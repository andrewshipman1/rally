'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Comment, User } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Avatar } from '@/components/ui/Avatar';

const COLORS = ['#2d6b5a', '#c4956a', '#3a8a7a', '#d4a574', '#1a3d4a', '#8b6f5c'];

type ActivityItem = Comment & { user: User };

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
  currentUserId,
}: {
  comments: ActivityItem[];
  tripId: string;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const sorted = [...initialComments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const [comments, setComments] = useState<ActivityItem[]>(sorted);
  const [composing, setComposing] = useState(false);
  const [newText, setNewText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const next = [...initialComments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setComments(next);
  }, [initialComments]);

  useEffect(() => {
    if (!currentUserId) return;
    const id = setInterval(() => router.refresh(), 30_000);
    return () => clearInterval(id);
  }, [currentUserId, router]);

  const submitComment = async () => {
    if (!newText.trim() || !currentUserId) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, text: newText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setComments((prev) => [data.comment as ActivityItem, ...prev]);
      setNewText('');
      setComposing(false);
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <SectionLabel icon="📣" text="Activity" />
        {!composing && currentUserId && (
          <button
            onClick={() => setComposing(true)}
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

      {!currentUserId && (
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px dashed rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: '10px 12px',
            marginBottom: 12,
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
          }}
        >
          RSVP first to join the chat
        </div>
      )}

      {composing && currentUserId && (
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
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Drop some hype..."
            rows={3}
            maxLength={1000}
            style={{
              ...inputStyle,
              resize: 'vertical',
              lineHeight: 1.4,
            }}
          />
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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
            <span
              style={{
                fontSize: 10,
                color: newText.length > 1000 ? '#ff8a8a' : 'rgba(255,255,255,0.45)',
                fontFamily: 'inherit',
                minWidth: 56,
                textAlign: 'right',
              }}
            >
              {newText.length}/1000
            </span>
            <button
              onClick={submitComment}
              disabled={!newText.trim() || submitting || newText.length > 1000}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                background:
                  newText.trim() && newText.length <= 1000
                    ? 'var(--rally-accent, #e8c9a0)'
                    : 'rgba(255,255,255,0.08)',
                color:
                  newText.trim() && newText.length <= 1000
                    ? '#1a3a4a'
                    : 'rgba(255,255,255,0.3)',
                fontSize: 13,
                fontWeight: 700,
                cursor:
                  newText.trim() && newText.length <= 1000 ? 'pointer' : 'default',
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
