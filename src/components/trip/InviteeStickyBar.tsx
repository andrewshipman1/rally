'use client';

// Phase 5 — invitee sticky bar (10D rewrite + 10D-followup). Single
// primary CTA + post-tap status pill + 30s resend cooldown + error
// retry. Confirm modal + "can't make it" path removed: signup is the
// gate for ALL RSVP states.
//
// Magic-link issuing reuses /api/auth/magic-link (the same endpoint
// AuthSurface posts to). For the same-tab reveal flow we override the
// emailRedirectTo to land back on /i/<token>?just_authed=1 — the
// resolver trampolines through /auth/callback for the PKCE exchange,
// then renders InviteeShellClient with freshAuth=true so the unblur
// animation plays in-place before router.replace catches the URL up.
// AuthSurface continues to call this endpoint without `redirectTo`,
// inheriting the legacy /auth/callback?trip=<slug> behavior.

import { useEffect, useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type State = 'idle' | 'sending' | 'sent' | 'error';
type Props = {
  themeId: ThemeId;
  slug: string;
  inviteeEmail: string;
  /** Used to build the magic-link redirect URL for the same-tab reveal flow. */
  inviteToken: string;
  /** Bubbles to InviteeShellClient so the locked-overlay copy can swap to the sent state. */
  onLinkSent: () => void;
};

const COOLDOWN_S = 30;

function maskEmail(email: string): string {
  // j**@example.com — first char + "**" + everything from "@" onward.
  return email.replace(/^(.).*(@.+)$/, '$1**$2');
}

export function InviteeStickyBar({
  themeId,
  slug,
  inviteeEmail,
  inviteToken,
  onLinkSent,
}: Props) {
  const [state, setState] = useState<State>('idle');
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown — same shape as AuthSurface. Hydration-safe:
  // initial state is 0; setInterval only runs once cooldown is seeded.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const send = async () => {
    setState('sending');
    try {
      // Same-tab reveal: redirect back to /i/<token>?just_authed=1
      // after the magic-link round-trip so the resolver renders
      // InviteeShellClient with freshAuth=true. Cross-tab path is
      // unaffected — the original tab still listens for SIGNED_IN.
      const redirectTo = `${window.location.origin}/i/${inviteToken}?just_authed=1`;
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: inviteeEmail, trip: slug, redirectTo }),
      });
      if (res.status === 429) {
        // Rate-limited — still show the sent state, seed the cooldown
        // from the server-reported retry window.
        const body = (await res.json().catch(() => ({}))) as { retryInMs?: number };
        setCooldown(Math.ceil((body.retryInMs ?? COOLDOWN_S * 1000) / 1000));
        setState('sent');
        onLinkSent();
        return;
      }
      if (!res.ok) {
        setState('error');
        return;
      }
      setState('sent');
      setCooldown(COOLDOWN_S);
      onLinkSent();
    } catch {
      setState('error');
    }
  };

  if (state === 'idle' || state === 'sending') {
    return (
      <div className="sticky">
        <button
          type="button"
          className="see-plan"
          disabled={state === 'sending'}
          onClick={() => void send()}
        >
          {getCopy(themeId, 'inviteeState.primaryCta')}
        </button>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="sticky">
        <button
          type="button"
          className="sticky-sent sticky-error"
          onClick={() => void send()}
        >
          {getCopy(themeId, 'inviteeState.inviteeStickyBar.sendError')}
        </button>
      </div>
    );
  }

  // state === 'sent'
  return (
    <div className="sticky">
      <div className="sticky-sent">
        <span className="sticky-sent-check">✓</span>
        <span>
          {getCopy(themeId, 'inviteeState.inviteeStickyBar.linkSentTo', {
            email: maskEmail(inviteeEmail),
          })}
        </span>
      </div>
      <div className="sticky-resend">
        {cooldown > 0 ? (
          <span>
            {getCopy(themeId, 'inviteeState.inviteeStickyBar.resendLink')} ·{' '}
            {getCopy(themeId, 'inviteeState.inviteeStickyBar.resendCooldown', { seconds: cooldown })}
          </span>
        ) : (
          <button type="button" onClick={() => void send()}>
            {getCopy(themeId, 'inviteeState.inviteeStickyBar.resendLink')}
          </button>
        )}
      </div>
    </div>
  );
}
