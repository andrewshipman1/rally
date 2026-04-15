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

  // Playlist — Session 8Q "the aux" rebuild
  'playlist.title':         'the aux',
  'playlist.captionEmpty':  "who's on?",
  'playlist.captionSaved':  'aux cord secured',
  'playlist.placeholder':   'drop the link · spotify or apple music',
  'playlist.hypeHint':      'real fun starts when the crew piles on',
  'playlist.openHint':      'tap the card to open · add songs from anywhere',
  'playlist.byline':        ({ name, when }: ThemeVars) =>
    `set by ${name ?? 'the crew'} · ${when ?? 'just now'}`,
  'playlist.swap':          'swap it',

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
  'rules.label':           'house rules',
  'album.label':           'shared photo album',
  'album.openCta.short':   'open in browser',

  // ExtrasSections decorative icons
  'collapse.icon':       '\u2304',
  'remove.icon':         '\u2715',
  'add.icon':            '+',
  'album.icon':          '\ud83d\udcf8',
};
