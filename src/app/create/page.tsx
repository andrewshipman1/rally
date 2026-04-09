import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TripForm } from '@/components/editor/TripForm';

export const metadata = {
  title: 'Create a trip — Rally',
};

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  // Phase 6: theme selection moved to the sketch page. The create form
  // no longer needs a themes list — new trips start with theme_id: null
  // and the picker auto-opens on first view via ?first=1.
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#faf9f7',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <TripForm userId={user.id} />
    </div>
  );
}
