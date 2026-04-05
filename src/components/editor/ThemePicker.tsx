'use client';

import type { Theme } from '@/types';

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
                  color: 'rgba(255,255,255,0.8)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
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
