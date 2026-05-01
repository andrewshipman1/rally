# Rally Design System

This bundle is the design system for **Rally**, a group-trip-planning app. It is intended to be uploaded to Claude Design so that generated mockups, prototypes, and marketing assets match what Rally actually looks like in production.

## What's in this bundle

```
rally-design-system/
├── DESIGN-SYSTEM.md     ← you are here
├── globals.css          ← chassis kernel + 17 theme overrides (single source of truth)
├── layout.tsx           ← Next.js root layout, shows how fonts are wired
├── themes/              ← per-theme palette + content strings (TypeScript)
│   ├── types.ts         ← Theme contract (read this first)
│   ├── index.ts
│   ├── categories.ts
│   ├── from-db.ts
│   └── 17× <theme-id>.ts
└── ui/                  ← shared UI primitives that consume the chassis
    ├── Avatar.tsx
    ├── Badge.tsx
    ├── Confetti.tsx
    ├── GlassCard.tsx
    ├── Reveal.tsx
    ├── SectionLabel.tsx
    └── SolidCard.tsx
```

## The chassis (most important concept)

Rally's design system is a **chassis kernel of 9 CSS variables** that every theme overrides. UI primitives never hard-code colors — they read these vars. To switch themes at runtime, mutate `data-theme` on a wrapper element inside `<body>`. CSS handles the rest, no React re-render required.

The 9 chassis vars:

| Var             | Purpose                                                 |
|-----------------|---------------------------------------------------------|
| `--bg`          | Page background                                         |
| `--ink`         | Primary text on `--bg` and `--field`                    |
| `--accent`      | Primary brand accent (CTAs, highlights)                 |
| `--accent2`     | Secondary accent                                        |
| `--sticker-bg`  | Sticker / flag background                               |
| `--stroke`      | Borders, rules, outlines                                |
| `--surface`     | Dark block surface (marquee, countdown blocks)          |
| `--on-surface`  | Text color on `--surface`                               |
| `--hot`         | Theme-adaptive urgency punch (e.g. trailing punctuation)|

A computed `--field` (subtle tint of `--bg` toward `--ink`) is derived from the chassis via `color-mix()`. Use it for cards, inputs, banners.

### Pairing rules

- `--surface` + `--on-surface` → dark block, light text (marquee, countdown)
- `--field` + `--ink` → light field, dark text (cards, inputs)
- `--bg` + `--ink` → page surfaces (sections, frames)
- **Never** put `--ink` on `--surface` — that's dark-on-dark in every theme.

## Themes

There are **17 themes**, organized into three types:

- **Occasion themes**: bachelorette, boys-trip, birthday-trip, couples-trip, wellness-retreat, reunion-weekend, festival-run
- **Setting themes**: beach-trip, ski-chalet, euro-summer, city-weekend, wine-country, lake-weekend, desert-trip, camping-trip, tropical
- **Default**: just-because (the picker fallback when no theme is chosen)

Each theme block in `globals.css` lives at `[data-theme="<id>"]` and overrides the 9 chassis vars (plus light/dark mode vars where needed). The `themes/` TypeScript files mirror the same palette plus content strings (vibe, sticker copy, marquee items, hints, empty states) — these are content, not visual tokens, but they shape what mockups should say.

### Dark themes

Three themes are dark by default: **boys-trip**, **city-weekend**, **festival-run**. They override `--stroke`, `--surface`, `--on-surface` directly. All other themes are light and inherit dual-mode defaults.

`just-because` additionally has an explicit `[data-theme="just-because"][data-mode="dark"]` block.

## Typography

All fonts are loaded via `next/font/google` (see `layout.tsx`). Four chassis fonts plus two legacy:

| CSS var              | Family             | Weights         | Usage                                              |
|----------------------|--------------------|-----------------|----------------------------------------------------|
| `--font-display`     | Shrikhand          | 400             | Wordmark, trip title, countdown number             |
| `--font-hand`        | Caveat             | 500, 700        | Stickers, taglines, flag, going-label              |
| `--font-body`        | DM Sans            | 400/500/700/900 | Everything else (default body)                     |
| `--font-serif`       | Instrument Serif   | 400             | Auth headlines, error states                       |
| `--font-geist-sans`  | Geist              | variable        | Legacy surfaces (dashboard, editor) — being phased out |
| `--font-geist-mono`  | Geist Mono         | variable        | Legacy code/mono                                   |

Tailwind theme aliases (defined in `globals.css`):

```
--font-sans:    var(--font-body), var(--font-geist-sans);
--font-mono:    var(--font-geist-mono);
--font-display: var(--font-display);
--font-hand:    var(--font-hand);
--font-serif:   var(--font-serif);
```

## Component instance vars (NOT in the chassis)

These are set inline per element, not on `:root` or theme blocks:

- `--pct` — lodging vote tally bar width (e.g. `"62%"`)
- `--fill` — dashboard rally meter fill (e.g. `"0.7"`)
- `--rot` — sticker / flag rotation (e.g. `"-3deg"`)
- `--house-grad` — surface decoration gradient
- `--frame` — surface decoration frame color

## Brand-locked tokens (not theme-dependent)

```
--bang-light: #ff2e7e   /* Wordmark "bang" color (light mode) */
--bang-dark:  #c4ff7a   /* Wordmark "bang" color (dark mode) */
```

These do not change across themes. The wordmark "bang" is a Rally signature.

## How to use this with Claude Design

1. Upload this entire `rally-design-system/` folder.
2. When prompting, reference themes by ID (e.g. "make a beach-trip-themed signup screen") so Claude pulls the right chassis values.
3. New components should consume chassis vars only — never hard-code hex.
4. For type, use the four chassis font vars. Default to `--font-body`. Reach for `--font-display` (Shrikhand) for headlines and `--font-hand` (Caveat) for playful, sticker-like accents.
5. Respect the pairing rules above — they're the difference between Rally-feeling output and generic output.

## Tech stack context (for reference)

- Next.js (App Router), React, TypeScript
- Tailwind v4 (CSS-first config — see top of `globals.css`)
- Theme switching via `data-theme` attribute, no JS state needed for visual swap
