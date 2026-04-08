// Rally chassis-side enums + boundary mappers.
//
// The legacy DB types in src/types/index.ts predate the lexicon rewrite:
//   - RsvpStatus is 'in' | 'out' | 'maybe' | 'pending'   (4 states)
//   - TripPhase  is 'sketch' | 'sell' | 'lock' | 'go'    (no 'done')
//
// The new chassis vocabulary (lexicon §5.5–§5.10):
//   - RallyRsvp  is 'in' | 'holding' | 'out' | 'pending' (4 states)
//   - RallyPhase is 'sketch' | 'sell' | 'lock' | 'go' | 'done'
//
// 'pending' = invited but hasn't responded yet (the dashboard "your move"
// state). 'holding' = explicitly placed a hold on a seat. The two were
// briefly conflated; they are now distinct per Andrew's call.
//
// We do NOT modify the legacy types. Instead, every read from the DB layer
// passes through dbRsvpToRally / dbPhaseToRally; every write back passes
// through rallyRsvpToDb / rallyPhaseToDb. When supabase migration 004 lands
// (extending the enums), these become identity functions and get deleted.

import type { RsvpStatus, TripPhase } from '@/types';

// ─── Chassis enums ─────────────────────────────────────────────────────────

export type RallyRsvp = 'in' | 'holding' | 'out' | 'pending';
export type RallyPhase = 'sketch' | 'sell' | 'lock' | 'go' | 'done';

// ─── Boundary mappers: DB → chassis ────────────────────────────────────────

/**
 * Legacy 'maybe' is the closest analog to chassis 'holding' (an explicit
 * non-committal but interested response). Legacy 'pending' (no response
 * yet) maps 1:1 to chassis 'pending'. Unknown values throw so schema
 * drift fails loud at the boundary instead of silently defaulting.
 */
export function dbRsvpToRally(s: RsvpStatus): RallyRsvp {
  switch (s) {
    case 'in':
    case 'out':
    case 'pending':
      return s;
    case 'maybe':
      return 'holding';
    default: {
      const exhaustive: never = s;
      throw new Error(`dbRsvpToRally: unknown RsvpStatus ${String(exhaustive)}`);
    }
  }
}

/**
 * 'done' is computed at render time from commit_deadline + go state until
 * migration 004 lands; the DB layer never sees it, so this mapper is total.
 */
export function dbPhaseToRally(p: TripPhase): RallyPhase {
  switch (p) {
    case 'sketch':
    case 'sell':
    case 'lock':
    case 'go':
      return p;
    default: {
      const exhaustive: never = p;
      throw new Error(`dbPhaseToRally: unknown TripPhase ${String(exhaustive)}`);
    }
  }
}

// ─── Boundary mappers: chassis → DB ────────────────────────────────────────

/**
 * 'holding' → 'maybe' (the closest legacy equivalent). 'pending' → 'pending'
 * is lossless. Round-trip lossless for 'in', 'out', 'pending'; 'holding'
 * round-trips through 'maybe' which dbRsvpToRally maps back to 'holding'.
 */
export function rallyRsvpToDb(s: RallyRsvp): RsvpStatus {
  switch (s) {
    case 'in':
    case 'out':
    case 'pending':
      return s;
    case 'holding':
      return 'maybe';
    default: {
      const exhaustive: never = s;
      throw new Error(`rallyRsvpToDb: unknown RallyRsvp ${String(exhaustive)}`);
    }
  }
}

/**
 * 'done' has no DB equivalent yet. Map to 'go' so writes don't fail; the
 * 'done' state is read-only / computed-only until migration 004.
 */
export function rallyPhaseToDb(p: RallyPhase): TripPhase {
  switch (p) {
    case 'sketch':
    case 'sell':
    case 'lock':
    case 'go':
      return p;
    case 'done':
      return 'go';
    default: {
      const exhaustive: never = p;
      throw new Error(`rallyPhaseToDb: unknown RallyPhase ${String(exhaustive)}`);
    }
  }
}
