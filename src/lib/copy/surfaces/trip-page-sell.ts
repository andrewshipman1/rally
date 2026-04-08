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
};
