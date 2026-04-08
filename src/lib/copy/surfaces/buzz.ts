// §5.26 — Buzz (the activity feed).
//
// System events are templated by actor name, target, and metadata. Compose
// placeholders and reaction sets rock-swap by theme; defaults live here
// and themes override via the theme content system.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const buzz: Record<string, Templated> = {
  // ─── Page chrome ────────────────────────────────────────────────
  'pageTitle':              'the buzz',
  'pageSubtitle':           ({ trip_name, n }: ThemeVars) => `${trip_name ?? 'this trip'} · ${n ?? '?'} rallied`,
  'backLink':               'back to trip',

  // ─── Compose area ───────────────────────────────────────────────
  'composePlaceholder.default':  "what's the word?",
  'composePlaceholder.ski':      "what's the chair chat?",
  'composePlaceholder.beach':    "what's the beach gossip?",
  'composePlaceholder.festival': 'what set?',
  'composePlaceholder.wine':     'pouring thoughts?',
  'composePlaceholder.city':     "what'd you find?",
  'composeSendButton':           '→',

  // ─── Day dividers ───────────────────────────────────────────────
  'dayDividerToday':        'today',
  'dayDividerYesterday':    'yesterday',
  'dayDividerOlder':        ({ weekday, date }: ThemeVars) => `${weekday ?? 'day'} · ${date ?? '?'}`,

  // ─── System events (templated) ──────────────────────────────────
  'eventRsvpIn':            ({ name }: ThemeVars) => `${name ?? 'someone'} is in`,
  'eventRsvpHolding':       ({ name }: ThemeVars) => `${name ?? 'someone'} is holding`,
  'eventRsvpOut':           ({ name }: ThemeVars) => `${name ?? 'someone'} is out`,
  'eventPlusOneAdded':      ({ name }: ThemeVars) => `${name ?? 'someone'} added a +1`,
  'eventVoteCast':          ({ name }: ThemeVars) => `${name ?? 'someone'} voted`,
  'eventVoteDetail':        ({ option_name }: ThemeVars) => `for ${option_name ?? 'an option'}`,
  'eventLodgingLocked':     ({ name }: ThemeVars) => `${name ?? 'host'} locked the lodging`,
  'eventLodgingLockDetail': ({ option_name, meta }: ThemeVars) => `winner: ${option_name ?? 'option'} · ${meta ?? ''}`,
  'eventActivityAdded':     ({ name }: ThemeVars) => `${name ?? 'someone'} added an activity`,
  'eventExtraAdded':        ({ name, extra_type }: ThemeVars) => `${name ?? 'someone'} added to ${extra_type ?? 'extras'}`,
  'eventThemeChanged':      ({ name }: ThemeVars) => `${name ?? 'host'} set the vibe`,
  'eventPhaseLock':         'trip is locked in — countdown is real now',
  'eventPhaseGo':           ({ n }: ThemeVars) => `countdown is on. ${n ?? '?'} days.`,
  'eventTripCreated':       ({ name }: ThemeVars) => `${name ?? 'host'} started the rally`,
  'eventCutoffPassed':      ({ n_in }: ThemeVars) => `time's up. locked with ${n_in ?? '?'} yes's.`,

  // ─── Timestamps ─────────────────────────────────────────────────
  'postTimestampJustNow':   'just now',
  'postTimestampMinutes':   ({ n }: ThemeVars) => `${n ?? '?'}m ago`,
  'postTimestampHours':     ({ n }: ThemeVars) => `${n ?? '?'}h ago`,
  'postTimestampYesterday': ({ time }: ThemeVars) => `yesterday · ${time ?? '?'}`,

  // ─── Reactions ──────────────────────────────────────────────────
  'reactionAdd':            '+',
  'defaultReactionSet':     '👍 🔥 😂 ❤️ 🙌',
  'themedReactionSki':      '🎿',
  'themedReactionBeach':    '🏖️',
  'themedReactionFestival': '🎟️',
  'themedReactionWine':     '🍷',

  // ─── Empty state ────────────────────────────────────────────────
  'emptyState':             'nothing yet — say hi 👋',
};
