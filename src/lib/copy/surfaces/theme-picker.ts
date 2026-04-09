// §5.23 — Theme picker (header, filters, tile patterns, CTA states, the
// 17 theme tile taglines, behavior notes). Source of truth for
// rally-phase-6-theme-picker.html.
//
// Tagline keys are kebab-case, matching chassis ThemeId exactly.
// Decision D3 (locked 2026-04-08): chassis-id kebab-case everywhere.
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

  // ─── Theme tile taglines (keyed by chassis ThemeId) ─────────────
  'tagline.bachelorette':     'her last weekend ✨',
  'tagline.boys-trip':        'the boys 🍻',
  'tagline.birthday-trip':    'cake on the road 🎂',
  'tagline.couples-trip':     'ride or dies 🥂',
  'tagline.wellness-retreat': 'namaste lit 🧘',
  'tagline.reunion-weekend':  "the band's back 🎤",
  'tagline.festival-run':     'main stage 🎟️',
  'tagline.beach-trip':       'vamos a la playa 🌴',
  'tagline.ski-chalet':       'send it ⛷️',
  'tagline.euro-summer':      'ciao bella 🍋',
  'tagline.city-weekend':     "let's gooo 🌃",
  'tagline.wine-country':     'salud 🍷',
  'tagline.lake-weekend':     'dock days 🚤',
  'tagline.desert-trip':      'heat check 🏜️',
  'tagline.camping-trip':     'off the grid 🏕️',
  'tagline.tropical':         'island time 🏝️',
  'tagline.just-because':     'lfg 🔥',

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
