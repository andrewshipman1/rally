// Contract tests for the legacy <-> chassis RSVP/phase boundary mappers.
//
// These mappers are TEMPORARY — they exist because the chassis vocabulary
// ('holding', 'done') is ahead of the DB enums ('maybe'; no 'done'). Once
// the Session 3 migration extends the DB enums, the mappers collapse to
// identity functions and get deleted. Until then, this suite pins their
// behavior so drift fails at CI instead of at runtime.
import { describe, it, expect } from 'vitest';
import {
  dbRsvpToRally,
  rallyRsvpToDb,
  dbPhaseToRally,
  rallyPhaseToDb,
  type RallyRsvp,
  type RallyPhase,
} from '../rally-types';
import type { RsvpStatus, TripPhase } from '@/types';

// ─── RSVP mapper ────────────────────────────────────────────────────────

describe('dbRsvpToRally', () => {
  it('maps legacy "in" to chassis "in"', () => {
    expect(dbRsvpToRally('in')).toBe('in');
  });

  it('maps legacy "out" to chassis "out"', () => {
    expect(dbRsvpToRally('out')).toBe('out');
  });

  it('maps legacy "maybe" to chassis "holding"', () => {
    expect(dbRsvpToRally('maybe')).toBe('holding');
  });

  it('maps legacy "pending" to chassis "pending"', () => {
    expect(dbRsvpToRally('pending')).toBe('pending');
  });

  it('throws on unknown legacy value (schema drift guard)', () => {
    expect(() => dbRsvpToRally('garbage' as unknown as RsvpStatus)).toThrow(
      /unknown RsvpStatus/,
    );
  });
});

describe('rallyRsvpToDb', () => {
  it('maps chassis "in" to legacy "in"', () => {
    expect(rallyRsvpToDb('in')).toBe('in');
  });

  it('maps chassis "out" to legacy "out"', () => {
    expect(rallyRsvpToDb('out')).toBe('out');
  });

  it('maps chassis "holding" to legacy "maybe"', () => {
    expect(rallyRsvpToDb('holding')).toBe('maybe');
  });

  it('maps chassis "pending" to legacy "pending"', () => {
    expect(rallyRsvpToDb('pending')).toBe('pending');
  });

  it('throws on unknown chassis value (schema drift guard)', () => {
    expect(() => rallyRsvpToDb('garbage' as unknown as RallyRsvp)).toThrow(
      /unknown RallyRsvp/,
    );
  });
});

describe('RSVP round-trip invariant', () => {
  const legacyValues: RsvpStatus[] = ['in', 'out', 'maybe', 'pending'];
  const chassisValues: RallyRsvp[] = ['in', 'out', 'holding', 'pending'];

  it.each(legacyValues)('legacy → chassis → legacy is identity for %s', (v) => {
    expect(rallyRsvpToDb(dbRsvpToRally(v))).toBe(v);
  });

  it.each(chassisValues)('chassis → legacy → chassis is identity for %s', (v) => {
    expect(dbRsvpToRally(rallyRsvpToDb(v))).toBe(v);
  });
});

// ─── Phase mapper ───────────────────────────────────────────────────────

describe('dbPhaseToRally', () => {
  it.each(['sketch', 'sell', 'lock', 'go'] satisfies TripPhase[])(
    'passes through legacy %s unchanged',
    (p) => {
      expect(dbPhaseToRally(p)).toBe(p);
    },
  );

  it('throws on unknown legacy phase', () => {
    expect(() => dbPhaseToRally('done' as unknown as TripPhase)).toThrow(
      /unknown TripPhase/,
    );
  });
});

describe('rallyPhaseToDb', () => {
  it.each(['sketch', 'sell', 'lock', 'go'] satisfies RallyPhase[])(
    'passes through chassis %s unchanged',
    (p) => {
      expect(rallyPhaseToDb(p)).toBe(p);
    },
  );

  it('maps chassis "done" to legacy "go" (lossy, by design)', () => {
    expect(rallyPhaseToDb('done')).toBe('go');
  });

  it('throws on unknown chassis phase', () => {
    expect(() => rallyPhaseToDb('archived' as unknown as RallyPhase)).toThrow(
      /unknown RallyPhase/,
    );
  });
});

describe('Phase round-trip invariant (excluding the lossy "done" case)', () => {
  const legacyValues: TripPhase[] = ['sketch', 'sell', 'lock', 'go'];

  it.each(legacyValues)('legacy → chassis → legacy is identity for %s', (p) => {
    expect(rallyPhaseToDb(dbPhaseToRally(p))).toBe(p);
  });

  it('"done" is a one-way map (chassis-only state)', () => {
    // 'done' → 'go' is intentional: the DB has no 'done' enum yet, and
    // 'done' is computed at render time. The round-trip chassis→db→chassis
    // for 'done' is LOSSY and that is acceptable until the Session 3
    // migration extends the TripPhase enum.
    expect(rallyPhaseToDb('done')).toBe('go');
    expect(dbPhaseToRally('go')).toBe('go'); // not 'done'
  });
});
