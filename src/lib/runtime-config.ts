export type StorageProvider = 'supabase' | 'none';

export const supabaseClientConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL?.trim() || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '',
  storageBucket: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET?.trim() || '',
};

export const storageProvider: StorageProvider = supabaseConfig.storageBucket ? 'supabase' : 'none';
export const authConfigured = supabaseClientConfigured;
