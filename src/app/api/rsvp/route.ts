import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { stripHtml } from '@/lib/sanitize';
import { getGuestUserId, setGuestCookie } from '@/lib/guest-auth';
import { track } from '@/lib/analytics';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const RSVP_LABELS = {
  in: 'Going',
  maybe: 'Maybe',
  out: "Can't make it",
} as const;

const rsvpSchema = z
  .object({
    tripId: z.string().uuid(),
    name: z.string().min(1).max(80),
    email: z.string().email().optional(),
    phone: z.string().min(5).max(20).optional(),
    status: z.enum(['in', 'out', 'maybe']),
  })
  .refine((d) => !!d.email || !!d.phone, { message: 'email or phone required' });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { tripId, status } = parsed.data;
  const cleanName = stripHtml(parsed.data.name);
  const email = parsed.data.email?.trim();
  const phone = parsed.data.phone?.trim();

  if (!cleanName) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const adminClient = getAdminClient();

    // Verify trip exists
    const { data: trip } = await adminClient
      .from('trips')
      .select('id, rsvp_emojis')
      .eq('id', tripId)
      .single();
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

    // If guest cookie present, lock identity to that user (cannot impersonate others).
    const existingUserId = await getGuestUserId();
    let userId: string;
    let displayName: string;
    let cookieJustIssued = false;

    if (existingUserId) {
      const { data: existingUser } = await adminClient
        .from('users')
        .select('id, display_name')
        .eq('id', existingUserId)
        .maybeSingle();
      if (!existingUser) {
        return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
      }
      userId = existingUser.id;
      displayName = existingUser.display_name;
    } else if (phone) {
      const { data: existing } = await adminClient
        .from('users')
        .select('id, display_name')
        .eq('phone', phone)
        .maybeSingle();
      if (existing) {
        userId = existing.id;
        displayName = existing.display_name;
        if (existing.display_name !== cleanName) {
          await adminClient.from('users').update({ display_name: cleanName }).eq('id', userId);
          displayName = cleanName;
        }
      } else {
        const { data: created, error: createErr } = await adminClient
          .from('users')
          .insert({ phone, email: email || null, display_name: cleanName })
          .select('id, display_name')
          .single();
        if (createErr) throw createErr;
        userId = created.id;
        displayName = created.display_name;
      }
      cookieJustIssued = true;
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
        if (existing.display_name !== cleanName) {
          await adminClient.from('users').update({ display_name: cleanName }).eq('id', userId);
          displayName = cleanName;
        }
      } else {
        const { data: created, error: createErr } = await adminClient
          .from('users')
          .insert({ phone: placeholderPhone, email, display_name: cleanName })
          .select('id, display_name')
          .single();
        if (createErr) throw createErr;
        userId = created.id;
        displayName = created.display_name;
      }
      cookieJustIssued = true;
    }

    if (cookieJustIssued) {
      await setGuestCookie(userId);
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
        .insert({ trip_id: tripId, user_id: userId, role: 'guest', rsvp: status })
        .select('id')
        .single();
      if (createErr) throw createErr;
      memberId = created.id;
    }

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

    track('rsvp_submitted', { tripId, userId, metadata: { status } });

    return NextResponse.json({ success: true, memberId, userId, displayName });
  } catch (err: unknown) {
    console.error('RSVP error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
