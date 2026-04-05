'use client';

import type { TripMember, User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';

export function CollageAvatars({
  members,
  primary,
}: {
  members: (TripMember & { user: User })[];
  primary: string;
}) {
  // Avatar color palette
  const colors = ['#2d6b5a', '#c4956a', '#3a8a7a', '#d4a574', '#1a3d4a', '#8b6f5c'];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
      {members.map((m, i) => (
        <div
          key={m.id}
          style={{
            animation: `popIn .45s cubic-bezier(.16,1,.3,1) ${0.5 + i * 0.07}s both`,
          }}
        >
          <Avatar
            initials={m.user.display_name.charAt(0).toUpperCase()}
            color={colors[i % colors.length]}
            size={30}
            border={`2px solid ${primary}`}
            photoUrl={m.user.profile_photo_url}
            style={{ marginLeft: i ? -7 : 0, zIndex: 10 - i }}
          />
        </div>
      ))}
    </div>
  );
}
