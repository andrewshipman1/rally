import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Dashboard } from '@/components/dashboard/Dashboard';
import type { Trip, Theme, TripMember } from '@/types';

type TripRow = Trip & {
  theme: Theme | null;
  trip_members: TripMember[];
};

export const metadata = {
  title: 'Dashboard — Rally',
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Fetch trips where user is organizer
  const { data: trips } = await supabase
    .from('trips')
    .select('*, theme:themes(*), trip_members(*)')
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#faf9f7',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Dashboard
        trips={(trips as TripRow[] | null) || []}
        userName={profile?.display_name || 'there'}
      />
    </div>
  );
}
