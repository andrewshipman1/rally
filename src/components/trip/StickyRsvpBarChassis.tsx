'use client';

// Three-state sticky RSVP bar against the phase 2 chassis.
//
// Two render modes for the invitee branch (10F):
//   - entry:     3-chip segmented control (icon + canonical state word)
//   - committed: single status pill (icon + themed button text + change)
// Re-tap "change" returns to entry with the previously-committed chip
// pre-styled .active. Submitting a new state morphs back to committed.
//
// Per lexicon §5.10:
//   - chip icons are LOCKED GLOBAL (🙌 / 🙏 / 👋) — never themed
//   - button CTA TEXT is themeable; lives in theme.strings.{state}.button
//
// 10F also adds a sticker burst (theme emoji extracted from
// sticker.invite via regex) and a haptic vibration on commit.
//
// The DB stores 'in' | 'holding' | 'out' | 'awaiting' directly
// (migration 008 created the four-state enum; migration 025 renamed
// 'pending' to 'awaiting'). No boundary mapping needed.

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

type EntryState = Exclude<RallyRsvp, 'awaiting'>;

const STATES: { id: EntryState; word: string }[] = [
  { id: 'in',      word: 'in' },
  { id: 'holding', word: 'holding' },
  { id: 'out',     word: 'out' },
];

const TRAILING_PICTOGRAPH = /\s*\p{Extended_Pictographic}\s*$/u;

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
  const [changing, setChanging] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

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

  const submit = async (state: EntryState) => {
    setError(null);
    setOptimistic(state);
    setChanging(false);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
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
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 800);
    } catch {
      setError(getCopy(themeId, 'errors.networkDown'));
      setOptimistic(current);
    }
  };

  const committedState: EntryState | null =
    optimistic === 'in' || optimistic === 'holding' || optimistic === 'out'
      ? optimistic
      : null;
  const mode: 'entry' | 'committed' =
    committedState && !changing ? 'committed' : 'entry';

  // Theme emoji for the sticker burst — pulled from sticker.invite, with
  // a defensive fallback if a theme drifts and loses the trailing pictograph.
  const stickerInvite = getCopy(themeId, 'sticker.invite');
  const stickerEmoji =
    stickerInvite.match(/(\p{Extended_Pictographic})\s*$/u)?.[1] ?? '🎉';

  if (mode === 'committed' && committedState) {
    const themedLabel = getCopy(themeId, `rsvp.${committedState}.button`);
    const trailing = themedLabel.match(/\s*(\p{Extended_Pictographic})\s*$/u);
    const stripped =
      trailing && trailing[1] === RSVP_CHIP_ICONS[committedState]
        ? themedLabel.replace(TRAILING_PICTOGRAPH, '')
        : themedLabel;
    return (
      <div className={`sticky sticky--committed is-${committedState}`}>
        <span className="sticky-pill-icon" aria-hidden="true">
          {RSVP_CHIP_ICONS[committedState]}
        </span>
        <span className="sticky-pill-text">{stripped}</span>
        <button
          type="button"
          className="sticky-change"
          onClick={() => setChanging(true)}
          disabled={pending}
        >
          {getCopy(themeId, 'inviteeStickyBar.change')}
        </button>
        {showBurst && (
          <span className="sticky-burst" aria-hidden="true">
            {stickerEmoji}
          </span>
        )}
        {showConfetti && <Confetti />}
      </div>
    );
  }

  return (
    <div className="sticky sticky--entry">
      {STATES.map(({ id, word }) => {
        const isActive = optimistic === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => void submit(id)}
            disabled={pending}
            aria-pressed={isActive}
            className={`sticky-chip${isActive ? ' active' : ''}`}
          >
            <span className="sticky-chip-icon" aria-hidden="true">
              {RSVP_CHIP_ICONS[id]}
            </span>
            <span className="sticky-chip-word">{word}</span>
          </button>
        );
      })}
      {error && <div className="sticky-error">{error}</div>}
      {showBurst && (
        <span className="sticky-burst" aria-hidden="true">
          {stickerEmoji}
        </span>
      )}
      {showConfetti && <Confetti />}
    </div>
  );
}
