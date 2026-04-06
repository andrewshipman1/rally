import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/comments
 * Body: { tripId, text, email?, phone?, name? }
 * Anonymous-friendly: looks up the user by phone/email (creating if needed)
 * and inserts a comment with type='comment'.
 */
export async function POST(request: NextRequest) {
  try {
    const adminClient = getAdminClient();
    const { tripId, text, email, phone, name } = (await request.json()) as {
      tripId: string;
      text: string;
      email?: string;
      phone?: string;
      name?: string;
    };

    if (!tripId || !text || !text.trim() || (!email && !phone)) {
      return NextResponse.json(
        { error: 'tripId, text, and email or phone required' },
        { status: 400 }
      );
    }

    // Find or create user (mirrors RSVP logic)
    let userId: string;
    if (phone) {
      const { data: existing } = await adminClient
        .from('users')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();
      if (existing) {
        userId = existing.id;
      } else {
        const { data: created, error } = await adminClient
          .from('users')
          .insert({
            phone,
            email: email || null,
            display_name: name?.trim() || phone,
          })
          .select('id')
          .single();
        if (error) throw error;
        userId = created.id;
      }
    } else {
      const placeholderPhone = `email:${email}`;
      const { data: existing } = await adminClient
        .from('users')
        .select('id')
        .eq('phone', placeholderPhone)
        .maybeSingle();
      if (existing) {
        userId = existing.id;
      } else {
        const { data: created, error } = await adminClient
          .from('users')
          .insert({
            phone: placeholderPhone,
            email,
            display_name: name?.trim() || email!,
          })
          .select('id')
          .single();
        if (error) throw error;
        userId = created.id;
      }
    }

    // Insert comment
    const { data: comment, error: commentErr } = await adminClient
      .from('comments')
      .insert({
        trip_id: tripId,
        user_id: userId,
        text: text.trim(),
        type: 'comment',
        reactions: [],
      })
      .select('*, user:users(*)')
      .single();

    if (commentErr) throw commentErr;

    return NextResponse.json({ success: true, comment });
  } catch (err: unknown) {
    console.error('Comment error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to post comment' },
      { status: 500 }
    );
  }
}
