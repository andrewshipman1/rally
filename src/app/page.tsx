// Dashboard — the organizer's game board. Lists trips grouped by phase
// state with per-card theming via chassis_theme_id.
//
// Auth: Supabase user required (no guest cookie). Redirect to /auth.
// Read-only for 3B — archive/unarchive deferred to 3C.

import { redirect } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { getCopy } from '@/lib/copy/get-copy';
import { getDashboardData } from '@/lib/dashboard';
import type { DashboardCard } from '@/lib/dashboard';
import type { RallyPhase } from '@/lib/rally-types';
import type { ThemeId } from '@/lib/themes/types';
import { SignOutButton } from '@/components/dashboard/SignOutButton';

export const metadata = {
  title: 'rally — where to next?',
};

const SCOREBOARD_PHASES: { key: string; phases: RallyPhase[]; hot?: boolean }[] = [
  { key: 'cooking', phases: ['sketch', 'sell'] },
  { key: 'lock',    phases: ['lock'] },
  { key: 'go',      phases: ['go'] },
];
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

  const { cards, phaseCounts, userName } = await getDashboardData(user.id);

  const defaultTheme: ThemeId = 'just-because';
  const activeCards = cards.filter((c) => c.phase !== 'done');
  const doneCards = cards.filter((c) => c.phase === 'done');

  return (
    <div className="chassis dash-surface">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-wordmark">
          {'rally'}<span className="bang">{'!'}</span>
        </div>
        <SignOutButton />
      </div>
      <p className="dash-greeting">
        {getCopy(defaultTheme, 'dashboard.greeting', { name: userName })}
      </p>
      <h1 className="dash-h1">
        {getCopy(defaultTheme, 'dashboard.pageH1')}
      </h1>

      {/* Scoreboard */}
      <div className="dash-scoreboard">
        {SCOREBOARD_PHASES.map(({ key, phases, hot }) => {
          const count = phases.reduce((sum, p) => sum + (phaseCounts[p] ?? 0), 0);
          if (count === 0) return null;
          return (
            <span key={key} className={`dash-chip${hot ? ' hot' : ''}`}>
              {getCopy(defaultTheme, `dashboard.score${key.charAt(0).toUpperCase() + key.slice(1)}`)}
              {' '}<strong>{count}</strong>
            </span>
          );
        })}
        {phaseCounts.done > 0 && (
          <span className="dash-chip">
            {getCopy(defaultTheme, 'dashboard.scoreDone')}
            {' '}<strong>{phaseCounts.done}</strong>
          </span>
        )}
      </div>

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
                {activeCards.map((card, i) => (
                  <TripCard key={card.trip.id} card={card} index={i} />
                ))}
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
        <Link href="/create">
          {getCopy(defaultTheme, 'dashboard.ctaCreate')}
        </Link>
      </div>
    </div>
  );
}

function TripCard({ card, index }: { card: DashboardCard; index: number }) {
  const { trip, phase, themeId, inCount, memberCount, daysUntil, destination, dateLabel } = card;
  const defaultTheme: ThemeId = 'just-because';
  const actionKey = PHASE_ACTION[phase];
  const slug = trip.share_slug;
  const href = phase === 'sketch' ? `/trip/${slug}` : `/trip/${slug}`;
  const members = trip.members || [];
  const displayMembers = members.slice(0, 5);

  return (
    <Link
      href={href}
      className="chassis dash-card"
      data-theme={themeId}
      style={{ animationDelay: `${0.08 * index}s` }}
    >
      {/* Countdown stamp */}
      {phase === 'sketch' ? (
        <div className="dash-stamp dash-stamp--sketch">
          <span className="dash-stamp-num">{'?'}</span>
          <span className="dash-stamp-sub">{'soon'}</span>
        </div>
      ) : daysUntil !== null && daysUntil >= 0 ? (
        <div className="dash-stamp">
          <span className="dash-stamp-num">
            {getCopy(defaultTheme, 'dashboard.cardCountdown', { n: daysUntil })}
          </span>
          <span className="dash-stamp-sub">
            {getCopy(defaultTheme, phase === 'sell' ? 'dashboard.cardCountdownLabelSell' : 'dashboard.cardCountdownLabel', { n: daysUntil })}
          </span>
        </div>
      ) : phase === 'lock' ? (
        <div className="dash-stamp">
          <span className="dash-stamp-num">{'🔒'}</span>
          <span className="dash-stamp-sub">
            {getCopy(defaultTheme, 'dashboard.cardCountdownLocked')}
          </span>
        </div>
      ) : null}

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
