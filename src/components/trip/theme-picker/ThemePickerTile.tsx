'use client';

// Single tile in the Phase 6 theme picker. Text-forward, full-width
// card: the theme's gradient fills the whole tile, with the theme name
// in Shrikhand 26px and the tagline in Caveat 18px rendered directly
// on top. Brutalist 2.5px ink border + hard-drop shadow per mockup.
//
// Tagline source: lexicon themePicker['tagline.<themeId>'] with fallback
// to theme.vibe from the registry when no lexicon entry exists. Tagline
// keys are kebab-case, matching ThemeId directly (decision D3).

import { themePicker } from '@/lib/copy/surfaces/theme-picker';
import { themesById } from '@/lib/themes';
import type { ThemeId } from '@/lib/themes/types';

// No mapping needed — tagline keys are `tagline.{ThemeId}` directly.

type Props = {
  themeId: ThemeId;
  selected: boolean;
  onClick: () => void;
};

export function ThemePickerTile({ themeId, selected, onClick }: Props) {
  const theme = themesById[themeId];
  const lexTagline = themePicker[`tagline.${themeId}`];
  const tagline = typeof lexTagline === 'string' ? lexTagline : theme.vibe;

  // Gradient stops mirror the mockup: accent top-left → bg bottom-right.
  const swatch = `linear-gradient(120deg, ${theme.palette.accent} 0%, ${theme.palette.bg} 100%)`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={theme.name}
      className="theme-picker-tile"
      data-selected={selected ? 'true' : 'false'}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 92,
        padding: '16px 20px',
        border: '2.5px solid #1a1a1a',
        borderRadius: 16,
        background: swatch,
        color: theme.palette.ink,
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 6,
        overflow: 'hidden',
        boxShadow: selected
          ? `4px 4px 0 ${theme.palette.accent}, 0 0 0 3px ${theme.palette.accent}`
          : '3px 3px 0 #1a1a1a',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display), 'Shrikhand', serif",
          fontSize: 26,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          fontWeight: 400,
        }}
      >
        {theme.name}
      </div>
      <div
        style={{
          fontFamily: "var(--font-hand), 'Caveat', cursive",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.1,
        }}
      >
        {tagline}
      </div>

      {selected && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: theme.palette.accent,
            color: '#fff',
            border: '2px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 14,
          }}
        >
          {'\u2713'}
        </div>
      )}
    </button>
  );
}
