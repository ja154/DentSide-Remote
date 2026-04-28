import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  APP_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://127.0.0.1:3000'),
  VITE_FIREBASE_API_KEY: z.string().optional(),
  VITE_FIREBASE_PROJECT_ID: z.string().optional(),
  VITE_FIREBASE_DATABASE_ID: z.string().default('(default)'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  MPESA_CONSUMER_KEY: z.string().optional(),
  MPESA_CONSUMER_SECRET: z.string().optional(),
  MPESA_SHORTCODE: z.string().optional(),
  MPESA_PASSKEY: z.string().optional(),
});

const parsedEnv = EnvSchema.parse(process.env);

if (parsedEnv.NODE_ENV === 'production' && !parsedEnv.APP_URL) {
  throw new Error('APP_URL must be set in production.');
}

export const env = {
  ...parsedEnv,
  allowedOrigins: parsedEnv.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  firebaseConfigured: Boolean(parsedEnv.VITE_FIREBASE_API_KEY && parsedEnv.VITE_FIREBASE_PROJECT_ID),
  storageConfigured: Boolean(parsedEnv.VITE_FIREBASE_STORAGE_BUCKET),
  stripeConfigured: Boolean(parsedEnv.STRIPE_SECRET_KEY && parsedEnv.STRIPE_WEBHOOK_SECRET),
  mpesaConfigured: Boolean(
    parsedEnv.MPESA_CONSUMER_KEY &&
      parsedEnv.MPESA_CONSUMER_SECRET &&
      parsedEnv.MPESA_SHORTCODE &&
      parsedEnv.MPESA_PASSKEY,
  ),
};
