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
// 10H: server-side orphan-merge + ensure-row upsert run on every
// successful PKCE exchange. ProfileSetup form gate retired — profile
// data capture is now lazy via /passport (post-RSVP nudge in
// CrewSection drives discovery). New and returning users share the
// same redirect logic.
//
// Backend choice still TODO(prd):auth-backend-confirm; this layer is
// provider-agnostic.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authProvider } from '@/lib/auth/supabase-provider';
import { createClient } from '@/lib/supabase/server';
import { mergeOrphan } from '@/lib/auth/merge-orphan';

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

  // 10H — server-side data wiring. Two ops in sequence:
  //
  //   (a) mergeOrphan: if an invitee orphan row matches the auth user's
  //       email, migrate every FK onto auth.users.id and create the
  //       canonical public.users row (Migration 023). Fast no-op when no
  //       orphan exists (organizer signups, returning users).
  //
  //   (b) ensure-row upsert with `ignoreDuplicates: true`: belt-and-braces
  //       guarantee that a public.users row exists post-callback. Maps to
  //       Postgres `INSERT ... ON CONFLICT DO NOTHING`. Critical: this
  //       NEVER overwrites an existing row, so passport-edited
  //       display_names on returning users are preserved across re-auth.
  //       Effectively fires only for organizer-only signups (no orphan,
  //       no prior row).
  //
  // Phone gets a deterministic per-id placeholder to satisfy the
  // NOT NULL UNIQUE constraint on public.users.phone (mirrors the
  // 'merge-tmp:<id>' pattern in Migration 023's placeholder row).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await mergeOrphan(supabase);
    } catch (err) {
      // RPC errors (RLS, network, schema drift) shouldn't block sign-in.
      // The defensive upsert below still creates a row if needed.
      console.error('[10H mergeOrphan] failed, continuing:', err);
    }

    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: user.id,
        phone: `auth-tmp:${user.id}`,
        email: user.email ?? null,
        display_name: user.email?.split('@')[0] ?? '?',
      },
      { onConflict: 'id', ignoreDuplicates: true },
    );
    if (upsertError) {
      console.error('[10H ensure-row upsert] failed:', upsertError.message);
    }
  }

  // Same redirect rules for new and returning users. 10H dropped the
  // /auth/setup branch — there's no profile gate anymore.
  if (isSafeNextPath(nextPath)) {
    return NextResponse.redirect(`${origin}${nextPath}`);
  }

  return NextResponse.redirect(
    tripSlug ? `${origin}/trip/${encodeURIComponent(tripSlug)}` : `${origin}/`
  );
}
