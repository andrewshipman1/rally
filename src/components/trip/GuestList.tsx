import type { TripMember, User } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

const COLORS = ['#2d6b5a', '#c4956a', '#3a8a7a', '#d4a574', '#1a3d4a', '#8b6f5c'];

function rsvpBadge(status: string) {
  switch (status) {
    case 'in':
      return { text: "I'm in! ✈️", bg: 'rgba(45,107,90,.3)', color: '#7ecdb8' };
    case 'maybe':
      return { text: 'Maybe 🤔', bg: 'rgba(212,165,116,.3)', color: '#e8c9a0' };
    default:
      return { text: 'Waiting...', bg: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.3)' };
  }
}

export function GuestList({
  members,
  organizerId,
}: {
  members: (TripMember & { user: User })[];
  organizerId: string;
}) {
  return (
    <GlassCard>
      <SectionLabel icon="👥" text="Who's in?" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map((m, i) => {
          const badge = rsvpBadge(m.rsvp);
          return (
            <div
              key={m.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Avatar
                  initials={m.user.display_name.charAt(0).toUpperCase()}
                  color={COLORS[i % COLORS.length]}
                  size={32}
                  border="2px solid rgba(255,255,255,.15)"
                  photoUrl={m.user.profile_photo_url}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>
                      {m.user.display_name}
                    </span>
                    {m.user.id === organizerId && (
                      <Badge text="Organizer" bg="rgba(45,107,90,.3)" color="#7ecdb8" />
                    )}
                  </div>
                  {m.user.instagram_handle && (
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                      {m.user.instagram_handle}
                    </span>
                  )}
                </div>
              </div>
              <Badge text={badge.text} bg={badge.bg} color={badge.color} />
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
