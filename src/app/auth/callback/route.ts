// GET /auth/callback?code=...
//
// Magic-link verification endpoint. Routes through the AuthProvider
// interface so the backend can swap. Returns redirects:
//   ok            → `next` (if same-origin path) → /trip/<slug> (if `trip`) → /
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
// 10H: ProfileSetup gate retired; orphan-merge + ensure-row upsert
// added here. Regression: auth.uid() wasn't reliably available in this
// route handler immediately post-PKCE-exchange, so RLS silently denied
// the upsert. See 10H Actuals + 10I brief.
//
// 10I: identity creation moved to a DB trigger on auth.users INSERT
// (Migration 024 — public.handle_new_user → public.handle_new_user_for).
// This route is now pure routing: PKCE exchange → redirect logic. No DB
// writes, no auth.uid() race, no SDK calls beyond verifyMagicLink.
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

  // Same redirect rules for new and returning users. The DB trigger
  // (Migration 024) has already populated public.users + consolidated
  // any matching orphan inside the auth signup transaction.
  if (isSafeNextPath(nextPath)) {
    return NextResponse.redirect(`${origin}${nextPath}`);
  }

  return NextResponse.redirect(
    tripSlug ? `${origin}/trip/${encodeURIComponent(tripSlug)}` : `${origin}/`
  );
}
