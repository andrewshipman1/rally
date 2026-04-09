// §5.10 — RSVP states (three-state, viewer-side).
//
// IMPORTANT: per lexicon §5.10, the chip icons (🙌 / 🧗 / —) are LOCKED
// GLOBAL. They live here as constants, NOT in any theme override. Only the
// viewer-side button CTA TEXT is themeable (e.g. "pour me in 🍷"); that
// text lives in theme.strings.rsvp.{state}.buttonLabel.
//
// Pipeline strip, crew rows, buzz events, and dashboard chips ALL render
// the global chip icons below — never the themed button labels.
import type { Templated, ThemeVars } from '@/lib/themes/types';

// ─── GLOBAL CHIP ICONS — locked per lexicon §5.10 ──────────────────────
// Do NOT theme. These are the unicode characters every surface renders for
// the three RSVP states.
export const RSVP_CHIP_ICONS = {
  in:      '🙌',
  holding: '🧗',
  out:     '—',
} as const;

export const rsvp: Record<string, Templated> = {
  // Default theme button labels (just-because). Per-theme overrides live
  // in src/lib/themes/<id>.ts → strings.rsvp.{state}.buttonLabel and are
  // resolved by getCopy() before falling back to these defaults.
  'in.button':       "i'm in 🙌",
  'holding.button':  'hold my seat 🧗',
  'out.button':      "can't make it —",

  // ─── Confirmation toasts ───────────────────────────────────────
  'in.toast':        "you're on the list.",
  'holding.toast':   ({ cutoff }: ThemeVars) => `seat's yours. you've got until ${cutoff ?? 'cutoff'}.`,
  'out.toast':       'next one.',

  // ─── Already-set state copy (viewer is in this state already) ──
  'in.already':      ({ n }: ThemeVars) => `you're in. ${n ?? '?'} days out.`,
  'holding.already': ({ cutoff }: ThemeVars) => `you've got a seat on hold until ${cutoff ?? 'cutoff'}.`,
  'out.already':     'you said no. miss us yet? change your mind.',

  // ─── Transition buttons (already-holding → upgrade/downgrade) ──
  'holding.upgrade':   'lock it in',
  'holding.downgrade': 'release the seat',

  // ─── Edge states ───────────────────────────────────────────────
  'lockedOut':         "this one's full. the next one's yours.",
  'pastCutoffNoResp':  ({ organizer }: ThemeVars) => `the door closed. tell ${organizer ?? 'them'} to start the next one.`,
  'pastCutoffHolding': ({ organizer }: ThemeVars) => `your hold expired. still want in? ask ${organizer ?? 'them'}.`,

  // ─── Organizer-side pipeline string ─────────────────────────────
  'pipeline.line': ({ n_in, n_hold, n_out, days }: ThemeVars) =>
    `${n_in ?? 0} in · ${n_hold ?? 0} holding · ${n_out ?? 0} out · cutoff in ${days ?? 0} days`,

  // ─── Crew section captions (default; themeable) ────────────────
  'crew.section.in':      'in',
  'crew.section.holding': 'holding',
  'crew.section.out':     'out',
  'crew.section.pending': 'pending',
  'crew.caption.in':      'locked and loaded',
  'crew.caption.holding': 'thinking about it',
  'crew.caption.out':     'catch the next one',
  'crew.caption.pending': "hasn't weighed in yet",

  // RsvpSection — prompt + share + button labels (distinct from default buttons above)
  'share.story':         'Share to Story \ud83d\udcf8',
  'prompt.h2':           'You coming or what?',
  'prompt.sub':          'Lock it in before the countdown hits zero',
  'prompt.in.button':    "I'm so in",
  'prompt.holding.button': 'Holding...',
  'prompt.out.button':   "Can't make it",
};
