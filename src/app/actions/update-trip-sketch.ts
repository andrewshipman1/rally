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
}>;

type Result = { ok: true } | { ok: false; error: string };

const ALLOWED_KEYS: ReadonlyArray<keyof SketchPatch> = [
  'name',
  'tagline',
  'destination',
  'date_start',
  'date_end',
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
  if (trip.phase !== 'sketch') return { ok: false, error: 'not-sketch-phase' };

  // Whitelist keys — no spread of raw input.
  const whitelisted: Record<string, unknown> = {};
  for (const k of ALLOWED_KEYS) {
    if (k in patch) whitelisted[k] = patch[k] ?? null;
  }
  if (Object.keys(whitelisted).length === 0) return { ok: true };

  const { error: updateError } = await supabase
    .from('trips')
    .update(whitelisted)
    .eq('id', tripId)
    .eq('phase', 'sketch');
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}
