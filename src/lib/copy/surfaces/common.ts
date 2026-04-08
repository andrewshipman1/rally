// Common chassis-wide bits used across many surfaces.
import type { Templated } from '@/lib/themes/types';

export const common: Record<string, Templated> = {
  // Wordmark — `rally!` lowercase, bang in accent color (brand brief).
  // Renders as plain text; the surface wraps the bang in <span class="bang">.
  'wordmark':       'rally!',

  // Footer — global default. Trip pages use the poetic variant from
  // tripPageShared.footer.poetic instead.
  'footer.madeWith':'made with rally',

  // Live indicator
  'live':           'trip is live',

  // Generic actions
  'action.back':    'back',
  'action.cancel':  'never mind',
  'action.copy':    'copy',
  'action.next':    'next →',
  'action.send':    'send it',
};
