'use client';

import { useRef, useState, useEffect } from 'react';

export function Reveal({
  children,
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'scale';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time init for a11y
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    // Session 9R BB-4 — threshold=0 + tiny negative bottom rootMargin
    // makes the observer fire reliably for below-fold modules on scroll.
    // The old threshold=0.12 required 12% of the (transformed) element
    // to cross the viewport — tall sections rendered below the fold
    // sometimes never hit that ratio during a normal scroll past and
    // stayed stuck at opacity:0 (BB-4 symptom in 9K/9L/9Q QA).
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const transforms: Record<string, string> = {
    up: 'translateY(28px)',
    left: 'translateX(28px)',
    scale: 'scale(0.93)',
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : transforms[direction] || transforms.up,
        transition: `all 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}
