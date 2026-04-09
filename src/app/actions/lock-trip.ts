'use server';

// Server action for the sell → lock phase transition.
// Organizer-only. Guards: commit_deadline must be set, at least 1
// RSVP'd-in member. CAS guard on phase to prevent race conditions.

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity-log';

type Result = { ok: true } | { ok: false; error: string };

const LockTripSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
});

export async function lockTrip(
  tripId: string,
  slug: string,
): Promise<Result> {
  const parsed = LockTripSchema.safeParse({ tripId, slug });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  // Fetch trip for authorization + guard checks
  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('organizer_id, phase, commit_deadline')
    .eq('id', tripId)
    .single();
  if (fetchError || !trip) return { ok: false, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not-organizer' };

  // Phase guard: must be in sell phase
  if (trip.phase !== 'sell') return { ok: false, error: 'wrong-phase' };

  // Deadline guard: commit_deadline must be set
  if (!trip.commit_deadline) return { ok: false, error: 'no-deadline' };

  // Member guard: at least 1 RSVP'd-in member
  const { count, error: countError } = await supabase
    .from('trip_members')
    .select('id', { count: 'exact', head: true })
    .eq('trip_id', tripId)
    .eq('rsvp', 'in');
  if (countError) return { ok: false, error: countError.message };
  if (!count || count < 1) return { ok: false, error: 'no-members' };

  // CAS update: .eq('phase', 'sell') prevents double-lock race
  const { error: updateError } = await supabase
    .from('trips')
    .update({ phase: 'lock' })
    .eq('id', tripId)
    .eq('phase', 'sell');
  if (updateError) return { ok: false, error: updateError.message };

  try {
    await logActivity(supabase, tripId, user.id, 'phase_lock');
  } catch {}

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}
