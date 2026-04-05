'use client';

import { useState } from 'react';
import type { Poll, PollVote, TripMember, User } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Avatar } from '@/components/ui/Avatar';

const COLORS = ['#2d6b5a', '#c4956a', '#3a8a7a', '#d4a574', '#1a3d4a', '#8b6f5c'];

export function DatePoll({
  poll,
  members,
}: {
  poll: Poll & { poll_votes: (PollVote & { user: User })[] };
  members: (TripMember & { user: User })[];
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (optionId: string) => {
    setSelected((prev) =>
      prev.includes(optionId) ? prev.filter((x) => x !== optionId) : [...prev, optionId]
    );
  };

  // Count votes per option
  const voteCounts: Record<string, { count: number; voters: User[] }> = {};
  for (const option of poll.options) {
    voteCounts[option.id] = { count: 0, voters: [] };
  }
  for (const vote of poll.poll_votes || []) {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {poll.options.map((option) => {
          const sel = selected.includes(option.id);
          const votes = voteCounts[option.id] || { count: 0, voters: [] };

          return (
            <button
              key={option.id}
              onClick={() => toggle(option.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 11,
                border: 'none',
                background: sel ? 'rgba(232,201,160,.18)' : 'rgba(255,255,255,.05)',
                cursor: 'pointer',
                transition: 'all .25s',
                outline: sel
                  ? '2px solid rgba(232,201,160,.45)'
                  : '1px solid rgba(255,255,255,0.1)',
                transform: sel ? 'scale(1.015)' : 'none',
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
                  {sel && <span style={{ color: '#1a3a4a', fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
