'use client';

import { useState } from 'react';
import type { Lodging, LodgingVote, User } from '@/types';
import { SolidCard } from '@/components/ui/SolidCard';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { MapsLink } from './MapsLink';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COLORS = ['#2d6b5a', '#c4956a', '#3a8a7a', '#d4a574', '#1a3d4a', '#8b6f5c'];

type LodgingWithVotes = Lodging & { votes: (LodgingVote & { user: User })[] };

export function LodgingCarousel({
  lodging,
  currentUserId,
}: {
  lodging: LodgingWithVotes[];
  currentUserId: string | null;
}) {
  const [idx, setIdx] = useState(() => {
    const selectedIdx = lodging.findIndex((l) => l.is_selected);
    return selectedIdx >= 0 ? selectedIdx : 0;
  });
  const [voteState, setVoteState] = useState(() =>
    Object.fromEntries(lodging.map((l) => [l.id, l.votes || []]))
  );

  if (lodging.length === 0) return null;

  const current = lodging[idx];
  const votes = voteState[current.id] || [];
  const hasVoted = currentUserId ? votes.some((v) => v.user_id === currentUserId) : false;
  const ppn = current.cost_per_night;

  const vote = async () => {
    if (!currentUserId) return;
    if (hasVoted) {
      // Remove vote
      await supabase
        .from('lodging_votes')
        .delete()
        .eq('lodging_id', current.id)
        .eq('user_id', currentUserId);
      setVoteState((prev) => ({
        ...prev,
        [current.id]: prev[current.id].filter((v) => v.user_id !== currentUserId),
      }));
    } else {
      // Add vote
      const { data } = await supabase
        .from('lodging_votes')
        .insert({ lodging_id: current.id, user_id: currentUserId })
        .select('*, user:users(*)')
        .single();
      if (data) {
        setVoteState((prev) => ({
          ...prev,
          [current.id]: [...(prev[current.id] || []), data as LodgingVote & { user: User }],
        }));
      }
    }
  };

  return (
    <SolidCard>
      {/* Hero image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 220,
          background: current.og_image_url
            ? `url(${current.og_image_url}) center/cover`
            : 'linear-gradient(135deg, #3a8a7a, #2d6b5a)',
        }}
      >
        {/* Gradient overlay for text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5))',
          }}
        />
        {/* Selected winner badge */}
        {current.is_selected && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <Badge text="✨ Picked!" bg="#2d6b5a" color="#fff" />
          </div>
        )}
        {/* Option counter */}
        {lodging.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              padding: '4px 10px',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              backdropFilter: 'blur(4px)',
            }}
          >
            {idx + 1} of {lodging.length}
          </div>
        )}
        {/* Arrows */}
        {lodging.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + lodging.length) % lodging.length)}
              style={arrowStyle('left')}
            >
              ‹
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % lodging.length)}
              style={arrowStyle('right')}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dots indicator */}
      {lodging.length > 1 && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', padding: '8px 0 0' }}>
          {lodging.map((_, i) => (
            <div
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 16 : 5,
                height: 5,
                borderRadius: 3,
                background: i === idx ? '#d4a574' : '#ccc',
                transition: 'all .3s',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}

      {/* Details */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
          <Badge text="🏠 The House" bg="#2d6b5a" color="#fff" />
          {ppn && (
            <span style={{ fontSize: 10, color: '#d4a574', fontWeight: 600 }}>
              ~${ppn}/night • Split
            </span>
          )}
        </div>
        <h3
          style={{
            fontFamily: 'var(--rally-font-display)',
            fontSize: 16,
            color: '#1a3a4a',
            margin: '0 0 2px',
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {current.name}
        </h3>
        {current.address && (
          <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px', display: 'flex', alignItems: 'center' }}>
            <span>📍 {current.address}</span>
            <MapsLink address={current.address} latitude={current.latitude} longitude={current.longitude} />
          </p>
        )}
        {current.highlights && current.highlights.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {current.highlights.map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 10,
                  color: '#1a3a4a',
                  background: '#f0ebe5',
                  padding: '3px 8px',
                  borderRadius: 14,
                  fontWeight: 500,
                }}
              >
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Vote button + voters */}
        {lodging.length > 1 && !current.is_selected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <button
              onClick={vote}
              disabled={!currentUserId}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 10,
                border: hasVoted ? '2px solid #2d6b5a' : '1.5px solid #e0e0e0',
                background: hasVoted ? '#e0f0eb' : '#fff',
                color: hasVoted ? '#2d6b5a' : '#888',
                fontSize: 12,
                fontWeight: 700,
                cursor: currentUserId ? 'pointer' : 'default',
                fontFamily: 'var(--rally-font-body)',
              }}
            >
              {hasVoted ? '✓ Voted' : '🗳️ Vote for this one'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {votes.slice(0, 4).map((v, i) => (
                <Avatar
                  key={v.id}
                  initials={v.user.display_name.charAt(0).toUpperCase()}
                  color={COLORS[i % COLORS.length]}
                  size={22}
                  border="1.5px solid #fff"
                  photoUrl={v.user.profile_photo_url}
                  style={{ marginLeft: i ? -6 : 0 }}
                />
              ))}
              {votes.length > 0 && (
                <span style={{ fontSize: 11, color: '#888', marginLeft: 4, fontWeight: 600 }}>
                  {votes.length}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Listing link */}
        {current.link && (
          <a
            href={current.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: 8,
              borderRadius: 10,
              border: '1.5px solid #2d6b5a',
              color: '#2d6b5a',
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View full listing →
          </a>
        )}
      </div>
    </SolidCard>
  );
}

function arrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    [side]: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,.35)',
    border: 'none',
    color: '#fff',
    borderRadius: '50%',
    width: 32,
    height: 32,
    cursor: 'pointer',
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  };
}
