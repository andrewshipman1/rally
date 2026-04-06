import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = Promise<{ id: string }>;

export async function POST(request: NextRequest, segmentData: { params: Params }) {
  const { id } = await segmentData.params;

  let body: { archived?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (typeof body.archived !== 'boolean') {
    return NextResponse.json({ error: 'archived boolean required' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: trip } = await supabase
    .from('trips')
    .select('organizer_id')
    .eq('id', id)
    .single();

  if (!trip || trip.organizer_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('trips')
    .update({ archived_at: body.archived ? new Date().toISOString() : null })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
