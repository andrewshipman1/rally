// §5.24 — Auth / magic link (landing, sent, expired, invalid, email copy).
// Provider-agnostic strings; chassis side. Implements the four states from
// rally-phase-11-auth.html. Backend provider is locked behind AuthProvider
// (src/lib/auth/provider.ts) — see TODO(prd):auth-backend-confirm.

import type { Templated, ThemeVars } from '@/lib/themes/types';

export const auth: Record<string, Templated> = {
  // ─── Landing state ─────────────────────────────────────────────
  'landing.h1':              'rally!',
  'landing.sub':             'the group trip planner for people who actually go',
  'landing.emailPlaceholder':'your email',
  'landing.sendButton':      'send me a link',
  'landing.loading':         'sending…',

  // ─── Sent state ────────────────────────────────────────────────
  'sent.h1':                 'check your email',
  'sent.sub':                ({ email }: ThemeVars) => `we sent a link to ${email ?? 'you'}. tap it to let yourself in.`,
  'sent.resend':             "didn't get it? send another",
  'sent.cooldown':           ({ n }: ThemeVars) => `hang on — ${n ?? 30}s`,
  'sent.toast':              'sent again.',

  // ─── Errors ────────────────────────────────────────────────────
  'errors.invalidEmail':     "that doesn't look like an email.",
  'errors.rateLimited':      'too many tries. wait a minute.',
  'errors.sendFailed':       "we couldn't send the link. try again?",

  // ─── Expired link state ────────────────────────────────────────
  'expired.sticker':         'oops ⏱',
  'expired.h1':              "link's expired",
  'expired.sub':             'they only last 15 minutes. send a fresh one.',
  'expired.cta':             'send a new one',

  // ─── Invalid link state ────────────────────────────────────────
  'invalid.sticker':         'huh 🤔',
  'invalid.h1':              "that link didn't work",
  'invalid.sub':             "the link's broken or already used. grab a new one.",
  'invalid.cta':             'send a new one',

  // ─── Sent state visual ─────────────────────────────────────────
  'sent.icon':               '📬',

  // ─── Sign out ──────────────────────────────────────────────────
  'signOut.confirm':         'sign out of rally?',
  'signOut.toast':           'signed out.',
};
