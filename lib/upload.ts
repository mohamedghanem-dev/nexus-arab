// lib/upload.ts — Image upload with compression for Nexus Arab

import imageCompression from 'browser-image-compression';
import { createClient } from './supabase/client';

export interface UploadResult {
  url: string;
  path: string;
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
};

export async function compressImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, COMPRESSION_OPTIONS);
  } catch {
    return file; // fallback to original
  }
}

export async function uploadImage(
  file: File,
  bucket: 'projects' | 'services' | 'avatars',
  folder?: string
): Promise<UploadResult> {
  const supabase = createClient();

  // Compress first
  const compressed = await compressImage(file);

  // Unique filename
  const ext = compressed.type === 'image/webp' ? 'webp' : file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = folder ? `${folder}/${filename}` : filename;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, compressed, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return { url: urlData.publicUrl, path };
}

export async function deleteImage(
  bucket: 'projects' | 'services' | 'avatars',
  path: string
): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(bucket).remove([path]);
}

// Extract storage path from full URL
export function extractStoragePath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/storage/v1/object/public/');
    if (parts[1]) {
      const [, ...pathParts] = parts[1].split('/');
      return pathParts.join('/');
    }
    return null;
  } catch {
    return null;
  }
}
