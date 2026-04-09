// Buzz feed data layer. Merges activity_log events with comment posts
// into a unified reverse-chron feed grouped by calendar day.
//
// Write paths (INSERT into activity_log) ship in Session 3C.
// This module is read-only.

import { createClient } from '@/lib/supabase/server';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { ActivityLogEntry, Comment, User } from '@/types';

// ─── Public types ─────────────────────────────────────────────────────────

export type BuzzItem =
  | { kind: 'event'; entry: ActivityLogEntry & { actor: User | null }; text: string; timestamp: string }
  | { kind: 'post'; comment: Comment & { user: User }; isMine: boolean; timestamp: string };

export interface BuzzDay {
  label: string;
  items: BuzzItem[];
}

// ─── Event type → lexicon key map ─────────────────────────────────────────

const EVENT_COPY_KEY: Record<string, string> = {
  rsvp_in:        'buzz.eventRsvpIn',
  rsvp_holding:   'buzz.eventRsvpHolding',
  rsvp_out:       'buzz.eventRsvpOut',
  plus_one_added: 'buzz.eventPlusOneAdded',
  vote_cast:      'buzz.eventVoteCast',
  lodging_locked: 'buzz.eventLodgingLocked',
  activity_added: 'buzz.eventActivityAdded',
  extra_added:    'buzz.eventExtraAdded',
  theme_changed:  'buzz.eventThemeChanged',
  phase_lock:     'buzz.eventPhaseLock',
  phase_go:       'buzz.eventPhaseGo',
  trip_created:   'buzz.eventTripCreated',
  cutoff_passed:  'buzz.eventCutoffPassed',
};

// ─── Event type → icon emoji ──────────────────────────────────────────────

const EVENT_ICON: Record<string, string> = {
  rsvp_in:        '🙌',
  rsvp_holding:   '🧗',
  rsvp_out:       '👋',
  plus_one_added: '➕',
  vote_cast:      '🗳️',
  lodging_locked: '🏠',
  activity_added: '🎯',
  extra_added:    '📦',
  theme_changed:  '🎨',
  phase_lock:     '🔒',
  phase_go:       '🚀',
  trip_created:   '🎉',
  cutoff_passed:  '⏰',
};

export function getEventIcon(eventType: string): string {
  return EVENT_ICON[eventType] ?? '📌';
}

// ─── Day label helpers ────────────────────────────────────────────────────

function getDayKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDayLabel(dateStr: string, themeId: ThemeId): string {
  const d = new Date(dateStr);
  const now = new Date();

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) return getCopy(themeId, 'buzz.dayDividerToday');

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (isYesterday) return getCopy(themeId, 'buzz.dayDividerYesterday');

  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return getCopy(themeId, 'buzz.dayDividerOlder', {
    weekday: weekdays[d.getDay()],
    date: `${months[d.getMonth()]} ${d.getDate()}`,
  });
}

// ─── Timestamp formatting ─────────────────────────────────────────────────

export function formatBuzzTimestamp(dateStr: string, themeId: ThemeId): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return getCopy(themeId, 'buzz.postTimestampJustNow');
  if (mins < 60) return getCopy(themeId, 'buzz.postTimestampMinutes', { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return getCopy(themeId, 'buzz.postTimestampHours', { n: hours });

  const d = new Date(dateStr);
  const timeStr = `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}${d.getHours() >= 12 ? 'pm' : 'am'}`;
  return getCopy(themeId, 'buzz.postTimestampYesterday', { time: timeStr });
}

// ─── Main query ───────────────────────────────────────────────────────────

export async function getBuzzFeed(
  tripId: string,
  currentUserId: string | null,
  themeId: ThemeId,
): Promise<BuzzDay[]> {
  const supabase = await createClient();

  // Fetch activity log events with actor user join
  const { data: events } = await supabase
    .from('activity_log')
    .select('*, actor:users!activity_log_actor_id_fkey(*)')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
    .limit(100);

  // Fetch chat posts (comments with type='comment') with user join
  const { data: posts } = await supabase
    .from('comments')
    .select('*, user:users(*)')
    .eq('trip_id', tripId)
    .eq('type', 'comment')
    .order('created_at', { ascending: false })
    .limit(100);

  // Build unified items
  const items: BuzzItem[] = [];

  if (events) {
    for (const e of events) {
      const entry = e as unknown as ActivityLogEntry & { actor: User | null };
      const copyKey = EVENT_COPY_KEY[entry.event_type];
      const text = copyKey
        ? getCopy(themeId, copyKey, {
            name: entry.actor?.display_name,
            ...(entry.metadata as Record<string, string | number | undefined>),
          })
        : entry.event_type;

      items.push({ kind: 'event', entry, text, timestamp: entry.created_at });
    }
  }

  if (posts) {
    for (const p of posts) {
      const comment = p as unknown as Comment & { user: User };
      items.push({
        kind: 'post',
        comment,
        isMine: comment.user_id === currentUserId,
        timestamp: comment.created_at,
      });
    }
  }

  // Sort reverse-chron
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Group by calendar day
  const dayMap = new Map<string, BuzzDay>();
  for (const item of items) {
    const key = getDayKey(item.timestamp);
    if (!dayMap.has(key)) {
      dayMap.set(key, { label: getDayLabel(item.timestamp, themeId), items: [] });
    }
    dayMap.get(key)!.items.push(item);
  }

  return Array.from(dayMap.values());
}
