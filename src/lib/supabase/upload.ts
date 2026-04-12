import { createClient } from './client';

const BUCKET = 'trip-covers';

/**
 * Upload a file to the trip-covers bucket in Supabase Storage.
 * Returns the public URL on success, or null on failure.
 */
export async function uploadTripCover(
  tripId: string,
  file: File,
): Promise<string | null> {
  const supabase = createClient();

  // Unique path: trip-covers/{tripId}/{timestamp}-{filename}
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${tripId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload failed:', error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
