'use client';

// Sketch-state sticky bottom bar. Four buttons:
// ← back | 🎨 theme | save draft | publish →
//
// Back navigates to dashboard. Theme opens ThemePickerSheet.
// Save draft flushes autosave. Publish transitions sketch → sell,
// gated on `ready` (name + date required).

import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  ready: boolean;
  onBack?: () => void;
  onThemeOpen?: () => void;
  onManualSave?: () => void;
  onPublish?: () => void;
};

export function BuilderStickyBar({
  themeId,
  ready,
  onBack,
  onThemeOpen,
  onManualSave,
  onPublish,
}: Props) {
  return (
    <div className="sticky">
      <button
        type="button"
        className="sticky-icon"
        onClick={onBack}
        aria-label="back to dashboard"
      >
        {getCopy(themeId, 'builderState.stickyBack')}
      </button>
      <button
        type="button"
        className="sticky-icon"
        onClick={onThemeOpen}
        aria-label="pick theme"
      >
        {getCopy(themeId, 'builderState.stickyTheme')}
      </button>
      <button
        type="button"
        className="sticky-draft"
        onClick={onManualSave}
      >
        {getCopy(themeId, 'builderState.stickyDraft')}
      </button>
      <button
        type="button"
        className={`sticky-publish${ready ? '' : ' disabled'}`}
        disabled={!ready}
        onClick={onPublish}
      >
        {ready
          ? getCopy(themeId, 'builderState.stickyPublish')
          : getCopy(themeId, 'builderState.stickyPublishDisabled')}
      </button>
    </div>
  );
}
