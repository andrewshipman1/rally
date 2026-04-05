'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(interval);
  }, [target]);

  const clamp = (n: number) => Math.max(0, n);
  return {
    d: clamp(Math.floor(diff / 864e5)),
    h: clamp(Math.floor((diff % 864e5) / 36e5)),
    m: clamp(Math.floor((diff % 36e5) / 6e4)),
    s: clamp(Math.floor((diff % 6e4) / 1e3)),
  };
}

const UNITS: [string, string][] = [
  ['d', 'days'],
  ['h', 'hrs'],
  ['m', 'min'],
  ['s', 'sec'],
];

export function Countdown({ deadline }: { deadline: string }) {
  const cd = useCountdown(new Date(deadline));

  return (
    <GlassCard>
      <div style={{ textAlign: 'center', padding: '0 0' }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--rally-accent)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 10,
          }}
        >
          ⏳ Time to lock it in
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {UNITS.map(([key, label], i) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && (
                <span
                  style={{
                    color: 'rgba(255,255,255,.2)',
                    fontSize: 18,
                    animation: 'pulse 1s infinite',
                    fontWeight: 300,
                  }}
                >
                  :
                </span>
              )}
              <div style={{ textAlign: 'center', minWidth: 48 }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#fff',
                    background: 'rgba(255,255,255,.12)',
                    borderRadius: 10,
                    padding: '6px 8px',
                    lineHeight: 1,
                    fontFamily: 'var(--rally-font-body)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {String(cd[key as keyof typeof cd]).padStart(2, '0')}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.6)',
                    marginTop: 3,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
