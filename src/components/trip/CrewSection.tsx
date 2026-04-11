// Inline crew section for the trip page. Extracted from the former
// /trip/[slug]/crew route page. Shows members grouped by RSVP state
// with summary strip and invite button.

import { formatDistanceToNow } from 'date-fns';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { RallyRsvp } from '@/lib/rally-types';
import type { TripMember, User } from '@/types';
import { Reveal } from '@/components/ui/Reveal';
import { CrewInviteButton } from './CrewInviteButton';
import { CrewAvatarTap } from './CrewAvatarTap';

type MemberRow = TripMember & { user: User };

type Props = {
  members: MemberRow[];
  organizerId: string;
  currentUserId: string | null;
  themeId: ThemeId;
  tripName: string;
  tripId: string;
  slug: string;
};

const STATE_ORDER: readonly RallyRsvp[] = ['in', 'holding', 'out'] as const;

const EMPTY_KEY: Record<RallyRsvp, string> = {
  in: 'crew.emptyStateIn',
  holding: 'crew.emptyStateHolding',
  out: 'crew.emptyStateOut',
  pending: 'crew.emptyStatePending',
};

export function CrewSection({
  members,
  organizerId,
  currentUserId,
  themeId,
  tripName,
  tripId,
  slug,
}: Props) {
  // Group by RSVP state. Organizer first within each bucket.
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
    <div className="crew-inline">
      <Reveal delay={0}>
        <h2 className="module-title">{getCopy(themeId, 'crew.pageTitle')}</h2>
        <p className="crew-subtitle">
          {getCopy(themeId, 'crew.pageSubtitle', { n: inCount, trip_name: tripName })}
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
      </Reveal>

      {STATE_ORDER.map((state, i) => (
        <Reveal key={state} delay={0.05 + i * 0.05} direction="left">
          <section className="crew-section">
            <h3 className="crew-section-title">
              {getCopy(themeId, `rsvp.crew.section.${state}`)}
            </h3>
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

      <CrewInviteButton tripId={tripId} slug={slug} themeId={themeId} />
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
  themeId: ThemeId;
}) {
  const name = member.user?.display_name ?? '?';
  const initial = name.slice(0, 1).toUpperCase();

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

  let plusOneSubtext: string | null = null;
  if (member.plus_one) {
    plusOneSubtext = member.plus_one_name
      ? getCopy(themeId, 'crew.plusOneSubtext', { name: member.plus_one_name })
      : getCopy(themeId, 'crew.plusOneSubtextAnon');
  }

  return (
    <li className="crew-row">
      {member.user ? (
        <CrewAvatarTap user={member.user}>
          <div className="av crew-row-av" style={{ background: 'var(--sticker-bg)' }}>
            {initial}
          </div>
        </CrewAvatarTap>
      ) : (
        <div className="av crew-row-av" style={{ background: 'var(--sticker-bg)' }}>
          {initial}
        </div>
      )}
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
