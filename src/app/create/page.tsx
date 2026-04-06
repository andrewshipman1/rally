import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TripForm } from '@/components/editor/TripForm';
import type { Theme } from '@/types';

export const metadata = {
  title: 'Create a trip — Rally',
};

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  // Fetch system themes for the theme picker
  const { data: themes } = await supabase
    .from('themes')
    .select('*')
    .eq('is_system', true)
    .order('template_name');

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#faf9f7',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <TripForm themes={(themes as Theme[]) || []} userId={user.id} />
    </div>
  );
}
