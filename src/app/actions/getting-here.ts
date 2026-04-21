'use server';

// Session 9B-1 — Getting Here module server action.
// upsertArrival writes the current user's arrival row on trip_members.
// Mode-change auto-resets cost_cents to null so stale numbers never
// linger across modes (e.g. switching flight → drive must blank the
// cost). Membership is implicitly verified by scoping the read to
// (trip_id, user_id); RLS "Members can update own" covers the write.

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ArrivalMode } from '@/types';

type Result = { ok: true } | { ok: false; error: string };

const UpsertArrivalSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  mode: z.enum(['flight', 'drive', 'train', 'other']).nullable(),
  costCents: z.number().int().min(0).max(10_000_000).nullable(),
});

export async function upsertArrival(
  tripId: string,
  slug: string,
  mode: ArrivalMode | null,
  costCents: number | null,
): Promise<Result> {
  const parsed = UpsertArrivalSchema.safeParse({ tripId, slug, mode, costCents });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  const { data: existing, error: fetchError } = await supabase
    .from('trip_members')
    .select('id, arrival_mode')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .single();
  if (fetchError || !existing) return { ok: false, error: 'not-a-member' };

  // Mode change auto-resets cost (ignore incoming costCents on change).
  const modeChanged = existing.arrival_mode !== mode;
  const nextCost = modeChanged ? null : costCents;

  const { error: updateError } = await supabase
    .from('trip_members')
    .update({
      arrival_mode: mode,
      arrival_cost_cents: nextCost,
      arrival_updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}
