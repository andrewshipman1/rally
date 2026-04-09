// §5.25 — Crew subsurface. Read-only expanded guest list grouped by
// RSVP state. Replaces the old inline GuestList card on the trip page.
//
// Auth mirrors the trip page: Supabase session OR signed guest cookie.
// Unauthenticated viewers on non-sketch trips are bounced back to the
// trip page (same condition that would have shown InviteeShell there).
// Sketch trips never link here.

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { formatDistanceToNow } from 'date-fns';

import { createClient } from '@/lib/supabase/server';
import { getGuestUserId, refreshGuestCookie } from '@/lib/guest-auth';
import type { RallyRsvp } from '@/lib/rally-types';
import { chassisThemeIdFromTemplate } from '@/lib/themes/from-db';
import { getCopy } from '@/lib/copy/get-copy';
import type { TripMember, User } from '@/types';
import { getTrip } from '../_data';
import { Reveal } from '@/components/ui/Reveal';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTrip(slug);
  if (!trip) return { title: 'rally — not found' };
  return { title: `the crew — ${trip.name}` };
}

type MemberRow = TripMember & { user: User };

const STATE_ORDER: readonly RallyRsvp[] = ['in', 'holding', 'out', 'pending'] as const;

const EMPTY_KEY: Record<RallyRsvp, string> = {
  in: 'crew.emptyStateIn',
  holding: 'crew.emptyStateHolding',
  out: 'crew.emptyStateOut',
  pending: 'crew.emptyStatePending',
};

export default async function CrewPage({ params }: Props) {
  const { slug } = await params;
  const trip = await getTrip(slug);
  if (!trip) notFound();

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const guestUserId = await getGuestUserId();
  const currentUserId = currentUser?.id || guestUserId || null;
  if (currentUserId) await refreshGuestCookie();

  // Sketch trips don't have a shareable crew yet; bounce to the trip
  // page which will short-circuit to the sketch shell. Unauthenticated
  // viewers on non-sketch trips belong in the invitee shell, not here.
  if (trip.phase === 'sketch' || currentUserId === null) {
    redirect(`/trip/${slug}`);
  }

  const themeId = chassisThemeIdFromTemplate(trip.theme?.template_name);
  const members = (trip.members || []) as MemberRow[];
  const organizerId = trip.organizer.id;

  // Group by RSVP state. Within each bucket, organizer first, then alpha.
  const buckets: Record<RallyRsvp, MemberRow[]> = {
    in: [],
    holding: [],
    out: [],
    pending: [],
  };
  for (const m of members) {
    buckets[m.rsvp].push(m);
  }
  for (const state of STATE_ORDER) {
    buckets[state].sort((a, b) => {
      if (a.user_id === organizerId) return -1;
      if (b.user_id === organizerId) return 1;
      return (a.user?.display_name ?? '').localeCompare(b.user?.display_name ?? '');
    });
  }

  const inCount = buckets.in.length;
  const holdingCount = buckets.holding.length;
  const outCount = buckets.out.length;

  return (
    <div className="chassis" data-theme={themeId}>
      <div className="crew-surface">
        <Link href={`/trip/${slug}`} className="crew-back">
          ← {getCopy(themeId, 'crew.backLink')}
        </Link>

        <h1 className="crew-title">{getCopy(themeId, 'crew.pageTitle')}</h1>
        <p className="crew-subtitle">
          {getCopy(themeId, 'crew.pageSubtitle', { n: inCount, trip_name: trip.name })}
        </p>

        <Reveal delay={0}>
          <div className="crew-summary">
            <span className="crew-tally">
              <strong>{inCount}</strong> {getCopy(themeId, 'crew.summaryIn')}
            </span>
            <span className="crew-tally">
              <strong>{holdingCount}</strong> {getCopy(themeId, 'crew.summaryHolding')}
            </span>
            <span className="crew-tally">
              <strong>{outCount}</strong> {getCopy(themeId, 'crew.summaryOut')}
            </span>
          </div>
        </Reveal>

        {STATE_ORDER.map((state, i) => (
          <Reveal key={state} delay={0.05 + i * 0.05} direction="left">
            <section className="crew-section">
              <h2 className="crew-section-title">
                {getCopy(themeId, `rsvp.crew.section.${state}`)}
              </h2>
              <p className="crew-section-caption">
                {getCopy(themeId, `rsvp.crew.caption.${state}`)}
              </p>
              {buckets[state].length === 0 ? (
                <p className="crew-empty">{getCopy(themeId, EMPTY_KEY[state])}</p>
              ) : (
                <ul className="crew-rows">
                  {buckets[state].map((m) => (
                    <CrewRow
                      key={m.id}
                      member={m}
                      state={state}
                      isOrganizer={m.user_id === organizerId}
                      isViewer={m.user_id === currentUserId}
                      themeId={themeId}
                    />
                  ))}
                </ul>
              )}
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function CrewRow({
  member,
  state,
  isOrganizer,
  isViewer,
  themeId,
}: {
  member: MemberRow;
  state: RallyRsvp;
  isOrganizer: boolean;
  isViewer: boolean;
  themeId: ReturnType<typeof chassisThemeIdFromTemplate>;
}) {
  const name = member.user?.display_name ?? '?';
  const initial = name.slice(0, 1).toUpperCase();

  // Subtext logic per lexicon §5.25:
  //   pending + no invite_opened_at → "hasn't opened the invite"
  //   pending + invite_opened_at    → "opened · hasn't rsvp'd"
  //   out + decline_reason          → "{reason}"
  //   in / holding / out (no reason) → "rsvp'd {when}"
  let subtext: string | null = null;
  if (state === 'pending') {
    subtext = member.invite_opened_at
      ? getCopy(themeId, 'crew.rowSubOpened')
      : getCopy(themeId, 'crew.rowSubUnopened');
  } else if (state === 'out' && member.decline_reason) {
    subtext = getCopy(themeId, 'crew.rowSubOutReason', { reason: member.decline_reason });
  } else {
    const when = formatDistanceToNow(new Date(member.updated_at), { addSuffix: true });
    subtext = getCopy(themeId, 'crew.rowSubRsvpd', { when });
  }

  // +1 subtext: named if plus_one_name exists, anonymous otherwise.
  let plusOneSubtext: string | null = null;
  if (member.plus_one) {
    plusOneSubtext = member.plus_one_name
      ? getCopy(themeId, 'crew.plusOneSubtext', { name: member.plus_one_name })
      : getCopy(themeId, 'crew.plusOneSubtextAnon');
  }

  return (
    <li className="crew-row">
      <div className="av crew-row-av" style={{ background: 'var(--sticker-bg)' }}>
        {initial}
      </div>
      <div className="crew-row-body">
        <div className="crew-row-name">
          {name}
          {isOrganizer && (
            <span className="crew-row-host"> {getCopy(themeId, 'crew.hostMarker')}</span>
          )}
          {isViewer && (
            <span className="crew-row-you"> · {getCopy(themeId, 'crew.youTag')}</span>
          )}
        </div>
        {subtext && <div className="crew-row-sub">{subtext}</div>}
        {plusOneSubtext && <div className="crew-row-sub">{plusOneSubtext}</div>}
      </div>
    </li>
  );
}
