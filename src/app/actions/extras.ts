'use server';

// Server actions for the Extras drawer write-side.
// All five actions are organizer-only. Each validates with Zod,
// re-reads auth from the httpOnly cookie, checks organizer status
// server-side, and logs to activity_log on success.

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { stripHtml } from '@/lib/sanitize';
import { logActivity } from '@/lib/activity-log';

type Result = { ok: true } | { ok: false; error: string };

// ─── Zod schemas ──────────────────────────────────────────────────

const AddPackingItemSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  text: z.string().min(1).max(200),
});

const RemovePackingItemSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  itemId: z.string().min(1),
});

const SetUrlSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  url: z.string().url().refine(
    (u) => u.startsWith('https://') || u.startsWith('http://'),
    { message: 'Only http/https URLs allowed' },
  ),
});

// Session 8Q — playlist save accepts optional OG enrichment from the
// client-side /api/enrich call. Enrichment is never required; empty
// values mean "enrich failed, fall back to domain chip."
const SetPlaylistSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  url: z.string().url().refine(
    (u) => u.startsWith('https://') || u.startsWith('http://'),
    { message: 'Only http/https URLs allowed' },
  ),
  ogImage: z.string().url().nullable().optional(),
  ogTitle: z.string().max(300).nullable().optional(),
});

const SetHouseRulesSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  text: z.string().max(1000),
});

// ─── Shared prelude ───────────────────────────────────────────────

type PreludeOk = {
  ok: true;
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string };
  trip: { organizer_id: string; packing_list: unknown };
};
type PreludeFail = { ok: false; error: string };

async function organizerPrelude(tripId: string): Promise<PreludeOk | PreludeFail> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('organizer_id, packing_list')
    .eq('id', tripId)
    .single();
  if (fetchError || !trip) return { ok: false, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not-organizer' };

  return { ok: true, supabase, user, trip };
}

// ─── Actions ──────────────────────────────────────────────────────

export async function addPackingItem(
  tripId: string,
  slug: string,
  text: string,
): Promise<Result> {
  const parsed = AddPackingItemSchema.safeParse({ tripId, slug, text });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };
  const { supabase, user, trip } = pre;

  const cleaned = stripHtml(parsed.data.text);
  if (!cleaned) return { ok: false, error: 'invalid-input' };

  const current = (trip.packing_list as { id: string; text: string; checked: boolean }[]) || [];
  const newItem = { id: crypto.randomUUID(), text: cleaned, checked: false };
  const updated = [...current, newItem];

  const { error: updateError } = await supabase
    .from('trips')
    .update({ packing_list: updated })
    .eq('id', tripId);
  if (updateError) return { ok: false, error: updateError.message };

  try {
    await logActivity(supabase, tripId, user.id, 'extra_added', {
      metadata: { extra_type: 'packing', item_text: cleaned },
    });
  } catch {}

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

export async function removePackingItem(
  tripId: string,
  slug: string,
  itemId: string,
): Promise<Result> {
  const parsed = RemovePackingItemSchema.safeParse({ tripId, slug, itemId });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };
  const { supabase, trip } = pre;

  const current = (trip.packing_list as { id: string; text: string; checked: boolean }[]) || [];
  const updated = current.filter((item) => item.id !== parsed.data.itemId);

  const { error: updateError } = await supabase
    .from('trips')
    .update({ packing_list: updated })
    .eq('id', tripId);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

export async function setPlaylistUrl(
  tripId: string,
  slug: string,
  url: string,
  og?: { ogImage?: string | null; ogTitle?: string | null },
): Promise<Result> {
  const parsed = SetPlaylistSchema.safeParse({
    tripId,
    slug,
    url,
    ogImage: og?.ogImage ?? null,
    ogTitle: og?.ogTitle ?? null,
  });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };
  const { supabase, user } = pre;

  // Session 8Q — denormalize curator first-name at save time so the
  // byline stays stable even if the user later renames themselves.
  const { data: profile } = await supabase
    .from('users')
    .select('display_name')
    .eq('id', user.id)
    .single();
  const firstName =
    (profile?.display_name ?? '').trim().split(/\s+/)[0] || null;

  const { error: updateError } = await supabase
    .from('trips')
    .update({
      playlist_url: parsed.data.url,
      playlist_og_image: parsed.data.ogImage ?? null,
      playlist_og_title: parsed.data.ogTitle ?? null,
      playlist_set_by_name: firstName,
      playlist_set_at: new Date().toISOString(),
    })
    .eq('id', tripId);
  if (updateError) return { ok: false, error: updateError.message };

  try {
    await logActivity(supabase, tripId, user.id, 'extra_added', {
      metadata: { extra_type: 'playlist' },
    });
  } catch {}

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

// Session 8Q — clear the playlist (and its OG/curator fields) so the
// empty state returns. Used by the "swap it" flow when the organizer
// wants to drop a new link.
export async function clearPlaylistUrl(
  tripId: string,
  slug: string,
): Promise<Result> {
  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };
  const { supabase } = pre;

  const { error: updateError } = await supabase
    .from('trips')
    .update({
      playlist_url: null,
      playlist_og_image: null,
      playlist_og_title: null,
      playlist_set_by_name: null,
      playlist_set_at: null,
    })
    .eq('id', tripId);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

export async function setHouseRules(
  tripId: string,
  slug: string,
  text: string,
): Promise<Result> {
  const parsed = SetHouseRulesSchema.safeParse({ tripId, slug, text });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };
  const { supabase, user } = pre;

  const cleaned = stripHtml(parsed.data.text);

  const { error: updateError } = await supabase
    .from('trips')
    .update({ house_rules: cleaned || null })
    .eq('id', tripId);
  if (updateError) return { ok: false, error: updateError.message };

  try {
    await logActivity(supabase, tripId, user.id, 'extra_added', {
      metadata: { extra_type: 'rules' },
    });
  } catch {}

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

export async function setAlbumUrl(
  tripId: string,
  slug: string,
  url: string,
): Promise<Result> {
  const parsed = SetUrlSchema.safeParse({ tripId, slug, url });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };
  const { supabase, user } = pre;

  const { error: updateError } = await supabase
    .from('trips')
    .update({ photo_album_url: parsed.data.url })
    .eq('id', tripId);
  if (updateError) return { ok: false, error: updateError.message };

  try {
    await logActivity(supabase, tripId, user.id, 'extra_added', {
      metadata: { extra_type: 'album' },
    });
  } catch {}

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}
