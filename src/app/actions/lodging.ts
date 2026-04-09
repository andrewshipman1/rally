'use server';

// Server actions for lodging voting write-side.
// castLodgingVote — any authenticated crew member.
// lockLodgingWinner — organizer only.

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity-log';

type Result = { ok: true } | { ok: false; error: string };

const CastVoteSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  lodgingOptionId: z.string().uuid(),
});

const LockWinnerSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  lodgingOptionId: z.string().uuid(),
});

export async function castLodgingVote(
  tripId: string,
  slug: string,
  lodgingOptionId: string,
): Promise<Result> {
  const parsed = CastVoteSchema.safeParse({ tripId, slug, lodgingOptionId });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  // Fetch all lodging for this trip to verify the option exists and check lock state
  const { data: allLodging, error: fetchError } = await supabase
    .from('lodging')
    .select('id, name, is_selected')
    .eq('trip_id', tripId);
  if (fetchError || !allLodging) return { ok: false, error: 'trip-not-found' };

  // Guard: voting closed if any option is selected
  if (allLodging.some((l) => l.is_selected)) {
    return { ok: false, error: 'voting-closed' };
  }

  // Guard: the target option must belong to this trip
  const targetOption = allLodging.find((l) => l.id === lodgingOptionId);
  if (!targetOption) return { ok: false, error: 'option-not-found' };

  // Remove any existing votes by this user for any lodging in this trip
  const lodgingIds = allLodging.map((l) => l.id);
  await supabase
    .from('lodging_votes')
    .delete()
    .eq('user_id', user.id)
    .in('lodging_id', lodgingIds);

  // Insert new vote
  const { error: insertError } = await supabase
    .from('lodging_votes')
    .insert({ lodging_id: lodgingOptionId, user_id: user.id });
  if (insertError) return { ok: false, error: insertError.message };

  try {
    await logActivity(supabase, tripId, user.id, 'vote_cast', {
      targetId: lodgingOptionId,
      targetType: 'lodging',
      metadata: { option_name: targetOption.name },
    });
  } catch {}

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

export async function lockLodgingWinner(
  tripId: string,
  slug: string,
  lodgingOptionId: string,
): Promise<Result> {
  const parsed = LockWinnerSchema.safeParse({ tripId, slug, lodgingOptionId });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  // Organizer guard
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('organizer_id')
    .eq('id', tripId)
    .single();
  if (tripError || !trip) return { ok: false, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not-organizer' };

  // Clear all selections for this trip
  const { error: clearError } = await supabase
    .from('lodging')
    .update({ is_selected: false })
    .eq('trip_id', tripId);
  if (clearError) return { ok: false, error: clearError.message };

  // Set winner
  const { error: setError } = await supabase
    .from('lodging')
    .update({ is_selected: true })
    .eq('id', lodgingOptionId)
    .eq('trip_id', tripId);
  if (setError) return { ok: false, error: setError.message };

  // Get winner name for metadata
  const { data: winner } = await supabase
    .from('lodging')
    .select('name')
    .eq('id', lodgingOptionId)
    .single();

  try {
    await logActivity(supabase, tripId, user.id, 'lodging_locked', {
      targetId: lodgingOptionId,
      targetType: 'lodging',
      metadata: { option_name: winner?.name ?? '' },
    });
  } catch {}

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}
