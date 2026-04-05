'use client';

const COLORS = ['#e8c9a0', '#2d6b5a', '#3a8a7a', '#d4a574', '#ff6b6b', '#ffd93d', '#f5e6d0'];

export function Confetti() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
      {Array.from({ length: 60 }).map((_, i) => {
        const w = 5 + Math.random() * 9;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: -10,
              width: w,
              height: w * (Math.random() > 0.5 ? 1 : 0.5),
              background: COLORS[i % COLORS.length],
              borderRadius: Math.random() > 0.4 ? '50%' : 2,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `cFall ${1.2 + Math.random() * 2.5}s ease-in ${Math.random() * 0.6}s forwards`,
            }}
          />
        );
      })}
    </div>
  );
}
