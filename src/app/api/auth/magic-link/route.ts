// POST /api/auth/magic-link
//
// Phase 11 magic-link issue endpoint. Routes through the AuthProvider
// interface so the backend can swap once TODO(prd):auth-backend-confirm
// resolves. Enforces the 30s cooldown + 5/hr rate limit upstream of the
// provider so every backend honors the same constraints.
//
// 10D-followup: accepts an optional `redirectTo` to override the
// default `${origin}/auth/callback?trip=<slug>` redirect URL. Used by
// the invitee teaser (InviteeStickyBar) to land magic-link clicks back
// at /i/<token>?just_authed=1 for the same-tab in-place reveal flow.
// AuthSurface (organizer signup) continues to omit `redirectTo` and
// inherits the legacy callback construction unchanged.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authProvider } from '@/lib/auth/supabase-provider';
import { checkMagicLinkRate, recordMagicLinkSend } from '@/lib/auth/rate-limit';

const schema = z.object({
  email: z.string().email().max(254),
  /** Optional invite trip slug — preserved through the magic link redirect. */
  trip: z.string().max(120).optional(),
  /** Optional override for the magic-link redirect URL. Must be same-origin. */
  redirectTo: z.string().url().max(500).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  const { email, trip, redirectTo: redirectToOverride } = parsed.data;

  // Rate limit BEFORE hitting the provider so we don't accidentally
  // burn through Supabase's own ceiling.
  const rate = await checkMagicLinkRate(email);
  if (!rate.ok) {
    return NextResponse.json(
      { error: rate.reason, retryInMs: rate.retryInMs },
      { status: 429 }
    );
  }

  const origin = new URL(req.url).origin;

  // Same-origin guard on the override — prevents a malicious caller
  // from coercing magic-link redirects to an attacker-controlled host.
  let redirectTo: string;
  if (redirectToOverride) {
    let provided: URL;
    try {
      provided = new URL(redirectToOverride);
    } catch {
      return NextResponse.json({ error: 'invalid_redirect' }, { status: 400 });
    }
    if (provided.origin !== origin) {
      return NextResponse.json({ error: 'invalid_redirect' }, { status: 400 });
    }
    redirectTo = redirectToOverride;
  } else {
    redirectTo = `${origin}/auth/callback${trip ? `?trip=${encodeURIComponent(trip)}` : ''}`;
  }

  const result = await authProvider.sendMagicLink(email, redirectTo);
  if (!result.ok) {
    const status = result.reason === 'invalid_email' ? 400 : 502;
    return NextResponse.json({ error: result.reason }, { status });
  }

  await recordMagicLinkSend(email);
  return NextResponse.json({ ok: true });
}
