import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileSetup } from '@/components/auth/ProfileSetup';

export const metadata = {
  title: 'Set up your profile — Rally',
};

export default async function SetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Must be authenticated
  if (!user) redirect('/auth');

  // If user already has a profile, go to dashboard
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existingUser) redirect('/');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(168deg, #122c35 0%, #1a3d4a 30%, #2d6b5a 60%, #3a8a7a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 380, width: '100%' }}>
        <ProfileSetup />
      </div>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
