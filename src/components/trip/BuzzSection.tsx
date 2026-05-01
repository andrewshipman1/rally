// Inline buzz (activity feed) section for the trip page. Extracted from
// the former /trip/[slug]/buzz route page. Shows reverse-chron feed
// with day dividers, event rows, and chat posts.

import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { BuzzItem, BuzzDay } from '@/lib/buzz';
import { getEventIcon, formatBuzzTimestamp } from '@/lib/buzz';
import { Reveal } from '@/components/ui/Reveal';

type Props = {
  buzzDays: BuzzDay[];
  currentUserId: string | null;
  themeId: ThemeId;
  tripName: string;
  inCount: number;
};

export function BuzzSection({ buzzDays, currentUserId, themeId, tripName, inCount }: Props) {
  return (
    <div className="buzz-inline">
      <Reveal delay={0}>
        <h2 className="module-title">{getCopy(themeId, 'buzz.pageTitle')}</h2>
        <p className="buzz-subtitle">
          {getCopy(themeId, 'buzz.pageSubtitle', { trip_name: tripName, n: inCount })}
        </p>
      </Reveal>

      {buzzDays.length === 0 ? (
        <Reveal delay={0.05}>
          <p className="buzz-empty">{getCopy(themeId, 'buzz.emptyState')}</p>
        </Reveal>
      ) : (
        <Reveal delay={0.05}>
          <div className="buzz-feed">
            {buzzDays.map((day) => (
              <div key={day.label}>
                <div className="buzz-day-divider">
                  <span className="buzz-dd-label">{day.label}</span>
                </div>
                {day.items.map((item) => (
                  <BuzzRow
                    key={item.kind === 'event' ? item.entry.id : item.comment.id}
                    item={item}
                    themeId={themeId}
                  />
                ))}
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* Compose bar — disabled placeholder, wired in Session 9 */}
      <div className="buzz-compose">
        <div className="av buzz-compose-av" style={{ background: 'var(--sticker-bg)' }}>
          {'?'}
        </div>
        <div className="buzz-compose-input">
          {getCopy(themeId, 'buzz.composePlaceholder.default')}
        </div>
      </div>
    </div>
  );
}

function BuzzRow({ item, themeId }: { item: BuzzItem; themeId: ThemeId }) {
  if (item.kind === 'event') {
    const icon = getEventIcon(item.entry.event_type);
    return (
      <div className="buzz-event">
        <div className="buzz-event-icon">{icon}</div>
        <div className="buzz-event-body">
          <span className="buzz-event-text">{item.text}</span>
          <span className="buzz-event-time">
            {formatBuzzTimestamp(item.timestamp, themeId)}
          </span>
        </div>
      </div>
    );
  }

  const { comment, isMine } = item;
  const name =
    comment.user?.display_name ||
    comment.user?.email?.split('@')[0] ||
    '?';
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <div className={`buzz-post${isMine ? ' mine' : ''}`}>
      {!isMine && (
        <div
          className="av buzz-post-av"
          style={comment.user?.profile_photo_url ? {
            background: `url(${comment.user.profile_photo_url}) center/cover`,
          } : { background: 'var(--sticker-bg)' }}
        >
          {!comment.user?.profile_photo_url && initial}
        </div>
      )}
      <div className="buzz-post-content">
        {!isMine && <div className="buzz-post-author">{name}</div>}
        <div className="buzz-bubble">
          <span className="buzz-post-text">{comment.text}</span>
        </div>
        <div className="buzz-post-meta">
          <span className="buzz-post-time">
            {formatBuzzTimestamp(item.timestamp, themeId)}
          </span>
        </div>
        {comment.reactions && comment.reactions.length > 0 && (
          <div className="buzz-reactions">
            {Object.entries(
              comment.reactions.reduce<Record<string, number>>((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {}),
            ).map(([emoji, count]) => (
              <span key={emoji} className="buzz-rx">
                {emoji} <span className="buzz-rx-count">{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      {isMine && (
        <div
          className="av buzz-post-av"
          style={comment.user?.profile_photo_url ? {
            background: `url(${comment.user.profile_photo_url}) center/cover`,
          } : { background: 'var(--accent)' }}
        >
          {!comment.user?.profile_photo_url && initial}
        </div>
      )}
    </div>
  );
}
