// §5.2 — Dashboard (logged-in home).
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const dashboard: Record<string, Templated> = {
  // ─── Page chrome ────────────────────────────────────────────────
  'pageTitle':            'rally!',
  'greeting':             ({ name }: ThemeVars) => `hey ${name ?? 'there'} 👋`,
  'pageH1':               'where to next? ✈️',

  // ─── Live row ───────────────────────────────────────────────────
  'liveRowAction':        ({ n }: ThemeVars) => `${n ?? 1} trip${Number(n) === 1 ? '' : 's'} need${Number(n) === 1 ? 's' : ''} your move`,
  'liveRowClear':         'all caught up ✨',

  // ─── Sections ───────────────────────────────────────────────────
  'sectionCooking':       "what you're cooking",
  'sectionArchive':       'the archive',

  // ─── Card content ───────────────────────────────────────────────
  'cardDateTbd':          'dates tbd',
  'cardDestTbd':          'destination tbd',
  'cardMembers':          ({ n }: ThemeVars) => `${n ?? '?'} ${Number(n) === 1 ? 'person' : 'people'}`,
  'cardCountdown':        ({ n }: ThemeVars) => `${n ?? '?'}`,
  'cardCountdownLabel':   ({ n }: ThemeVars) => `day${Number(n) === 1 ? '' : 's'}`,
  'cardCountdownLabelSell': 'to lock',
  'cardCountdownLocked':  'locked',

  // ─── Card actions ───────────────────────────────────────────────
  'actionKeepBuilding':   'keep building →',
  'actionTapIn':          'tap in →',
  'actionNudge':          'nudge them →',
  'actionRelive':         're-live it →',
  'actionViewTrip':       'view trip →',

  // ─── Rally meter ────────────────────────────────────────────────
  'rallyMeterLabel':      'rallied so far',
  'rallyMeterCount':      ({ n, target }: ThemeVars) => `${n ?? '?'} / ${target ?? '?'} ride or dies`,

  // ─── Empty state ────────────────────────────────────────────────
  'emptyEmoji':           '✈️',
  'emptyTitle':           'no trips yet',
  'emptySubtitle':        'start one and see where it goes',

  // ─── Marquee ─────────────────────────────────────────────────────
  'marqueeYourMove':      ({ name }: ThemeVars) => `your move on ${name ?? 'a trip'}`,
  'marqueeDaysTo':        ({ n, destination }: ThemeVars) => `${n ?? '?'} days to ${destination ?? 'adventure'}`,
  'marqueeLocked':        ({ destination }: ThemeVars) => `${destination ?? 'trip'} is locked`,
  'marqueeLive':          "let's gooo",
  'marqueeBrewing':       ({ name }: ThemeVars) => `${name ?? 'something'} is brewing`,

  // ─── CTA ────────────────────────────────────────────────────────
  'ctaCreate':            'start a trip 🔥',

  // ─── Delete ──────���──────────────────────────────────────────────
  'deleteConfirm':        'delete this draft?',
  'deleteYes':            'yes, trash it',
  'deleteNo':             'nah, keep it',
};
