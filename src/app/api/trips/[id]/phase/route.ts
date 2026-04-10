import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DEV-ONLY: Force phase transition for QA testing.
// Guarded by NEXT_PUBLIC_DEV_BYPASS=1 or NODE_ENV=development.

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isDev =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_DEV_BYPASS === '1';

  if (!isDev) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  const { id: tripId } = await params;
  const { phase } = await request.json();

  if (!['sketch', 'sell', 'lock', 'go', 'done'].includes(phase)) {
    return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('trips')
    .update({ phase })
    .eq('id', tripId)
    .eq('organizer_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, phase });
}
