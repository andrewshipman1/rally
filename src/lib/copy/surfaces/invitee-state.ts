// §5.17 — Invitee state (pre-login).
//
// Login gate, not RSVP gate. Every string pulls dual duty: convert the
// viewer into a user AND communicate social obligation. The plan section
// is blurred/locked until the magic-link flow completes.
//
// 10D revision: removed `secondaryCta` + `cantMakeItConfirm*` (the
// "can't make it" confirm modal was rejected — signup is the gate for
// ALL RSVP states). Removed `goingLabel` + `emptyAvatarLabel` (the
// going row was removed from the teaser per Andrew's Call 4 lock).
// Added the `inviteeStickyBar.*` keys for the post-tap status pill +
// resend cooldown + error retry, plus `lockedOverlayMessageSent` for
// the post-tap overlay copy swap.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const inviteeState: Record<string, Templated> = {
  // ─── Header ─────────────────────────────────────────────────────
  'inviterRow':           ({ inviter_first }: ThemeVars) => `${inviter_first ?? 'someone'} called you up`,
  'sticker':              "you're invited 💌",
  'eyebrow':              ({ trip_name }: ThemeVars) => `★ for ${trip_name ?? 'this trip'}`,

  // ─── Locked plan section ────────────────────────────────────────
  'lockedSectionHeader':  'the plan',
  'lockedSectionPill':    '🔒 locked',
  'lockedOverlayMessage': 'sign in to see the plan ↑',
  'lockedOverlayMessageSent': 'check your email ✉',

  // ─── CTAs ───────────────────────────────────────────────────────
  'primaryCta':           'see the plan →',

  // ─── Sticky bar (10D post-tap states) ───────────────────────────
  'inviteeStickyBar.linkSentTo':     ({ email }: ThemeVars) => `✓ link sent to ${email ?? 'your inbox'}`,
  'inviteeStickyBar.resendLink':     "didn't get it? send another",
  'inviteeStickyBar.resendCooldown': ({ seconds }: ThemeVars) => `${seconds ?? 0}s`,
  'inviteeStickyBar.sendError':      "couldn't send · try again",

  // ─── Share link ─────────────────────────────────────────────────
  'shareLinkCopyAction':  'copy the invite link ↗',

  // ─── Footer ─────────────────────────────────────────────────────
  'footer':               'made with rally!',
};
