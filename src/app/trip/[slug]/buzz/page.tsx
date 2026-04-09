// §5.26 — Buzz subsurface. Reverse-chron mixed feed of system events
// and chat posts. Read-only for Session 3B — compose box and reactions
// are disabled placeholders. Write paths ship in 3C.
//
// Auth mirrors the crew subsurface: Supabase session OR guest cookie.

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import { getGuestUserId, refreshGuestCookie } from '@/lib/guest-auth';
import { chassisThemeIdFromTemplate } from '@/lib/themes/from-db';
import { getCopy } from '@/lib/copy/get-copy';
import { getBuzzFeed, getEventIcon, formatBuzzTimestamp } from '@/lib/buzz';
import type { BuzzItem } from '@/lib/buzz';
import type { ThemeId } from '@/lib/themes/types';
import { getTrip } from '../_data';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTrip(slug);
  if (!trip) return { title: 'rally — not found' };
  return { title: `the buzz — ${trip.name}` };
}

export default async function BuzzPage({ params }: Props) {
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

  // Sketch trips don't have buzz; unauthed viewers bounce to trip page.
  if (trip.phase === 'sketch' || currentUserId === null) {
    redirect(`/trip/${slug}`);
  }

  const themeId = chassisThemeIdFromTemplate(trip.theme?.template_name);
  const inCount = (trip.members || []).filter((m) => m.rsvp === 'in').length;
  const days = await getBuzzFeed(trip.id, currentUserId, themeId);

  return (
    <div className="chassis" data-theme={themeId}>
      <div className="buzz-surface">
        <Link href={`/trip/${slug}`} className="buzz-back">
          {getCopy(themeId, 'buzz.backLink')}
        </Link>

        <h1 className="buzz-title">{getCopy(themeId, 'buzz.pageTitle')}</h1>
        <p className="buzz-subtitle">
          {getCopy(themeId, 'buzz.pageSubtitle', { trip_name: trip.name, n: inCount })}
        </p>

        {days.length === 0 ? (
          <p className="buzz-empty">{getCopy(themeId, 'buzz.emptyState')}</p>
        ) : (
          <div className="buzz-feed">
            {days.map((day) => (
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
        )}

        {/* Compose bar — disabled placeholder for 3B, wired in 3C */}
        <div className="buzz-compose">
          <div className="av buzz-compose-av" style={{ background: 'var(--sticker-bg)' }}>
            {currentUser?.user_metadata?.display_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="buzz-compose-input">
            {getCopy(themeId, 'buzz.composePlaceholder.default')}
          </div>
          <div className="buzz-compose-send">
            {getCopy(themeId, 'buzz.composeSendButton')}
          </div>
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
  const name = comment.user?.display_name ?? '?';
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <div className={`buzz-post${isMine ? ' mine' : ''}`}>
      {!isMine && (
        <div className="av buzz-post-av" style={{ background: 'var(--sticker-bg)' }}>
          {initial}
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
        <div className="av buzz-post-av" style={{ background: 'var(--accent)' }}>
          {initial}
        </div>
      )}
    </div>
  );
}
