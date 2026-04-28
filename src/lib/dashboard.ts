// Dashboard data layer. Fetches all trips where the current user is
// organizer or member, grouped by rally phase for the game-board view.

import { createClient } from '@/lib/supabase/server';
import { computeRallyPhase } from '@/lib/rally-types';
import type { RallyPhase } from '@/lib/rally-types';
import { chassisThemeIdFromTemplate } from '@/lib/themes/from-db';
import type { ThemeId } from '@/lib/themes/types';
import type { Trip, Theme, TripMember, User } from '@/types';


// ─── Types ────────────────────────────────────────────────────────────────

export type DashboardTrip = Trip & {
  theme: Theme | null;
  members: (TripMember & { user: User })[];
  organizer: User;
};

export interface DashboardCard {
  trip: DashboardTrip;
  phase: RallyPhase;
  themeId: ThemeId;
  inCount: number;
  holdingCount: number;
  memberCount: number;
  daysUntil: number | null;
  destination: string | null;
  dateLabel: string | null;
  isOrganizer: boolean;
  needsMove: boolean;
  isArchived: boolean;
}

export interface DashboardData {
  cards: DashboardCard[];
  archivedCards: DashboardCard[];
  phaseCounts: Record<RallyPhase, number>;
  needsMoveCount: number;
  userName: string;
  userPhotoUrl: string | null;
}

// ─── Query ────────────────────────────────────────────────────────────────

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();

  // Get user profile for greeting
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  // Get trips where user is organizer
  const { data: orgTrips } = await supabase
    .from('trips')
    .select('*, theme:themes(*), members:trip_members(*, user:users(*)), organizer:users!trips_organizer_id_fkey(*)')
    .eq('organizer_id', userId)
    .order('created_at', { ascending: false });

  // Get trips where user is a member (but not organizer, to avoid dupes)
  const { data: memberTrips } = await supabase
    .from('trips')
    .select('*, theme:themes(*), members:trip_members(*, user:users(*)), organizer:users!trips_organizer_id_fkey(*)')
    .neq('organizer_id', userId)
    .order('created_at', { ascending: false });

  // Filter member trips to only those where user actually is a member
  const filteredMemberTrips = (memberTrips || []).filter((t) => {
    const trip = t as unknown as DashboardTrip;
    return trip.members?.some((m) => m.user_id === userId);
  });

  // Tag each trip with organizer status before merging
  const orgTripList = ((orgTrips || []) as unknown as DashboardTrip[]).map(
    (t) => ({ trip: t, isOrganizer: true })
  );
  const memberTripList = (filteredMemberTrips as unknown as DashboardTrip[]).map(
    (t) => ({ trip: t, isOrganizer: false })
  );
  const allTrips = [...orgTripList, ...memberTripList];

  // Build cards with computed phase and theme
  const allCards: DashboardCard[] = allTrips.map(({ trip, isOrganizer }) => {
    const phase = computeRallyPhase(trip.phase, trip.date_end);
    const themeId = (trip.chassis_theme_id as ThemeId) || chassisThemeIdFromTemplate(trip.theme?.template_name);
    const members = trip.members || [];
    const inCount = members.filter((m) => m.rsvp === 'in').length;
    const holdingCount = members.filter((m) => m.rsvp === 'holding').length;

    let daysUntil: number | null = null;
    if (phase !== 'done' && phase !== 'sketch') {
      // Sell phase: count to commit_deadline (lock cutoff).
      // Lock/Go: count to date_start.
      // Use Math.ceil to stay consistent with ChassisCountdown on the trip page.
      const targetDate = phase === 'sell' && trip.commit_deadline
        ? trip.commit_deadline
        : trip.date_start;
      if (targetDate) {
        const diffMs = new Date(targetDate).getTime() - Date.now();
        daysUntil = Math.max(0, Math.ceil(diffMs / 86_400_000));
      }
    }

    let dateLabel: string | null = null;
    if (trip.date_start && trip.date_end) {
      const start = new Date(trip.date_start);
      const end = new Date(trip.date_end);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      dateLabel = `${months[start.getMonth()]} ${start.getDate()}–${end.getDate()}`;
    }

    const isArchived = trip.archived_at != null;
    const needsMove = phase === 'sell' && holdingCount > 0 && isOrganizer && !isArchived;

    return {
      trip,
      phase,
      themeId,
      inCount,
      holdingCount,
      memberCount: members.length,
      daysUntil,
      destination: trip.destination,
      dateLabel,
      isOrganizer,
      needsMove,
      isArchived,
    };
  });

  // Partition: archived hides only for the organizer.
  // - archivedCards: organizer's own archived trips (the dashboard "archived" subsection)
  // - cards: organizer's active trips + every member trip regardless of archive state
  const archivedCards = allCards.filter((c) => c.isOrganizer && c.isArchived);
  const cards = allCards.filter((c) => !(c.isOrganizer && c.isArchived));

  // Count by phase — active cards only; archived trips don't drive live signals.
  const phaseCounts: Record<RallyPhase, number> = {
    sketch: 0, sell: 0, lock: 0, go: 0, done: 0,
  };
  for (const card of cards) {
    phaseCounts[card.phase]++;
  }

  const needsMoveCount = cards.filter((c) => c.needsMove).length;

  return {
    cards,
    archivedCards,
    phaseCounts,
    needsMoveCount,
    userName: profile?.display_name || 'there',
    userPhotoUrl: profile?.profile_photo_url ?? null,
  };
}
