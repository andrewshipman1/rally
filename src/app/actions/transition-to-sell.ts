'use server';

// Server action to transition a trip from sketch → sell phase.
// Called by the "send it" CTA in BuilderStickyBar. Gates: the
// caller must be the organizer, the trip must be in sketch, and
// name >= 3 chars + at least one date must be set.

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type Result = { ok: true } | { ok: false; error: string };

export async function transitionToSell(
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
    .select('organizer_id, phase, name, date_start')
    .eq('id', tripId)
    .single();
  if (fetchError || !trip) return { ok: false, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not-organizer' };
  if (trip.phase !== 'sketch') return { ok: false, error: 'not-sketch-phase' };

  // Gate: name >= 3 chars + at least one date
  if (!trip.name || trip.name.trim().length < 3) {
    return { ok: false, error: 'name-too-short' };
  }
  if (!trip.date_start) {
    return { ok: false, error: 'no-date' };
  }

  const { error: updateError } = await supabase
    .from('trips')
    .update({ phase: 'sell' })
    .eq('id', tripId)
    .eq('phase', 'sketch');
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}
