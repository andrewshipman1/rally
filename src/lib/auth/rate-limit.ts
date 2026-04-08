// Magic-link rate limiter. Enforces the two phase-11 constraints:
//   - 30-second cooldown between sends per email
//   - 5 sends per email per hour (then a 1-hour lockout)
//
// Storage: in-memory Map. This is fine for single-instance dev/preview
// deploys. Production deployments behind multiple Node instances will need
// a shared store (Redis, Upstash, or a `magic_link_attempts` Supabase
// table). Flagged at the Session 1 checkpoint as "rate-limit storage TBD".
//
// The map is keyed by lowercased email and trimmed lazily on read so it
// can't grow unbounded between hits.

const COOLDOWN_MS = 30_000;        // 30s between sends
const HOURLY_LIMIT = 5;            // 5 sends per email per hour
const HOURLY_WINDOW_MS = 60 * 60 * 1000;

type Attempt = { timestamps: number[] };

const attempts = new Map<string, Attempt>();

export type RateCheckResult =
  | { ok: true }
  | { ok: false; reason: 'cooldown'; retryInMs: number }
  | { ok: false; reason: 'hourly_limit'; retryInMs: number };

/** Pure check — call before sending. Does not record the attempt. */
export function checkMagicLinkRate(emailRaw: string, now = Date.now()): RateCheckResult {
  const email = emailRaw.toLowerCase().trim();
  const rec = attempts.get(email);
  if (!rec) return { ok: true };

  // Trim outside the hourly window so the limiter is always current.
  rec.timestamps = rec.timestamps.filter((t) => now - t < HOURLY_WINDOW_MS);
  if (rec.timestamps.length === 0) {
    attempts.delete(email);
    return { ok: true };
  }

  // Cooldown check — most recent timestamp.
  const last = rec.timestamps[rec.timestamps.length - 1];
  const sinceLast = now - last;
  if (sinceLast < COOLDOWN_MS) {
    return { ok: false, reason: 'cooldown', retryInMs: COOLDOWN_MS - sinceLast };
  }

  // Hourly limit check.
  if (rec.timestamps.length >= HOURLY_LIMIT) {
    const oldest = rec.timestamps[0];
    return {
      ok: false,
      reason: 'hourly_limit',
      retryInMs: HOURLY_WINDOW_MS - (now - oldest),
    };
  }

  return { ok: true };
}

/** Record a successful send. Call after the provider returns ok:true. */
export function recordMagicLinkSend(emailRaw: string, now = Date.now()): void {
  const email = emailRaw.toLowerCase().trim();
  const rec = attempts.get(email) ?? { timestamps: [] };
  rec.timestamps.push(now);
  attempts.set(email, rec);
}

/** Test helper. Not exported through index. */
export function _resetRateLimitForTests(): void {
  attempts.clear();
}
