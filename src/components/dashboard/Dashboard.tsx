'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import type { Trip, Theme, TripMember } from '@/types';
import { SignOutButton } from './SignOutButton';
import { getCopy } from '@/lib/copy/get-copy';

type TripRow = Trip & {
  theme: Theme | null;
  trip_members: TripMember[];
};

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function isPastTrip(t: TripRow): boolean {
  if (t.archived_at) return true;
  if (!t.date_end) return false;
  return new Date(t.date_end).getTime() < Date.now() - THIRTY_DAYS;
}

const PHASE_BADGES: Record<string, { label: string; bg: string; color: string }> = {
  sketch: { label: 'Draft', bg: '#f0ebe5', color: '#8b6f5c' },
  sell: { label: 'Selling', bg: '#e0f0eb', color: '#2d6b5a' },
  lock: { label: 'Locked', bg: '#e0ebf0', color: '#1a3d4a' },
  go: { label: 'Live!', bg: '#fff3e0', color: '#e65100' },
};

export function Dashboard({
  trips,
  userName,
}: {
  trips: TripRow[];
  userName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const setArchived = async (tripId: string, archived: boolean) => {
    setBusy(tripId);
    try {
      await fetch(`/api/trips/${tripId}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const activeTrips = trips.filter((t) => !isPastTrip(t));
  const pastTrips = trips.filter(isPastTrip);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 800, color: '#1a3a4a', margin: 0 }}>
            {getCopy('just-because', 'dashboard.pageTitle')}
          </h1>
          <p style={{ fontSize: 14, color: '#888', margin: '2px 0 0' }}>
            {getCopy('just-because', 'dashboard.greeting', { name: userName })}
          </p>
        </div>
        <SignOutButton />
      </div>

      {/* Create trip CTA */}
      <Link
        href="/create"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: 16,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #2d6b5a, #3a8a7a)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 4px 24px rgba(45,107,90,.25)',
          marginBottom: 24,
          transition: 'all .15s',
        }}
      >
        {getCopy('just-because', 'dashboard.ctaCreate')}
      </Link>

      {/* Trip list */}
      {trips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{getCopy('just-because', 'dashboard.emptyEmoji')}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#666' }}>{getCopy('just-because', 'dashboard.emptyTitle')}</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{getCopy('just-because', 'dashboard.emptySubtitle')}</div>
        </div>
      ) : (
        <>
          {activeTrips.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#aaa', marginBottom: 4 }}>
                {getCopy('just-because', 'dashboard.sectionCooking')}
              </div>
              {activeTrips.map((trip) => renderTripCard(trip, false, busy, setArchived))}
            </div>
          )}
          {pastTrips.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#aaa', marginBottom: 4 }}>
                {getCopy('just-because', 'dashboard.sectionArchive')}
              </div>
              {pastTrips.map((trip) => renderTripCard(trip, true, busy, setArchived))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function renderTripCard(
  trip: TripRow,
  isPast: boolean,
  busy: string | null,
  setArchived: (id: string, archived: boolean) => void
) {
  const phase = PHASE_BADGES[trip.phase] || PHASE_BADGES.sketch;
  const memberCount = trip.trip_members?.length || 0;
  const dateStr =
    trip.date_start && trip.date_end
      ? `${format(new Date(trip.date_start), 'MMM d')}–${format(new Date(trip.date_end), 'd')}`
      : 'Dates TBD';

  const themePrimary = trip.theme?.color_primary || '#2d6b5a';
  const themeAccent = trip.theme?.color_accent || '#d4a574';
  const thumbBackground = trip.cover_image_url
    ? `url(${trip.cover_image_url}) center / cover`
    : `linear-gradient(135deg, ${themePrimary}, ${themeAccent})`;

  return (
    <div
      key={trip.id}
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
        borderLeft: `4px solid ${themePrimary}`,
        opacity: isPast ? 0.6 : 1,
      }}
    >
      <Link
        href={`/edit/${trip.id}`}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 10,
              background: thumbBackground,
              flexShrink: 0,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
            aria-hidden
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#1a3a4a',
                }}
              >
                {trip.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: phase.bg,
                  color: phase.color,
                }}
              >
                {phase.label}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              {trip.destination || 'Destination TBD'}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: '#1a3a4a', fontWeight: 600 }}>{dateStr}</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
              {memberCount} {memberCount === 1 ? 'person' : 'people'}
            </div>
          </div>
        </div>
      </Link>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          disabled={busy === trip.id}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setArchived(trip.id, !isPast);
          }}
          style={{
            background: 'none',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            color: '#888',
            cursor: busy === trip.id ? 'default' : 'pointer',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {busy === trip.id ? '...' : isPast ? 'Unarchive' : 'Archive'}
        </button>
      </div>
    </div>
  );
}
