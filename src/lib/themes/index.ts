// Themes registry — all 17 themes registered. getCopy() reads from
// themesById; CSS overrides for each id live in src/app/globals.css under
// the THEME OVERRIDES section. Keep palette hex strings in sync between
// the .ts file here and the matching [data-theme="<id>"] block.

import type { Theme, ThemeId } from './types';

import { justBecause }      from './just-because';
import { bachelorette }     from './bachelorette';
import { boysTrip }         from './boys-trip';
import { birthdayTrip }     from './birthday-trip';
import { couplesTrip }      from './couples-trip';
import { wellnessRetreat }  from './wellness-retreat';
import { reunionWeekend }   from './reunion-weekend';
import { festivalRun }      from './festival-run';
import { beachTrip }        from './beach-trip';
import { skiChalet }        from './ski-chalet';
import { euroSummer }       from './euro-summer';
import { cityWeekend }      from './city-weekend';
import { wineCountry }      from './wine-country';
import { lakeWeekend }      from './lake-weekend';
import { desertTrip }       from './desert-trip';
import { campingTrip }      from './camping-trip';
import { tropical }         from './tropical';

const themes: Theme[] = [
  // occasions
  bachelorette,
  boysTrip,
  birthdayTrip,
  couplesTrip,
  wellnessRetreat,
  reunionWeekend,
  festivalRun,
  // settings
  beachTrip,
  skiChalet,
  euroSummer,
  cityWeekend,
  wineCountry,
  lakeWeekend,
  desertTrip,
  campingTrip,
  tropical,
  // default
  justBecause,
];

/** Lookup table by id. All 17 themes are registered. */
export const themesById = Object.fromEntries(
  themes.map((t) => [t.id, t])
) as Record<ThemeId, Theme>;

/** Stable id list — picker grid render order. */
export const themeIds: ThemeId[] = themes.map((t) => t.id);

/** Returns the theme record. Total — every ThemeId is registered. */
export function getTheme(id: ThemeId): Theme {
  return themesById[id];
}

export type {
  Theme,
  ThemeId,
  ThemeType,
  ThemePalette,
  ThemeStrings,
  ThemeVars,
  Templated,
} from './types';
