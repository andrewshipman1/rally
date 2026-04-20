'use client';

// Session 9D — d:h:m:s scoreboard. Yellow-stickered tiles over an ink
// border + offset shadow, seconds tile ticks once per second, optional
// kicker + date line above, optional hint + wobbling emoji below.
//
// Props-only surface: the server component resolves lexicon strings and
// passes them down as plain props so this component stays client-pure.
// Hydration-safe: tick state is null on SSR and after mount renders "--"
// placeholders until the first interval fire; same pattern as
// ChassisCountdown.
//
// Source: rally-9d-scoreboard-mockup.html .scoreboard / .tile / .tile-secs.

import { useEffect, useRef, useState } from 'react';

type Units = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

type Props = {
  /** Target ISO date string. */
  target: string;
  /** Unit labels rendered under each tile. Required. */
  units: Units;
  /** Optional kicker line above the date (e.g., "lock in by"). When set,
   *  the kicker + date row renders; when absent, only tiles + hint show. */
  kicker?: string;
  /** Optional hint line rendered below the tiles. */
  hint?: string;
  /** Optional emoji rendered after the hint with a 3s wobble loop. */
  hintEmoji?: string;
};

type TickState = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

function computeTick(targetMs: number, nowMs: number): TickState {
  const diff = Math.max(0, targetMs - nowMs);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

function formatDateLabel(target: Date): string {
  // Client-detected tz → "mar 15 · 12pm est". Falls back to date-only if
  // the formatter doesn't surface the time-zone name.
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      timeZoneName: 'short',
    }).formatToParts(target);
    const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const month = pick('month');
    const day = pick('day');
    const hour = pick('hour');
    const dayPeriod = pick('dayPeriod');
    const tz = pick('timeZoneName');
    const timeBit = hour && dayPeriod ? `${hour}${dayPeriod}${tz ? ` ${tz}` : ''}` : '';
    const head = `${month} ${day}`.trim();
    return (timeBit ? `${head} · ${timeBit}` : head).toLowerCase();
  } catch {
    return '';
  }
}

export function CountdownScoreboard({ target, units, kicker, hint, hintEmoji }: Props) {
  const [tick, setTick] = useState<TickState | null>(null);
  const [dateLabel, setDateLabel] = useState<string>('');
  // 9D-fix — ref-guarded interval. Survives Next.js / Turbopack Fast
  // Refresh cleanly: if a previous effect didn't get its cleanup fired
  // (observed in Next 16 dev, 4–5× stacked ticks), we clear the stale
  // id before scheduling a new one. Prod is already single-tick.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const t = new Date(target);
    const targetMs = t.getTime();
    const update = () => setTick(computeTick(targetMs, Date.now()));
    update();
    setDateLabel(formatDateLabel(t));
    intervalRef.current = setInterval(update, 1000);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [target]);

  const showHeader = Boolean(kicker);
  const ph = '--';

  return (
    // 9F — wrap in .countdown-card (white-surface variant of the module
    // system). Interior markup, prop surface, and tick logic unchanged.
    <div className="countdown-card">
      <div className="scoreboard">
        {showHeader && (
          <>
            <div className="scoreboard-kicker">{kicker}</div>
            <div className="scoreboard-date">{dateLabel || ph}</div>
          </>
        )}
        <div className="scoreboard-tiles" role="timer" aria-live="off">
          <div className="tile">
            <div className="tile-num">{tick?.days ?? ph}</div>
            <div className="tile-label">{units.days}</div>
          </div>
          <div className="tile">
            <div className="tile-num">{tick?.hours ?? ph}</div>
            <div className="tile-label">{units.hours}</div>
          </div>
          <div className="tile">
            <div className="tile-num">{tick?.minutes ?? ph}</div>
            <div className="tile-label">{units.minutes}</div>
          </div>
          <div className="tile tile-secs">
            <div className="tile-num">{tick?.seconds ?? ph}</div>
            <div className="tile-label">{units.seconds}</div>
          </div>
        </div>
        {hint && (
          <div className="scoreboard-hint">
            {hint}
            {hintEmoji && (
              <>
                {' '}
                <span className="lock-emoji" aria-hidden="true">{hintEmoji}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
