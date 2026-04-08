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
import { dbRsvpToRally, type RallyRsvp } from '@/lib/rally-types';
import { chassisThemeIdFromTemplate } from '@/lib/themes/from-db';
import { getCopy } from '@/lib/copy/get-copy';
import type { TripMember, User } from '@/types';
import { getTrip } from '../_data';

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

  // Group by chassis RSVP state ('maybe' → 'holding' via the boundary
  // mapper). Within each bucket, organizer first, then alpha by name.
  const buckets: Record<RallyRsvp, MemberRow[]> = {
    in: [],
    holding: [],
    out: [],
    pending: [],
  };
  for (const m of members) {
    buckets[dbRsvpToRally(m.rsvp)].push(m);
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

        {STATE_ORDER.map((state) => (
          <section key={state} className="crew-section">
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

  // v0 subtext fallback: we only have `updated_at` for rsvp'd-when and
  // no invite-open tracking, no decline reason, no plus-one name.
  // Pending rows render no subtext. Everyone else gets "rsvp'd Nd ago".
  let subtext: string | null = null;
  if (state !== 'pending') {
    const when = formatDistanceToNow(new Date(member.updated_at), { addSuffix: true });
    subtext = getCopy(themeId, 'crew.rowSubRsvpd', { when });
  }
  const plusOneSubtext = member.plus_one ? getCopy(themeId, 'crew.plusOneSubtextAnon') : null;

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
