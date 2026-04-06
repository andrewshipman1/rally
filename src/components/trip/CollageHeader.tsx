import type { Trip, Theme, User, TripMember } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { CollageAvatars } from './CollageAvatars';

// Default collage placeholders when no header_images are provided
const DEFAULT_COLLAGE: CollageItem[] = [
  { color: '#3a8a7a', label: 'Beach sunset', col: '1/3', row: '1/2' },
  { color: '#1a3d4a', label: 'Cenote swim', col: '1/2', row: '2/3' },
  { color: '#d4a574', label: 'Tulum ruins', col: '2/3', row: '2/3' },
  { color: '#c4956a', label: 'The crew', col: '3/4', row: '1/3' },
  { color: '#2d6b5a', label: 'Rooftop vibes', col: '1/4', row: '3/4' },
];

interface CollageItem {
  color: string;
  label: string;
  col: string;
  row: string;
  url?: string;
}

export function CollageHeader({
  trip,
  theme,
  organizer,
  members,
  dateStr,
  confirmedCount,
}: {
  trip: Trip;
  theme: Theme | null;
  organizer: User;
  members: (TripMember & { user: User })[];
  dateStr: string;
  confirmedCount: number;
}) {
  const primary = theme?.color_primary || '#122c35';
  const accent = theme?.color_accent || '#e8c9a0';
  const collageItems =
    trip.header_images && trip.header_images.length > 0
      ? trip.header_images.slice(0, 5).map((img, i) => {
          // Parse "col / row" format from HeaderBuilder, fall back to default for that index
          const fallback = DEFAULT_COLLAGE[i % DEFAULT_COLLAGE.length];
          let col = fallback.col;
          let row = fallback.row;
          if (img.position && img.position.includes(' / ')) {
            const parts = img.position.split(' / ');
            if (parts.length === 2) {
              col = parts[0];
              row = parts[1];
            }
          }
          return {
            color: theme?.color_primary || fallback.color,
            label: img.label || '',
            col,
            row,
            url: img.url,
          };
        })
      : DEFAULT_COLLAGE;

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Collage grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '110px 90px 80px',
          gap: 2,
          animation: 'fadeIn 1.2s cubic-bezier(.16,1,.3,1)',
        }}
      >
        {collageItems.map((p, i) => (
          <div
            key={i}
            style={{
              gridColumn: p.col,
              gridRow: p.row,
              background: p.url
                ? `url(${p.url}) center/cover`
                : `linear-gradient(${130 + i * 20}deg, ${p.color}, ${p.color}dd)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(${45 + i * 30}deg, rgba(255,255,255,.08) 0%, transparent 50%)`,
              }}
            />
            {!p.url && (
              <span
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,.45)',
                  fontWeight: 500,
                  fontFamily: 'var(--rally-font-body)',
                }}
              >
                {p.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '75%',
          background: `linear-gradient(to top, ${primary}f2 0%, ${primary}99 40%, transparent 100%)`,
        }}
      />

      {/* Hero text */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 24px 22px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '3px 12px',
            borderRadius: 14,
            background: 'rgba(255,255,255,.12)',
            fontSize: 10,
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 10,
            animation: 'slideUp .9s cubic-bezier(.16,1,.3,1) .2s both',
          }}
        >
          {organizer.display_name}&apos;s trip
        </div>

        <h1
          style={{
            fontFamily: 'var(--rally-font-display)',
            fontSize: 56,
            fontWeight: 800,
            color: '#fff',
            margin: '4px 0 0',
            lineHeight: 0.95,
            letterSpacing: -1.5,
            textShadow: '0 2px 30px rgba(0,0,0,.3)',
            animation: 'slideUp 1s cubic-bezier(.16,1,.3,1) .1s both',
          }}
        >
          {trip.name}
        </h1>

        {trip.tagline && (
          <p
            style={{
              fontFamily: 'var(--rally-font-display)',
              fontSize: 17,
              fontStyle: 'italic',
              color: accent,
              margin: '6px 0 14px',
              fontWeight: 400,
              opacity: 0.9,
              animation: 'slideUp 1s cubic-bezier(.16,1,.3,1) .25s both',
            }}
          >
            {trip.tagline}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
            animation: 'slideUp 1s cubic-bezier(.16,1,.3,1) .35s both',
          }}
        >
          <span>✈️</span>
          <span style={{ fontWeight: 600, color: '#fff' }}>{dateStr}</span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span>{confirmedCount} going</span>
        </div>

        {/* Friend avatars */}
        <CollageAvatars members={members} primary={primary} />
      </div>
    </div>
  );
}
