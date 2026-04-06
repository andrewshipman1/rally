'use client';

import { useState } from 'react';
import type { Comment, User } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Avatar } from '@/components/ui/Avatar';

const COLORS = ['#2d6b5a', '#c4956a', '#3a8a7a', '#d4a574', '#1a3d4a', '#8b6f5c'];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'now';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function GroupChat({
  comments: initialComments,
  tripId,
}: {
  comments: (Comment & { user: User })[];
  tripId: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(new Set<string>());

  const addComment = () => {
    if (!newComment.trim()) return;
    // Client-side only for now — API integration comes in Step 19
    const tempComment = {
      id: `temp-${Date.now()}`,
      trip_id: tripId,
      user_id: 'temp',
      text: newComment,
      reactions: [],
      type: 'comment' as const,
      created_at: new Date().toISOString(),
      user: {
        id: 'temp',
        phone: '',
        email: null,
        display_name: 'You',
        profile_photo_url: null,
        bio: null,
        instagram_handle: null,
        tiktok_handle: null,
        dietary_restrictions: null,
        venmo_handle: null,
        created_at: '',
        updated_at: '',
      },
    };
    setComments((prev) => [...prev, tempComment]);
    setNewComment('');
  };

  const toggleLike = (commentIdx: number, emoji: string) => {
    const key = `${commentIdx}-${emoji}`;
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <GlassCard>
      <SectionLabel icon="💬" text="The group chat" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {comments.map((c, ci) => {
          // Group reactions by emoji
          const reactionMap = new Map<string, number>();
          for (const r of c.reactions || []) {
            reactionMap.set(r.emoji, (reactionMap.get(r.emoji) || 0) + 1);
          }

          return (
            <div key={c.id} style={{ display: 'flex', gap: 8 }}>
              <Avatar
                initials={c.user.display_name.charAt(0).toUpperCase()}
                color={COLORS[ci % COLORS.length]}
                size={26}
                border="none"
                photoUrl={c.user.profile_photo_url}
                style={{ marginTop: 1 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {c.user.display_name}
                  </span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,.2)' }}>
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', marginTop: 1, lineHeight: 1.45 }}>
                  {c.text}
                </div>
                {reactionMap.size > 0 && (
                  <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                    {Array.from(reactionMap.entries()).map(([emoji, count]) => {
                      const isLiked = liked.has(`${ci}-${emoji}`);
                      return (
                        <button
                          key={emoji}
                          onClick={() => toggleLike(ci, emoji)}
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
                            transition: 'all .2s',
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

      {/* Input */}
      <div style={{ display: 'flex', gap: 6, marginTop: 14, alignItems: 'center' }}>
        <Avatar initials="Y" color="#d4a574" size={24} border="none" />
        <div
          style={{
            flex: 1,
            display: 'flex',
            background: 'rgba(255,255,255,.05)',
            borderRadius: 11,
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addComment()}
            placeholder="Drop some hype..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 12,
              padding: '9px 10px',
              fontFamily: 'var(--rally-font-body)',
            }}
          />
          <button
            onClick={addComment}
            style={{
              background: newComment.trim() ? 'var(--rally-accent)' : 'transparent',
              border: 'none',
              color: newComment.trim() ? '#1a3a4a' : 'rgba(255,255,255,.15)',
              padding: '0 12px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'var(--rally-font-body)',
              transition: 'all .2s',
              borderRadius: '0 10px 10px 0',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
