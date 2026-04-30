// GET /auth/callback?code=...
//
// Magic-link verification endpoint. Routes through the AuthProvider
// interface so the backend can swap. Returns redirects:
//   ok + new user → /auth/setup (profile collection per §5.15)
//   ok + existing → / (dashboard)  OR  /trip/<slug> if a trip param was preserved
//                  OR  the `next` path if one was passed (10D-followup)
//   expired       → /auth/expired
//   invalid       → /auth/invalid
//
// 10D-followup: optional `next` param. The invitee teaser uses this to
// trampoline the PKCE code exchange — magic-link redirectTo points
// back to /i/<token>?just_authed=1, the resolver detects the `?code=`
// and forwards here with `next=/i/<token>?just_authed=1`. Server
// Components can't write cookies (Next 16), so the exchange has to
// happen in this route handler. Existing AuthSurface callers don't
// pass `next` and inherit the legacy `trip`-based redirect unchanged.
//
// Backend choice still TODO(prd):auth-backend-confirm; this layer is
// provider-agnostic.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authProvider } from '@/lib/auth/supabase-provider';

/**
 * Same-origin path guard. Accepts only relative paths starting with a
 * single `/` so an attacker can't pass `//evil.com/...` (protocol-
 * relative URL) or a fully-qualified URL to another host.
 */
function isSafeNextPath(value: string | null): value is string {
  if (!value) return false;
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//')) return false;
  return true;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tripSlug = searchParams.get('trip');
  const nextPath = searchParams.get('next');

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/invalid`);
  }

  const result = await authProvider.verifyMagicLink(code);
  if (!result.ok) {
    return NextResponse.redirect(
      `${origin}/auth/${result.reason === 'expired' ? 'expired' : 'invalid'}`
    );
  }

  // First-time user: collect display name + profile bits.
  // 10D-followup limitation: ProfileSetup hardcodes its post-save
  // redirect to `/`, so first-time invitees skip the same-tab reveal.
  // Existing-user invitees (orphan-merged earlier) hit the `next`
  // branch below and get the in-place animation.
  if (result.isNewUser) {
    const setupUrl = new URL(`${origin}/auth/setup`);
    if (tripSlug) setupUrl.searchParams.set('trip', tripSlug);
    return NextResponse.redirect(setupUrl);
  }

  // 10D-followup: explicit `next` overrides the trip-based default.
  // Path-only + same-origin per isSafeNextPath; rejects malformed
  // input by silently falling through to the legacy default.
  if (isSafeNextPath(nextPath)) {
    return NextResponse.redirect(`${origin}${nextPath}`);
  }

  // Returning user: trip slug overrides dashboard if present.
  return NextResponse.redirect(
    tripSlug ? `${origin}/trip/${encodeURIComponent(tripSlug)}` : `${origin}/`
  );
}
