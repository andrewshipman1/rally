'use client';

// Sketch-state sticky bottom bar. Two buttons: a ✏️ manual flush
// (safety net — autosave is primary) and a wide "send it" CTA that
// starts dashed + disabled and flips to solid + accent when the
// ungate rule is met.
//
// `ready` is passed from the parent (SketchTripShell) so it can
// update optimistically as the user types, without waiting for a
// server round-trip.

import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  ready: boolean;
  onManualSave?: () => void;
  onSendIt?: () => void;
};

export function BuilderStickyBar({ themeId, ready, onManualSave, onSendIt }: Props) {
  return (
    <div className="sticky">
      <button
        type="button"
        className="save-draft"
        onClick={onManualSave}
        aria-label={getCopy(themeId, 'builderState.saveDraftButton')}
      >
        {getCopy(themeId, 'builderState.saveDraftButton')}
      </button>
      <button
        type="button"
        className={`send${ready ? '' : ' disabled'}`}
        disabled={!ready}
        onClick={onSendIt}
      >
        {ready
          ? getCopy(themeId, 'builderState.ctaReady')
          : getCopy(themeId, 'builderState.ctaDisabled')}
      </button>
    </div>
  );
}
