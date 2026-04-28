'use client';

// Per-card kebab menu for organizer-owned dashboard trips.
// Three single-item variants gated by phase + archive state:
//   delete    — sketch only, two-tap confirm (auto-reverts after 3s)
//   archive   — sell+, fires immediately
//   unarchive — already archived, fires immediately
// Lives inside a parent <Link>, so all clicks stop propagation to keep
// the card from navigating when interacting with the menu.

import { useEffect, useRef, useState, useTransition } from 'react';
import { deleteTrip } from '@/app/actions/delete-trip';
import { archiveTrip, unarchiveTrip } from '@/app/actions/archive-trip';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Variant = 'delete' | 'archive' | 'unarchive';
type State = 'closed' | 'open' | 'confirming-delete';

const CONFIRM_TIMEOUT_MS = 3000;

export function TripCardMenu({
  tripId,
  variant,
  themeId,
}: {
  tripId: string;
  variant: Variant;
  themeId: ThemeId;
}) {
  const [state, setState] = useState<State>('closed');
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLButtonElement>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Click-outside + Esc close
  useEffect(() => {
    if (state === 'closed') return;

    function handlePointer(e: MouseEvent | TouchEvent) {
      if (containerRef.current?.contains(e.target as Node)) return;
      setState('closed');
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setState('closed');
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [state]);

  // Focus the menu item once the menu opens for keyboard nav
  useEffect(() => {
    if (state === 'open' || state === 'confirming-delete') {
      itemRef.current?.focus();
    }
  }, [state]);

  // Auto-revert from confirming back to open after timeout
  useEffect(() => {
    if (state !== 'confirming-delete') return;
    confirmTimerRef.current = setTimeout(() => {
      setState('open');
    }, CONFIRM_TIMEOUT_MS);
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, [state]);

  function stop(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function toggleMenu(e: React.MouseEvent) {
    stop(e);
    setError(false);
    setState((s) => (s === 'closed' ? 'open' : 'closed'));
  }

  function handleDeleteClick(e: React.MouseEvent) {
    stop(e);
    if (state === 'open') {
      setState('confirming-delete');
      return;
    }
    // confirming-delete → fire
    startTransition(async () => {
      const result = await deleteTrip({ tripId });
      if (!result.ok) {
        setError(true);
        setState('open');
      }
      // success → page revalidates; component unmounts with the card
    });
  }

  function handleArchiveClick(e: React.MouseEvent) {
    stop(e);
    startTransition(async () => {
      const result = await archiveTrip({ tripId });
      if (!result.ok) {
        setError(true);
      } else {
        setState('closed');
      }
    });
  }

  function handleUnarchiveClick(e: React.MouseEvent) {
    stop(e);
    startTransition(async () => {
      const result = await unarchiveTrip({ tripId });
      if (!result.ok) {
        setError(true);
      } else {
        setState('closed');
      }
    });
  }

  const isOpen = state !== 'closed';

  // Item content depends on variant + state
  let itemCopy: string;
  let itemClass: string;
  let itemHandler: (e: React.MouseEvent) => void;
  if (error) {
    itemCopy = getCopy(themeId, 'dashboard.menu.error');
    itemClass = 'dash-card-menu-item';
    itemHandler = (e) => stop(e);
  } else if (variant === 'delete') {
    if (state === 'confirming-delete') {
      itemCopy = getCopy(themeId, 'dashboard.menu.confirmDelete');
      itemClass = 'dash-card-menu-item danger confirming';
    } else {
      itemCopy = getCopy(themeId, 'dashboard.menu.deleteTrip');
      itemClass = 'dash-card-menu-item danger';
    }
    itemHandler = handleDeleteClick;
  } else if (variant === 'archive') {
    itemCopy = getCopy(themeId, 'dashboard.menu.archiveTrip');
    itemClass = 'dash-card-menu-item';
    itemHandler = handleArchiveClick;
  } else {
    itemCopy = getCopy(themeId, 'dashboard.menu.unarchiveTrip');
    itemClass = 'dash-card-menu-item';
    itemHandler = handleUnarchiveClick;
  }

  return (
    <div
      ref={containerRef}
      className="dash-card-menu-wrap"
      onClick={stop}
      onMouseDown={stop}
    >
      <button
        type="button"
        className={`dash-card-kebab${isOpen ? ' active' : ''}`}
        aria-label="trip options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
      >
        ⋯
      </button>

      {isOpen && (
        <div className="dash-card-menu" role="menu">
          <button
            ref={itemRef}
            type="button"
            role="menuitem"
            className={itemClass}
            disabled={pending}
            onClick={itemHandler}
          >
            {itemCopy}
          </button>
        </div>
      )}
    </div>
  );
}
