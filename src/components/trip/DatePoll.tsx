'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Poll, PollVote, User } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Avatar } from '@/components/ui/Avatar';

const COLORS = ['#2d6b5a', '#c4956a', '#3a8a7a', '#d4a574', '#1a3d4a', '#8b6f5c'];

export function DatePoll({
  poll,
  currentUserId,
}: {
  poll: Poll & { votes: (PollVote & { user: User })[] };
  currentUserId: string | null;
}) {
  const router = useRouter();

  const myVote = currentUserId
    ? poll.votes?.find((v) => v.user_id === currentUserId)
    : null;
  const [selected, setSelected] = useState<string[]>(myVote?.selected_options || []);
  const [saving, setSaving] = useState(false);
  const [animating, setAnimating] = useState<string | null>(null);

  const persist = async (next: string[]) => {
    if (!currentUserId) return;
    setSaving(true);
    try {
      await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: poll.id, selectedOptions: next }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const toggle = (optionId: string) => {
    const next = selected.includes(optionId)
      ? selected.filter((x) => x !== optionId)
      : [...selected, optionId];
    setSelected(next);
    setAnimating(optionId);
    setTimeout(() => setAnimating(null), 200);
    persist(next);
  };

  // Count votes per option
  const voteCounts: Record<string, { count: number; voters: User[] }> = {};
  for (const option of poll.options) {
    voteCounts[option.id] = { count: 0, voters: [] };
  }
  for (const vote of poll.votes || []) {
    for (const optId of vote.selected_options) {
      if (voteCounts[optId]) {
        voteCounts[optId].count++;
        voteCounts[optId].voters.push(vote.user);
      }
    }
  }

  return (
    <GlassCard>
      <SectionLabel icon="📅" text={poll.question || 'Which dates work?'} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, opacity: saving ? 0.85 : 1 }}>
        {poll.options.map((option) => {
          const sel = selected.includes(option.id);
          const votes = voteCounts[option.id] || { count: 0, voters: [] };

          return (
            <button
              key={option.id}
              onClick={() => toggle(option.id)}
              disabled={saving || !currentUserId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 11,
                border: 'none',
                background: sel ? 'rgba(232,201,160,.18)' : 'rgba(255,255,255,.05)',
                cursor: currentUserId ? 'pointer' : 'default',
                transition: 'all .25s',
                outline: sel
                  ? '2px solid rgba(232,201,160,.45)'
                  : '1px solid rgba(255,255,255,0.1)',
                transform: sel ? 'scale(1.015)' : 'none',
                animation: animating === option.id ? 'poll-select 0.2s ease-out' : undefined,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'var(--rally-font-body)' }}>
                {option.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {votes.count > 0 && (
                  <div style={{ display: 'flex' }}>
                    {votes.voters.slice(0, 5).map((voter, i) => (
                      <Avatar
                        key={voter.id}
                        initials={voter.display_name.charAt(0).toUpperCase()}
                        color={COLORS[i % COLORS.length]}
                        size={16}
                        border="1.5px solid rgba(255,255,255,.1)"
                        photoUrl={voter.profile_photo_url}
                        style={{ marginLeft: i ? -5 : 0, fontSize: 8 }}
                      />
                    ))}
                  </div>
                )}
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{votes.count}</span>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    background: sel ? 'var(--rally-accent)' : 'rgba(255,255,255,.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all .2s',
                  }}
                >
                  {sel && <span style={{ color: '#1a3a4a', fontSize: 12, fontWeight: 700 }}>{'\u2713'}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
