import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type RsvpStatus = 'in' | 'maybe' | 'out';

const RSVP_LABELS: Record<RsvpStatus, string> = {
  in: 'Going',
  maybe: 'Maybe',
  out: "Can't make it",
};

export async function POST(request: NextRequest) {
  try {
    const adminClient = getAdminClient();
    const { tripId, email, phone, name, status } = (await request.json()) as {
      tripId: string;
      email?: string;
      phone?: string;
      name?: string;
      status: RsvpStatus;
    };

    if (!tripId || !status || (!email && !phone)) {
      return NextResponse.json(
        { error: 'tripId, status, and email or phone required' },
        { status: 400 }
      );
    }

    if (!['in', 'maybe', 'out'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify trip exists
    const { data: trip } = await adminClient
      .from('trips')
      .select('id, rsvp_emojis')
      .eq('id', tripId)
      .single();
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    // Find or create user
    let userId: string;
    let displayName: string;

    if (phone) {
      const { data: existing } = await adminClient
        .from('users')
        .select('id, display_name')
        .eq('phone', phone)
        .maybeSingle();

      if (existing) {
        userId = existing.id;
        displayName = existing.display_name;
        if (name && name.trim() && existing.display_name !== name.trim()) {
          await adminClient.from('users').update({ display_name: name.trim() }).eq('id', userId);
          displayName = name.trim();
        }
      } else {
        const { data: created, error: createErr } = await adminClient
          .from('users')
          .insert({
            phone,
            email: email || null,
            display_name: name?.trim() || phone,
          })
          .select('id, display_name')
          .single();
        if (createErr) throw createErr;
        userId = created.id;
        displayName = created.display_name;
      }
    } else {
      const placeholderPhone = `email:${email}`;
      const { data: existing } = await adminClient
        .from('users')
        .select('id, display_name')
        .eq('phone', placeholderPhone)
        .maybeSingle();

      if (existing) {
        userId = existing.id;
        displayName = existing.display_name;
        if (name && name.trim() && existing.display_name !== name.trim()) {
          await adminClient.from('users').update({ display_name: name.trim() }).eq('id', userId);
          displayName = name.trim();
        }
      } else {
        const { data: created, error: createErr } = await adminClient
          .from('users')
          .insert({
            phone: placeholderPhone,
            email,
            display_name: name?.trim() || email!,
          })
          .select('id, display_name')
          .single();
        if (createErr) throw createErr;
        userId = created.id;
        displayName = created.display_name;
      }
    }

    // Upsert trip_member
    const { data: existingMember } = await adminClient
      .from('trip_members')
      .select('id, rsvp')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .maybeSingle();

    let memberId: string;
    const isStatusChange = !existingMember || existingMember.rsvp !== status;

    if (existingMember) {
      const { error: updateErr } = await adminClient
        .from('trip_members')
        .update({ rsvp: status })
        .eq('id', existingMember.id);
      if (updateErr) throw updateErr;
      memberId = existingMember.id;
    } else {
      const { data: created, error: createErr } = await adminClient
        .from('trip_members')
        .insert({
          trip_id: tripId,
          user_id: userId,
          role: 'guest',
          rsvp: status,
        })
        .select('id')
        .single();
      if (createErr) throw createErr;
      memberId = created.id;
    }

    // Log activity feed entry (only if status actually changed)
    if (isStatusChange) {
      const emojis = (trip.rsvp_emojis as { going: string; maybe: string; cant: string } | null) || {
        going: '🙌',
        maybe: '🤔',
        cant: '😢',
      };
      const emoji = status === 'in' ? emojis.going : status === 'maybe' ? emojis.maybe : emojis.cant;
      const text = `rsvped ${RSVP_LABELS[status]} ${emoji}`;

      await adminClient.from('comments').insert({
        trip_id: tripId,
        user_id: userId,
        text,
        type: 'rsvp',
        reactions: [],
      });
    }

    return NextResponse.json({
      success: true,
      memberId,
      userId,
      displayName,
    });
  } catch (err: unknown) {
    console.error('RSVP error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to RSVP' },
      { status: 500 }
    );
  }
}
