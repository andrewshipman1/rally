// §5.6 — Trip page sell state ("the pitch"). The loud state.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const tripPageSell: Record<string, Templated> = {
  'eyebrow':              ({ organizer }: ThemeVars) => `${organizer ?? 'someone'} is calling`,
  'countdown1.label':     ({ n }: ThemeVars) => `${n ?? '?'} days until liftoff`,
  'countdown2.label':     ({ n }: ThemeVars) => `${n ?? '?'} days to lock it in`,
  'tagline':              'the vibe is approaching',
  'sticky.undecided':     "i'm in 🙌",
  'sticky.secondary':     "i'm a maybe",
  'sticky.committed':     "you're in. nice.",
  'sticky.organizer':     'nudge the maybes',
  'cost.banner':          ({ n }: ThemeVars) => `~$${n ?? 0} per person, before flights`,
  'lockUrgency.t3':       "3 days. don't be the missing one.",
  'lockUrgency.t1':       "tomorrow. it's now or december.",

  // Session 9D — countdown scoreboard (sell phase only). Kicker sits above
  // the date line; hint + emoji sit below the d:h:m:s tiles.
  'scoreboard.kicker':    'lock in by',
  'scoreboard.hint':      'until the plan locks',
  'scoreboard.hintEmoji': '\u{1F512}', // 🔒 lock

  // Session 9E — dynamic sell marquee segments. Rendered as 3 discrete
  // items into the marquee track array; the scroll loop duplicates the
  // array for seamless scroll. `alreadyIn` segment omitted when count is 0.
  'marquee.calledUp':     ({ organizer }: ThemeVars) => `${organizer ?? 'someone'} called you up`,
  'marquee.lockBy':       ({ cutoff }: ThemeVars)    => `lock it in by ${cutoff ?? 'soon'}`,
  'marquee.alreadyIn':    ({ count }: ThemeVars)     => `${count ?? 0} already in`,
  // Session 9F scrapped `phaseEyebrow.sell` — the muted "sell · N-night
  // trip" row above the title was dropped when the hierarchy rework
  // moved title → meta → tagline into a single clean reading order.
};
