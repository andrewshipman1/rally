import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { stripHtml } from '@/lib/sanitize';
import { getGuestUserId } from '@/lib/guest-auth';
import { track } from '@/lib/analytics';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const commentSchema = z.object({
  tripId: z.string().uuid(),
  text: z.string().min(1).max(1000),
});

// Simple in-memory rate limit: 10 comments / minute / user
const rateBuckets = new Map<string, number[]>();
function rateLimited(userId: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const bucket = (rateBuckets.get(userId) || []).filter((t) => t > windowStart);
  if (bucket.length >= 10) {
    rateBuckets.set(userId, bucket);
    return true;
  }
  bucket.push(now);
  rateBuckets.set(userId, bucket);
  return false;
}

export async function POST(request: NextRequest) {
  const userId = await getGuestUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const cleanText = stripHtml(parsed.data.text);
  if (!cleanText) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (rateLimited(userId)) {
    return NextResponse.json({ error: 'Too many comments' }, { status: 429 });
  }

  try {
    const adminClient = getAdminClient();

    const { data: comment, error: commentErr } = await adminClient
      .from('comments')
      .insert({
        trip_id: parsed.data.tripId,
        user_id: userId,
        text: cleanText,
        type: 'comment',
        reactions: [],
      })
      .select('*, user:users(*)')
      .single();

    if (commentErr) throw commentErr;

    track('comment_posted', {
      tripId: parsed.data.tripId,
      userId,
      metadata: { commentLength: cleanText.length },
    });

    return NextResponse.json({ success: true, comment });
  } catch (err: unknown) {
    console.error('Comment error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
