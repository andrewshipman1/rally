// Phase 5 — invitee pre-login shell.
//
// Rendered by /trip/[slug]/page.tsx (unauthed branch in non-sketch phases)
// and by /i/[token]/page.tsx (10C resolver). Login gate, not RSVP gate:
// hero + countdown stay visible; the plan is blurred behind a "sign in
// to see the plan" overlay until the magic-link round-trip completes.
//
// Composition strategy: server-render the static-state pieces
// (PostcardHero + ChassisCountdown) here, then delegate the
// auth-state-aware portion (LockedPlan, PoeticFooter, InviteeStickyBar)
// to InviteeShellClient. The client wrapper owns the unlocked + linkSent
// state driven by Supabase's onAuthStateChange listener (10D).

import { PostcardHero } from '@/components/trip/PostcardHero';
import { ChassisCountdown } from '@/components/trip/ChassisCountdown';
import { InviteeShellClient } from '@/components/trip/InviteeShellClient';
import { getCopy } from '@/lib/copy/get-copy';
import { getTheme } from '@/lib/themes';
import type { ThemeId } from '@/lib/themes/types';
import type { TripWithDetails, TripCostSummary } from '@/types';

type Props = {
  themeId: ThemeId;
  slug: string;
  trip: TripWithDetails;
  cost: TripCostSummary;
  inviteeEmail: string;
  inviteToken: string;
  /** 10D-followup — set by the resolver when the viewer arrived via a
   *  same-tab magic-link click (`?just_authed=1`). Triggers the reveal
   *  animation on InviteeShellClient mount without waiting for an
   *  onAuthStateChange event. */
  freshAuth?: boolean;
};

export function InviteeShell({
  themeId,
  slug,
  trip,
  cost,
  inviteeEmail,
  inviteToken,
  freshAuth = false,
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
        inviteeOverrides={{
          inviterRowText: getCopy(themeId, 'inviteeState.inviterRow', { inviter_first: inviterFirst }),
          inviterInitial: (inviterFirst ?? '?').slice(0, 1).toUpperCase(),
          eyebrowText: getCopy(themeId, 'inviteeState.eyebrow', { trip_name: trip.name }),
        }}
      />

      {trip.date_start && (
        <ChassisCountdown target={trip.date_start} label={heroLabel} flag={fomoFlag} />
      )}

      <InviteeShellClient
        themeId={themeId}
        slug={slug}
        inviteeEmail={inviteeEmail}
        inviteToken={inviteToken}
        lodging={trip.lodging ?? []}
        flights={trip.flights ?? []}
        activities={trip.activities ?? []}
        cost={cost}
        freshAuth={freshAuth}
      />
    </>
  );
}
