// POST /api/auth/magic-link
//
// Phase 11 magic-link issue endpoint. Routes through the AuthProvider
// interface so the backend can swap once TODO(prd):auth-backend-confirm
// resolves. Enforces the 30s cooldown + 5/hr rate limit upstream of the
// provider so every backend honors the same constraints.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authProvider } from '@/lib/auth/supabase-provider';
import { checkMagicLinkRate, recordMagicLinkSend } from '@/lib/auth/rate-limit';

const schema = z.object({
  email: z.string().email().max(254),
  /** Optional invite trip slug — preserved through the magic link redirect. */
  trip: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  const { email, trip } = parsed.data;

  // Rate limit BEFORE hitting the provider so we don't accidentally
  // burn through Supabase's own ceiling.
  const rate = await checkMagicLinkRate(email);
  if (!rate.ok) {
    return NextResponse.json(
      { error: rate.reason, retryInMs: rate.retryInMs },
      { status: 429 }
    );
  }

  const origin = new URL(req.url).origin;
  const redirectTo = `${origin}/auth/callback${trip ? `?trip=${encodeURIComponent(trip)}` : ''}`;

  const result = await authProvider.sendMagicLink(email, redirectTo);
  if (!result.ok) {
    const status = result.reason === 'invalid_email' ? 400 : 502;
    return NextResponse.json({ error: result.reason }, { status });
  }

  await recordMagicLinkSend(email);
  return NextResponse.json({ ok: true });
}
