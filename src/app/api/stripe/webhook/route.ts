
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';
import { logger } from '@/lib/logger';
import { getServerEnv } from '@/config/server-env';
import { headers } from 'next/headers';

const serverEnvPromise = getServerEnv();

let stripe: Stripe | null = null;
let hasLoggedInvalidEnv = false;

async function getStripe() {
  const env = await serverEnvPromise;

  if (!env.success) {
    if (!hasLoggedInvalidEnv) {
      hasLoggedInvalidEnv = true;
      logger.error('Stripe server environment variables are not set.', env.error.flatten());
    }
    return null;
  }

  if (!stripe) {
    stripe = new Stripe(env.data.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  return stripe;
}

const { firestore } = initializeFirebase();

/**
 * Handles incoming Stripe webhooks.
 */
export async function POST(req: NextRequest) {
  const env = await serverEnvPromise;
  const stripe = await getStripe();

  if (!stripe || !env.success) {
    return NextResponse.json({ error: 'Stripe is not configured. Missing API keys.' }, { status: 500 });
  }

  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.data.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    logger.error(`Stripe webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Idempotency: Check if we've already processed this event.
  // We store events under the user's subcollection to keep data organized.
  // For events without a user context (like general account updates), you might store them in a root collection.
  const eventRef = doc(firestore, `stripe_events/${event.id}`);
  const eventDoc = await getDoc(eventRef);

  if (eventDoc.exists()) {
    logger.warn(`Webhook: Received duplicate event: ${event.id}, ignoring.`);
    return NextResponse.json({ ok: true, message: 'Already processed.' });
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      logger.log(`Webhook: Handling checkout.session.completed for ${session.id}`);
      await handleCheckoutSessionCompleted(session, event.id);
      break;

    // Add other event types here as needed (e.g., for subscriptions)
    // case 'customer.subscription.updated':
    // case 'customer.subscription.deleted':
    //   const subscription = event.data.object as Stripe.Subscription;
    //   // handle subscription update
    //   break;

    default:
      logger.warn(`Webhook: Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ ok: true });
}


/**
 * Handles the `checkout.session.completed` event from Stripe.
 * This is the primary event for confirming a one-time purchase.
 * @param session The Stripe Checkout Session object.
 * @param eventId The ID of the Stripe event.
 */
const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session, eventId: string) => {
  const uid = session.metadata?.uid;
  const planId = session.metadata?.planId;

  if (!uid || !planId) {
    logger.error(`Webhook Error: Missing uid or planId in metadata for session ${session.id}`);
    return;
  }

  if (session.payment_status === 'paid') {
    try {
      const batch = writeBatch(firestore);

      // 1. Update the payment document
      const paymentRef = doc(firestore, `users/${uid}/payments/${session.id}`);
      batch.set(paymentRef, {
        status: 'success',
        planId: planId,
        amount: session.amount_total,
        currency: session.currency,
        updatedAt: serverTimestamp(),
        stripe: {
          customerId: session.customer,
          paymentIntentId: session.payment_intent,
        }
      }, { merge: true });

      // 2. Set the user's membership status
      const membershipRef = doc(firestore, `users/${uid}/membership`, 'stripe');
      batch.set(membershipRef, {
        tier: 'premium',
        source: 'stripe',
        active: true,
        planId: planId,
        stripeSessionId: session.id, // Store session ID for cross-referencing
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // 3. Record that this event has been processed for idempotency
      const eventRef = doc(firestore, `stripe_events/${eventId}`);
      batch.set(eventRef, {
        processedAt: serverTimestamp(),
        eventType: 'checkout.session.completed',
        uid: uid,
      });

      await batch.commit();
      logger.log(`Webhook: Successfully granted premium access to user ${uid} for session ${session.id}.`);

    } catch (error) {
      logger.error(`Webhook: Error processing checkout session ${session.id} for user ${uid}:`, error);
    }
  } else {
    logger.warn(`Webhook: Received checkout.session.completed for session ${session.id} but payment status is ${session.payment_status}.`);
  }
};
