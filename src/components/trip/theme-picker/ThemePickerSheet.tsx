'use client';

// Phase 6 — Theme picker bottom-sheet modal.
//
// Mounted inside SketchTripShell. The parent owns the previewThemeId +
// committedThemeId state so the chassis wrapper's `data-theme` always
// reflects `previewThemeId ?? committedThemeId` on every render — no
// imperative DOM mutation, no risk of a mid-preview React re-render
// stomping the preview.
//
// Interaction model:
//   - Tile click → setPreviewThemeId(id). Parent re-renders → chassis
//     data-theme swaps → CSS vars update → live preview behind sheet.
//   - Dismiss (backdrop / Esc / drag handle) → onClose() which sets
//     previewThemeId = null → chassis reverts to committed.
//   - Confirm → commitTripTheme server action → onCommitted(id) which
//     sets committedThemeId = next + previewThemeId = null. Sheet closes.
//
// Rendered via createPortal to document.body so the backdrop sits over
// the chassis wrapper, not inside it.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { themePicker } from '@/lib/copy/surfaces/theme-picker';
import { themeIds } from '@/lib/themes';
import { themesById } from '@/lib/themes';
import { themeCategories, type ThemeCategory } from '@/lib/themes/categories';
import type { ThemeId, ThemeVars, Templated } from '@/lib/themes/types';
import { commitTripTheme } from '@/app/actions/commit-trip-theme';
import { ThemePickerTile } from './ThemePickerTile';

type FilterKey = 'all' | ThemeCategory;

type Props = {
  open: boolean;
  onClose: () => void;
  committedThemeId: ThemeId;
  previewThemeId: ThemeId | null;
  setPreviewThemeId: (id: ThemeId | null) => void;
  tripId: string;
  tripName: string | null;
  slug: string;
  onCommitted: (next: ThemeId) => void;
  /**
   * Skip the server action on confirm — used by legacy editor paths
   * that have their own save pipeline. The sheet still calls
   * onCommitted so the parent can wire it into its own mutation.
   */
  localOnly?: boolean;
};

function renderTemplated(t: Templated | undefined, vars: ThemeVars = {}): string {
  if (t == null) return '';
  if (typeof t === 'string') return t;
  return t(vars);
}

export function ThemePickerSheet({
  open,
  onClose,
  committedThemeId,
  previewThemeId,
  setPreviewThemeId,
  tripId,
  tripName,
  slug,
  onCommitted,
  localOnly,
}: Props) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Portal needs to defer until after hydration.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to dismiss.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Clear error when the sheet reopens or preview changes.
  useEffect(() => {
    setError(null);
  }, [open, previewThemeId]);

  const tileGridRef = useRef<HTMLDivElement>(null);

  const handleTileKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const grid = tileGridRef.current;
      if (!grid) return;
      const tiles = Array.from(
        grid.querySelectorAll<HTMLButtonElement>('button.theme-picker-tile'),
      );
      if (tiles.length === 0) return;
      const idx = tiles.indexOf(document.activeElement as HTMLButtonElement);
      let next: number;
      if (e.key === 'ArrowDown') {
        next = idx < 0 ? 0 : Math.min(idx + 1, tiles.length - 1);
      } else {
        next = idx < 0 ? tiles.length - 1 : Math.max(idx - 1, 0);
      }
      tiles[next].focus();
    },
    [],
  );

  const activePreview = previewThemeId ?? committedThemeId;

  const visibleTiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return themeIds.filter((id) => {
      if (filter !== 'all' && !themeCategories[id].includes(filter)) return false;
      if (q) {
        const name = themesById[id].name.toLowerCase();
        if (!name.includes(q) && !id.includes(q)) return false;
      }
      return true;
    });
  }, [filter, query]);

  if (!mounted) return null;
  if (!open) return null;

  const dirty = previewThemeId != null && previewThemeId !== committedThemeId;

  async function onConfirm() {
    if (!dirty || pending) return;
    setPending(true);
    setError(null);
    try {
      const next = activePreview;
      if (!localOnly) {
        const result = await commitTripTheme(tripId, slug, next);
        if (!result.ok) {
          setError(result.error);
          setPending(false);
          return;
        }
      }
      onCommitted(next);
      setToast(
        renderTemplated(themePicker.confirmationToast, { trip_name: tripName ?? undefined }),
      );
      window.setTimeout(() => setToast(null), 2200);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'commit-failed');
    } finally {
      setPending(false);
    }
  }

  const filters: Array<{ key: FilterKey; label: string }> = [
    { key: 'all',        label: themePicker.filterAll as string },
    { key: 'weekends',   label: themePicker.filterWeekends as string },
    { key: 'bigTrips',   label: themePicker.filterBigTrips as string },
    { key: 'milestones', label: themePicker.filterMilestones as string },
    { key: 'chill',      label: themePicker.filterChill as string },
  ];

  const ctaLabel = dirty
    ? (themePicker.ctaPicked as string)
    : (themePicker.ctaDisabled as string);

  return createPortal(
    // Wrap in a .chassis + data-theme so the sheet's CSS vars
    // (var(--bg), var(--ink), var(--accent), etc.) resolve against
    // the live preview theme. Portals escape the SketchTripShell's
    // chassis wrapper, so without this the sheet would render with
    // :root defaults instead of the picked theme's palette.
    <div
      className="chassis"
      data-theme={activePreview}
      role="dialog"
      aria-modal="true"
      aria-label={themePicker.pageHeader as string}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop — dim + blur the chassis behind. */}
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.42)',
          backdropFilter: 'blur(1px) brightness(0.85)',
          WebkitBackdropFilter: 'blur(1px) brightness(0.85)',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'relative',
          maxHeight: '86vh',
          background: 'var(--bg)',
          color: 'var(--ink)',
          borderTop: '3px solid var(--ink)',
          borderRadius: '24px 24px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -20px 40px rgba(0,0,0,0.25)',
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 42,
            height: 4,
            background: 'var(--ink)',
            opacity: 0.25,
            borderRadius: 4,
            margin: '12px auto 8px',
          }}
        />

        {/* Header */}
        <div style={{ padding: '4px 20px 12px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              fontFamily: "'Fraunces', serif",
              color: 'var(--ink)',
            }}
          >
            {themePicker.pageHeader as string}
          </h2>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
            {themePicker.pageSubheader as string}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px 10px' }}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={themePicker.searchPlaceholder as string}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--stroke, rgba(0,0,0,0.2))',
              background: 'transparent',
              color: 'var(--ink)',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Filter pills */}
        <div
          role="tablist"
          style={{
            padding: '0 20px 12px',
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: '1px solid var(--stroke, rgba(0,0,0,0.2))',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'var(--on-surface, #fff)' : 'var(--ink)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textTransform: 'lowercase',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Tile list — single-column, scrollable. Per mockup: tiles are
            text-forward cards with the gradient as the full background,
            not miniature swatches in a multi-column grid. */}
        <div
          ref={tileGridRef}
          role="listbox"
          aria-label="Theme options"
          onKeyDown={handleTileKeyDown}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: 0,
          }}
        >
          {visibleTiles.map((id) => (
            <ThemePickerTile
              key={id}
              themeId={id}
              selected={activePreview === id}
              onClick={() => setPreviewThemeId(id)}
            />
          ))}
        </div>

        {/* Confirm bar */}
        <div
          style={{
            padding: '12px 20px calc(16px + env(safe-area-inset-bottom, 0px))',
            borderTop: '1px solid var(--stroke, rgba(0,0,0,0.15))',
            background: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.7, textAlign: 'center' }}>
            {themePicker.changeLaterHint as string}
          </div>
          {error && (
            <div
              role="alert"
              style={{
                fontSize: 11,
                color: '#c42',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={!dirty || pending}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 12,
              border: '2px solid var(--ink)',
              background: dirty ? 'var(--accent)' : 'var(--surface, rgba(0,0,0,0.05))',
              color: dirty ? 'var(--on-surface, #fff)' : 'var(--ink)',
              fontSize: 15,
              fontWeight: 800,
              cursor: dirty && !pending ? 'pointer' : 'default',
              opacity: dirty ? 1 : 0.5,
              fontFamily: 'inherit',
            }}
          >
            {pending ? '…' : ctaLabel}
          </button>
        </div>

        {toast && (
          <div
            role="status"
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--ink)',
              color: 'var(--bg)',
              padding: '8px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
