
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';
import { logger } from '@/lib/logger';
import { stripeSecretKey } from '@/config/stripe-server';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

const { firestore } = initializeFirebase();

export async function POST(req: NextRequest) {
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
