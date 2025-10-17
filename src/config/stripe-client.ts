
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? '';

if (!stripePublicKey && process.env.NODE_ENV !== 'development') {
  console.error('Stripe public key is not set. Checkout will fail.');
}

/**
 * Returns true if the Stripe public key is available.
 */
export const hasStripeKey = (): boolean => {
  return Boolean(stripePublicKey);
};

export { stripePublicKey };
