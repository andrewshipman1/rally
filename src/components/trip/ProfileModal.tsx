'use client';

import type { User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';

export function ProfileModal({
  user,
  isOrganizer,
  onClose,
}: {
  user: User;
  isOrganizer: boolean;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'modalIn .3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 22,
          padding: '28px 24px',
          maxWidth: 320,
          width: '100%',
          textAlign: 'center',
          animation: 'modalPop .4s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <Avatar
          initials={user.display_name.charAt(0).toUpperCase()}
          color="#2d6b5a"
          size={72}
          border="3px solid #f0ebe5"
          photoUrl={user.profile_photo_url}
          style={{ margin: '0 auto 12px' }}
        />
        <div
          style={{
            fontFamily: 'var(--rally-font-display)',
            fontSize: 22,
            fontWeight: 700,
            color: '#1a3a4a',
          }}
        >
          {user.display_name}
        </div>
        {user.bio && (
          <div style={{ fontSize: 14, color: '#888', marginTop: 4, lineHeight: 1.4 }}>
            {user.bio}
          </div>
        )}
        {user.instagram_handle && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 13,
                color: '#2d6b5a',
                fontWeight: 600,
                background: '#e0f0eb',
                padding: '6px 14px',
                borderRadius: 10,
              }}
            >
              📸 {user.instagram_handle}
            </span>
          </div>
        )}
        {isOrganizer && (
          <div style={{ marginTop: 12 }}>
            <a
              href={`sms:${user.phone}`}
              style={{
                display: 'inline-block',
                fontSize: 13,
                color: '#fff',
                fontWeight: 600,
                textDecoration: 'none',
                background: '#2d6b5a',
                padding: '8px 18px',
                borderRadius: 10,
              }}
            >
              Message organizer 💬
            </a>
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            fontSize: 13,
            color: '#aaa',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--rally-font-body)',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
