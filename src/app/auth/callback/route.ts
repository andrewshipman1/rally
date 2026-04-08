// GET /auth/callback?code=...
//
// Magic-link verification endpoint. Routes through the AuthProvider
// interface so the backend can swap. Returns redirects:
//   ok + new user → /auth/setup (profile collection per §5.15)
//   ok + existing → / (dashboard)  OR  /trip/<slug> if a trip param was preserved
//   expired       → /auth/expired
//   invalid       → /auth/invalid
//
// Backend choice still TODO(prd):auth-backend-confirm; this layer is
// provider-agnostic.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authProvider } from '@/lib/auth/supabase-provider';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tripSlug = searchParams.get('trip');

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
  if (result.isNewUser) {
    const setupUrl = new URL(`${origin}/auth/setup`);
    if (tripSlug) setupUrl.searchParams.set('trip', tripSlug);
    return NextResponse.redirect(setupUrl);
  }

  // Returning user: trip slug overrides dashboard if present.
  return NextResponse.redirect(
    tripSlug ? `${origin}/trip/${encodeURIComponent(tripSlug)}` : `${origin}/`
  );
}
