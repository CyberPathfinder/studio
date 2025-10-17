'use client';

import { z } from 'zod';
import { logger } from '@/lib/logger';

function readClientEnv() {
  if (typeof window === 'undefined') {
    return {
      NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    };
  }

  return {
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  };
}

const clientSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z
    .string()
    .min(1, { message: 'NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set in environment variables.' }),
});

type ClientEnvResult = z.SafeParseReturnType<ReturnType<typeof readClientEnv>, z.infer<typeof clientSchema>>;

let cachedClientEnv: ClientEnvResult | null = null;

function logInvalidEnv(result: ClientEnvResult) {
  if (process.env.NODE_ENV === 'test' || result.success) {
    return;
  }

  logger.error('Invalid client environment variables:', result.error.flatten().fieldErrors);
}

function validateClientEnv() {
  if (!cachedClientEnv) {
    cachedClientEnv = clientSchema.safeParse(readClientEnv());
    logInvalidEnv(cachedClientEnv);
  }

  return cachedClientEnv;
}

export async function getClientEnv() {
  return validateClientEnv();
}
