// §5.15 — Passport page. Social proof surface showing user's trip
// portfolio, stat strip, stamp grid, and ride-or-dies leaderboard.
//
// Auth: Supabase user required (no guest cookie). Redirect to /auth.
// Read-only — profile edit is v0.1 scope.

import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import { getCopy } from '@/lib/copy/get-copy';
import {
  getPassportProfile,
  getPassportStats,
  getPassportStamps,
  getRideOrDies,
} from '@/lib/passport';
import type { ThemeId } from '@/lib/themes/types';

export const metadata: Metadata = {
  title: 'rally — your passport',
};

const STAMP_ROTATIONS = ['-2deg', '1.5deg', '-1deg', '2deg', '-0.5deg', '1.8deg'];

export default async function PassportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const defaultTheme: ThemeId = 'just-because';

  const [profile, stats, stamps, rideOrDies] = await Promise.all([
    getPassportProfile(user.id),
    getPassportStats(user.id),
    getPassportStamps(user.id),
    getRideOrDies(user.id),
  ]);

  if (!profile) {
    redirect('/auth');
  }

  const initial = profile.displayName.charAt(0).toUpperCase();

  return (
    <div className="chassis passport-surface">
      <div className="passport-wordmark">
        {'rally'}<span className="bang">{'!'}</span>
      </div>

      {/* Profile head */}
      <div className="passport-head">
        <div className="passport-avatar">{initial}</div>
        <h1 className="passport-name">{profile.displayName}</h1>
        <p className="passport-handle">
          {profile.bio || getCopy(defaultTheme, 'passport.handlePlaceholder')}
        </p>
        <p className="passport-est">
          {getCopy(defaultTheme, 'passport.estLine', {
            year: profile.joinYear,
            n_countries: stats.countries,
          })}
        </p>
      </div>

      {/* Stat strip */}
      <div className="passport-stats">
        <div className="passport-stat">
          <div className="passport-stat-num trips">{stats.trips}</div>
          <div className="passport-stat-label">
            {getCopy(defaultTheme, 'passport.statTrips')}
          </div>
        </div>
        <div className="passport-stat">
          <div className="passport-stat-num rod">{stats.rideOrDies}</div>
          <div className="passport-stat-label">
            {getCopy(defaultTheme, 'passport.statRideOrDies')}
          </div>
        </div>
        <div className="passport-stat">
          <div className="passport-stat-num countries">{stats.countries}</div>
          <div className="passport-stat-label">
            {getCopy(defaultTheme, 'passport.statCountries')}
          </div>
        </div>
      </div>

      {/* Stamps section */}
      <section className="passport-section">
        <h2 className="passport-section-title">
          {getCopy(defaultTheme, 'passport.sectionStamps')}
        </h2>
        <p className="passport-section-sub">
          {getCopy(defaultTheme, 'passport.sectionStampsSub')}
        </p>

        {stamps.length === 0 ? (
          <div className="passport-empty">
            <p className="passport-empty-title">
              {getCopy(defaultTheme, 'passport.emptyStamps')}
            </p>
            <p className="passport-empty-sub">
              {getCopy(defaultTheme, 'passport.emptyStampsSub')}
            </p>
          </div>
        ) : (
          <div className="passport-grid">
            {stamps.map((stamp, i) => {
              const rot = STAMP_ROTATIONS[i % STAMP_ROTATIONS.length];
              const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
              let metaLabel = '';
              if (stamp.dateStart && stamp.dateEnd) {
                const start = new Date(stamp.dateStart);
                const end = new Date(stamp.dateEnd);
                const nights = Math.ceil(
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                );
                metaLabel = getCopy(defaultTheme, 'passport.stampMeta', {
                  month: months[start.getMonth()],
                  year: start.getFullYear(),
                  n_nights: nights,
                });
              }

              // Parse destination for place name (first part before comma)
              const place = stamp.destination?.split(',')[0]?.trim() || stamp.tripName;

              return (
                <div
                  key={stamp.tripId}
                  className="chassis passport-stamp"
                  data-theme={stamp.themeId}
                  style={{
                    '--rot': rot,
                    animationDelay: `${0.1 * i}s`,
                  } as React.CSSProperties}
                >
                  <p className="stamp-place">{place}</p>
                  <p className="stamp-trip">{`\u201c${stamp.tripName}\u201d`}</p>
                  {metaLabel && <p className="stamp-meta">{metaLabel}</p>}
                  {stamp.members.length > 0 && (
                    <div className="stamp-avs">
                      {stamp.members.map((m, j) => (
                        <div
                          key={j}
                          className="av"
                          style={{ background: 'var(--sticker-bg)' }}
                        >
                          {m.initial}
                        </div>
                      ))}
                      {stamp.memberCount > 5 && (
                        <div
                          className="av"
                          style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}
                        >
                          {`+${stamp.memberCount - 5}`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Ride or dies section */}
      <section className="passport-section">
        <h2 className="passport-section-title">
          {getCopy(defaultTheme, 'passport.sectionRod')}
        </h2>
        <p className="passport-section-sub">
          {getCopy(defaultTheme, 'passport.sectionRodSub')}
        </p>

        {rideOrDies.length === 0 ? (
          <div className="passport-empty">
            <p className="passport-empty-title">
              {getCopy(defaultTheme, 'passport.emptyRod')}
            </p>
            <p className="passport-empty-sub">
              {getCopy(defaultTheme, 'passport.emptyRodSub')}
            </p>
          </div>
        ) : (
          <div className="passport-rod-list">
            {rideOrDies.map((rod, i) => (
              <div
                key={rod.userId}
                className="passport-rod-row"
                style={{ animationDelay: `${0.08 * i + 0.3}s` }}
              >
                <span className="passport-rod-rank">{`#${i + 1}`}</span>
                <div className="passport-rod-av">{rod.initial}</div>
                <span className="passport-rod-name">{rod.displayName}</span>
                <span className="passport-rod-count">
                  {getCopy(defaultTheme, 'passport.rodCount', { n: rod.sharedTrips })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sticky CTA */}
      <div className="passport-sticky">
        <Link href="/create">
          {getCopy(defaultTheme, 'passport.ctaCreate')}
        </Link>
      </div>
    </div>
  );
}
