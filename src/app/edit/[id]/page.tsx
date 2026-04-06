import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TripEditor } from '@/components/editor/TripEditor';
import type { Trip, Theme, Lodging, Flight, Transport, Restaurant, Activity, Grocery, TripMember, User } from '@/types';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: trip } = await supabase.from('trips').select('name').eq('id', id).single();
  return { title: trip ? `Edit ${trip.name} — Rally` : 'Edit trip — Rally' };
}

export type EditableTrip = Trip & {
  theme: Theme | null;
  lodging: Lodging[];
  flights: Flight[];
  transport: Transport[];
  restaurants: Restaurant[];
  activities: Activity[];
  groceries: Grocery[];
  members: (TripMember & { user: User })[];
};

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: trip } = await supabase
    .from('trips')
    .select(
      '*, theme:themes(*), lodging(*), flights(*), transport(*), restaurants(*), activities(*), groceries(*), members:trip_members(*, user:users(*))'
    )
    .eq('id', id)
    .eq('organizer_id', user.id)
    .order('sort_order', { referencedTable: 'lodging', ascending: true })
    .order('sort_order', { referencedTable: 'flights', ascending: true })
    .order('sort_order', { referencedTable: 'transport', ascending: true })
    .order('sort_order', { referencedTable: 'restaurants', ascending: true })
    .order('sort_order', { referencedTable: 'activities', ascending: true })
    .order('sort_order', { referencedTable: 'groceries', ascending: true })
    .single();

  if (!trip) notFound();

  const { data: themes } = await supabase
    .from('themes')
    .select('*')
    .eq('is_system', true)
    .order('template_name');

  return <TripEditor trip={trip as unknown as EditableTrip} themes={(themes as Theme[]) || []} />;
}
