'use server';

import { z } from 'zod';
import { logger } from '@/lib/logger';

const serverSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1, { message: 'STRIPE_SECRET_KEY is not set in environment variables.' }),
  STRIPE_PRICE_ID: z.string().min(1, { message: 'STRIPE_PRICE_ID is not set in environment variables.' }),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, { message: 'STRIPE_WEBHOOK_SECRET is not set in environment variables.' }),
});

type ServerEnvInput = Record<string, string | undefined>;
type ServerEnvResult = z.SafeParseReturnType<ServerEnvInput, z.infer<typeof serverSchema>>;

let cachedServerEnv: ServerEnvResult | null = null;

export async function getServerEnv() {
  if (!cachedServerEnv) {
    const result = serverSchema.safeParse(process.env as ServerEnvInput);

    if (process.env.NODE_ENV !== 'test' && !result.success) {
      logger.error('Invalid server environment variables:', result.error.flatten().fieldErrors);
    }

    cachedServerEnv = result;
  }

  return cachedServerEnv;
}
