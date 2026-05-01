// 10C — Invite token resolver. Maps `/i/<invite_token>` → trip context.
// Strategy doc §Dimension 2 locked the four-branch behavior:
//   - Token not found / row deleted → /auth/invalid
//   - Signed in + identity matches the token → /trip/<slug>
//   - Signed in + identity mismatch        → /trip/<slug> (normal viewer)
//   - Not signed in → render the existing partial InviteeShell here so
//     the `/i/<token>` URL is preserved (10D's in-place auth listener +
//     unblur reveal architecture attaches to that stable route).
//
// 10D additions:
//   - Pull `users.email` for the resolved member so the InviteeShell
//     teaser can hand it to InviteeStickyBar without a second round-trip.
//   - Pass `inviteToken` (URL param) through.
//   - Drop `goingMembers` + `inCount` — the going row was removed from
//     the teaser per Andrew's Call 4 lock.
//
// 10D-followup (same-tab reveal):
//   - Detect `?code=...` on the URL (from a same-tab magic-link click)
//     and trampoline through /auth/callback so the PKCE exchange runs
//     in a route handler that can actually persist auth cookies. Next
//     16 Server Components are read-only for cookies.
//   - Detect `?just_authed=1` on a returning request (post-callback)
//     and render InviteeShellClient with `freshAuth=true` so the
//     unblur animation plays in-place before router.replace catches
//     the URL up to /trip/<slug>. Without the param, signed-in users
//     keep the existing redirect behavior (so re-tapping the email
//     later doesn't replay the reveal).

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { calculateTripCost } from '@/types';
import { chassisThemeIdFromTemplate } from '@/lib/themes/from-db';
import type { ThemeId } from '@/lib/themes/types';
import { InviteeShell } from '@/components/trip/InviteeShell';
import { getTrip } from '../../trip/[slug]/_data';

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function InviteResolver({ params, searchParams }: Props) {
  const { token } = await params;
  const sp = await searchParams;
  const code = typeof sp.code === 'string' ? sp.code : null;
  const justAuthed = sp.just_authed === '1';

  // Admin client for the cross-user trip_members lookup. The token
  // itself IS the access credential here; no auth gate yet because
  // unauthenticated invitees clicking their email link are the
  // primary use case.
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: member } = await adminClient
    .from('trip_members')
    .select('user_id, trip:trips(share_slug), user:users(email)')
    .eq('invite_token', token)
    .maybeSingle();

  // Supabase types joined relations as arrays even on 1-to-1 FKs; cast
  // through unknown to the actual single-row shape.
  const trip = member?.trip as unknown as { share_slug: string } | null | undefined;
  const memberUser = member?.user as unknown as { email: string | null } | null | undefined;
  if (!member || !trip?.share_slug) {
    redirect('/auth/invalid');
  }
  const slug = trip.share_slug;

  // 10D-followup — fresh-magic-link arrival: PKCE code in URL needs to
  // be exchanged before cookies can be set. Server components can't
  // write cookies, so trampoline through /auth/callback (a route
  // handler) and let it redirect back here once the session is live.
  if (code) {
    // Supabase clobbers the existing query when appending ?code=, so
    // ?just_authed=1 is gone by the time we get here. The presence of
    // ?code= definitionally means a same-tab magic-link click, so the
    // post-callback landing is always the in-place reveal.
    const nextPath = `/i/${token}?just_authed=1`;
    redirect(
      `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(nextPath)}`,
    );
  }

  // Auth check via the user-session client.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 10D-followup — freshAuth: just came back from the callback
  // trampoline with `?just_authed=1` and an authed session. Render the
  // shell with the reveal animation; don't redirect. Without the flag,
  // an already-signed-in viewer (re-tap later, or any direct visit)
  // keeps the legacy redirect to /trip/<slug>.
  const freshAuth = !!user && justAuthed;

  if (user && !freshAuth) {
    // Match OR mismatch — both branches resolve to /trip/<slug> per
    // strategy doc. The token is an invite-delivery tracker, not a
    // security primitive; the trip page already enforces its own
    // viewer semantics.
    redirect(`/trip/${slug}`);
  }

  // Phone-only orphans don't have email and shouldn't reach the teaser
  // (10C's fan-out filters them upstream). Defensive: if we got here
  // without an email, bounce to /auth/invalid since signup can't proceed.
  const inviteeEmail = memberUser?.email ?? null;
  if (!inviteeEmail) {
    redirect('/auth/invalid');
  }

  // Render InviteeShell — either standard teaser (not signed in) or
  // the in-place reveal variant (`freshAuth`). Mirror the prop
  // derivation from /trip/[slug]/page.tsx so the unauthed render is
  // identical to the slug-route's unauthed branch.
  const tripData = await getTrip(slug);
  if (!tripData) redirect('/auth/invalid');

  const themeId =
    (tripData.chassis_theme_id as ThemeId) ||
    chassisThemeIdFromTemplate(tripData.theme?.template_name);
  const cost = calculateTripCost(tripData);

  return (
    <div className="chassis" data-theme={themeId}>
      <InviteeShell
        themeId={themeId}
        slug={slug}
        trip={tripData}
        cost={cost}
        inviteeEmail={inviteeEmail}
        inviteToken={token}
        freshAuth={freshAuth}
      />
    </div>
  );
}
