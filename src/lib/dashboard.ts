// Dashboard data layer. Fetches all trips where the current user is
// organizer or member, grouped by rally phase for the game-board view.

import { createClient } from '@/lib/supabase/server';
import { computeRallyPhase } from '@/lib/rally-types';
import type { RallyPhase } from '@/lib/rally-types';
import { chassisThemeIdFromTemplate } from '@/lib/themes/from-db';
import type { ThemeId } from '@/lib/themes/types';
import type { Trip, Theme, TripMember, User } from '@/types';
import { differenceInDays } from 'date-fns';

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
}

export interface DashboardData {
  cards: DashboardCard[];
  phaseCounts: Record<RallyPhase, number>;
  userName: string;
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

  const allTrips = [
    ...((orgTrips || []) as unknown as DashboardTrip[]),
    ...(filteredMemberTrips as unknown as DashboardTrip[]),
  ];

  // Build cards with computed phase and theme
  const cards: DashboardCard[] = allTrips.map((trip) => {
    const phase = computeRallyPhase(trip.phase, trip.date_end);
    const themeId = (trip.chassis_theme_id as ThemeId) || chassisThemeIdFromTemplate(trip.theme?.template_name);
    const members = trip.members || [];
    const inCount = members.filter((m) => m.rsvp === 'in').length;
    const holdingCount = members.filter((m) => m.rsvp === 'holding').length;

    let daysUntil: number | null = null;
    if (trip.date_start && phase !== 'done' && phase !== 'sketch') {
      daysUntil = differenceInDays(new Date(trip.date_start), new Date());
    }

    let dateLabel: string | null = null;
    if (trip.date_start && trip.date_end) {
      const start = new Date(trip.date_start);
      const end = new Date(trip.date_end);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      dateLabel = `${months[start.getMonth()]} ${start.getDate()}–${end.getDate()}`;
    }

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
    };
  });

  // Count by phase
  const phaseCounts: Record<RallyPhase, number> = {
    sketch: 0, sell: 0, lock: 0, go: 0, done: 0,
  };
  for (const card of cards) {
    phaseCounts[card.phase]++;
  }

  return {
    cards,
    phaseCounts,
    userName: profile?.display_name || 'there',
  };
}
