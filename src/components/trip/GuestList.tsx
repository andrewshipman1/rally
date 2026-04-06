'use client';

import { useState } from 'react';
import type { TripMember, User } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

const COLORS = ['#2d6b5a', '#c4956a', '#3a8a7a', '#d4a574', '#1a3d4a', '#8b6f5c'];

const RSVP_LABELS = {
  in: { text: "Going", bg: 'rgba(45,107,90,.3)', color: '#7ecdb8' },
  maybe: { text: 'Maybe', bg: 'rgba(212,165,116,.3)', color: '#e8c9a0' },
  out: { text: "Can't make it", bg: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.4)' },
  pending: { text: 'Invited', bg: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.5)' },
};

export function GuestList({
  members,
  organizerId,
}: {
  members: (TripMember & { user: User })[];
  organizerId: string;
}) {
  const [showAll, setShowAll] = useState(false);

  const goingCount = members.filter((m) => m.rsvp === 'in').length;
  const visibleAvatars = members.slice(0, 8);
  const overflow = members.length - visibleAvatars.length;

  return (
    <>
      <GlassCard>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--rally-accent)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1.8,
              fontFamily: 'var(--rally-font-body)',
            }}
          >
            👥 Guest list · {goingCount} going
          </div>
          <button
            onClick={() => setShowAll(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            View all →
          </button>
        </div>

        {/* Horizontal scroll of avatars */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 4,
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {visibleAvatars.map((m, i) => (
            <div
              key={m.id}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}
            >
              <Avatar
                initials={m.user.display_name.charAt(0).toUpperCase()}
                color={COLORS[i % COLORS.length]}
                size={56}
                border="2px solid rgba(255,255,255,.15)"
                photoUrl={m.user.profile_photo_url}
              />
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.7)',
                  maxWidth: 60,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}
              >
                {m.user.display_name.split(' ')[0]}
              </div>
            </div>
          ))}
          {overflow > 0 && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '2px dashed rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              +{overflow}
            </button>
          )}
        </div>
      </GlassCard>

      {/* Modal: full list */}
      {showAll && (
        <div
          onClick={() => setShowAll(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 998,
            display: 'flex',
            alignItems: 'flex-end',
            padding: 0,
            animation: 'modalIn .3s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a3a4a',
              borderRadius: '22px 22px 0 0',
              padding: '20px 20px 32px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              animation: 'modalPop .4s cubic-bezier(.16,1,.3,1)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                margin: '0 auto 16px',
              }}
            />
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 22,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 4,
              }}
            >
              Guest list
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
              {goingCount} going · {members.length} invited
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {members.map((m, i) => {
                const badge = RSVP_LABELS[m.rsvp];
                return (
                  <div
                    key={m.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar
                        initials={m.user.display_name.charAt(0).toUpperCase()}
                        color={COLORS[i % COLORS.length]}
                        size={40}
                        border="2px solid rgba(255,255,255,.15)"
                        photoUrl={m.user.profile_photo_url}
                      />
                      <div>
                        <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>
                          {m.user.display_name}
                          {m.user.id === organizerId && (
                            <span style={{ marginLeft: 6, fontSize: 9, color: '#7ecdb8', fontWeight: 600 }}>
                              · organizer
                            </span>
                          )}
                        </div>
                        {m.user.instagram_handle && (
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                            {m.user.instagram_handle}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge text={badge.text} bg={badge.bg} color={badge.color} />
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowAll(false)}
              style={{
                width: '100%',
                marginTop: 20,
                padding: 12,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
