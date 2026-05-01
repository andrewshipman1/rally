'use server';

// Server action to transition a trip from sketch → sell phase.
// Called by the "send it" CTA in BuilderStickyBar. Gates: the
// caller must be the organizer, the trip must be in sketch, and
// name >= 3 chars + at least one date must be set.
//
// 10C — after the phase flip succeeds, fans invite emails out to
// every trip_members row that has an email AND has not been emailed
// yet (`invite_sent_at IS NULL`). Best-effort: per-invitee failures
// log but do NOT fail the transition, and `invite_sent_at` is only
// set on a successful send so failures auto-retry on a future
// publish event. Phone-only invitees (email IS NULL) are skipped
// silently per strategy doc §Dimension 2 v1 punt.

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';
import { sendInviteEmail } from '@/lib/email';
import { chassisThemeIdFromTemplate } from '@/lib/themes/from-db';
import type { ThemeId } from '@/lib/themes/types';

type Result = { ok: true } | { ok: false; error: string };

// Service-role client for the cross-user trip_members enumeration +
// invite_sent_at update. The organizer is already authenticated above
// the call site (line 22), so admin-client use here is a deliberate
// scope-narrowing for the fan-out only.
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function transitionToSell(
  tripId: string,
  slug: string,
): Promise<Result> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select(
      'organizer_id, phase, name, tagline, destination, date_start, date_end, cover_image_url, share_slug, chassis_theme_id, theme:themes(template_name)',
    )
    .eq('id', tripId)
    .single();
  if (fetchError || !trip) return { ok: false, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not-organizer' };
  if (trip.phase !== 'sketch') return { ok: false, error: 'not-sketch-phase' };

  // Gate: name >= 3 chars + at least one date
  if (!trip.name || trip.name.trim().length < 3) {
    return { ok: false, error: 'name-too-short' };
  }
  if (!trip.date_start) {
    return { ok: false, error: 'no-date' };
  }

  const { error: updateError } = await supabase
    .from('trips')
    .update({ phase: 'sell' })
    .eq('id', tripId)
    .eq('phase', 'sketch');
  if (updateError) return { ok: false, error: updateError.message };

  // ─── Publish-time invite fan-out (10C) ───────────────────────────
  // The phase flip itself is the unit of success. Email sends are
  // best-effort; failures here do NOT fail the action.
  const adminClient = getAdminClient();

  const { data: members, error: membersError } = await adminClient
    .from('trip_members')
    .select('id, invite_token, user:users(email, display_name)')
    .eq('trip_id', tripId)
    .is('invite_sent_at', null);

  if (membersError) {
    console.error('[10C fan-out] member enumerate failed', membersError.message);
  } else if (members && members.length > 0) {
    const { data: organizer } = await adminClient
      .from('users')
      .select('display_name')
      .eq('id', user.id)
      .single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const dateStr =
      trip.date_start && trip.date_end
        ? `${format(new Date(trip.date_start), 'MMM d')}–${format(new Date(trip.date_end), 'd, yyyy')}`
        : null;
    const tripTheme = trip.theme as unknown as { template_name: string | null } | null | undefined;
    const themeId: ThemeId =
      (trip.chassis_theme_id as ThemeId) ||
      chassisThemeIdFromTemplate(tripTheme?.template_name);
    const daysOut = trip.date_start
      ? Math.max(
          0,
          Math.ceil((new Date(trip.date_start).getTime() - Date.now()) / 86_400_000),
        )
      : null;

    for (const m of members) {
      // Supabase's typed-join infers `user` as an array even on 1-to-1
      // FKs, so cast through unknown to the actual single-row shape.
      const memberUser = m.user as unknown as
        | { email: string | null; display_name: string | null }
        | null;
      if (!memberUser?.email) {
        console.log('[10C fan-out] skip phone-only', m.id);
        continue;
      }

      const result = await sendInviteEmail({
        to: memberUser.email,
        recipientName: memberUser.display_name ?? null,
        organizerName: organizer?.display_name || 'Your friend',
        tripName: trip.name,
        tripTagline: trip.tagline,
        destination: trip.destination,
        dateStr,
        coverImageUrl: trip.cover_image_url,
        shareUrl: `${appUrl}/i/${m.invite_token}`,
        themeId,
        daysOut,
      });

      if (result.ok) {
        const { error: stampError } = await adminClient
          .from('trip_members')
          .update({ invite_sent_at: new Date().toISOString() })
          .eq('id', m.id);
        if (stampError) {
          console.error('[10C fan-out] invite_sent_at stamp failed', m.id, stampError.message);
        }
      } else {
        console.error('[10C fan-out] email failed', m.id, result.error);
      }
    }
  }

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}
