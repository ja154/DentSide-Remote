import { getAccessToken } from './auth-client';
import { supabaseConfig } from './runtime-config';

type UploadResult = {
  path: string;
  contentType?: string;
  sizeBytes?: number;
};

const getSupabaseStorageUrl = (path: string) => {
  const baseUrl = supabaseConfig.url.replace(/\/+$/, '');
  return `${baseUrl}/storage/v1/object/${supabaseConfig.storageBucket}/${path}`;
};

export const storageConfigured = Boolean(supabaseConfig.storageBucket);

export const uploadProtectedFile = async ({
  path,
  file,
}: {
  path: string;
  file: File;
}): Promise<UploadResult> => {
  if (!storageConfigured) {
    throw new Error('Supabase Storage is not configured.');
  }

  const token = await getAccessToken();

  if (!token) {
    throw new Error('You need an active session before uploading to Supabase Storage.');
  }

  const response = await fetch(getSupabaseStorageUrl(path), {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseConfig.anonKey,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'false',
    },
    body: file,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Supabase Storage upload failed with ${response.status}.`);
  }

  return {
    path,
    contentType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
  };
};
