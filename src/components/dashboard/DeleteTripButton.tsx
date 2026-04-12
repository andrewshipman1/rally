'use client';

import { useRef, useState, useTransition, type ReactNode } from 'react';
import { deleteTrip } from '@/app/actions/delete-trip';
import { getCopy } from '@/lib/copy/get-copy';

const LONG_PRESS_MS = 500;

export function SwipeableCard({
  tripId,
  children,
}: {
  tripId: string;
  children: ReactNode;
}) {
  const [showX, setShowX] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moved = useRef(false);

  function startPress() {
    moved.current = false;
    timerRef.current = setTimeout(() => {
      if (!moved.current) setShowX(true);
    }, LONG_PRESS_MS);
  }

  function cancelPress() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function onMove() {
    moved.current = true;
    cancelPress();
  }

  function handleXTap(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(true);
  }

  function handleConfirm(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError(false);
    startTransition(async () => {
      const result = await deleteTrip({ tripId });
      if (!result.ok) {
        setError(true);
      }
    });
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(false);
    setShowX(false);
  }

  // Dismiss overlay if tapping outside the X
  function handleOverlayTap(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setShowX(false);
    }
  }

  return (
    <div
      className="dash-swipe-wrapper"
      onTouchStart={startPress}
      onTouchMove={onMove}
      onTouchEnd={cancelPress}
      onMouseDown={startPress}
      onMouseMove={onMove}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
    >
      {children}

      {/* Long-press overlay */}
      {showX && (
        <div className="dash-delete-overlay" onClick={handleOverlayTap}>
          {confirming ? (
            <div className="dash-delete-overlay-confirm" onClick={(e) => e.stopPropagation()}>
              <span className="dash-delete-overlay-prompt">
                {error ? 'something went wrong' : getCopy('just-because', 'dashboard.deleteConfirm')}
              </span>
              <div className="dash-delete-overlay-actions">
                <button
                  type="button"
                  className="dash-delete-yes"
                  disabled={pending}
                  onClick={handleConfirm}
                >
                  {getCopy('just-because', 'dashboard.deleteYes')}
                </button>
                <button
                  type="button"
                  className="dash-delete-no"
                  disabled={pending}
                  onClick={handleCancel}
                >
                  {getCopy('just-because', 'dashboard.deleteNo')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="dash-delete-x"
              onClick={handleXTap}
              aria-label="delete draft"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
