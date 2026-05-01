import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'dotenv';
import { z } from 'zod';

const lockedEnvKeys = new Set(Object.keys(process.env));

const mergeEnvFile = (relativePath: string) => {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  if (!fs.existsSync(absolutePath)) {
    return;
  }

  const parsedFile = parse(fs.readFileSync(absolutePath, 'utf8'));

  for (const [key, value] of Object.entries(parsedFile)) {
    if (value === '') {
      continue;
    }

    if (lockedEnvKeys.has(key)) {
      continue;
    }

    process.env[key] = value;
  }
};

// Frontend-safe root env files remain available as a fallback, while backend-specific
// files under server/ take precedence for Express configuration.
for (const envFile of ['.env', '.env.local', 'server/.env', 'server/.env.local']) {
  mergeEnvFile(envFile);
}

const envMode = process.env.NODE_ENV?.trim() || 'development';

for (const envFile of [
  `.env.${envMode}`,
  `.env.${envMode}.local`,
  `server/.env.${envMode}`,
  `server/.env.${envMode}.local`,
]) {
  mergeEnvFile(envFile);
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  APP_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://127.0.0.1:3000'),
  SERVE_STATIC_FRONTEND: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().optional(),
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

const supabaseConfigured = Boolean(
  parsedEnv.SUPABASE_URL &&
    parsedEnv.SUPABASE_ANON_KEY &&
    parsedEnv.SUPABASE_SERVICE_ROLE_KEY,
);
const storageProvider = parsedEnv.SUPABASE_STORAGE_BUCKET ? 'supabase' : 'none';

export const env = {
  ...parsedEnv,
  allowedOrigins: parsedEnv.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  serveStaticFrontend: parsedEnv.SERVE_STATIC_FRONTEND,
  supabaseConfigured,
  storageProvider,
  storageConfigured: storageProvider !== 'none',
  stripeConfigured: Boolean(parsedEnv.STRIPE_SECRET_KEY && parsedEnv.STRIPE_WEBHOOK_SECRET),
  mpesaConfigured: Boolean(
    parsedEnv.MPESA_CONSUMER_KEY &&
      parsedEnv.MPESA_CONSUMER_SECRET &&
      parsedEnv.MPESA_SHORTCODE &&
      parsedEnv.MPESA_PASSKEY,
  ),
};
