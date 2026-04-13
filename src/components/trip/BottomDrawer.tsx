'use client';

// Generic bottom drawer / sheet. Slides up from bottom with dark
// overlay backdrop, drag handle, drag-to-dismiss. Based on the
// PassportDrawer pattern (portal + CSS transitions).

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Theme ID — wraps content in a chassis div so .chassis-scoped CSS applies inside the portal */
  themeId?: string;
};

export function BottomDrawer({ open, onClose, title, children, themeId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate in after portal mounts
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

  // Drag-to-dismiss handlers
  function handleTouchStart(e: React.TouchEvent) {
    dragStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (dragStartY.current === null || !panelRef.current) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) {
      panelRef.current.style.transform = `translateY(${dy}px)`;
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (dragStartY.current === null || !panelRef.current) return;
    const dy = e.changedTouches[0].clientY - dragStartY.current;
    dragStartY.current = null;
    if (dy > 80) {
      onClose();
    } else {
      panelRef.current.style.transform = '';
    }
  }

  if (!mounted || !open) return null;

  const drawer = (
    <div className="bottom-drawer-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className={`bottom-drawer-panel${visible ? ' bottom-drawer-panel--open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bottom-drawer-handle" />
        <div className="bottom-drawer-title">{title}</div>
        <div className="bottom-drawer-body">{children}</div>
      </div>
    </div>
  );

  // Wrap in chassis so .chassis-scoped CSS (lodging forms, invite inputs) applies inside the portal
  const wrapped = themeId ? (
    <div className="chassis" data-theme={themeId}>{drawer}</div>
  ) : drawer;

  return createPortal(wrapped, document.body);
}
