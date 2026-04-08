// §5.17 — Invitee state (pre-login).
//
// Login gate, not RSVP gate. Every string pulls dual duty: convert the
// viewer into a user AND communicate social obligation. The plan section
// is blurred/locked until the magic-link flow completes.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const inviteeState: Record<string, Templated> = {
  // ─── Header ─────────────────────────────────────────────────────
  'inviterRow':           ({ inviter_first }: ThemeVars) => `${inviter_first ?? 'someone'} called you up`,
  'sticker':              "you're invited 💌",
  'eyebrow':              ({ trip_name }: ThemeVars) => `★ for ${trip_name ?? 'this trip'}`,

  // ─── Social proof row ───────────────────────────────────────────
  'goingLabel':           ({ n }: ThemeVars) => `${n ?? '?'} already in (1 seat with your name) 👇`,
  'emptyAvatarLabel':     'you?',

  // ─── Locked plan section ────────────────────────────────────────
  'lockedSectionHeader':  'the plan',
  'lockedSectionPill':    '🔒 locked',
  'lockedOverlayMessage': 'sign in to see the plan ↑',

  // ─── CTAs ───────────────────────────────────────────────────────
  'primaryCta':           'see the plan →',
  'secondaryCta':         "can't make it",
  'cantMakeItConfirm':    ({ inviter_first }: ThemeVars) => `no worries. tell ${inviter_first ?? 'them'} yourself?`,

  // ─── Share link ─────────────────────────────────────────────────
  'shareLinkCopyAction':  'copy the invite link ↗',

  // ─── Footer ─────────────────────────────────────────────────────
  'footer':               'made with rally',
};
