'use client';

// Passport drawer — slides up from the bottom when a crew avatar is tapped.
// Shows the member's photo, name, bio, and social links (instagram, tiktok).
// Read-only; the full /passport page is the edit surface.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { User } from '@/types';

type Props = {
  open: boolean;
  onClose: () => void;
  user: User | null;
};

export function PassportDrawer({ open, onClose, user }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate in after mount — setTimeout ensures the browser has painted
  // the initial translateY(100%) frame before we flip to translateY(0).
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(id);
    } else {
      setVisible(false);
    }
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted || !open || !user) return null;

  const initial = user.display_name?.charAt(0).toUpperCase() ?? '?';
  const hasSocials = user.instagram_handle || user.tiktok_handle;

  return createPortal(
    <div className="passport-drawer-backdrop" onClick={onClose}>
      <div
        className={`passport-drawer-panel${visible ? ' passport-drawer-panel--open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="passport-drawer-handle" />

        {/* Avatar */}
        <div className="passport-drawer-avatar">
          {user.profile_photo_url ? (
            <div
              className="passport-drawer-photo"
              style={{ backgroundImage: `url(${user.profile_photo_url})` }}
            />
          ) : (
            <div className="passport-drawer-initial">{initial}</div>
          )}
        </div>

        {/* Name */}
        <h2 className="passport-drawer-name">{user.display_name}</h2>

        {/* Bio */}
        {user.bio && (
          <p className="passport-drawer-bio">{user.bio}</p>
        )}

        {/* Socials */}
        {hasSocials && (
          <div className="passport-drawer-socials">
            {user.instagram_handle && (
              <a
                href={`https://instagram.com/${user.instagram_handle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="passport-drawer-social"
              >
                <span className="passport-drawer-social-icon">📸</span>
                <span>@{user.instagram_handle.replace(/^@/, '')}</span>
              </a>
            )}
            {user.tiktok_handle && (
              <a
                href={`https://tiktok.com/@${user.tiktok_handle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="passport-drawer-social"
              >
                <span className="passport-drawer-social-icon">🎵</span>
                <span>@{user.tiktok_handle.replace(/^@/, '')}</span>
              </a>
            )}
          </div>
        )}

        {/* Empty state when no bio/socials */}
        {!user.bio && !hasSocials && (
          <p className="passport-drawer-empty">no passport yet — they&apos;re mysterious like that</p>
        )}
      </div>
    </div>,
    document.body,
  );
}
