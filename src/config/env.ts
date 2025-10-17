
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Helper for client-side env validation
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

const serverSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1, { message: 'STRIPE_SECRET_KEY is not set in environment variables.' }),
  STRIPE_PRICE_ID: z.string().min(1, { message: 'STRIPE_PRICE_ID is not set in environment variables.' }),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, { message: 'STRIPE_WEBHOOK_SECRET is not set in environment variables.' }),
});

const clientSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z
    .string()
    .min(1, { message: 'NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set in environment variables.' }),
});

type ServerEnvResult = z.SafeParseReturnType<NodeJS.ProcessEnv, z.infer<typeof serverSchema>>;
type ClientEnvResult = z.SafeParseReturnType<ReturnType<typeof readClientEnv>, z.infer<typeof clientSchema>>;

let cachedServerEnv: ServerEnvResult | null = null;
let cachedClientEnv: ClientEnvResult | null = null;

function logInvalidEnv<TInput, TOutput>(
  result: z.SafeParseReturnType<TInput, TOutput>,
  scope: 'server' | 'client'
) {
  if (process.env.NODE_ENV === 'test' || result.success) {
    return;
  }

  logger.error(`Invalid ${scope} environment variables:`, result.error.flatten().fieldErrors);
}

function validateServerEnv() {
  if (!cachedServerEnv) {
    cachedServerEnv = serverSchema.safeParse(process.env);
    logInvalidEnv(cachedServerEnv, 'server');
  }

  return cachedServerEnv;
}

function validateClientEnv() {
  if (!cachedClientEnv) {
    cachedClientEnv = clientSchema.safeParse(readClientEnv());
    logInvalidEnv(cachedClientEnv, 'client');
  }

  return cachedClientEnv;
}

export async function getServerEnv() {
  return validateServerEnv();
}

export async function getClientEnv() {
  return validateClientEnv();
}
