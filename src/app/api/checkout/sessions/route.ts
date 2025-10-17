
import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server'; // Assumes server-side initialization

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Initialize Firebase Admin for server-side operations
const { firestore } = initializeFirebase();

export async function POST(req: NextRequest) {
  try {
    const { uid, planId, intakeVersion } = await req.json();

    if (!uid || !planId) {
      return NextResponse.json({ error: 'Missing required parameters: uid and planId' }, { status: 400 });
    }

    const origin = req.nextUrl.origin;

    const priceId = 'price_1PgQ7N2N3N4N5N6Nabcdefg'; // Replace with your actual Stripe Price ID for the plan

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {
        uid: uid,
        planId: planId,
        intakeVersion: intakeVersion || 'v1',
      },
    });

    if (!session.id) {
        throw new Error('Failed to create Stripe session.');
    }

    // Create a payment document in Firestore before redirecting
    const paymentRef = doc(firestore, `users/${uid}/payments/${session.id}`);
    await setDoc(paymentRef, {
      status: 'created',
      planId: planId,
      createdAt: serverTimestamp(),
      stripeSessionId: session.id,
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Stripe Checkout Session Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
