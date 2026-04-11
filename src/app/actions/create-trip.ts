'use server';

// Server action for the dashboard "start a trip" button. Creates a
// minimal sketch-state trip and its organizer membership row, then
// redirects to the sketch page with ?first=1 to auto-open the theme
// picker. Replaces the old /create route + TripForm.

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { track } from '@/lib/analytics';

export async function createTrip(): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert({
      organizer_id: user.id,
      name: 'untitled rally',
      phase: 'sketch',
      theme_id: null,
    })
    .select('id, share_slug')
    .single();

  if (tripError) {
    throw new Error(`Trip insert failed: ${tripError.message}`);
  }

  await supabase.from('trip_members').insert({
    trip_id: trip.id,
    user_id: user.id,
    role: 'organizer',
    rsvp: 'in',
  });

  track('trip_created', {
    tripId: trip.id,
    userId: user.id,
    metadata: { destination: null, theme: null },
  });

  redirect(`/trip/${trip.share_slug}?first=1`);
}
