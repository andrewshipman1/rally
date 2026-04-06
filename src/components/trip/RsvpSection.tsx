'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Confetti } from '@/components/ui/Confetti';
import type { RsvpEmojis } from '@/types';

type RsvpState = 'in' | 'maybe' | 'out' | null;

const DEFAULT_EMOJIS: RsvpEmojis = { going: '🙌', maybe: '🤔', cant: '😢' };

export function RsvpSection({
  tripId,
  emojis = DEFAULT_EMOJIS,
}: {
  tripId: string;
  emojis?: RsvpEmojis;
}) {
  const [rsvp, setRsvp] = useState<RsvpState>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const doRsvp = (status: RsvpState) => {
    setRsvp(status);
    if (status === 'in') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
    // API integration comes in Step 17
  };

  if (rsvp) {
    const config = {
      in: {
        emoji: emojis.going,
        title: "You're in!",
        subtitle: "We'll text you updates ✈️",
        bg: 'rgba(45,107,90,.2)',
        animEmoji: true,
      },
      maybe: {
        emoji: emojis.maybe,
        title: "We'll hold your spot",
        subtitle: "We'll nudge you before the deadline",
        bg: 'rgba(255,255,255,0.08)',
        animEmoji: false,
      },
      out: {
        emoji: emojis.cant,
        title: 'Maybe next time',
        subtitle: "We'll miss you!",
        bg: 'rgba(255,255,255,0.08)',
        animEmoji: false,
      },
    }[rsvp];

    return (
      <>
        {showConfetti && <Confetti />}
        <GlassCard>
          <div
            style={{
              textAlign: 'center',
              padding: '10px 0',
              animation: 'modalPop .5s cubic-bezier(.16,1,.3,1)',
            }}
          >
            <div
              style={{
                fontSize: 42,
                marginBottom: 8,
                animation: config.animEmoji ? 'bounce .6s ease' : 'none',
              }}
            >
              {config.emoji}
            </div>
            <div
              style={{
                fontFamily: 'var(--rally-font-display)',
                fontSize: 22,
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {config.title}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
              {config.subtitle}
            </div>
            {rsvp === 'in' && (
              <button
                style={{
                  marginTop: 16,
                  padding: '10px 20px',
                  borderRadius: 11,
                  border: '1px solid rgba(255,255,255,.2)',
                  background: 'rgba(255,255,255,.08)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--rally-font-body)',
                }}
              >
                Share to Story 📸
              </button>
            )}
          </div>
        </GlassCard>
      </>
    );
  }

  return (
    <GlassCard>
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        <div
          style={{
            fontFamily: 'var(--rally-font-display)',
            fontSize: 22,
            color: '#fff',
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          You coming or what?
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
          Lock it in before the countdown hits zero
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => doRsvp('in')}
            style={{
              padding: 14,
              borderRadius: 13,
              border: 'none',
              background: 'linear-gradient(135deg, #2d6b5a, #3a8a7a)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--rally-font-body)',
              boxShadow: '0 4px 24px rgba(45,107,90,.35)',
              transition: 'all .15s',
            }}
          >
            I&apos;m so in {emojis.going}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => doRsvp('maybe')}
              style={{
                flex: 1,
                padding: 11,
                borderRadius: 12,
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--rally-font-body)',
              }}
            >
              Maybe... {emojis.maybe}
            </button>
            <button
              onClick={() => doRsvp('out')}
              style={{
                flex: 1,
                padding: 11,
                borderRadius: 12,
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--rally-font-body)',
              }}
            >
              Can&apos;t make it {emojis.cant}
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
