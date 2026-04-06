'use client';

import { useState, useRef, useEffect } from 'react';
import type { TripMember, User, RsvpStatus } from '@/types';
import { Avatar } from '@/components/ui/Avatar';

type Member = TripMember & { user: User };

type UndoState = {
  member: Member;
  expiresAt: number;
} | null;

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
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [undo, setUndo] = useState<UndoState>(null);
  const [tick, setTick] = useState(0);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!undo) return;
    const interval = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(interval);
  }, [undo]);

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

  const remove = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setUndo({ member: target, expiresAt: Date.now() + 5000 });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(async () => {
      setUndo(null);
      try {
        await fetch(`/api/invite?memberId=${memberId}`, { method: 'DELETE' });
      } catch {
        // ignore
      }
    }, 5000);
  };

  const undoRemove = () => {
    if (!undo) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setMembers((prev) => [...prev, undo.member]);
    setUndo(null);
  };

  const undoSecondsLeft = undo
    ? Math.max(0, Math.ceil((undo.expiresAt - Date.now()) / 1000))
    : 0;
  // Reference tick to keep linter happy and force re-render via effect.
  void tick;

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

      {undo && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'rgba(20,30,40,0.9)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, color: '#fff' }}>
            {undo.member.user.display_name} removed. ({undoSecondsLeft}s)
          </div>
          <button
            onClick={undoRemove}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Undo
          </button>
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
