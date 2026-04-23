'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getCopy } from '@/lib/copy/get-copy';
import { mergeOrphan } from '@/lib/auth/merge-orphan';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function ProfileSetup() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Session 9S — invite-then-signup orphan merge. Migration 023
      // installed a SECURITY DEFINER RPC that locates an orphan row
      // (same email, different id — created by `api/invite/route.ts`
      // before this user signed up) and migrates every FK onto the
      // new auth user's id atomically. Safe to call unconditionally:
      // the RPC fast-returns `{ merged: false }` when no orphan
      // exists. Without this, the upsert below would trip 9R's
      // UNIQUE(email) constraint and surface "Failed to save profile"
      // for every invitee-then-signup flow.
      await mergeOrphan(supabase);

      // Session 9R BB-1 — upsert-on-id keeps the ProfileSetup submit
      // idempotent across double-submits. After 9S's merge this
      // always INSERTs: the merge left the FKs pointing at the new
      // auth id but deleted the orphan's public.users row, so
      // there's nothing to conflict with on `id`.
      const { error: insertError } = await supabase.from('users').upsert(
        {
          id: user.id,
          phone: user.phone || '',
          email: user.email || null,
          display_name: name.trim(),
          bio: bio.trim() || null,
          instagram_handle: instagram.trim() || null,
        },
        { onConflict: 'id' },
      );

      if (insertError) throw insertError;
      window.location.href = '/';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    fontFamily: "'Outfit', sans-serif",
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 600,
    display: 'block',
    marginBottom: 6,
    marginTop: 14,
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 24,
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>{getCopy('just-because', 'auth.setup.emoji')}</div>
        <div style={{ fontSize: 16, color: '#fff', fontWeight: 700, fontFamily: "'Fraunces', serif" }}>
          {getCopy('just-because', 'auth.setup.h1')}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          {getCopy('just-because', 'auth.setup.sub')}
        </div>
      </div>

      <label style={labelStyle}>{getCopy('just-because', 'auth.setup.nameLabel')}</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        style={inputStyle}
      />

      <label style={labelStyle}>{getCopy('just-because', 'auth.setup.bioLabel')}</label>
      <input
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Trip dad. Spreadsheet enthusiast."
        style={inputStyle}
      />

      <label style={labelStyle}>{getCopy('just-because', 'auth.setup.igLabel')}</label>
      <input
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        placeholder="@your.handle"
        style={inputStyle}
      />

      <button
        onClick={save}
        disabled={!name.trim() || loading}
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 12,
          border: 'none',
          background: name.trim() ? 'linear-gradient(135deg, #2d6b5a, #3a8a7a)' : 'rgba(255,255,255,0.1)',
          color: name.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
          fontSize: 15,
          fontWeight: 700,
          cursor: name.trim() ? 'pointer' : 'default',
          marginTop: 20,
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {loading ? 'Saving...' : "Let's go →"}
      </button>

      {error && (
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,100,100,0.15)', color: '#ff8a8a', fontSize: 12, textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  );
}
