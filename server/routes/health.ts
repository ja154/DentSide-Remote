import { Router } from 'express';
import { env } from '../env.ts';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    providers: {
      auth: 'supabase',
      data: 'supabase',
      storage: env.storageProvider,
    },
    services: {
      supabase: env.supabaseConfigured,
      storage: env.storageConfigured,
      stripe: env.stripeConfigured,
      mpesa: env.mpesaConfigured,
    },
  });
});
