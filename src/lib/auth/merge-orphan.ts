// Session 9S — invite-then-signup orphan merge flow.
//
// Thin TypeScript wrapper over the `merge_orphan_user_by_email` RPC
// (migration 023). The heavy lifting — FK migration, collision
// resolution, orphan deletion — happens atomically server-side in a
// PL/pgSQL function body. This wrapper exists so ProfileSetup and
// future callers can trigger the merge via a named function instead
// of a raw `.rpc()` call.
//
// The RPC takes no arguments. It pulls the caller's email from
// `auth.uid()` and `auth.users.email` server-side, so an unauthenticated
// caller or one whose email doesn't match any orphan gets `null` back
// with zero DB changes. That makes this function safe to call
// unconditionally on every ProfileSetup submission — the "no orphan"
// fast path is a single indexed SELECT plus a return.

import type { SupabaseClient } from '@supabase/supabase-js';

export type MergeOrphanResult =
  | { merged: false }
  | { merged: true; orphanId: string };

export async function mergeOrphan(
  supabase: SupabaseClient,
): Promise<MergeOrphanResult> {
  const { data, error } = await supabase.rpc('merge_orphan_user_by_email');

  if (error) {
    // The RPC is authoritative on data integrity. If it throws, we
    // let the caller handle the error rather than swallowing it —
    // ProfileSetup's existing catch surfaces "Failed to save profile"
    // which is the right failure mode (user retries).
    throw error;
  }

  // RPC returns a uuid (orphan id) on merge, null if no orphan existed.
  if (data == null) {
    return { merged: false };
  }

  return { merged: true, orphanId: data as string };
}
