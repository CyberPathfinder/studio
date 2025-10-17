
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';
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


const { firestore } = initializeFirebase();

export async function POST(req: NextRequest) {
  const env = await serverEnvPromise;
  const stripe = await getStripe();

  if (!stripe || !env.success) {
    return NextResponse.json({ error: 'Stripe is not configured. Missing API keys.' }, { status: 500 });
  }
  
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId as string);
    const uid = session.metadata?.uid;

    if (!uid) {
        return NextResponse.json({ error: 'User ID not found in session metadata.' }, { status: 400 });
    }
    
    // Check if we have already processed this payment
    const membershipRef = doc(firestore, `users/${uid}/membership`, 'stripe');
    const existingMembership = await getDoc(membershipRef);
    if (existingMembership.exists() && existingMembership.data()?.stripeSessionId === sessionId) {
        logger.warn(`Webhook: Attempted to process already processed session: ${sessionId}`);
        return NextResponse.json({ ok: true, message: 'Already processed.' });
    }

    if (session.payment_status === 'paid') {
      const planId = session.metadata?.planId || 'unknown_plan';

      const batch = writeBatch(firestore);

      // 1. Update the payment document
      const paymentRef = doc(firestore, `users/${uid}/payments/${sessionId}`);
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
      
      batch.set(membershipRef, {
        tier: 'premium',
        source: 'stripe',
        active: true,
        planId: planId,
        stripeSessionId: sessionId, 
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await batch.commit();

      return NextResponse.json({ ok: true });
    } else {
        return NextResponse.json({ ok: false, error: 'Payment not successful.' }, { status: 402 });
    }

  } catch (error: any) {
    logger.error('Stripe Verify Session Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
