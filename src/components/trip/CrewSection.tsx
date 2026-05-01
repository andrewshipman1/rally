'use client';

// Inline crew section for the trip page. Rebuilt in 9M:
// - Wrapped in `.module-section.crew-module` (sibling-pattern bordered container).
// - Per-state collapsibles with avatar-pile preview + chevron.
// - States with zero members are hidden entirely (no empty-state
//   placeholders inside collapsed shells).

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { RallyRsvp } from '@/lib/rally-types';
import type { TripMember, User } from '@/types';
import { CrewAvatarTap } from './CrewAvatarTap';

type MemberRow = TripMember & { user: User };

// 10H — sparse-profile predicate for the viewer-only passport nudge.
// "Sparse" = no bio, no instagram_handle, no tiktok_handle, no photo.
// Returns false defensively when user is missing (no nudge if we can't
// confirm sparseness).
function isSparseProfile(user: User | null | undefined): boolean {
  if (!user) return false;
  return !(
    user.bio ||
    user.instagram_handle ||
    user.tiktok_handle ||
    user.profile_photo_url
  );
}

type Props = {
  members: MemberRow[];
  organizerId: string;
  currentUserId: string | null;
  themeId: ThemeId;
  tripName: string;
  tripId: string;
  slug: string;
};

const STATE_ORDER: readonly RallyRsvp[] = ['in', 'holding', 'out', 'awaiting'] as const;
const PILE_LIMIT = 5;

export function CrewSection({
  members,
  organizerId,
  currentUserId,
  themeId,
}: Props) {
  const [expanded, setExpanded] = useState<Record<RallyRsvp, boolean>>({
    in: false,
    holding: false,
    out: false,
    awaiting: false,
  });

  const buckets: Record<RallyRsvp, MemberRow[]> = {
    in: [],
    holding: [],
    out: [],
    awaiting: [],
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
  const total = members.length;
  const eyebrowKey =
    total > inCount ? 'crew.eyebrowRalliedPartial' : 'crew.eyebrowRalliedAll';

  const toggle = (state: RallyRsvp) =>
    setExpanded((prev) => ({ ...prev, [state]: !prev[state] }));

  return (
    <div className="module-section crew-module">
      <div className="module-section-header">
        <span className="module-section-title">
          {getCopy(themeId, 'crew.pageTitle')}
        </span>
        <span className="module-section-count">
          {getCopy(themeId, eyebrowKey, { n: inCount, total })}
        </span>
      </div>
      {STATE_ORDER.map((state) => {
        const rows = buckets[state];
        if (rows.length === 0) return null;
        const isExpanded = expanded[state];
        const pileRows = rows.slice(0, PILE_LIMIT);
        const overflow = Math.max(0, rows.length - PILE_LIMIT);
        return (
          <div
            key={state}
            className={`crew-state-collapsible${isExpanded ? ' expanded' : ''}`}
          >
            <button
              type="button"
              className="crew-state-header"
              aria-expanded={isExpanded}
              onClick={() => toggle(state)}
            >
              <span className="crew-state-header-left">
                <span className={`crew-tally-pill ${state}`}>
                  {state === 'awaiting' ? (
                    getCopy(themeId, `rsvp.crew.section.${state}`, { count: rows.length })
                  ) : (
                    <>
                      <strong>{rows.length}</strong>{' '}
                      {getCopy(themeId, `rsvp.crew.section.${state}`)}
                    </>
                  )}
                </span>
              </span>
              <span className="crew-state-pile">
                {pileRows.map((m) => (
                  <PileAvatar key={m.id} member={m} />
                ))}
                {overflow > 0 && (
                  <span className="crew-pile-more">+{overflow}</span>
                )}
              </span>
              <span className="crew-chevron" aria-hidden="true">
                ›
              </span>
            </button>
            {isExpanded && (
              <div className="crew-state-rows-wrap">
                <ul className="crew-rows">
                  {rows.map((m) => (
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PileAvatar({ member }: { member: MemberRow }) {
  const name =
    member.user?.display_name ||
    member.user?.email?.split('@')[0] ||
    '?';
  const initial = name.slice(0, 1).toUpperCase();
  if (member.user?.profile_photo_url) {
    return (
      <div
        className="crew-pile-av"
        style={{
          background: `url(${member.user.profile_photo_url}) center/cover`,
        }}
        aria-hidden="true"
      />
    );
  }
  return (
    <div className="crew-pile-av" aria-hidden="true">
      {initial}
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
  const name =
    member.user?.display_name ||
    member.user?.email?.split('@')[0] ||
    '?';
  const initial = name.slice(0, 1).toUpperCase();

  let subtext: string | null = null;
  if (state === 'awaiting') {
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
          <div
            className="av crew-row-av"
            style={member.user.profile_photo_url ? {
              background: `url(${member.user.profile_photo_url}) center/cover`,
            } : { background: 'var(--sticker-bg)' }}
          >
            {!member.user.profile_photo_url && initial}
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
        {isViewer && isSparseProfile(member.user) && (
          <a className="crew-row-sub crew-row-nudge" href="/passport">
            {getCopy(themeId, 'crew.passportNudge')}
          </a>
        )}
      </div>
    </li>
  );
}
