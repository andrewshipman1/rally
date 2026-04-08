// Theme picker filter categories. Maps each chassis ThemeId to one or
// more of the four lexicon filter buckets (Weekends / Big Trips /
// Milestones / Chill). The "All" filter ignores this map.
//
// Multi-tag is allowed so a theme can legitimately appear under more
// than one filter (e.g. bachelorette is both a weekend and a milestone).
//
// Best-guess tagging — retune in a follow-up if product has stronger
// opinions. No explicit spec in rally-theme-content-system.md yet.

import type { ThemeId } from './types';

export type ThemeCategory = 'weekends' | 'bigTrips' | 'milestones' | 'chill';

export const themeCategories: Record<ThemeId, ThemeCategory[]> = {
  // Milestones (commemorative, once-in-a-lifetime)
  'bachelorette':     ['milestones', 'weekends'],
  'birthday-trip':    ['milestones'],
  'reunion-weekend':  ['milestones'],

  // Weekends (2–3 nights, drivable, low logistics)
  'city-weekend':     ['weekends'],
  'lake-weekend':     ['weekends', 'chill'],
  'wine-country':     ['weekends', 'chill'],
  'ski-chalet':       ['weekends'],
  'boys-trip':        ['weekends'],

  // Big Trips (week+, flight, heavy logistics)
  'euro-summer':      ['bigTrips'],
  'tropical':         ['bigTrips', 'chill'],
  'beach-trip':       ['bigTrips'],
  'desert-trip':      ['bigTrips'],
  'camping-trip':     ['bigTrips'],
  'festival-run':     ['bigTrips'],

  // Chill (low-intensity, relaxed pacing)
  'wellness-retreat': ['chill'],
  'couples-trip':     ['chill'],
  'just-because':     ['chill'],
};

/** Primary (first) category for a theme — used for the tile's category tag. */
export function primaryCategory(id: ThemeId): ThemeCategory {
  return themeCategories[id][0];
}
