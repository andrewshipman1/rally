// §5.8 — Trip page go state. The countdown is the heartbeat.
// Hero label varies by days-remaining bucket. Sticky CTA references trip
// name in {trip}-mode form.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const tripPageGo: Record<string, Templated> = {
  'eyebrow':              ({ n }: ThemeVars) => `${n ?? '?'} days`,

  'countdown.t30':        ({ n }: ThemeVars) => `${n ?? '?'} days until liftoff`,
  'countdown.t14':        'two weeks. start the playlist.',
  'countdown.t7':         "one week. it's almost real.",
  'countdown.t3':         '3 sleeps.',
  'countdown.t1':         'tomorrow.',
  'countdown.t0':         'today.',
  'countdown.during':     "you're in it.",
  'countdown.post':       'that happened.',

  'sticky.cta':           ({ trip }: ThemeVars) => `the group chat is in ${trip ?? 'trip'}-mode`,
};
