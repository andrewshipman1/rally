'use client';

// Clickable avatar wrapper. Used in both the going row and crew section
// to make avatars open the passport drawer on tap.

import type { User } from '@/types';
import { usePassport } from './PassportContext';

type Props = {
  user: User;
  children: React.ReactNode;
};

export function CrewAvatarTap({ user, children }: Props) {
  const { openPassport } = usePassport();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        openPassport(user);
      }}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'inline-flex',
      }}
      title={user.display_name}
    >
      {children}
    </button>
  );
}
