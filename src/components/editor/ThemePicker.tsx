'use client';

import type { Theme } from '@/types';

function hexLightness(hex: string): number {
  // Returns lightness 0..100 from a #rrggbb color; defaults to 50 if unparseable
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return 50;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 0xff) / 255;
  const g = ((n >> 8) & 0xff) / 255;
  const b = (n & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return ((max + min) / 2) * 100;
}

export function ThemePicker({
  themes,
  selected,
  onSelect,
}: {
  themes: Theme[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        marginTop: 4,
      }}
    >
      {themes.map((theme) => {
        const isSelected = selected === theme.id;
        const isLight = hexLightness(theme.color_primary || '#000000') > 60;
        const labelColor = isLight ? 'rgba(20,20,20,0.85)' : 'rgba(255,255,255,0.85)';
        const labelShadow = isLight ? '0 1px 1px rgba(255,255,255,0.4)' : '0 1px 3px rgba(0,0,0,0.3)';
        return (
          <button
            key={theme.id}
            onClick={() => onSelect(isSelected ? null : theme.id)}
            style={{
              padding: 0,
              border: isSelected ? '2px solid #2d6b5a' : '2px solid transparent',
              borderRadius: 12,
              cursor: 'pointer',
              background: 'none',
              overflow: 'hidden',
              transition: 'all .2s',
              outline: 'none',
            }}
          >
            <div
              style={{
                height: 48,
                background: theme.background_value,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                padding: '0 0 6px',
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: labelColor,
                  textShadow: labelShadow,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {theme.template_name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
