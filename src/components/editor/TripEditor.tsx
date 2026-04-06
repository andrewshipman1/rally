'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Theme, Lodging, Flight, Transport, Restaurant, Activity } from '@/types';
import type { EditableTrip } from '@/app/edit/[id]/page';
import { ThemePicker } from './ThemePicker';
import { ComponentList } from './ComponentList';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function TripEditor({ trip, themes }: { trip: EditableTrip; themes: Theme[] }) {
  const router = useRouter();
  const [name, setName] = useState(trip.name);
  const [destination, setDestination] = useState(trip.destination || '');
  const [tagline, setTagline] = useState(trip.tagline || '');
  const [dateStart, setDateStart] = useState(trip.date_start || '');
  const [dateEnd, setDateEnd] = useState(trip.date_end || '');
  const [deadline, setDeadline] = useState(
    trip.commit_deadline ? trip.commit_deadline.split('T')[0] : ''
  );
  const [selectedTheme, setSelectedTheme] = useState<string | null>(trip.theme_id);
  const [phase, setPhase] = useState(trip.phase);

  const [lodging, setLodging] = useState<Lodging[]>(trip.lodging || []);
  const [flights, setFlights] = useState<Flight[]>(trip.flights || []);
  const [transport, setTransport] = useState<Transport[]>(trip.transport || []);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(trip.restaurants || []);
  const [activities, setActivities] = useState<Activity[]>(trip.activities || []);

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase
      .from('trips')
      .update({
        name: name.trim(),
        destination: destination.trim() || null,
        tagline: tagline.trim() || null,
        date_start: dateStart || null,
        date_end: dateEnd || null,
        commit_deadline: deadline ? new Date(deadline).toISOString() : null,
        theme_id: selectedTheme,
        phase,
      })
      .eq('id', trip.id);
    setSaving(false);
    router.refresh();
  };

  const copyLink = () => {
    const shareUrl = `${window.location.origin}/trip/${trip.share_slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.1)',
    background: '#fff',
    color: '#1a3a4a',
    fontSize: 14,
    outline: 'none',
    fontFamily: "'Outfit', sans-serif",
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#888',
    fontWeight: 600,
    display: 'block',
    marginBottom: 6,
    marginTop: 16,
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: 13,
              color: '#888',
            }}
          >
            ← Back
          </button>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 22,
              fontWeight: 800,
              color: '#1a3a4a',
              margin: 0,
            }}
          >
            Edit trip
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={`/trip/${trip.share_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.1)',
              background: '#fff',
              color: '#1a3a4a',
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Preview
          </a>
          <button
            onClick={copyLink}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: 'none',
              background: copied ? '#2d6b5a' : 'linear-gradient(135deg, #2d6b5a, #3a8a7a)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied!' : 'Share link'}
          </button>
        </div>
      </div>

      {/* Trip details */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a4a', marginBottom: 4 }}>
          Trip details
        </div>

        <label style={{ ...labelStyle, marginTop: 12 }}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Destination</label>
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Tagline</label>
        <input value={tagline} onChange={(e) => setTagline(e.target.value)} style={inputStyle} />

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start date</label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End date</label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <label style={labelStyle}>Commit deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Phase</label>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {(['sketch', 'sell', 'lock', 'go'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPhase(p)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: phase === p ? '2px solid #2d6b5a' : '1px solid rgba(0,0,0,0.1)',
                background: phase === p ? '#e0f0eb' : '#fff',
                color: phase === p ? '#2d6b5a' : '#888',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <label style={labelStyle}>Theme</label>
        <ThemePicker themes={themes} selected={selectedTheme} onSelect={setSelectedTheme} />

        <button
          onClick={save}
          disabled={saving}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #2d6b5a, #3a8a7a)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: 20,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      {/* Components */}
      <div style={{ marginTop: 20 }}>
        <ComponentList
          tripId={trip.id}
          lodging={lodging}
          flights={flights}
          transport={transport}
          restaurants={restaurants}
          activities={activities}
          onLodgingChange={setLodging}
          onFlightsChange={setFlights}
          onTransportChange={setTransport}
          onRestaurantsChange={setRestaurants}
          onActivitiesChange={setActivities}
        />
      </div>
    </div>
  );
}
