import Image from 'next/image';
import type { Trip, Theme, User, TripMember } from '@/types';
import { CollageAvatars } from './CollageAvatars';
import { displayName } from '@/lib/display';

export function CoverHeader({
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
  const coverUrl = trip.cover_image_url;

  // Theme gradient fallback when no cover image
  const fallbackBg =
    theme?.background_value ||
    `linear-gradient(168deg, ${primary} 0%, ${primary} 60%, ${accent} 100%)`;

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: 300,
        width: '100%',
        background: coverUrl ? primary : fallbackBg,
        animation: 'fadeIn 1.2s cubic-bezier(.16,1,.3,1)',
      }}
    >
      {coverUrl && (
        <Image
          src={coverUrl}
          alt={trip.name}
          fill
          preload
          sizes="(max-width: 480px) 100vw, 480px"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      )}

      {/* Gradient overlay on bottom 60%: transparent → theme primary */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: `linear-gradient(to top, ${primary} 0%, ${primary}cc 40%, transparent 100%)`,
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
            color: 'rgba(255,255,255,0.85)',
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.18)',
            marginBottom: 10,
            textShadow: '0 1px 4px rgba(0,0,0,.35)',
            animation: 'slideUp .9s cubic-bezier(.16,1,.3,1) .2s both',
          }}
        >
          {displayName(organizer.display_name)}&apos;s trip
        </div>

        <h1
          style={{
            fontFamily: 'var(--rally-font-display)',
            fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
            fontWeight: 800,
            color: '#fff',
            margin: '4px 0 0',
            lineHeight: 1,
            letterSpacing: -1.5,
            textShadow: '0 2px 30px rgba(0,0,0,.45)',
            animation: 'slideUp 1s cubic-bezier(.16,1,.3,1) .1s both',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
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
              opacity: 0.95,
              textShadow: '0 1px 8px rgba(0,0,0,.35)',
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
            color: 'rgba(255,255,255,0.85)',
            textShadow: '0 1px 4px rgba(0,0,0,.35)',
            animation: 'slideUp 1s cubic-bezier(.16,1,.3,1) .35s both',
          }}
        >
          <span>✈️</span>
          <span style={{ fontWeight: 600, color: '#fff' }}>{dateStr}</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span>
            {members.length === 1 && members[0].user_id === organizer.id
              ? `${displayName(organizer.display_name).split(' ')[0]}'s hosting`
              : `${confirmedCount} going`}
          </span>
        </div>

        {/* Friend avatars */}
        <CollageAvatars members={members} primary={primary} />
      </div>
    </div>
  );
}
