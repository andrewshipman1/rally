import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user has a profile in our users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (existingUser) {
        // Existing user — go to dashboard
        return NextResponse.redirect(`${origin}/`);
      } else {
        // New user — go to profile setup
        return NextResponse.redirect(`${origin}/auth/setup`);
      }
    }
  }

  // Auth failed — redirect back to auth page
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
}
