// §5.11 — Empty states.
import type { Templated } from '@/lib/themes/types';

export const emptyStates: Record<string, Templated> = {
  'lodging':    'no spot picked yet',
  'flights':    'no flights added yet',
  'transport':  'no wheels sorted yet',
  'activities': 'nothing planned yet',
  'groceries':  'no list yet',
};
