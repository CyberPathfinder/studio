const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}

const stripePriceId = process.env.STRIPE_PRICE_ID;
if (!stripePriceId) {
  throw new Error('STRIPE_PRICE_ID environment variable is not set.');
}

export { stripeSecretKey, stripePriceId };
