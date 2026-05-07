'use server';

// Session 12A (Lock-A): the sell → lock transactional state transition.
//
// Wraps the public.fire_lock PL/pgSQL function (defined in migration
// 032). All state changes — lodging vote-winner finalization,
// allocation writes (organizer-books vs each-attendee-books),
// actual_cost capture, holding → out auto-bump, phase flip,
// lock_deadline, optional payment-handle save — happen in a single
// Postgres transaction inside the RPC. Partial-state lock is
// impossible: any failure rolls back ALL writes.
//
// Lock-A creates the data foundation. Lock-B will wire the wizard UI
// to call this action. Until Lock-B ships, fireLock has no UI caller.
//
// Surface mirrors src/app/actions/transition-to-sell.ts:
// - 'use server'
// - createClient() server-side
// - auth.getUser() pre-check (faster error path; defense in depth
//   for the RPC's own auth.uid() check)
// - returns Result discriminated union
// - revalidatePath on success
//
// See:
// - rally-lock-phase-strategy-v0.md "Cowork session 2" for the locked
//   wizard / allocation / commitment shape.
// - rally-fix-plan-v1.md §Session 12A for the brief.
// - supabase/migrations/032_commitments_and_fire_lock.sql for the
//   PL/pgSQL implementation + return-shape contract.

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity-log';

// ─── Param + result shapes ──────────────────────────────────────────

export type FireLockAllocation = {
  itemType: 'lodging' | 'transport' | 'headliner';
  itemId: string;            // for headliner, pass the trip id
  mode: 'organizer_books' | 'individual_books';
  // dollars; required when mode === 'organizer_books'. Headliner
  // values are dollars at the boundary; the RPC converts to cents
  // internally per the headliner_*_cents convention (017 / 030).
  actualCost?: number;
};

export type FireLockPaymentHandles = {
  venmo?: string;
  zelle?: string;
  cashapp?: string;
};

export type FireLockParams = {
  tripId: string;
  slug: string;                          // for revalidatePath
  // Vote-winner override. null when the trip has no lodging items
  // (skip the is_selected pass).
  lodgingChoice: { lodgingId: string } | null;
  allocations: FireLockAllocation[];
  lockDeadline: string;                  // ISO timestamp
  paymentHandles?: FireLockPaymentHandles;
};

export type FireLockResult =
  | { ok: true; lockedAt: string }
  | { ok: false; error: string };

// ─── Zod validation ─────────────────────────────────────────────────
// Matches the RPC's expected JSONB shape. The RPC re-validates
// (RAISE EXCEPTION on bad mode / missing actualCost / etc.) — this
// schema fails fast before the round trip.

const AllocationSchema = z
  .object({
    itemType: z.enum(['lodging', 'transport', 'headliner']),
    itemId: z.string().uuid(),
    mode: z.enum(['organizer_books', 'individual_books']),
    actualCost: z.number().nonnegative().optional(),
  })
  .refine(
    (a) => a.mode !== 'organizer_books' || typeof a.actualCost === 'number',
    { message: 'actualCost required when mode = organizer_books' },
  );

const PaymentHandlesSchema = z
  .object({
    venmo: z.string().optional(),
    zelle: z.string().optional(),
    cashapp: z.string().optional(),
  })
  .optional();

const FireLockSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  lodgingChoice: z.object({ lodgingId: z.string().uuid() }).nullable(),
  allocations: z.array(AllocationSchema),
  lockDeadline: z.string().datetime({ offset: true }),
  paymentHandles: PaymentHandlesSchema,
});

// ─── Action ─────────────────────────────────────────────────────────

export async function fireLock(params: FireLockParams): Promise<FireLockResult> {
  const parsed = FireLockSchema.safeParse(params);
  if (!parsed.success) {
    return { ok: false, error: 'invalid_input' };
  }
  const p = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not_authenticated' };

  // Defense-in-depth: organizer check happens authoritatively in the
  // RPC (against trips.organizer_id, scoped by auth.uid()), but a
  // pre-check here saves a round trip on the common-case
  // not-organizer error AND short-circuits early on already-locked
  // trips. Both paths return WITHOUT writes.
  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('organizer_id, phase')
    .eq('id', p.tripId)
    .single();
  if (fetchError || !trip) return { ok: false, error: 'trip_not_found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not_organizer' };
  if (trip.phase !== 'sell') return { ok: false, error: 'already_locked' };

  // ─── Call the transactional RPC ───────────────────────────────────
  // The RPC does ALL writes inside a single transaction. If it raises
  // a PG exception (concurrent_lock_attempt, invalid_allocation_mode,
  // missing_actual_cost_for_organizer_books, headliner_item_id_mismatch,
  // unknown_item_type), supabase-js surfaces it on `error` and the
  // transaction has already rolled back — no DB changes persist.
  const { data, error: rpcError } = await supabase.rpc('fire_lock', {
    p_trip_id: p.tripId,
    p_lodging_id: p.lodgingChoice?.lodgingId ?? null,
    p_allocations: p.allocations.map((a) => ({
      itemType: a.itemType,
      itemId: a.itemId,
      mode: a.mode,
      actualCost: a.actualCost ?? null,
    })),
    p_lock_deadline: p.lockDeadline,
    p_payment_handles: p.paymentHandles ?? null,
  });

  if (rpcError) {
    // PG RAISE EXCEPTION text comes through on rpcError.message.
    // Surface it verbatim for Lock-B's wizard error handling — the
    // wizard distinguishes user-correctable (e.g.,
    // missing_actual_cost_for_organizer_books) from retry
    // (concurrent_lock_attempt) by code prefix.
    return { ok: false, error: rpcError.message };
  }

  // The RPC returns jsonb. supabase-js surfaces it as `data` typed as
  // unknown — narrow before reading.
  const payload = data as { ok?: boolean; error?: string; lockedAt?: string } | null;
  if (!payload || payload.ok !== true) {
    return { ok: false, error: payload?.error ?? 'unknown_rpc_failure' };
  }
  if (typeof payload.lockedAt !== 'string') {
    return { ok: false, error: 'malformed_rpc_response' };
  }

  // Best-effort activity log entry — failure here does NOT roll back
  // the lock. Mirrors the lock_trip pattern (lock-trip.ts:62-64).
  try {
    await logActivity(supabase, p.tripId, user.id, 'phase_lock');
  } catch {
    /* swallow — activity log is observational, not source of truth */
  }

  revalidatePath(`/trip/${p.slug}`);
  return { ok: true, lockedAt: payload.lockedAt };
}
