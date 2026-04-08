'use client';

// Phase 2 chassis countdown — single big day number on the surface block,
// with an accent flag absolute-positioned at top-right. Hydration-safe:
// initial state is null and the number renders as `--` during SSR; the
// useEffect computes once on mount and then ticks once per minute (we don't
// need second-precision for "X days until liftoff").
//
// Source: rally-phase-2-theme-system.html .chassis .countdown block.

import { useEffect, useState } from 'react';

type Props = {
  /** Target ISO date string. */
  target: string;
  /** Label below the number, e.g. "days until liftoff". */
  label: string;
  /** Optional flag word in the top-right corner, e.g. "lfg" or "i do, i do". */
  flag?: string;
};

function daysUntil(target: Date, now: Date = new Date()): number {
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / 86_400_000));
}

export function ChassisCountdown({ target, label, flag }: Props) {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    const t = new Date(target);
    const tick = () => setN(daysUntil(t));
    tick();
    // Once a minute is plenty for day-precision; saves a needless 1Hz interval.
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="countdown">
      {flag && <div className="cd-flag">{flag}</div>}
      <div className="cd-num">{n ?? '--'}</div>
      <div className="cd-label">{label}</div>
    </div>
  );
}
