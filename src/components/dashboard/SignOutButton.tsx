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
        // Session 11 polish (Cowork, 2026-05-03): flattened from a pill-with-
        // outline to a plain text link. The pill looked popped-out next to
        // the bare passport avatar in the AppHeader and against the cream page
        // background after dropping the AppHeader's white box. Sign-out is a
        // secondary escape hatch, not a primary action — muted color +
        // transparent background keeps it discoverable but visually
        // recessive.
        padding: '4px 8px',
        border: 'none',
        background: 'transparent',
        color: '#888',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {getCopy('just-because', 'auth.signOut.button')}
    </button>
  );
}
