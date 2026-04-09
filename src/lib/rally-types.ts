// Rally chassis-side enums + phase boundary mapper.
//
// RallyRsvp is now identical to RsvpStatus after migration 008
// replaced 'maybe' with 'holding'. The RSVP boundary mappers
// (dbRsvpToRally / rallyRsvpToDb) have been deleted.
//
// The phase mapper remains because the DB enum doesn't have 'done'
// yet — that's computed at render time.

import type { TripPhase } from '@/types';

// ─── Chassis enums ─────────────────────────────────────────────────────────

export type RallyRsvp = 'in' | 'holding' | 'out' | 'pending';
export type RallyPhase = 'sketch' | 'sell' | 'lock' | 'go' | 'done';

// ─── Boundary mapper: DB → chassis (phase only) ───────────────────────────

/**
 * 'done' is computed at render time from commit_deadline + go state until
 * a future migration adds it to the DB enum.
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

// ─── Done-phase computation ───────────────────────────────────────────────

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * A trip is "done" when it's in 'go' phase and its end date is 30+ days
 * in the past. Used by dashboard and passport for phase grouping.
 */
export function isTripDone(phase: string, dateEnd: string | null): boolean {
  if (phase !== 'go') return false;
  if (!dateEnd) return false;
  return new Date(dateEnd).getTime() < Date.now() - THIRTY_DAYS_MS;
}

/** Compute the display phase for a trip, mapping go → done when appropriate. */
export function computeRallyPhase(phase: string, dateEnd: string | null): RallyPhase {
  if (isTripDone(phase, dateEnd)) return 'done';
  return dbPhaseToRally(phase as TripPhase);
}

/**
 * 'done' has no DB equivalent yet. Map to 'go' so writes don't fail; the
 * 'done' state is read-only / computed-only until a future migration.
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
