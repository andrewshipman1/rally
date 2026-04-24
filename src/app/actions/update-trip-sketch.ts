'use server';

// Server action for the sketch-state auto-save path. Accepts a partial
// patch of the four inline-editable fields and writes them to the trips
// table, gated on the caller being the organizer and the trip still
// being in the sketch phase. Keys are whitelisted explicitly — no
// prop-injection via spread.
//
// Returns a structured result so the client hook can surface failure
// without throwing across the RSC boundary. On success, revalidates
// the trip page so the RSC rerenders with the new values; the client
// hook intentionally does NOT await the refresh, so controlled inputs
// are never stomped mid-typing (see SketchTripShell.tsx risk note).

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type SketchPatch = Partial<{
  name: string;
  tagline: string | null;
  destination: string | null;
  date_start: string | null;
  date_end: string | null;
  commit_deadline: string | null;
  cover_image_url: string | null;
}>;

type Result = { ok: true } | { ok: false; error: string };

const ALLOWED_KEYS: ReadonlyArray<keyof SketchPatch> = [
  'name',
  'tagline',
  'destination',
  'date_start',
  'date_end',
  'commit_deadline',
  'cover_image_url',
];

export async function updateTripSketch(
  tripId: string,
  slug: string,
  patch: SketchPatch,
): Promise<Result> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  // Fetch phase + organizer for authorization + phase guard.
  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('organizer_id, phase')
    .eq('id', tripId)
    .single();
  if (fetchError || !trip) return { ok: false, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not-organizer' };
  // 9W — also allow 'sell' so the organizer edit-on-sell view can write
  // through the same action. Auth (organizer_id) still gates writes.
  if (trip.phase !== 'sketch' && trip.phase !== 'sell') {
    return { ok: false, error: 'wrong-phase' };
  }

  // Whitelist keys — no spread of raw input.
  const whitelisted: Record<string, unknown> = {};
  for (const k of ALLOWED_KEYS) {
    if (k in patch) whitelisted[k] = patch[k] ?? null;
  }
  if (Object.keys(whitelisted).length === 0) return { ok: true };

  const { error: updateError } = await supabase
    .from('trips')
    .update(whitelisted)
    .eq('id', tripId);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

// ─── Session 8J — headliner updates ────────────────────────────────
// The headliner is stored as six nullable columns on trips (singular
// per trip). Updates mirror updateTripSketch's auth + phase guard, but
// write a different whitelist.

export type HeadlinerPatch = {
  description: string;
  costCents: number;
  costUnit: 'per_person' | 'total';
  linkUrl: string | null;
  imageUrl: string | null;
  sourceTitle: string | null;
};

const HEADLINER_DESCRIPTION_MAX = 80;
const URL_PATTERN = /^https?:\/\/.+/;

export async function updateHeadliner(
  tripId: string,
  slug: string,
  patch: HeadlinerPatch,
): Promise<Result> {
  // Validation — mirror the drawer's client-side rules so the server
  // is the source of truth.
  const description = (patch.description ?? '').trim();
  if (description.length < 1 || description.length > HEADLINER_DESCRIPTION_MAX) {
    return { ok: false, error: 'invalid-description' };
  }
  if (!Number.isInteger(patch.costCents) || patch.costCents <= 0) {
    return { ok: false, error: 'invalid-cost' };
  }
  if (patch.costUnit !== 'per_person' && patch.costUnit !== 'total') {
    return { ok: false, error: 'invalid-cost-unit' };
  }
  if (patch.linkUrl != null && patch.linkUrl !== '' && !URL_PATTERN.test(patch.linkUrl)) {
    return { ok: false, error: 'invalid-link' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('organizer_id, phase')
    .eq('id', tripId)
    .single();
  if (fetchError || !trip) return { ok: false, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not-organizer' };

  const { error: updateError } = await supabase
    .from('trips')
    .update({
      headliner_description: description,
      headliner_cost_cents: patch.costCents,
      headliner_cost_unit: patch.costUnit,
      headliner_link_url: patch.linkUrl || null,
      headliner_image_url: patch.imageUrl || null,
      headliner_source_title: patch.sourceTitle || null,
    })
    .eq('id', tripId);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

// ─── Session 8K — activities estimate ─────────────────────────────
// Sketch-phase activities collapses to a single per-person estimate
// stored on `trips`. Not phase-gated (matches headliner behavior); the
// value is sketch-only data but editable in adjacent phases without
// surprising 403s. Pass `null` to clear.

export async function setActivitiesEstimate(
  tripId: string,
  slug: string,
  dollars: number | null,
): Promise<Result> {
  if (dollars != null) {
    if (!Number.isFinite(dollars) || dollars < 0 || !Number.isInteger(dollars)) {
      return { ok: false, error: 'invalid-activities-estimate' };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('organizer_id')
    .eq('id', tripId)
    .single();
  if (fetchError || !trip) return { ok: false, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not-organizer' };

  const { error: updateError } = await supabase
    .from('trips')
    .update({
      activities_estimate_per_person_cents: dollars != null ? dollars * 100 : null,
    })
    .eq('id', tripId);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

export async function removeHeadliner(
  tripId: string,
  slug: string,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('organizer_id')
    .eq('id', tripId)
    .single();
  if (fetchError || !trip) return { ok: false, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not-organizer' };

  const { error: updateError } = await supabase
    .from('trips')
    .update({
      headliner_description: null,
      headliner_cost_cents: null,
      headliner_cost_unit: null,
      headliner_link_url: null,
      headliner_image_url: null,
      headliner_source_title: null,
    })
    .eq('id', tripId);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}
