'use server';

export type ClientRuntimeEnv = {
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: string | null;
};

export async function getClientRuntimeEnv(): Promise<ClientRuntimeEnv> {
  return {
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? null,
  };
}

export async function isStripeConfigured(): Promise<boolean> {
  const { NEXT_PUBLIC_STRIPE_PUBLIC_KEY } = await getClientRuntimeEnv();
  return Boolean(NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
}

export async function requireStripePublicKey(): Promise<string> {
  const { NEXT_PUBLIC_STRIPE_PUBLIC_KEY } = await getClientRuntimeEnv();

  if (!NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY environment variable is not set.');
  }

  return NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
}
