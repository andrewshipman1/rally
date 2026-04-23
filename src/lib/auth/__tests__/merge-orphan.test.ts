// Session 9S — unit tests for `mergeOrphan()` TS wrapper.
//
// The wrapper is three lines; these tests lock in its contract with
// callers (ProfileSetup today, future flows tomorrow):
//
//   * On no-orphan: resolves `{ merged: false }`, no throw.
//   * On orphan merged: resolves `{ merged: true, orphanId }`.
//   * On RPC error: propagates the error so the caller can surface
//     "Failed to save profile" (or equivalent).
//
// The actual merge SQL — FK migration, collision handling, orphan
// deletion — is tested end-to-end against a live DB by
// `.probe_9s_merge.ts` (scenarios A + B), since that logic lives in
// the PL/pgSQL function body in migration 023.

import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mergeOrphan } from '../merge-orphan';

function mockClient(rpcImpl: () => Promise<{ data: unknown; error: unknown }>) {
  return { rpc: vi.fn(rpcImpl) } as unknown as SupabaseClient;
}

describe('mergeOrphan', () => {
  it('returns { merged: false } when the RPC resolves to null (no orphan)', async () => {
    const sb = mockClient(async () => ({ data: null, error: null }));
    const result = await mergeOrphan(sb);
    expect(result).toEqual({ merged: false });
    expect(sb.rpc).toHaveBeenCalledWith('merge_orphan_user_by_email');
  });

  it('returns { merged: true, orphanId } when the RPC returns a uuid', async () => {
    const orphanId = '88e4da18-ae6b-4b43-98b5-55de8fc83c0b';
    const sb = mockClient(async () => ({ data: orphanId, error: null }));
    const result = await mergeOrphan(sb);
    expect(result).toEqual({ merged: true, orphanId });
  });

  it('throws when the RPC reports an error (so ProfileSetup can surface it)', async () => {
    const err = { message: 'permission denied for function merge_orphan_user_by_email' };
    const sb = mockClient(async () => ({ data: null, error: err }));
    await expect(mergeOrphan(sb)).rejects.toBe(err);
  });

  it('invokes the RPC exactly once per call', async () => {
    const sb = mockClient(async () => ({ data: null, error: null }));
    await mergeOrphan(sb);
    expect(sb.rpc).toHaveBeenCalledTimes(1);
  });
});
