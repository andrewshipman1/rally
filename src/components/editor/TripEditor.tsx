'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Theme, Lodging, Flight, Transport, Restaurant, Activity, PackingItem, RsvpEmojis, HeaderImage } from '@/types';
import { themeToCSS } from '@/types';
import type { EditableTrip } from '@/app/edit/[id]/page';
import { ComponentList } from './ComponentList';
import { EditorToolbar } from './EditorToolbar';
import { TripExtras } from './TripExtras';
import { InviteSection } from './InviteSection';
import { HeaderBuilder } from './HeaderBuilder';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Font family options for the editor's font selector
export const FONT_OPTIONS = [
  { id: 'classic', label: 'Classic', display: 'Fraunces', body: 'Outfit' },
  { id: 'eclectic', label: 'Eclectic', display: 'Syne', body: 'Outfit' },
  { id: 'fancy', label: 'Fancy', display: 'Cormorant Garamond', body: 'Outfit' },
  { id: 'literary', label: 'Literary', display: 'Playfair Display', body: 'DM Sans' },
];

export function TripEditor({ trip, themes }: { trip: EditableTrip; themes: Theme[] }) {
  const router = useRouter();

  // Trip details state
  const [name, setName] = useState(trip.name);
  const [destination, setDestination] = useState(trip.destination || '');
  const [tagline, setTagline] = useState(trip.tagline || '');
  const [description, setDescription] = useState(trip.description || '');
  const [dateStart, setDateStart] = useState(trip.date_start || '');
  const [dateEnd, setDateEnd] = useState(trip.date_end || '');
  const [deadline, setDeadline] = useState(
    trip.commit_deadline ? trip.commit_deadline.split('T')[0] : ''
  );
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(trip.theme_id);
  const [phase, setPhase] = useState(trip.phase);

  // Component state
  const [lodging, setLodging] = useState<Lodging[]>(trip.lodging || []);
  const [flights, setFlights] = useState<Flight[]>(trip.flights || []);
  const [transport, setTransport] = useState<Transport[]>(trip.transport || []);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(trip.restaurants || []);
  const [activities, setActivities] = useState<Activity[]>(trip.activities || []);

  // Extras state
  const [packingList, setPackingList] = useState<PackingItem[]>(trip.packing_list || []);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(trip.playlist_url);
  const [houseRules, setHouseRules] = useState<string | null>(trip.house_rules);
  const [photoAlbumUrl, setPhotoAlbumUrl] = useState<string | null>(trip.photo_album_url);
  const [rsvpEmojis, setRsvpEmojis] = useState<RsvpEmojis>(
    trip.rsvp_emojis || { going: '🙌', maybe: '🤔', cant: '😢' }
  );
  const [headerImages, setHeaderImages] = useState<HeaderImage[]>(trip.header_images || []);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'theme' | 'effect' | 'settings' | null>(null);

  // Resolved theme (from selectedThemeId)
  const selectedTheme = useMemo(
    () => themes.find((t) => t.id === selectedThemeId) || trip.theme || null,
    [themes, selectedThemeId, trip.theme]
  );

  const cssVars = selectedTheme ? themeToCSS(selectedTheme) : null;
  const fontDisplay = selectedTheme?.font_display || 'Fraunces';
  const fontBody = selectedTheme?.font_body || 'Outfit';
  const bgStyle =
    selectedTheme?.background_value ||
    'linear-gradient(168deg, #122c35 0%, #1a3d4a 30%, #2d6b5a 60%, #3a8a7a 100%)';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontDisplay)}:ital,wght@0,400;0,700;0,800;1,400&family=${encodeURIComponent(fontBody)}:wght@400;500;600;700&family=Syne:wght@600;700;800&family=Cormorant+Garamond:wght@400;600;700&family=Playfair+Display:wght@400;700;800&family=DM+Sans:wght@400;500;600;700&display=swap`;

  // ─── Save (debounced trigger via button) ───
  const save = async () => {
    setSaving(true);
    await supabase
      .from('trips')
      .update({
        name: name.trim(),
        destination: destination.trim() || null,
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        date_start: dateStart || null,
        date_end: dateEnd || null,
        commit_deadline: deadline ? new Date(deadline).toISOString() : null,
        theme_id: selectedThemeId,
        phase,
        rsvp_emojis: rsvpEmojis,
      })
      .eq('id', trip.id);
    setSaving(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
    router.refresh();
  };

  return (
    <>
      <link href={fontUrl} rel="stylesheet" />
      <div
        style={{
          minHeight: '100vh',
          background: bgStyle,
          fontFamily: `'${fontBody}', sans-serif`,
          position: 'relative',
          paddingBottom: 80,
          ...(cssVars as React.CSSProperties),
        }}
      >
        {/* Grain overlay */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            opacity: 0.03,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Top bar: Close + Save */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            background: 'rgba(0,0,0,0.15)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <button
            onClick={() => router.push('/')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a
              href={`/trip/${trip.share_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Preview
            </a>
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: savedAt ? '#2d6b5a' : 'linear-gradient(135deg, #fff, #f0ebe5)',
                color: savedAt ? '#fff' : '#1a3a4a',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: `'${fontBody}', sans-serif`,
                transition: 'all .2s',
              }}
            >
              {saving ? 'Saving...' : savedAt ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 460, margin: '0 auto', padding: '20px 16px', position: 'relative' }}>
          {/* ─── Hero (inline editable) ─── */}
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 18,
              padding: '28px 20px',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.12)',
              textAlign: 'center',
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Trip name"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontFamily: `'${fontDisplay}', serif`,
                fontSize: 44,
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: -1.2,
                lineHeight: 1,
                padding: 0,
                textShadow: '0 2px 30px rgba(0,0,0,.3)',
              }}
            />
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Add a tagline..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'rgba(255,255,255,0.85)',
                fontFamily: `'${fontDisplay}', serif`,
                fontSize: 16,
                fontStyle: 'italic',
                textAlign: 'center',
                marginTop: 8,
                padding: 0,
              }}
            />
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destination"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: `'${fontBody}', sans-serif`,
                fontSize: 13,
                textAlign: 'center',
                marginTop: 8,
                padding: 0,
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 14,
                fontSize: 13,
              }}
            >
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                style={dateInputStyle}
              />
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>→</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                style={dateInputStyle}
              />
            </div>
          </div>

          {/* ─── Description ─── */}
          <GlassSection title="Sell the trip" emoji="📝">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why should your friends come? What's the vibe? What's the plan?"
              rows={4}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '12px 14px',
                color: '#fff',
                fontSize: 13,
                outline: 'none',
                fontFamily: `'${fontBody}', sans-serif`,
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </GlassSection>

          {/* ─── Header builder ─── */}
          <HeaderBuilder
            tripId={trip.id}
            headerImages={headerImages}
            onChange={setHeaderImages}
          />

          {/* ─── Invite section ─── */}
          <InviteSection tripId={trip.id} members={trip.members || []} />

          {/* ─── Optional Extras ─── */}
          <TripExtras
            tripId={trip.id}
            packingList={packingList}
            playlistUrl={playlistUrl}
            houseRules={houseRules}
            photoAlbumUrl={photoAlbumUrl}
            onPackingChange={setPackingList}
            onPlaylistChange={setPlaylistUrl}
            onRulesChange={setHouseRules}
            onAlbumChange={setPhotoAlbumUrl}
          />

          {/* ─── Components (lodging, flights, etc) ─── */}
          <div style={{ marginTop: 14 }}>
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

        {/* ─── Bottom Toolbar ─── */}
        <EditorToolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          themes={themes}
          selectedThemeId={selectedThemeId}
          onThemeChange={setSelectedThemeId}
          phase={phase}
          onPhaseChange={setPhase}
          deadline={deadline}
          onDeadlineChange={setDeadline}
          shareSlug={trip.share_slug}
          rsvpEmojis={rsvpEmojis}
          onRsvpEmojisChange={setRsvpEmojis}
        />
      </div>
    </>
  );
}

const dateInputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  padding: '6px 10px',
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  outline: 'none',
  fontFamily: 'inherit',
  colorScheme: 'dark',
};

// ─── GlassSection: reusable glass card with title ───

function GlassSection({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: 14,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 18,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>{emoji}</span>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}
