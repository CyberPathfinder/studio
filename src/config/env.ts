
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

const parsedServerEnv = serverSchema.safeParse(process.env);
const parsedClientEnv = clientSchema.safeParse(readClientEnv());

if (process.env.NODE_ENV !== 'test') {
  // Don't log during tests
  if (!parsedServerEnv.success) {
    logger.error('Invalid server environment variables:', parsedServerEnv.error.flatten().fieldErrors);
  }
  if (!parsedClientEnv.success) {
    logger.error('Invalid client environment variables:', parsedClientEnv.error.flatten().fieldErrors);
  }
}

export async function getServerEnv() {
  return parsedServerEnv;
}

export async function getClientEnv() {
  return parsedClientEnv;
}
