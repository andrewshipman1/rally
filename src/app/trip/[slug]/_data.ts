// Shared trip loader for the trip page + its subsurfaces (crew, etc.).
// Next.js dedupes this query across the route tree within one request,
// so the crew subsurface can call getTrip() without a second DB roundtrip.
//
// Kept as a plain async function (not a Server Action). No "use server".

import { createClient } from '@/lib/supabase/server';
import type { TripWithDetails } from '@/types';

export async function getTrip(slug: string): Promise<TripWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('trips')
    .select(
      `
      *,
      theme:themes(*),
      lodging(*, votes:lodging_votes(*, user:users(*))),
      flights(*),
      transport(*),
      restaurants(*),
      activities(*),
      groceries(*),
      members:trip_members(*, user:users(*)),
      organizer:users!trips_organizer_id_fkey(*),
      comments(*, user:users(*)),
      polls(*, votes:poll_votes(*, user:users(*)))
    `
    )
    .eq('share_slug', slug)
    .order('sort_order', { referencedTable: 'lodging', ascending: true })
    .order('sort_order', { referencedTable: 'flights', ascending: true })
    .order('sort_order', { referencedTable: 'transport', ascending: true })
    .order('sort_order', { referencedTable: 'restaurants', ascending: true })
    .order('sort_order', { referencedTable: 'activities', ascending: true })
    .order('sort_order', { referencedTable: 'groceries', ascending: true })
    .order('created_at', { referencedTable: 'comments', ascending: true })
    .single();

  if (error || !data) return null;
  return data as unknown as TripWithDetails;
}
