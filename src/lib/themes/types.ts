// Rally chassis type foundations — themes layer.
// This file is intentionally values-free. It defines the contract every
// theme file (themes/{id}.ts) and every copy consumer (copy/get-copy.ts)
// builds against.

// ─── Theme identity ────────────────────────────────────────────────────────

export type ThemeId =
  | 'bachelorette'
  | 'boys-trip'
  | 'birthday-trip'
  | 'couples-trip'
  | 'wellness-retreat'
  | 'reunion-weekend'
  | 'festival-run'
  | 'beach-trip'
  | 'ski-chalet'
  | 'euro-summer'
  | 'city-weekend'
  | 'wine-country'
  | 'lake-weekend'
  | 'desert-trip'
  | 'camping-trip'
  | 'tropical'
  | 'just-because';

export type ThemeType = 'occasion' | 'setting' | 'default';

// ─── Palette (8 chassis vars) ──────────────────────────────────────────────

/**
 * The 8 chassis CSS custom properties every theme defines.
 * Hex strings only — no rgba, no gradients. Component instance vars
 * (--pct, --fill, --rot, etc.) are NOT in this shape; they're set inline.
 */
export interface ThemePalette {
  bg: string;
  ink: string;
  accent: string;
  accent2: string;
  stickerBg: string;
  stroke: string;
  surface: string;
  onSurface: string;
}

/** Optional dark variant. Partial because dark mode only overrides what differs. */
export type ThemePaletteDark = Partial<ThemePalette>;

// ─── Theme variables (lexicon §5.22) ───────────────────────────────────────

/**
 * Typed bag of vars passed into a Templated function or used to substitute
 * {token} placeholders in a raw-string Templated.
 *
 * Open set: the index signature lets new tokens land without type churn.
 * Lexicon §5.22 is the source-of-truth catalog for which vars exist.
 */
export interface ThemeVars {
  age?: number | string;
  name?: string;
  first_name?: string;
  organizer?: string;
  inviter_first?: string;
  trip?: string;
  trip_name?: string;
  partner?: string;
  festival?: string;
  mountain?: string;
  city?: string;
  place?: string;
  lake?: string;
  region?: string;
  island?: string;
  group?: string;
  n?: number;
  n_in?: number;
  n_hold?: number;
  n_out?: number;
  n_going?: number;
  n_nights?: number;
  cutoff?: string;
  date?: string;
  weekday?: string;
  destination?: string;
  extra_type?: string;
  option_name?: string;
  [key: string]: string | number | undefined;
}

/**
 * A renderable string. Either a static string with optional {token}
 * placeholders, or a function over typed vars per lexicon §5.22.
 * Both forms go through render() in copy/interpolate.ts.
 */
export type Templated = string | ((vars: ThemeVars) => string);

// ─── Per-theme content overrides ───────────────────────────────────────────

/**
 * Per-theme content. Keys mirror lexicon dotted paths so getCopy() can do
 * a literal lookup against the theme strings tree — no manual key remap.
 *
 * Per lexicon §5.10: ONLY the button CTA text is themeable for RSVP.
 * Chip icons (🙌/🧗/—) live globally in copy/surfaces/rsvp.ts.
 */
export interface ThemeStrings {
  vibe: Templated;

  sticker: {
    new: Templated;
    invite: Templated;
    locked: Templated;
  };

  marquee: [Templated, Templated, Templated, Templated, Templated];

  hint: {
    name: Templated;
    dates: Templated;
    invite: Templated;
  };

  empty: {
    noActivities: Templated;
    noExtras: Templated;
  };

  in: { button: Templated };
  holding: { button: Templated };
  out: { button: Templated };

  nudge: {
    t14: Templated;
    t7: Templated;
    t3: Templated;
    cutoff: Templated;
  };

  cta: { send: Templated };
  caption: { invite: Templated };

  // ─── Lexicon §6 themed microcopy (all optional — fall back to lexicon defaults) ───
  // Lexicon §6 only enumerates these for 11 of 17 themes today. The 6
  // missing ones (Boys, Reunion, Festival, Desert, Camping, Tropical) leave
  // these undefined and the rendering surface uses the global default from
  // copy/surfaces/{tripPageShared,buzz,crew}.ts. Tracked: CoWork to backfill.

  /** Single FOMO flag word, e.g. "lfg" — shown on the countdown sticker. */
  fomoFlag?: string;
  /** Sticky CTA emoji, e.g. "🔥". */
  ctaEmoji?: string;
  /** Signature countdown phrase, e.g. "days until liftoff". */
  countdownSignature?: Templated;
  /** Buzz/chat compose placeholder. Override; defaults to "what's the word?". */
  buzzPlaceholder?: Templated;
  /** Crew page section headers per RSVP state. Override; defaults in rsvp lexicon. */
  crewSectionCaptions?: {
    in: Templated;
    holding: Templated;
    out: Templated;
  };
  /** Single emoji this theme adds to the default reaction set 👍🔥😂❤️🙌. */
  signatureReaction?: string;
}

// ─── Full theme record ─────────────────────────────────────────────────────

export interface Theme {
  id: ThemeId;
  /** Display name e.g. "Bachelorette". Sentence case at the surface. */
  name: string;
  type: ThemeType;
  /**
   * Picker tagline. Mirrors strings.vibe but kept as a static string here
   * so the picker grid renders without invoking render() per tile.
   */
  vibe: string;
  palette: ThemePalette;
  paletteDark?: ThemePaletteDark;
  strings: ThemeStrings;
}
