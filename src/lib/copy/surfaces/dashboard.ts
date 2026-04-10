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

  // ─── Scoreboard ─────────────────────────────────────────────────
  'scoreCooking':         'cooking',
  'scoreLock':            'locked',
  'scoreGo':              'live',
  'scoreDone':            'done',

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
  'rallyMeterCount':      ({ n, target }: ThemeVars) => `${n ?? '?'} / ${target ?? '?'}`,

  // ─── Empty state ────────────────────────────────────────────────
  'emptyEmoji':           '✈️',
  'emptyTitle':           'no trips yet',
  'emptySubtitle':        'start one and see where it goes',

  // ─── CTA ────────────────────────────────────────────────────────
  'ctaCreate':            'start a trip 🔥',
};
