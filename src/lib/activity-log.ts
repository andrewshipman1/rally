// Shared helper for inserting into activity_log alongside primary mutations.
// Non-fatal: if the primary mutation succeeded, a failed log insert should
// not cause the whole action to return ok: false. Call sites should
// try/catch if they want to swallow silently.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ActivityEventType } from '@/types';

export async function logActivity(
  supabase: SupabaseClient,
  tripId: string,
  actorId: string,
  eventType: ActivityEventType,
  opts?: {
    targetId?: string;
    targetType?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await supabase.from('activity_log').insert({
    trip_id: tripId,
    actor_id: actorId,
    event_type: eventType,
    target_id: opts?.targetId ?? null,
    target_type: opts?.targetType ?? null,
    metadata: opts?.metadata ?? {},
  });
}
