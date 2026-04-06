'use client';

import { useState } from 'react';
import { Confetti } from '@/components/ui/Confetti';
import type { RsvpEmojis } from '@/types';

type RsvpState = 'in' | 'maybe' | 'out' | null;

export function StickyRsvpBar({
  tripId,
  emojis,
}: {
  tripId: string;
  emojis: RsvpEmojis;
}) {
  const [rsvp, setRsvp] = useState<RsvpState>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const doRsvp = (status: RsvpState) => {
    setRsvp(status);
    setExpanded(false);
    if (status === 'in') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
  };

  const statusConfig = rsvp
    ? {
        in: { emoji: emojis.going, label: 'Going', color: '#7ecdb8' },
        maybe: { emoji: emojis.maybe, label: 'Maybe', color: '#e8c9a0' },
        out: { emoji: emojis.cant, label: "Can't make it", color: 'rgba(255,255,255,0.5)' },
      }[rsvp]
    : null;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          background: 'rgba(10,20,25,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {/* Left: RSVP status / button */}
          {rsvp ? (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: statusConfig!.color,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <span style={{ fontSize: 18 }}>{statusConfig!.emoji}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{statusConfig!.label}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>edit</span>
            </button>
          ) : (
            <button
              onClick={() => setExpanded(true)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, var(--rally-accent, #e8c9a0), #fff)',
                color: '#1a3a4a',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              }}
            >
              RSVP {emojis.going}
            </button>
          )}

          {/* Action icons */}
          <button
            onClick={() => {
              const chat = document.getElementById('group-chat');
              chat?.scrollIntoView({ behavior: 'smooth' });
            }}
            title="Comment"
            style={iconButtonStyle}
          >
            💬
          </button>
          <button onClick={copyLink} title="Share" style={iconButtonStyle}>
            📤
          </button>
        </div>

        {/* Expanded RSVP picker */}
        {expanded && (
          <div
            style={{
              maxWidth: 420,
              margin: '12px auto 0',
              display: 'flex',
              gap: 8,
              animation: 'slideUp 0.2s ease',
            }}
          >
            <button onClick={() => doRsvp('in')} style={rsvpButton('rgba(45,107,90,0.4)')}>
              {emojis.going} Going
            </button>
            <button onClick={() => doRsvp('maybe')} style={rsvpButton('rgba(212,165,116,0.4)')}>
              {emojis.maybe} Maybe
            </button>
            <button onClick={() => doRsvp('out')} style={rsvpButton('rgba(255,255,255,0.08)')}>
              {emojis.cant} No
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const iconButtonStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  fontSize: 17,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

function rsvpButton(bg: string): React.CSSProperties {
  return {
    flex: 1,
    padding: '12px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.15)',
    background: bg,
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
  };
}
