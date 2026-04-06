import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getGuestUserId } from '@/lib/guest-auth';
import { track } from '@/lib/analytics';

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const voteSchema = z.object({
  pollId: z.string().uuid(),
  selectedOptions: z.array(z.string()).max(50),
});

export async function POST(request: NextRequest) {
  const userId = await getGuestUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { pollId, selectedOptions } = parsed.data;
  const admin = getAdminClient();

  const { data: poll } = await admin
    .from('polls')
    .select('id, trip_id')
    .eq('id', pollId)
    .single();
  if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

  const { data: vote, error } = await admin
    .from('poll_votes')
    .upsert(
      { poll_id: pollId, user_id: userId, selected_options: selectedOptions },
      { onConflict: 'poll_id,user_id' }
    )
    .select('*')
    .single();

  if (error) {
    console.error('poll vote error', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }

  track('date_poll_voted', {
    tripId: poll.trip_id,
    userId,
    metadata: { pollId, optionCount: selectedOptions.length },
  });

  return NextResponse.json({ success: true, vote });
}
