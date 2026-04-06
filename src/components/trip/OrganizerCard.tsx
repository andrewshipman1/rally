import type { User } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

export function OrganizerCard({ organizer, tripName }: { organizer: User; tripName?: string }) {
  // Phones with `email:` prefix are placeholders for email-only users
  const realPhone =
    organizer.phone && !organizer.phone.startsWith('email:') ? organizer.phone : null;
  const messageHref = realPhone
    ? `sms:${realPhone}`
    : organizer.email
    ? `mailto:${organizer.email}?subject=${encodeURIComponent(`Question about ${tripName || 'your trip'}`)}`
    : null;

  return (
    <GlassCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar
          initials={organizer.display_name.charAt(0).toUpperCase()}
          color="#2d6b5a"
          size={44}
          border="2px solid rgba(255,255,255,.2)"
          photoUrl={organizer.profile_photo_url}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              {organizer.display_name}
            </span>
            <Badge text="Organizer" bg="rgba(45,107,90,.35)" color="#7ecdb8" />
          </div>
          {organizer.bio && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>
              {organizer.bio}
            </div>
          )}
        </div>
        {messageHref && (
          <a
            href={messageHref}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,0.1)',
              textDecoration: 'none',
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            💬
          </a>
        )}
      </div>
    </GlassCard>
  );
}
