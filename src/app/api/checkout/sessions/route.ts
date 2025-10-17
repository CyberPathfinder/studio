
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';
import { initializeFirebase } from '@/firebase/server'; // Assumes server-side initialization
import { logger } from '@/lib/logger';
import { getServerEnv } from '@/config/server-env';

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

// Initialize Firebase Admin for server-side operations
const { firestore } = initializeFirebase();

export async function POST(req: NextRequest) {
  const env = await serverEnvPromise;
  const stripe = await getStripe();

  if (!stripe || !env.success) {
    return NextResponse.json({ error: 'Stripe is not configured. Missing API keys.' }, { status: 500 });
  }

  try {
    const { uid, planId, intakeVersion } = await req.json();

    if (!uid || !planId) {
      return NextResponse.json({ error: 'Missing required parameters: uid and planId' }, { status: 400 });
    }

    const origin = req.nextUrl.origin;

    // Create a payment document in Firestore before creating the Stripe session
    // This allows us to have a record of the intent to purchase.
    // We use a temporary ID that we will replace with the session ID later if needed,
    // but for this flow, the session ID is what matters.
    const tempPaymentRef = firestore.doc(`users/${uid}/payments/pending_checkout`);
    await tempPaymentRef.set(
      {
        status: 'pending',
        planId: planId,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );


    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: env.data.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`, // Pass session to cancel page too
      metadata: {
        uid: uid,
        planId: planId,
        intakeVersion: intakeVersion || 'v1',
      },
    });

    if (!session.id) {
        throw new Error('Failed to create Stripe session.');
    }

    // Now, create the specific payment document for this session.
    const paymentRef = firestore.doc(`users/${uid}/payments/${session.id}`);
    await paymentRef.set({
      status: 'created',
      planId: planId,
      createdAt: FieldValue.serverTimestamp(),
      stripeSessionId: session.id,
    });
    
    // Optionally delete the temporary document
    await tempPaymentRef.set({ status: 'migrated' }, { merge: true });


    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    logger.error('Stripe Checkout Session Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
