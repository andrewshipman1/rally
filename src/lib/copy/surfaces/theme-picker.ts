// §5.23 — Theme picker (header, filters, tile patterns, CTA states, the
// 17 theme tile taglines, behavior notes). Source of truth for
// rally-phase-6-theme-picker.html.
//
// Note: tileName and tileTagline are resolved at runtime from theme.name
// and theme.tagline in the theme content system — they are NOT keyed in
// this lexicon.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const themePicker: Record<string, Templated> = {
  // ─── Page chrome ────────────────────────────────────────────────
  'pageHeader':           'pick the vibe',
  'pageSubheader':        'this is the whole plan — pick what fits',
  'searchPlaceholder':    'search vibes',

  // ─── Filters ────────────────────────────────────────────────────
  'filterAll':            'all',
  'filterWeekends':       'weekends',
  'filterBigTrips':       'big trips',
  'filterMilestones':     'milestones',
  'filterChill':          'chill',

  // ─── Tile badge ─────────────────────────────────────────────────
  'selectedTileBadge':    'picked ✓',

  // ─── Theme tile taglines (locked for v0, keyed by theme id) ─────
  'tagline.bachelorette':    'her last weekend ✨',
  'tagline.beachTrip':       'vamos a la playa 🌴',
  'tagline.skiChalet':       'send it ⛷️',
  'tagline.euroSummer':      'ciao bella 🍋',
  'tagline.cityWeekend':     "let's gooo 🌃",
  'tagline.wineCountry':     'salud 🍷',
  'tagline.lakeWeekend':     'dock days 🚤',
  'tagline.birthdayTrip':    'cake on the road 🎂',
  'tagline.couplesTrip':     'ride or dies 🥂',
  'tagline.wellnessRetreat': 'namaste lit 🧘',
  'tagline.justBecause':     'lfg 🔥',
  'tagline.bachWeekendGuys': 'send-off 🥃',
  'tagline.reunion':         "the band's back 🎤",
  'tagline.girlsTrip':       'the girls 💅',
  'tagline.boysTrip':        'the boys 🍻',
  'tagline.festival':        'main stage 🎟️',
  'tagline.tropical':        'island time 🏝️',

  // ─── Preview ────────────────────────────────────────────────────
  'previewHeader':        "how it'll look",
  'previewSub':           'your trip, this vibe',

  // ─── CTAs ───────────────────────────────────────────────────────
  'ctaDisabled':          'pick one to keep going',
  'ctaPicked':            'lock the vibe →',
  'changeLaterHint':      'you can swap it later. nothing is final.',

  // ─── Confirmation ───────────────────────────────────────────────
  'confirmationToast':    ({ trip_name }: ThemeVars) => `vibe locked. ${trip_name ?? 'this trip'} it is.`,
  'backLink':             'back to the trip',
};
