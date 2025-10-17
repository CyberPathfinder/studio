
import { env } from './env';

let stripePublicKey: string;

if (env.client.success) {
    stripePublicKey = env.client.data.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
} else {
    // In development, it's okay to have a placeholder.
    // In production, the build would have failed if the env var was missing.
    stripePublicKey = '';
    if (process.env.NODE_ENV !== 'development') {
         console.error("Stripe public key is not set. Checkout will fail.");
    }
}

/**
 * Returns true if the Stripe public key is available.
 */
export const hasStripeKey = (): boolean => {
    return env.client.success;
}

export { stripePublicKey };
