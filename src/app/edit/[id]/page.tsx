import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TripEditor } from '@/components/editor/TripEditor';
import type { Trip, Theme, Block } from '@/types';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: trip } = await supabase.from('trips').select('name').eq('id', id).single();
  return { title: trip ? `Edit ${trip.name} — Rally` : 'Edit trip — Rally' };
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: trip } = await supabase
    .from('trips')
    .select('*, theme:themes(*), blocks(*)')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .order('sort_order', { referencedTable: 'blocks', ascending: true })
    .single();

  if (!trip) notFound();

  // Fetch themes for theme picker
  const { data: themes } = await supabase
    .from('themes')
    .select('*')
    .eq('is_system', true)
    .order('template_name');

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
      <TripEditor
        trip={trip as Trip & { theme: Theme | null; blocks: Block[] }}
        themes={(themes as Theme[]) || []}
      />
    </div>
  );
}
