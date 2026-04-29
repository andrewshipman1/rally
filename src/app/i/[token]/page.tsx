// 10C — Invite token resolver. Maps `/i/<invite_token>` → trip context.
// Strategy doc §Dimension 2 locked the four-branch behavior:
//   - Token not found / row deleted → /auth/invalid
//   - Signed in + identity matches the token → /trip/<slug>
//   - Signed in + identity mismatch        → /trip/<slug> (normal viewer)
//   - Not signed in → render the existing partial InviteeShell here so
//     the `/i/<token>` URL is preserved (10D's in-place auth listener +
//     unblur reveal architecture attaches to that stable route).
//
// Render path mirrors the unauthed branch in /trip/[slug]/page.tsx
// (currentUserId === null && phase !== 'sketch' → InviteeShell). Same
// `.chassis` wrapper, same prop derivation. InviteeShell itself is
// rendered as-is — 10D polishes its visual surface, not 10C.

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { calculateTripCost } from '@/types';
import { chassisThemeIdFromTemplate } from '@/lib/themes/from-db';
import type { ThemeId } from '@/lib/themes/types';
import { InviteeShell } from '@/components/trip/InviteeShell';
import { getTrip } from '../../trip/[slug]/_data';

type Props = { params: Promise<{ token: string }> };

export default async function InviteResolver({ params }: Props) {
  const { token } = await params;

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
    .select('user_id, trip:trips(share_slug)')
    .eq('invite_token', token)
    .maybeSingle();

  // Supabase types joined relations as arrays even on 1-to-1 FKs; cast
  // through unknown to the actual single-row shape.
  const trip = member?.trip as unknown as { share_slug: string } | null | undefined;
  if (!member || !trip?.share_slug) {
    redirect('/auth/invalid');
  }
  const slug = trip.share_slug;

  // Auth check via the user-session client.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Match OR mismatch — both branches resolve to /trip/<slug> per
    // strategy doc. The token is an invite-delivery tracker, not a
    // security primitive; the trip page already enforces its own
    // viewer semantics.
    redirect(`/trip/${slug}`);
  }

  // Not signed in — render InviteeShell directly. Mirror the prop
  // derivation from /trip/[slug]/page.tsx so the unauthed render is
  // identical to the slug-route's unauthed branch.
  const tripData = await getTrip(slug);
  if (!tripData) redirect('/auth/invalid');

  const themeId =
    (tripData.chassis_theme_id as ThemeId) ||
    chassisThemeIdFromTemplate(tripData.theme?.template_name);
  const members = tripData.members || [];
  const inCount = members.filter((m) => m.rsvp === 'in').length;
  const goingMembers = members.filter((m) => m.rsvp === 'in');
  const cost = calculateTripCost(tripData);

  return (
    <div className="chassis" data-theme={themeId}>
      <InviteeShell
        themeId={themeId}
        slug={slug}
        trip={tripData}
        goingMembers={goingMembers}
        inCount={inCount}
        cost={cost}
      />
    </div>
  );
}
