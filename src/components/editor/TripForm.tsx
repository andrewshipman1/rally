'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Theme } from '@/types';
import { ThemePicker } from './ThemePicker';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function TripForm({ themes, userId }: { themes: Theme[]; userId: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [tagline, setTagline] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      // Create the trip
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          organizer_id: userId,
          name: name.trim(),
          destination: destination.trim() || null,
          tagline: tagline.trim() || null,
          date_start: dateStart || null,
          date_end: dateEnd || null,
          commit_deadline: deadline ? new Date(deadline).toISOString() : null,
          phase: 'sketch',
          theme_id: selectedTheme,
        })
        .select('id')
        .single();

      if (tripError) throw tripError;

      // Add organizer as trip member
      await supabase.from('trip_members').insert({
        trip_id: trip.id,
        user_id: userId,
        role: 'organizer',
        rsvp: 'in',
      });

      router.push(`/edit/${trip.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
    } finally {
      setLoading(false);
    }
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

  // Preview gradient for selected theme
  const previewTheme = themes.find((t) => t.id === selectedTheme);

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
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
            fontSize: 24,
            fontWeight: 800,
            color: '#1a3a4a',
            margin: 0,
          }}
        >
          Create a trip
        </h1>
      </div>

      {/* Theme preview bar */}
      {previewTheme && (
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: previewTheme.background_value,
            marginBottom: 16,
            transition: 'background 0.5s',
          }}
        />
      )}

      {/* Form */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <label style={{ ...labelStyle, marginTop: 0 }}>Trip name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tulum"
          style={inputStyle}
        />

        <label style={labelStyle}>Destination</label>
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Quintana Roo, Mexico"
          style={inputStyle}
        />

        <label style={labelStyle}>Tagline</label>
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Sun, cenotes & mezcal"
          style={inputStyle}
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 0 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start date</label>
            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End date</label>
            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <label style={labelStyle}>Commit deadline</label>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Theme</label>
        <ThemePicker themes={themes} selected={selectedTheme} onSelect={setSelectedTheme} />
      </div>

      <button
        onClick={create}
        disabled={!name.trim() || loading}
        style={{
          width: '100%',
          padding: 16,
          borderRadius: 14,
          border: 'none',
          background: name.trim() ? 'linear-gradient(135deg, #2d6b5a, #3a8a7a)' : '#e0e0e0',
          color: name.trim() ? '#fff' : '#aaa',
          fontSize: 16,
          fontWeight: 700,
          cursor: name.trim() ? 'pointer' : 'default',
          marginTop: 20,
          fontFamily: "'Outfit', sans-serif",
          boxShadow: name.trim() ? '0 4px 24px rgba(45,107,90,.25)' : 'none',
        }}
      >
        {loading ? 'Creating...' : 'Create trip →'}
      </button>

      {error && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#fff0f0', color: '#d44', fontSize: 13, textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  );
}
