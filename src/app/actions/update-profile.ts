'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type Result = { ok: true } | { ok: false; error: string };

const UpdateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  instagram_handle: z.string().max(60).optional(),
  tiktok_handle: z.string().max(60).optional(),
  home_city: z.string().max(100).optional(),
  profile_photo_url: z.string().url().optional(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field is required' },
);

export async function updateProfile(
  fields: z.input<typeof UpdateProfileSchema>,
): Promise<Result> {
  const parsed = UpdateProfileSchema.safeParse(fields);
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  // Build the update payload — only include defined fields
  const update: Record<string, unknown> = {};
  const d = parsed.data;

  if (d.display_name !== undefined) update.display_name = d.display_name.trim();
  if (d.bio !== undefined) update.bio = d.bio.trim() || null;
  if (d.email !== undefined) update.email = d.email.trim() || null;
  if (d.phone !== undefined) update.phone = d.phone.trim() || null;
  if (d.home_city !== undefined) update.home_city = d.home_city.trim() || null;
  if (d.profile_photo_url !== undefined) update.profile_photo_url = d.profile_photo_url;

  // Strip leading @ from social handles
  if (d.instagram_handle !== undefined) {
    update.instagram_handle = d.instagram_handle.replace(/^@/, '').trim() || null;
  }
  if (d.tiktok_handle !== undefined) {
    update.tiktok_handle = d.tiktok_handle.replace(/^@/, '').trim() || null;
  }

  const { error: updateError } = await supabase
    .from('users')
    .update(update)
    .eq('id', user.id);

  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath('/passport');
  return { ok: true };
}
