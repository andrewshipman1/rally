// Phase 5 — Invitee pre-login shell.
//
// Rendered by /trip/[slug]/page.tsx when the viewer has no auth session
// AND no guest cookie AND the trip is in a non-sketch phase. This is a
// LOGIN gate, not an RSVP gate: the hero + countdown + going row stay
// visible; only the plan details are blurred behind a "sign in to see
// the plan ↑" overlay.
//
// Composition strategy: reuse PostcardHero and ChassisCountdown as-is
// (they render identically to the live view). The going row is inline
// here because the invitee variant adds a dashed "you?" empty slot
// that the live going row doesn't need. LockedPlan + InviteeStickyBar
// are Phase-5-only primitives.

import { PostcardHero } from '@/components/trip/PostcardHero';
import { ChassisCountdown } from '@/components/trip/ChassisCountdown';
import { LockedPlan } from '@/components/trip/LockedPlan';
import { InviteeStickyBar } from '@/components/trip/InviteeStickyBar';
import { PoeticFooter } from '@/components/trip/PoeticFooter';
import { getCopy } from '@/lib/copy/get-copy';
import { getTheme } from '@/lib/themes';
import type { ThemeId } from '@/lib/themes/types';
import type { TripWithDetails, TripCostSummary } from '@/types';

type Props = {
  themeId: ThemeId;
  slug: string;
  trip: TripWithDetails;
  goingMembers: TripWithDetails['members'];
  inCount: number;
  cost: TripCostSummary;
};

export function InviteeShell({
  themeId,
  slug,
  trip,
  goingMembers,
  inCount,
  cost,
}: Props) {
  const theme = getTheme(themeId);
  const organizer = trip.organizer;
  const inviterFirst =
    organizer?.display_name?.trim().split(/\s+/)[0] ?? null;

  // Hero countdown label — same derivation as the live view, minus the
  // sell-phase "days to lock it in" override (invitees don't need the
  // cutoff messaging; they need the trip-start countdown).
  const themedSignature =
    typeof theme.strings.countdownSignature === 'string'
      ? theme.strings.countdownSignature
      : theme.strings.countdownSignature?.({});
  const heroLabel =
    themedSignature ?? getCopy(themeId, 'tripPageShared.countdown.label.signature');

  const fomoFlag = theme.strings.fomoFlag;

  return (
    <>
      <PostcardHero
        themeId={themeId}
        tripName={trip.name}
        destination={trip.destination}
        tagline={trip.tagline}
        coverImageUrl={trip.cover_image_url}
        organizerName={organizer?.display_name ?? ''}
        phase={trip.phase}
        isLive={false}
      />

      {trip.date_start && (
        <ChassisCountdown target={trip.date_start} label={heroLabel} flag={fomoFlag} />
      )}

      {/* Going row — label + avatar cascade + dashed "you?" slot */}
      <div className="going">
        <div className="going-label">
          {getCopy(themeId, 'inviteeState.goingLabel', { n: inCount })}
        </div>
        <div className="avatars">
          {goingMembers.slice(0, 5).map((m) => {
            const initial = (m.user.display_name ?? '?').slice(0, 1).toUpperCase();
            return (
              <div key={m.id} className="av" style={{ background: 'var(--sticker-bg)' }}>
                {initial}
              </div>
            );
          })}
          <div className="av av-empty">
            {getCopy(themeId, 'inviteeState.emptyAvatarLabel')}
          </div>
        </div>
      </div>

      <LockedPlan
        themeId={themeId}
        lodging={trip.lodging ?? []}
        flights={trip.flights ?? []}
        activities={trip.activities ?? []}
        cost={cost}
      />

      <PoeticFooter themeId={themeId} />

      <InviteeStickyBar themeId={themeId} slug={slug} inviterFirst={inviterFirst} />
    </>
  );
}
