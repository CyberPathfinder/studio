const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
if (!stripePublicKey) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY environment variable is not set.');
}

export { stripePublicKey };
