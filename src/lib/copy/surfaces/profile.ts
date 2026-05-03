// §5.27 — Profile inline-editing surface.
import type { Templated } from '@/lib/themes/types';

export const profile: Record<string, Templated> = {
  // ─── Details card ───────────────────────────────────────────────
  'infoTitle':          'your info',

  // ─── Field labels ───────────────────────────────────────────────
  'labelName':          'name',
  'labelBio':           'bio',
  'labelEmail':         'email',
  'labelPhone':         'phone',
  'labelInsta':         'insta',
  'labelTiktok':        'tiktok',
  'labelCity':          'based in',

  // ─── Placeholders ──────────────────────────────────────────────
  'placeholderName':    'your name',
  'placeholderBio':     'tagline, vibe, whatever',
  'placeholderHandle':  'handle without @',
  'placeholderEmail':   'your email',
  'placeholderPhone':   'your number',
  'placeholderCity':    'your city',

  // ─── Save feedback ─────────────────────────────────────────────
  'saveSuccess':        '✓ saved',
  'saveFailed':         '✗ retry',

  // ─── Photo upload ──────────────────────────────────────────────
  'photoFailed':        'upload failed — tap to retry',

  // ─── Navigation ────────────────────────────────────────────────
  /** @deprecated 11 — replaced by <AppHeader> wordmark home-link */
  'backLink':           '← my trips',
};
