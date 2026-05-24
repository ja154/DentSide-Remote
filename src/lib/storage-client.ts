import { supabase } from './supabase';
import { supabaseConfig } from './runtime-config';

type UploadResult = {
  path: string;
  contentType?: string;
  sizeBytes?: number;
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
  const { error } = await supabase.storage.from(supabaseConfig.storageBucket).upload(path, file, {
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  });

  if (error) {
    throw new Error(error.message || 'Supabase Storage upload failed.');
  }

  return {
    path,
    contentType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
  };
};
