'use client';

import { useState } from 'react';
import type { TripMember, User, RsvpStatus } from '@/types';
import { Avatar } from '@/components/ui/Avatar';

const COLORS = ['#2d6b5a', '#c4956a', '#3a8a7a', '#d4a574', '#1a3d4a', '#8b6f5c'];

const RSVP_LABELS: Record<RsvpStatus, { text: string; color: string }> = {
  in: { text: "Going ✈️", color: '#7ecdb8' },
  maybe: { text: 'Maybe 🤔', color: '#e8c9a0' },
  out: { text: "Can't make it", color: 'rgba(255,255,255,0.4)' },
  pending: { text: 'Invited', color: 'rgba(255,255,255,0.6)' },
};

export function InviteSection({
  tripId,
  members: initialMembers,
}: {
  tripId: string;
  members: (TripMember & { user: User })[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const invite = async () => {
    if (!identifier.trim()) return;
    setError('');
    setAdding(true);
    try {
      const body: { tripId: string; name: string; email?: string; phone?: string } = {
        tripId,
        name: name.trim() || identifier.trim(),
      };
      if (method === 'email') body.email = identifier.trim();
      else body.phone = identifier.trim();

      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite');
      if (data.alreadyInvited) {
        setError('Already invited');
        return;
      }
      setMembers((prev) => [...prev, data.member]);
      setIdentifier('');
      setName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to invite');
    } finally {
      setAdding(false);
    }
  };

  const remove = async (memberId: string) => {
    if (!confirm('Remove this person from the trip?')) return;
    try {
      await fetch(`/api/invite?memberId=${memberId}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch {
      // ignore
    }
  };

  return (
    <div
      style={{
        marginTop: 14,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 18,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: 12,
        }}
      >
        👥 Who&apos;s coming?
      </div>

      {/* Member list */}
      {members.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {members.map((m, i) => {
            const rsvp = RSVP_LABELS[m.rsvp];
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 10,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Avatar
                  initials={m.user.display_name.charAt(0).toUpperCase()}
                  color={COLORS[i % COLORS.length]}
                  size={32}
                  border="none"
                  photoUrl={m.user.profile_photo_url}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#fff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.user.display_name}
                    {m.role === 'organizer' && (
                      <span style={{ marginLeft: 6, fontSize: 9, color: '#7ecdb8' }}>· organizer</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: rsvp.color }}>{rsvp.text}</div>
                </div>
                {m.role !== 'organizer' && (
                  <button
                    onClick={() => remove(m.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add invite form */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3 }}>
        {(['email', 'phone'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: 6,
              border: 'none',
              background: method === m ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: method === m ? '#fff' : 'rgba(255,255,255,0.5)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {m === 'email' ? '✉️ Email' : '📱 Phone'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          style={inputStyle}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && identifier && invite()}
            type={method === 'email' ? 'email' : 'tel'}
            placeholder={method === 'email' ? 'friend@example.com' : '+1 555 123 4567'}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={invite}
            disabled={!identifier.trim() || adding}
            style={{
              padding: '0 16px',
              borderRadius: 8,
              border: 'none',
              background: identifier.trim() ? '#fff' : 'rgba(255,255,255,0.08)',
              color: identifier.trim() ? '#1a3a4a' : 'rgba(255,255,255,0.3)',
              fontSize: 13,
              fontWeight: 700,
              cursor: identifier.trim() ? 'pointer' : 'default',
              fontFamily: 'inherit',
            }}
          >
            {adding ? '...' : 'Invite'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#ff8a8a', textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontSize: 13,
  outline: 'none',
  fontFamily: "'Outfit', sans-serif",
  boxSizing: 'border-box',
};
