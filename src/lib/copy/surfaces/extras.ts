// §5.21 — Extras (drawer: packing, playlist, house rules, shared album).
// Read-only on the trip page in Session 1; full drawer UX lands Session 3.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const extras: Record<string, Templated> = {
  'drawer.title':          'the extras',
  'drawer.subtitle':       'the small stuff that makes it',

  'add.empty':             'add something',
  'add.populated':         '+ one more',

  'chooser.title':         'pick one to add',
  'chooser.packing':       'packing list · what to bring',
  'chooser.playlist':      'playlist · the soundtrack',
  'chooser.rules':         'house rules · the vibe',
  'chooser.album':         'shared album · link to photos',

  // Packing list
  'packing.empty':         "nothing on the list yet. what can't anyone forget?",
  'packing.placeholder':   'what to bring...',
  'packing.checked':       'got it',

  // Playlist
  'playlist.title':        'the soundtrack',
  'playlist.empty':        'drop a spotify or apple music link',
  'playlist.openCta':      'open in spotify →',
  'playlist.meta':         ({ n, name }: ThemeVars) => `${n ?? 0} tracks · by ${name ?? '?'}`,

  // House rules
  'rules.title':           'the vibe',
  'rules.empty':           'any ground rules? (quiet hours, cleanup, etc.)',
  'rules.bulletPrefix':    '·',

  // Shared album
  'album.title':           'the album',
  'album.empty':           'paste an apple or google photos link',
  'album.openCta':         'open the album ↗',
  'album.meta':            ({ name, n }: ThemeVars) => `${name ?? '?'} · ${n ?? 0} photos so far`,

  'drawer.empty':          'nothing here yet. add the first thing.',

  'menu.edit':             'edit',
  'menu.remove':           'remove',

  'toast.added':           ({ extra_type }: ThemeVars) => `added ${extra_type ?? 'extra'} to extras`,

  // Section heading labels (used by ExtrasSections)
  'packing.label':         'packing list',
  'playlist.label':        'trip playlist',
  'rules.label':           'house rules',
  'album.label':           'shared photo album',
  'album.openCta.short':   'open in browser',
  'playlist.openCta.short': 'open playlist',
};
