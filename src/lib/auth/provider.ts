// AuthProvider — the interface every auth backend implements.
//
// Why this exists: TODO(prd):auth-backend-confirm. Andrew has not picked
// between Supabase Auth, Clerk, Resend-only custom JWT, or a fully custom
// stack. Phase 11 spec is provider-agnostic. We ship behind this interface
// so the provider can swap with a single import change.
//
// Constraints every provider must honor (rally-phase-11-auth.html callout):
//   - magic link expires in 15 minutes
//   - single-use (clicking a used link → 'invalid')
//   - email delivery via Resend
//   - session duration: 30 days rolling (refreshed on each visit)
//   - resend cooldown: 30 seconds per email (enforced via rate-limit.ts)
//   - rate limit: 5 sends per email per hour (enforced via rate-limit.ts)
//
// The provider does NOT enforce the cooldown / rate limit itself — that
// happens upstream in the magic-link route handler so the same limiter
// applies whether we're on Supabase, Clerk, or custom.

export type MagicLinkResult =
  | { ok: true }
  | { ok: false; reason: 'invalid_email' | 'send_failed'; message?: string };

export type VerifyResult =
  | { ok: true; userId: string; email: string; isNewUser: boolean }
  | { ok: false; reason: 'expired' | 'invalid' };

export type SessionInfo = {
  userId: string;
  email: string;
} | null;

export interface AuthProvider {
  /** Send a magic link to the given email. Should return ok:true even if
   *  the email doesn't exist (account creation is implicit per phase 11). */
  sendMagicLink(email: string, redirectTo: string): Promise<MagicLinkResult>;

  /** Verify a callback code/token. Single-use, 15-min TTL. */
  verifyMagicLink(code: string): Promise<VerifyResult>;

  /** Read the current session from the request context (cookies). */
  getSession(): Promise<SessionInfo>;

  /** Sign out the current session. */
  signOut(): Promise<void>;
}
