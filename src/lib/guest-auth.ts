import crypto from 'node:crypto';
import { cookies } from 'next/headers';

// NOTE: Set RALLY_GUEST_SECRET in production. We fall back to the Supabase service role key
// in dev so cookies still sign without an extra env var.
function getSecret(): string {
  const secret = process.env.RALLY_GUEST_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('No guest auth secret configured');
  return secret;
}

const COOKIE_NAME = 'rally_guest';
// 30-day rolling session per phase 11 spec. Refreshed via refreshGuestCookie()
// on every authenticated request so an active user never sees a re-auth prompt.
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function hmac(data: string): string {
  return base64url(crypto.createHmac('sha256', getSecret()).update(data).digest());
}

export function signGuestToken(userId: string): string {
  const ts = Date.now().toString();
  const payload = `${userId}.${ts}`;
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

export function verifyGuestToken(token: string): { userId: string } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, ts, sig] = parts;
  if (!userId || !ts || !sig) return null;
  const expected = hmac(`${userId}.${ts}`);
  // Constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  const issued = Number(ts);
  if (!Number.isFinite(issued)) return null;
  const ageSec = (Date.now() - issued) / 1000;
  if (ageSec < 0 || ageSec > MAX_AGE) return null;
  return { userId };
}

export async function setGuestCookie(userId: string): Promise<void> {
  try {
    const store = await cookies();
    store.set(COOKIE_NAME, signGuestToken(userId), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: MAX_AGE,
    });
  } catch {
    // Called from a Server Component — cookie writes are only allowed in
    // Server Actions / Route Handlers. Safe to ignore here.
  }
}

export async function getGuestUserId(): Promise<string | null> {
  const store = await cookies();
  const c = store.get(COOKIE_NAME);
  if (!c?.value) return null;
  const verified = verifyGuestToken(c.value);
  return verified?.userId ?? null;
}

export async function clearGuestCookie(): Promise<void> {
  try {
    const store = await cookies();
    store.delete(COOKIE_NAME);
  } catch {
    // Called from a Server Component — safe to ignore.
  }
}

/**
 * Re-issue the cookie with a fresh expiration if a valid session exists.
 * Implements the "30-day rolling" half of phase 11: each authenticated
 * request slides the expiry forward, so an active user is never logged
 * out, but an inactive one drops after 30 days of silence. Idempotent —
 * safe to call from middleware, route handlers, or server components.
 */
export async function refreshGuestCookie(): Promise<void> {
  try {
    const userId = await getGuestUserId();
    if (userId) await setGuestCookie(userId);
  } catch {
    // Called from a Server Component — cookie writes are only allowed in
    // Server Actions and Route Handlers. Safe to ignore; the cookie will
    // be refreshed on the next eligible request.
  }
}
