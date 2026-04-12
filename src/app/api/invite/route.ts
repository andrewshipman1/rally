import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { sendInviteEmail } from '@/lib/email';
import { format } from 'date-fns';

// Service-role client for admin operations (creating invitee users without auth)
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = getAdminClient();
    const { tripId, email, phone, name } = await request.json();

    if (!tripId || (!email && !phone)) {
      return NextResponse.json({ error: 'tripId and email or phone required' }, { status: 400 });
    }

    // Verify the requesting user is the organizer
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: trip } = await supabase
      .from('trips')
      .select('organizer_id, phase, name, tagline, destination, date_start, date_end, cover_image_url, share_slug')
      .eq('id', tripId)
      .single();

    if (!trip || trip.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch organizer display name for the email
    const { data: organizer } = await adminClient
      .from('users')
      .select('display_name')
      .eq('id', user.id)
      .single();

    // Find or create the invitee user
    let inviteeId: string;

    if (phone) {
      // Look up by phone
      const { data: existing } = await adminClient
        .from('users')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (existing) {
        inviteeId = existing.id;
      } else {
        const { data: created, error: createErr } = await adminClient
          .from('users')
          .insert({
            phone,
            email: email || null,
            display_name: name || phone,
          })
          .select('id')
          .single();
        if (createErr) throw createErr;
        inviteeId = created.id;
      }
    } else {
      // Email-only invitee — use placeholder phone (email as the unique key)
      const placeholderPhone = `email:${email}`;
      const { data: existing } = await adminClient
        .from('users')
        .select('id')
        .eq('phone', placeholderPhone)
        .maybeSingle();

      if (existing) {
        inviteeId = existing.id;
      } else {
        const { data: created, error: createErr } = await adminClient
          .from('users')
          .insert({
            phone: placeholderPhone,
            email,
            display_name: name || email,
          })
          .select('id')
          .single();
        if (createErr) throw createErr;
        inviteeId = created.id;
      }
    }

    // Create trip_member row (or fetch existing)
    const { data: existingMember } = await adminClient
      .from('trip_members')
      .select('id, rsvp')
      .eq('trip_id', tripId)
      .eq('user_id', inviteeId)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json({ alreadyInvited: true, memberId: existingMember.id });
    }

    const { data: member, error: memberErr } = await adminClient
      .from('trip_members')
      .insert({
        trip_id: tripId,
        user_id: inviteeId,
        role: 'guest',
        rsvp: 'pending',
      })
      .select('*, user:users(*)')
      .single();

    if (memberErr) throw memberErr;

    // Send invite email (best-effort — don't fail the request if email fails).
    // In sketch phase, skip email — invites queue until the trip publishes to sell.
    let emailResult: { ok: boolean; error?: string } = { ok: false, error: 'no email' };
    if (email && trip.phase !== 'sketch') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const dateStr =
        trip.date_start && trip.date_end
          ? `${format(new Date(trip.date_start), 'MMM d')}–${format(new Date(trip.date_end), 'd, yyyy')}`
          : null;
      emailResult = await sendInviteEmail({
        to: email,
        recipientName: name || null,
        organizerName: organizer?.display_name || 'Your friend',
        tripName: trip.name,
        tripTagline: trip.tagline,
        destination: trip.destination,
        dateStr,
        coverImageUrl: trip.cover_image_url,
        shareUrl: `${appUrl}/trip/${trip.share_slug}`,
      });
      if (!emailResult.ok) {
        console.error('Invite email failed:', emailResult.error);
      }
    }

    return NextResponse.json({ success: true, member, emailSent: emailResult.ok, emailError: emailResult.error });
  } catch (err: unknown) {
    console.error('Invite error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to invite' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminClient = getAdminClient();
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify organizer owns this trip
    const { data: member } = await supabase
      .from('trip_members')
      .select('trip_id, trips(organizer_id)')
      .eq('id', memberId)
      .single();

    const memberData = member as { trip_id: string; trips: { organizer_id: string } } | null;
    if (!memberData || memberData.trips?.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await adminClient.from('trip_members').delete().eq('id', memberId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to remove' },
      { status: 500 }
    );
  }
}
