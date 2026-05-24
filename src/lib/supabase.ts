import { createClient } from '@supabase/supabase-js';
import { supabaseConfig, supabaseClientConfigured } from './runtime-config';

const FALLBACK_SUPABASE_URL = 'https://placeholder.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'placeholder-placeholder-placeholder-placeholder-placeholder';

export const supabase = createClient(
  supabaseClientConfigured ? supabaseConfig.url : FALLBACK_SUPABASE_URL,
  supabaseClientConfigured ? supabaseConfig.anonKey : FALLBACK_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'dentside.supabase.auth',
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  },
);
