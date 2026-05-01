// Supabase implementation of AuthProvider. Default backend until
// TODO(prd):auth-backend-confirm resolves. Wraps the existing
// @supabase/ssr server client so SSR pages and route handlers can both
// use it.
//
// Magic-link details:
//   - Supabase enforces single-use codes natively
//   - 15-min expiry is configured in the Supabase project's auth settings
//     (Auth → URL Configuration → "OTP Expiration"). The code below trusts
//     that setting; if a project misconfigures it, the verifier will see
//     stale codes as 'invalid' instead of 'expired' (no clean way to tell
//     the two apart from Supabase's error code).

import { createClient } from '@/lib/supabase/server';
import type {
  AuthProvider,
  MagicLinkResult,
  VerifyResult,
  SessionInfo,
} from './provider';

export const supabaseAuthProvider: AuthProvider = {
  async sendMagicLink(email, redirectTo): Promise<MagicLinkResult> {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      // Supabase returns 422 for invalid email format
      if (error.status === 422 || /invalid/i.test(error.message)) {
        return { ok: false, reason: 'invalid_email', message: error.message };
      }
      return { ok: false, reason: 'send_failed', message: error.message };
    }
    return { ok: true };
  },

  async verifyMagicLink(code): Promise<VerifyResult> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data?.user) {
      // Supabase doesn't distinguish "expired" from "invalid" cleanly in
      // the OAuth code flow. Heuristic: presence of "expired" in the
      // message → expired; everything else → invalid.
      const msg = error?.message ?? '';
      const reason: 'expired' | 'invalid' = /expired|stale/i.test(msg) ? 'expired' : 'invalid';
      return { ok: false, reason };
    }

    // 10H — `isNewUser` retired. The /auth/setup form gate it gated
    // is gone; orphan-merge + ensure-row upsert run unconditionally
    // in the callback for both new and returning users.
    return {
      ok: true,
      userId: data.user.id,
      email: data.user.email ?? '',
    };
  },

  async getSession(): Promise<SessionInfo> {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return null;
    return { userId: data.user.id, email: data.user.email ?? '' };
  },

  async signOut(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
  },
};

// Default export — change this single line when TODO(prd):auth-backend-confirm
// resolves and a different provider is selected.
export const authProvider: AuthProvider = supabaseAuthProvider;
