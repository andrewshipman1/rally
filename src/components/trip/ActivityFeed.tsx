'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Comment, User } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Avatar } from '@/components/ui/Avatar';

const COLORS = ['#2d6b5a', '#c4956a', '#3a8a7a', '#d4a574', '#1a3d4a', '#8b6f5c'];
const STORAGE_KEY = 'rally:identity';

type ActivityItem = Comment & { user: User };

function loadIdentity(): { name: string; email?: string; phone?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

export function ActivityFeed({
  comments: initialComments,
  tripId,
}: {
  comments: ActivityItem[];
  tripId: string;
}) {
  const router = useRouter();
  // Sort newest first
  const sorted = [...initialComments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const [comments, setComments] = useState<ActivityItem[]>(sorted);
  const [composing, setComposing] = useState(false);
  const [newText, setNewText] = useState('');
  const [identityNeeded, setIdentityNeeded] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const identity = loadIdentity();
    if (identity) {
      setName(identity.name || '');
      if (identity.email) {
        setContact(identity.email);
        setContactType('email');
      } else if (identity.phone) {
        setContact(identity.phone);
        setContactType('phone');
      }
    }
  }, []);

  // Re-sync when parent passes new comments (after router.refresh from RSVP)
  useEffect(() => {
    const next = [...initialComments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setComments(next);
  }, [initialComments]);

  const startComment = () => {
    setError('');
    setComposing(true);
    const identity = loadIdentity();
    if (!identity || (!identity.email && !identity.phone)) {
      setIdentityNeeded(true);
    }
  };

  const submitComment = async () => {
    if (!newText.trim()) return;

    let identity = loadIdentity();
    if (!identity || (!identity.email && !identity.phone)) {
      // Need to collect identity first
      if (!name.trim() || !contact.trim()) {
        setIdentityNeeded(true);
        return;
      }
      identity =
        contactType === 'email'
          ? { name: name.trim(), email: contact.trim() }
          : { name: name.trim(), phone: contact.trim() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    }

    setSubmitting(true);
    setError('');
    try {
      const body: Record<string, string> = {
        tripId,
        text: newText.trim(),
        name: identity.name,
      };
      if (identity.email) body.email = identity.email;
      if (identity.phone) body.phone = identity.phone;

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setComments((prev) => [data.comment as ActivityItem, ...prev]);
      setNewText('');
      setComposing(false);
      setIdentityNeeded(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = (commentId: string, emoji: string) => {
    const key = `${commentId}-${emoji}`;
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <GlassCard>
      {/* Header with section label and Comment button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <SectionLabel icon="📣" text="Activity" />
        {!composing && (
          <button
            onClick={startComment}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: 12,
            }}
          >
            ✏️ Comment
          </button>
        )}
      </div>

      {/* Composer */}
      {composing && (
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {identityNeeded && (
            <>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                Add your name to comment
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3 }}>
                {(['email', 'phone'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setContactType(m)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 6,
                      border: 'none',
                      background: contactType === m ? 'rgba(255,255,255,0.15)' : 'transparent',
                      color: contactType === m ? '#fff' : 'rgba(255,255,255,0.5)',
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
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                type={contactType === 'email' ? 'email' : 'tel'}
                placeholder={contactType === 'email' ? 'you@example.com' : '+1 555 123 4567'}
                style={inputStyle}
              />
            </>
          )}
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Drop some hype..."
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
              lineHeight: 1.4,
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => {
                setComposing(false);
                setNewText('');
                setError('');
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              onClick={submitComment}
              disabled={!newText.trim() || submitting}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                background: newText.trim() ? 'var(--rally-accent, #e8c9a0)' : 'rgba(255,255,255,0.08)',
                color: newText.trim() ? '#1a3a4a' : 'rgba(255,255,255,0.3)',
                fontSize: 13,
                fontWeight: 700,
                cursor: newText.trim() ? 'pointer' : 'default',
                fontFamily: 'inherit',
              }}
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
          {error && (
            <div style={{ fontSize: 11, color: '#ff8a8a', textAlign: 'center' }}>{error}</div>
          )}
        </div>
      )}

      {/* Feed */}
      {comments.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '20px 0',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 12,
          }}
        >
          No activity yet — be the first to RSVP or drop a comment 👇
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {comments.map((c, i) => {
            const isRsvp = c.type === 'rsvp';
            const reactionMap = new Map<string, number>();
            for (const r of c.reactions || []) {
              reactionMap.set(r.emoji, (reactionMap.get(r.emoji) || 0) + 1);
            }

            return (
              <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                <Avatar
                  initials={c.user.display_name.charAt(0).toUpperCase()}
                  color={COLORS[i % COLORS.length]}
                  size={32}
                  border="none"
                  photoUrl={c.user.profile_photo_url}
                  style={{ marginTop: 1 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                      {c.user.display_name}
                    </span>
                    {isRsvp && (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
                        {c.text}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 9,
                        color: 'rgba(255,255,255,0.3)',
                        marginLeft: 'auto',
                        flexShrink: 0,
                      }}
                    >
                      {timeAgo(c.created_at)}
                    </span>
                  </div>
                  {!isRsvp && (
                    <div
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.85)',
                        marginTop: 2,
                        lineHeight: 1.45,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {c.text}
                    </div>
                  )}
                  {reactionMap.size > 0 && (
                    <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                      {Array.from(reactionMap.entries()).map(([emoji, count]) => {
                        const isLiked = liked.has(`${c.id}-${emoji}`);
                        return (
                          <button
                            key={emoji}
                            onClick={() => toggleLike(c.id, emoji)}
                            style={{
                              background: isLiked
                                ? 'rgba(232,201,160,.2)'
                                : 'rgba(255,255,255,.05)',
                              border: isLiked
                                ? '1px solid rgba(232,201,160,.3)'
                                : '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 10,
                              padding: '1px 6px',
                              cursor: 'pointer',
                              fontSize: 11,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              fontFamily: 'inherit',
                            }}
                          >
                            <span>{emoji}</span>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>
                              {count + (isLiked ? 1 : 0)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
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
