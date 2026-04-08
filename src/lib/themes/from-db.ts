// Map a legacy DB theme row's template_name to the new chassis ThemeId.
// Used by trip page render until the DB schema gains a chassis_theme_id
// column (Session 3 migration). Falls back to 'just-because' for unmapped
// templates ("Minimal" was cut by the redesign per scope §7).

import type { ThemeId } from './types';

const MAP: Record<string, ThemeId> = {
  'Bachelorette':      'bachelorette',
  'Boys Trip':         'boys-trip',
  'Birthday Trip':     'birthday-trip',
  'Couples Trip':      'couples-trip',
  'Wellness Retreat':  'wellness-retreat',
  'Reunion Weekend':   'reunion-weekend',
  'Festival Run':      'festival-run',
  'Beach Trip':        'beach-trip',
  'Ski Chalet':        'ski-chalet',
  'Euro Summer':       'euro-summer',
  'City Weekend':      'city-weekend',
  'Wine Country':      'wine-country',
  'Lake Weekend':      'lake-weekend',
  'Desert Trip':       'desert-trip',
  'Camping Trip':      'camping-trip',
  'Tropical':          'tropical',
  'Just Because':      'just-because',
};

export function chassisThemeIdFromTemplate(templateName: string | null | undefined): ThemeId {
  if (!templateName) return 'just-because';
  return MAP[templateName] ?? 'just-because';
}
