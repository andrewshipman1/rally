// Magic-link rate limiter. Enforces the two phase-11 constraints:
//   - 30-second cooldown between sends per email
//   - 5 sends per email per hour (then a 1-hour lockout)
//
// Storage: Supabase `auth_rate_limits` table (migration 011).
// Each row stores a JSONB array of send timestamps within the
// current hourly window, enabling both cooldown and hourly limit
// checks from a single row.

import { createClient } from '@supabase/supabase-js';

const COOLDOWN_MS = 30_000;        // 30s between sends
const HOURLY_LIMIT = 5;            // 5 sends per email per hour
const HOURLY_WINDOW_MS = 60 * 60 * 1000;

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type RateCheckResult =
  | { ok: true }
  | { ok: false; reason: 'cooldown'; retryInMs: number }
  | { ok: false; reason: 'hourly_limit'; retryInMs: number };

/** Check rate limit. Call before sending a magic link. */
export async function checkMagicLinkRate(
  emailRaw: string,
  now = Date.now()
): Promise<RateCheckResult> {
  const email = emailRaw.toLowerCase().trim();
  const admin = getAdminClient();

  const { data } = await admin
    .from('auth_rate_limits')
    .select('send_timestamps')
    .eq('email', email)
    .maybeSingle();

  if (!data) return { ok: true };

  // Filter to timestamps within the hourly window.
  const raw = (data.send_timestamps as number[]) ?? [];
  const timestamps = raw.filter((t) => now - t < HOURLY_WINDOW_MS);

  if (timestamps.length === 0) return { ok: true };

  // Cooldown check — most recent timestamp.
  const last = timestamps[timestamps.length - 1];
  const sinceLast = now - last;
  if (sinceLast < COOLDOWN_MS) {
    return { ok: false, reason: 'cooldown', retryInMs: COOLDOWN_MS - sinceLast };
  }

  // Hourly limit check.
  if (timestamps.length >= HOURLY_LIMIT) {
    const oldest = timestamps[0];
    return {
      ok: false,
      reason: 'hourly_limit',
      retryInMs: HOURLY_WINDOW_MS - (now - oldest),
    };
  }

  return { ok: true };
}

/** Record a successful send. Call after the provider returns ok. */
export async function recordMagicLinkSend(
  emailRaw: string,
  now = Date.now()
): Promise<void> {
  const email = emailRaw.toLowerCase().trim();
  const admin = getAdminClient();

  // Fetch existing timestamps, prune stale, append new.
  const { data } = await admin
    .from('auth_rate_limits')
    .select('send_timestamps')
    .eq('email', email)
    .maybeSingle();

  const raw = (data?.send_timestamps as number[]) ?? [];
  const pruned = raw.filter((t) => now - t < HOURLY_WINDOW_MS);
  pruned.push(now);

  await admin
    .from('auth_rate_limits')
    .upsert(
      { email, send_timestamps: pruned, updated_at: new Date(now).toISOString() },
      { onConflict: 'email' }
    );
}
