'use server';

// Soft-archive (and unarchive) a trip from the organizer's dashboard.
// Archive sets trips.archived_at = now(); unarchive clears it.
// Sketch trips reject archive — they should be deleted instead.

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const TripIdSchema = z.object({
  tripId: z.string().uuid(),
});

type Result = { ok: true } | { ok: false; error: string };

export async function archiveTrip(input: z.input<typeof TripIdSchema>): Promise<Result> {
  const parsed = TripIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const { tripId } = parsed.data;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('organizer_id, phase')
    .eq('id', tripId)
    .single();

  if (fetchError || !trip) return { ok: false, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not-organizer' };
  if (trip.phase === 'sketch') return { ok: false, error: 'use-delete-instead' };

  const { error: updateError } = await supabase
    .from('trips')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', tripId);

  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath('/');
  return { ok: true };
}

export async function unarchiveTrip(input: z.input<typeof TripIdSchema>): Promise<Result> {
  const parsed = TripIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const { tripId } = parsed.data;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
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
    .update({ archived_at: null })
    .eq('id', tripId);

  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath('/');
  return { ok: true };
}
