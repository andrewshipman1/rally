// Passport data layer. Stat aggregation and stamp grid queries
// for the user's travel portfolio page.

import { createClient } from '@/lib/supabase/server';
import { isTripDone } from '@/lib/rally-types';
import { chassisThemeIdFromTemplate } from '@/lib/themes/from-db';
import type { ThemeId } from '@/lib/themes/types';
import type { User, Trip, Theme, TripMember } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────

export interface PassportProfile {
  displayName: string;
  photoUrl: string | null;
  bio: string | null;
  joinYear: number;
}

export interface PassportStats {
  trips: number;
  rideOrDies: number;
  countries: number;
}

export interface PassportStamp {
  tripId: string;
  tripName: string;
  destination: string | null;
  themeId: ThemeId;
  dateStart: string | null;
  dateEnd: string | null;
  memberCount: number;
  members: { initial: string; displayName: string }[];
}

export interface RideOrDie {
  userId: string;
  displayName: string;
  photoUrl: string | null;
  initial: string;
  sharedTrips: number;
}

// ─── Queries ──────────────────────────────────────────────────────────────

export async function getPassportProfile(userId: string): Promise<PassportProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!data) return null;
  const user = data as unknown as User;
  return {
    displayName: user.display_name || '?',
    photoUrl: user.profile_photo_url,
    bio: user.bio,
    joinYear: new Date(user.created_at).getFullYear(),
  };
}

type TripRow = Trip & {
  theme: Theme | null;
  members: (TripMember & { user: User })[];
};

async function getDoneTrips(userId: string): Promise<TripRow[]> {
  const supabase = await createClient();

  // Get all trips where user is a member with rsvp='in'
  const { data: trips } = await supabase
    .from('trips')
    .select('*, theme:themes(*), members:trip_members(*, user:users(*))')
    .order('date_start', { ascending: false });

  if (!trips) return [];

  return (trips as unknown as TripRow[]).filter((t) => {
    // Must be done
    if (!isTripDone(t.phase, t.date_end)) return false;
    // User must be a member with rsvp 'in'
    return t.members?.some((m) => m.user_id === userId && m.rsvp === 'in');
  });
}

export async function getPassportStats(userId: string): Promise<PassportStats> {
  const doneTrips = await getDoneTrips(userId);

  const trips = doneTrips.length;

  // Ride or dies: distinct co-travelers across done trips
  const coTravelers = new Set<string>();
  for (const t of doneTrips) {
    for (const m of t.members || []) {
      if (m.user_id !== userId && m.rsvp === 'in') {
        coTravelers.add(m.user_id);
      }
    }
  }

  // Countries: best-effort parse from destination
  const countrySet = new Set<string>();
  for (const t of doneTrips) {
    if (t.destination) {
      const parts = t.destination.split(',');
      const country = parts[parts.length - 1].trim().toLowerCase();
      if (country) countrySet.add(country);
    }
  }

  return {
    trips,
    rideOrDies: coTravelers.size,
    countries: countrySet.size,
  };
}

export async function getPassportStamps(userId: string): Promise<PassportStamp[]> {
  const doneTrips = await getDoneTrips(userId);

  return doneTrips.map((t) => {
    const themeId = (t.chassis_theme_id as ThemeId) || chassisThemeIdFromTemplate(t.theme?.template_name);
    const inMembers = (t.members || []).filter((m) => m.rsvp === 'in');
    return {
      tripId: t.id,
      tripName: t.name,
      destination: t.destination,
      themeId,
      dateStart: t.date_start,
      dateEnd: t.date_end,
      memberCount: inMembers.length,
      members: inMembers.slice(0, 5).map((m) => ({
        initial: (m.user?.display_name ?? '?').charAt(0).toUpperCase(),
        displayName: m.user?.display_name ?? '?',
      })),
    };
  });
}

export async function getRideOrDies(userId: string): Promise<RideOrDie[]> {
  const doneTrips = await getDoneTrips(userId);

  // Count shared trips per co-traveler
  const countMap = new Map<string, { user: User; count: number }>();
  for (const t of doneTrips) {
    for (const m of t.members || []) {
      if (m.user_id !== userId && m.rsvp === 'in' && m.user) {
        const existing = countMap.get(m.user_id);
        if (existing) {
          existing.count++;
        } else {
          countMap.set(m.user_id, { user: m.user, count: 1 });
        }
      }
    }
  }

  // Sort by count desc, take top 10
  return Array.from(countMap.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([uid, { user, count }]) => ({
      userId: uid,
      displayName: user.display_name || '?',
      photoUrl: user.profile_photo_url,
      initial: (user.display_name || '?').charAt(0).toUpperCase(),
      sharedTrips: count,
    }));
}
