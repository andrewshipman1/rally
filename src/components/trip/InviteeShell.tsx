// Phase 5 — invitee pre-login shell.
//
// Rendered by /trip/[slug]/page.tsx (unauthed branch in non-sketch phases)
// and by /i/[token]/page.tsx (10C resolver). Login gate, not RSVP gate:
// hero + countdown stay visible; the plan is blurred behind a "sign in
// to see the plan" overlay until the magic-link round-trip completes.
//
// Composition strategy: server-render the static-state pieces
// (PostcardHero + CountdownScoreboard) here, then delegate the
// auth-state-aware portion (LockedPlan, PoeticFooter, InviteeStickyBar)
// to InviteeShellClient. The client wrapper owns the unlocked + linkSent
// state driven by Supabase's onAuthStateChange listener (10D).
//
// 10D.5: PostcardHero now inherits the date-row render path (date_start +
// date_end passed through), and the trip-start countdown was swapped
// for the cutoff-targeting CountdownScoreboard so the teaser matches
// the post-login sell hero.

import { PostcardHero } from '@/components/trip/PostcardHero';
import { CountdownScoreboard } from '@/components/trip/CountdownScoreboard';
import { InviteeShellClient } from '@/components/trip/InviteeShellClient';
import { getCopy } from '@/lib/copy/get-copy';
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
  const organizer = trip.organizer;
  const inviterFirst =
    organizer?.display_name?.trim().split(/\s+/)[0] ?? null;

  // 10D.5 — scoreboard prop derivation mirrors /trip/[slug]/page.tsx
  // lines 255-263 exactly. Reuses existing lexicon; no new keys.
  const cutoffIso = trip.commit_deadline;
  const sbKicker = getCopy(themeId, 'tripPageSell.scoreboard.kicker');
  const sbHint = getCopy(themeId, 'tripPageSell.scoreboard.hint');
  const sbHintEmoji = getCopy(themeId, 'tripPageSell.scoreboard.hintEmoji');
  const sbUnits = {
    days: getCopy(themeId, 'tripPageShared.scoreboard.units.days'),
    hours: getCopy(themeId, 'tripPageShared.scoreboard.units.hours'),
    minutes: getCopy(themeId, 'tripPageShared.scoreboard.units.minutes'),
    seconds: getCopy(themeId, 'tripPageShared.scoreboard.units.seconds'),
  };

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
        dateStartIso={trip.date_start}
        dateEndIso={trip.date_end}
        inviteeOverrides={{
          inviterRowText: getCopy(themeId, 'inviteeState.inviterRow', { inviter_first: inviterFirst }),
          inviterInitial: (inviterFirst ?? '?').slice(0, 1).toUpperCase(),
          eyebrowText: getCopy(themeId, 'inviteeState.eyebrow', { trip_name: trip.name }),
        }}
      />

      {cutoffIso && (
        <CountdownScoreboard
          target={cutoffIso}
          units={sbUnits}
          kicker={sbKicker}
          hint={sbHint}
          hintEmoji={sbHintEmoji}
        />
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
