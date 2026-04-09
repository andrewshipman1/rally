'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function SignOutButton() {
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <button
      onClick={signOut}
      style={{
        padding: '8px 14px',
        borderRadius: 10,
        border: '1px solid rgba(0,0,0,0.08)',
        background: '#fff',
        color: '#888',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {getCopy('just-because', 'auth.signOut.button')}
    </button>
  );
}
