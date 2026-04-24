'use client';

// Sketch-state sticky bottom bar.
//
// Sketch mode (default): ← back | 🎨 theme | save draft | publish →
//   Back navigates to dashboard. Theme opens ThemePickerSheet.
//   Save draft flushes autosave. Publish transitions sketch → sell,
//   gated on `ready` (name + date required).
//
// Edit-on-sell mode (9W): ← back | 🎨 theme | done editing
//   Save-draft hidden (autosave-only; "draft" is sketch-specific).
//   Publish replaced by done-editing, always tappable (exit, not save).
//   Dark-mode bar treatment + hint banner signal the mode shift.

import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  ready: boolean;
  mode?: 'sketch' | 'edit-on-sell';
  onBack?: () => void;
  onThemeOpen?: () => void;
  onManualSave?: () => void;
  onPublish?: () => void;
  /** 9W — invoked by the done-editing pill in edit-on-sell mode. */
  onDone?: () => void;
};

export function BuilderStickyBar({
  themeId,
  ready,
  mode = 'sketch',
  onBack,
  onThemeOpen,
  onManualSave,
  onPublish,
  onDone,
}: Props) {
  const isEditMode = mode === 'edit-on-sell';

  return (
    <>
      {isEditMode && (
        <div className="sticky-edit-hint">
          {getCopy(themeId, 'builderState.editModeHint')}
        </div>
      )}
      <div className={`sticky${isEditMode ? ' sticky--edit-mode' : ''}`}>
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
        {!isEditMode && (
          <button
            type="button"
            className="sticky-draft"
            onClick={onManualSave}
          >
            {getCopy(themeId, 'builderState.stickyDraft')}
          </button>
        )}
        {isEditMode ? (
          <button
            type="button"
            className="sticky-done"
            onClick={onDone}
          >
            {getCopy(themeId, 'builderState.editModeDone')}
          </button>
        ) : (
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
        )}
      </div>
    </>
  );
}
