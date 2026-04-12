'use server';

// Server action to hard-delete a sketch-phase trip. Only the organizer
// can delete, and only while the trip is still in sketch phase.
// FK cascades in Supabase handle related rows (lodging, crew, etc.).

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const DeleteTripSchema = z.object({
  tripId: z.string().uuid(),
});

type Result = { ok: true } | { ok: false; error: string };

export async function deleteTrip(input: z.input<typeof DeleteTripSchema>): Promise<Result> {
  const parsed = DeleteTripSchema.safeParse(input);
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
  if (trip.phase !== 'sketch') return { ok: false, error: 'not-sketch-phase' };

  const { error: deleteError } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);

  if (deleteError) return { ok: false, error: deleteError.message };

  revalidatePath('/');
  return { ok: true };
}
