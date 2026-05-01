'use client';

const COLORS = ['#e8c9a0', '#2d6b5a', '#3a8a7a', '#d4a574', '#ff6b6b', '#ffd93d', '#f5e6d0'];

interface Particle {
  w: number;
  left: number;
  aspectRatio: number;
  borderRadius: string | number;
  rotation: number;
  duration: number;
  delay: number;
}

// Pre-compute random particle properties outside the component so render stays pure.
const particles: Particle[] = Array.from({ length: 60 }, () => ({
  w: 5 + Math.random() * 9,
  left: Math.random() * 100,
  aspectRatio: Math.random() > 0.5 ? 1 : 0.5,
  borderRadius: Math.random() > 0.4 ? '50%' : 2,
  rotation: Math.random() * 360,
  duration: 1.2 + Math.random() * 2.5,
  delay: Math.random() * 0.6,
}));

export function Confetti() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -10,
            width: p.w,
            height: p.w * p.aspectRatio,
            background: COLORS[i % COLORS.length],
            borderRadius: p.borderRadius,
            transform: `rotate(${p.rotation}deg)`,
            animation: `cFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
