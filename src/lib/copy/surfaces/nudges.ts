// §5.18 — Nudge automations (organizer-side controls + sequence copy).
// The auto-sequence is sent server-side; these strings render the
// in-product organizer nudge controls only.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const nudges: Record<string, Templated> = {
  // Pipeline panel (lock-mode)
  'pipeline.header':    "where everyone's at",
  'pipeline.line':      ({ n_in, n_hold, n_no, n }: ThemeVars) =>
    `${n_in ?? 0} in · ${n_hold ?? 0} holding · ${n_no ?? 0} no response · cutoff in ${n ?? 0} days`,

  // Manual nudge controls
  'nudge.button':       ({ name }: ThemeVars) => `nudge ${name ?? 'them'}`,
  'nudge.toast':        ({ name }: ThemeVars) => `sent. ${name ?? 'they'} will see it.`,
  'nudge.history':      ({ when }: ThemeVars) => `last nudged ${when ?? 'recently'}`,

  // Cutoff override
  'cutoff.override':    'push the deadline',
  'cutoff.overrideConfirm': ({ date }: ThemeVars) =>
    `cutoff moved to ${date ?? '?'}. everyone still holding gets another shot.`,

  // Auto-sequence push/email copy (rendered server-side, kept here for
  // string parity with the lexicon)
  'auto.t14':           ({ inviter, trip, n_open }: ThemeVars) =>
    `${inviter ?? 'someone'} is still holding a seat for you on ${trip ?? 'the trip'}. ${n_open ?? 0} spots left.`,
  'auto.t7':            ({ trip, crew_short }: ThemeVars) =>
    `last week to decide on ${trip ?? 'the trip'}. ${crew_short ?? 'the crew'} are booking flights.`,
  'auto.t3':            ({ trip, day }: ThemeVars) =>
    `48h left on ${trip ?? 'the trip'}. after ${day ?? 'soon'} your seat opens up.`,
  'auto.t0':            'we released your seat — catch the next one?',
  'auto.expiredHold':   ({ trip, inviter }: ThemeVars) =>
    `your hold on ${trip ?? 'the trip'} expired. still want in? ask ${inviter ?? 'them'}.`,
};
