// Theme picker filter categories. Maps each chassis ThemeId to one or
// more of the four filter buckets (Weekends / Big Trips / Milestones /
// Chill). The "All" filter ignores this map.
//
// Overlap is intentional — filters are OR, not mutually exclusive.
// Bachelorette, boys-trip, and birthday-trip double-expose in weekends
// + milestones because they're functionally both. Chill stays lean on
// purpose; if engagement data shows it's dead, prune in v0.1.
//
// Locked via decision D2 (2026-04-08).

import type { ThemeId } from './types';

export type ThemeCategory = 'weekends' | 'bigTrips' | 'milestones' | 'chill';

export const themeCategories: Record<ThemeId, ThemeCategory[]> = {
  // Weekends + Milestones (double-exposed)
  'bachelorette':     ['weekends', 'milestones'],
  'boys-trip':        ['weekends', 'milestones'],
  'birthday-trip':    ['weekends', 'milestones'],

  // Weekends only
  'ski-chalet':       ['weekends'],
  'city-weekend':     ['weekends'],
  'just-because':     ['weekends'],

  // Weekends + Chill
  'lake-weekend':     ['weekends', 'chill'],
  'wine-country':     ['weekends', 'chill'],

  // Big Trips
  'euro-summer':      ['bigTrips'],
  'beach-trip':       ['bigTrips'],
  'festival-run':     ['bigTrips'],
  'desert-trip':      ['bigTrips'],
  'camping-trip':     ['bigTrips'],

  // Big Trips + Chill
  'tropical':         ['bigTrips', 'chill'],

  // Milestones + Chill
  'couples-trip':     ['milestones', 'chill'],

  // Milestones only
  'reunion-weekend':  ['milestones'],

  // Chill only
  'wellness-retreat': ['chill'],
};

/** Primary (first) category for a theme — used for the tile's category tag. */
export function primaryCategory(id: ThemeId): ThemeCategory {
  return themeCategories[id][0];
}
