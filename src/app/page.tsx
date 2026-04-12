// Dashboard — the organizer's game board. Lists trips grouped by phase
// state with per-card theming via chassis_theme_id.
//
// Auth: Supabase user required (no guest cookie). Redirect to /auth.

import { redirect } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { getCopy } from '@/lib/copy/get-copy';
import { getDashboardData } from '@/lib/dashboard';
import type { DashboardCard } from '@/lib/dashboard';
import type { RallyPhase } from '@/lib/rally-types';
import type { ThemeId } from '@/lib/themes/types';
import { SignOutButton } from '@/components/dashboard/SignOutButton';
import { CreateTripButton } from '@/components/dashboard/CreateTripButton';
import { SwipeableCard } from '@/components/dashboard/DeleteTripButton';

export const metadata = {
  title: 'rally — where to next?',
};

const PHASE_ACTION: Record<RallyPhase, string> = {
  sketch: 'dashboard.actionKeepBuilding',
  sell: 'dashboard.actionTapIn',
  lock: 'dashboard.actionViewTrip',
  go: 'dashboard.actionViewTrip',
  done: 'dashboard.actionRelive',
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { cards, phaseCounts, needsMoveCount, userName } = await getDashboardData(user.id);

  const defaultTheme: ThemeId = 'just-because';
  const activeCards = cards.filter((c) => c.phase !== 'done');
  const doneCards = cards.filter((c) => c.phase === 'done');

  // Build marquee segments from active cards
  const marqueeSegments: string[] = [];
  for (const card of activeCards) {
    if (card.needsMove) {
      marqueeSegments.push(getCopy(defaultTheme, 'dashboard.marqueeYourMove', { name: card.trip.name || card.destination || 'a trip' }) as string);
    } else if ((card.phase === 'sell' || card.phase === 'go') && card.daysUntil !== null) {
      marqueeSegments.push(getCopy(defaultTheme, 'dashboard.marqueeDaysTo', { n: card.daysUntil, destination: card.destination || 'adventure' }) as string);
    } else if (card.phase === 'lock') {
      marqueeSegments.push(getCopy(defaultTheme, 'dashboard.marqueeLocked', { destination: card.destination || card.trip.name || 'trip' }) as string);
    } else if (card.phase === 'sketch') {
      marqueeSegments.push(getCopy(defaultTheme, 'dashboard.marqueeBrewing', { name: card.trip.name || 'something' }) as string);
    }
  }
  // Add a generic hype segment if we have any trips
  if (marqueeSegments.length > 0) {
    marqueeSegments.push(getCopy(defaultTheme, 'dashboard.marqueeLive') as string);
  }

  return (
    <div className="chassis dash-surface">
      {/* Marquee */}
      {marqueeSegments.length > 0 && (
        <div className="dash-marquee">
          <div className="marquee">
            <div className="marquee-track">
              {[...marqueeSegments, ...marqueeSegments].map((text, i) => (
                <span key={i}>{text}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dash-header">
        <div className="dash-wordmark">
          {'rally'}<span className="bang">{'!'}</span>
        </div>
        <div className="dash-header-right">
          <Link href="/passport" className="dash-passport-link" title="your passport">
            <span className="dash-passport-av">{userName.charAt(0).toUpperCase()}</span>
          </Link>
          <SignOutButton />
        </div>
      </div>

      {/* Live-row */}
      <div className="dash-live-row">
        {needsMoveCount > 0 ? (
          <>
            <span className="dot" />
            {getCopy(defaultTheme, 'dashboard.liveRowAction', { n: needsMoveCount })}
          </>
        ) : (
          getCopy(defaultTheme, 'dashboard.liveRowClear')
        )}
      </div>

      <p className="dash-greeting">
        {getCopy(defaultTheme, 'dashboard.greeting', { name: userName })}
      </p>
      <h1 className="dash-h1">
        {getCopy(defaultTheme, 'dashboard.pageH1')}
      </h1>

      {cards.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-emoji">
            {getCopy(defaultTheme, 'dashboard.emptyEmoji')}
          </div>
          <h2 className="dash-empty-title">
            {getCopy(defaultTheme, 'dashboard.emptyTitle')}
          </h2>
          <p className="dash-empty-sub">
            {getCopy(defaultTheme, 'dashboard.emptySubtitle')}
          </p>
        </div>
      ) : (
        <>
          {/* Active trips */}
          {activeCards.length > 0 && (
            <section className="dash-section">
              <h2 className="dash-section-title">
                {getCopy(defaultTheme, 'dashboard.sectionCooking')}
                <span className="dash-section-count">{activeCards.length}</span>
              </h2>
              <div className="dash-cards">
                {activeCards.map((card, i) =>
                  card.phase === 'sketch' && card.isOrganizer ? (
                    <SwipeableCard key={card.trip.id} tripId={card.trip.id}>
                      <TripCard card={card} index={i} />
                    </SwipeableCard>
                  ) : (
                    <TripCard key={card.trip.id} card={card} index={i} />
                  )
                )}
              </div>
            </section>
          )}

          {/* Archive */}
          {doneCards.length > 0 && (
            <section className="dash-section">
              <h2 className="dash-section-title">
                {getCopy(defaultTheme, 'dashboard.sectionArchive')}
                <span className="dash-section-count">{doneCards.length}</span>
              </h2>
              <div className="dash-cards">
                {doneCards.map((card, i) => (
                  <TripCard key={card.trip.id} card={card} index={i} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Sticky CTA */}
      <div className="dash-sticky">
        <CreateTripButton />
      </div>
    </div>
  );
}

function TripCard({ card, index }: { card: DashboardCard; index: number }) {
  const { trip, phase, themeId, inCount, memberCount, daysUntil, destination, dateLabel, needsMove } = card;
  const defaultTheme: ThemeId = 'just-because';
  const actionKey = needsMove ? 'dashboard.actionNudge' : PHASE_ACTION[phase];
  const slug = trip.share_slug;
  const href = `/trip/${slug}`;
  const members = trip.members || [];
  const displayMembers = members.slice(0, 5);

  // Card classes
  const cardClasses = [
    'chassis',
    'dash-card',
    needsMove ? 'needs-move' : '',
    phase === 'done' ? 'faded' : '',
  ].filter(Boolean).join(' ');

  // Stamp rendering
  const stamp = getStamp(phase, daysUntil, needsMove, defaultTheme);

  return (
    <Link
      href={href}
      className={cardClasses}
      data-theme={themeId}
      style={{ animationDelay: `${0.08 * index}s` }}
    >
      {/* Countdown stamp */}
      {stamp && (
        <div className={`dash-stamp${stamp.cls ? ` ${stamp.cls}` : ''}`}>
          <span className="dash-stamp-num">{stamp.num}</span>
          <span className="dash-stamp-sub">{stamp.sub}</span>
        </div>
      )}

      <div className="dash-card-name">{trip.name || destination || getCopy(defaultTheme, 'dashboard.cardDestTbd')}</div>
      <div className="dash-card-meta">
        {trip.name ? (destination || getCopy(defaultTheme, 'dashboard.cardDestTbd')) : null}
        {trip.name ? ' · ' : null}
        {dateLabel || getCopy(defaultTheme, 'dashboard.cardDateTbd')}
        {' · '}
        {getCopy(defaultTheme, 'dashboard.cardMembers', { n: memberCount })}
      </div>

      {/* Rally meter for sell-state cards */}
      {phase === 'sell' && (trip.group_size > 0 || memberCount > 0) && (() => {
        const target = trip.group_size > 0 ? trip.group_size : memberCount;
        return (
          <div className="dash-meter">
            <div className="dash-meter-bar">
              <div
                className="dash-meter-fill"
                style={{ width: `${Math.min(100, (inCount / target) * 100)}%` }}
              />
            </div>
            <div className="dash-meter-label">
              <span>{getCopy(defaultTheme, 'dashboard.rallyMeterLabel')}</span>
              <span>{getCopy(defaultTheme, 'dashboard.rallyMeterCount', { n: inCount, target })}</span>
            </div>
          </div>
        );
      })()}

      {/* Bottom: avatars + action */}
      <div className="dash-card-bottom">
        <div className="dash-avs">
          {displayMembers.map((m) => (
            <div
              key={m.id}
              className="av"
              style={{ background: 'var(--sticker-bg)' }}
            >
              {m.user?.display_name?.charAt(0).toUpperCase() ?? '?'}
            </div>
          ))}
          {memberCount > 5 && (
            <div className="av" style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>
              {`+${memberCount - 5}`}
            </div>
          )}
        </div>
        <span className="dash-card-action">
          {getCopy(defaultTheme, actionKey)}
        </span>
      </div>
    </Link>
  );
}

function getStamp(
  phase: RallyPhase,
  daysUntil: number | null,
  needsMove: boolean,
  themeId: ThemeId,
): { num: string; sub: string; cls?: string } | null {
  switch (phase) {
    case 'sketch':
      return { num: '?', sub: 'soon', cls: 'dash-stamp--sketch' };
    case 'sell':
      if (needsMove) {
        return {
          num: daysUntil !== null && daysUntil >= 0 ? String(daysUntil) : '!',
          sub: 'to lock!',
          cls: 'urgent',
        };
      }
      return daysUntil !== null && daysUntil >= 0
        ? { num: String(daysUntil), sub: getCopy(themeId, 'dashboard.cardCountdownLabelSell') as string }
        : null;
    case 'lock':
      return daysUntil !== null && daysUntil >= 0
        ? { num: String(daysUntil), sub: getCopy(themeId, 'dashboard.cardCountdownLabel', { n: daysUntil }) as string, cls: 'locked-state' }
        : { num: '🔒', sub: getCopy(themeId, 'dashboard.cardCountdownLocked') as string, cls: 'locked-state' };
    case 'go':
      return daysUntil !== null && daysUntil >= 0
        ? { num: String(daysUntil), sub: getCopy(themeId, 'dashboard.cardCountdownLabel', { n: daysUntil }) as string }
        : null;
    case 'done':
      return { num: '✓', sub: 'done', cls: 'done-state' };
    default:
      return null;
  }
}
