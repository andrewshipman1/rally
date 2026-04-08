// §5.7 — Trip page lock state ("the commitment"). Confetti energy.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const tripPageLock: Record<string, Templated> = {
  'eyebrow':              'locked in',
  'countdown.label':      ({ n }: ThemeVars) => `${n ?? '?'} days until liftoff`,
  'tagline':              "we're going 🚀",
  'sticky.committed':     'start packing',
  'sticky.organizer':     'post the playlist',
  'banner':               'the cabin is booked. the crew is set. nothing left to do but show up.',
};
