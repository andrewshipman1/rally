'use client';

// Three-state sticky RSVP bar against the phase 2 chassis.
//
// Renders three pills (in / holding / out) using the GLOBAL chip icons
// from copy/surfaces/rsvp.ts. The button label below the active row uses
// the THEMED text from theme.strings.{state}.button via
// getCopy(). Per lexicon §5.10:
//   - chip icons are LOCKED GLOBAL (🙌 / 🧗 / —) — never themed
//   - button CTA TEXT is themeable
//
// The DB now stores 'in' | 'holding' | 'out' | 'pending' directly
// (migration 008). No boundary mapping needed.

import { useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import { RSVP_CHIP_ICONS } from '@/lib/copy/surfaces/rsvp';
import { Confetti } from '@/components/ui/Confetti';
import type { ThemeId } from '@/lib/themes/types';
import type { RallyRsvp } from '@/lib/rally-types';

type Props = {
  themeId: ThemeId;
  tripId: string;
  /** Current viewer's RSVP, or null if not yet RSVP'd. */
  current: RallyRsvp | null;
  /** Display name + email for new RSVPs (post-auth, this is set). */
  viewerName: string | null;
  viewerEmail: string | null;
  /** When true, show "you started this" instead of RSVP buttons. */
  isOrganizer?: boolean;
};

const STATES: { id: Exclude<RallyRsvp, 'pending'>; copyKey: string }[] = [
  { id: 'in',      copyKey: 'rsvp.in.button' },
  { id: 'holding', copyKey: 'rsvp.holding.button' },
  { id: 'out',     copyKey: 'rsvp.out.button' },
];

export function StickyRsvpBarChassis({
  themeId,
  tripId,
  current,
  viewerName,
  viewerEmail,
  isOrganizer,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<RallyRsvp | null>(current);
  const [showConfetti, setShowConfetti] = useState(false);

  if (isOrganizer) {
    return (
      <div className="sticky sticky--organizer">
        <span className="sticky-organizer-text">
          {'★ '}{getCopy(themeId, 'builderState.eyebrow')}
        </span>
        <button
          type="button"
          className="sticky-organizer-edit"
          onClick={() => router.push(`${pathname}?edit=1`)}
        >
          {getCopy(themeId, 'builderState.editCta')}
        </button>
      </div>
    );
  }

  const submit = async (state: Exclude<RallyRsvp, 'pending'>) => {
    setError(null);
    setOptimistic(state);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tripId,
          name: viewerName ?? '',
          email: viewerEmail ?? undefined,
          status: state,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? getCopy(themeId, 'errors.saveFailed'));
        setOptimistic(current);
        return;
      }
      // Re-render the server component so n_in / n_hold / per-person cost
      // refresh without a full reload.
      startTransition(() => router.refresh());
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } catch {
      setError(getCopy(themeId, 'errors.networkDown'));
      setOptimistic(current);
    }
  };

  return (
    <div className="sticky">
      {STATES.map(({ id, copyKey }) => {
        const isActive = optimistic === id;
        const label = getCopy(themeId, copyKey);
        return (
          <button
            key={id}
            type="button"
            onClick={() => void submit(id)}
            disabled={pending}
            aria-pressed={isActive}
            className={`sticky-chip${isActive ? ' active' : ''}`}
          >
            <span aria-hidden="true">{RSVP_CHIP_ICONS[id]}</span>
            <span>{label}</span>
          </button>
        );
      })}
      {error && <div className="sticky-error">{error}</div>}
      {showConfetti && <Confetti />}
    </div>
  );
}
