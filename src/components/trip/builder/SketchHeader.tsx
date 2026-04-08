'use client';

// The inline-editable field block that replaces the usual
// eyebrow + title + tagline layout inside .chassis .header when
// the trip is in sketch phase. Composes four InlineFields and a
// handwritten hint. State is fully lifted — the parent owns the
// values and the autosave queue.

import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import { InlineField } from './InlineField';

type Props = {
  themeId: ThemeId;
  name: string;
  tagline: string | null;
  destination: string | null;
  dateStart: string | null;
  onNameChange: (next: string) => void;
  onTaglineChange: (next: string) => void;
  onDestinationChange: (next: string) => void;
  onDateStartChange: (next: string) => void;
};

export function SketchHeader({
  themeId,
  name,
  tagline,
  destination,
  dateStart,
  onNameChange,
  onTaglineChange,
  onDestinationChange,
  onDateStartChange,
}: Props) {
  return (
    <>
      <InlineField
        variant="title"
        label={getCopy(themeId, 'builderState.fieldLabel.name')}
        placeholder={getCopy(themeId, 'builderState.titlePlaceholder')}
        value={name}
        onChange={onNameChange}
      />
      <div className="hint">{getCopy(themeId, 'builderState.titleHint')}</div>
      <InlineField
        variant="tagline"
        label={getCopy(themeId, 'builderState.fieldLabel.oneLine')}
        placeholder={getCopy(themeId, 'builderState.taglinePlaceholder')}
        value={tagline}
        onChange={onTaglineChange}
      />
      <div className="field-row">
        <InlineField
          variant="when"
          label={getCopy(themeId, 'builderState.fieldLabel.when')}
          placeholder={getCopy(themeId, 'builderState.whenFieldPlaceholder')}
          value={dateStart}
          inputType="date"
          onChange={onDateStartChange}
        />
        <InlineField
          variant="where"
          label={getCopy(themeId, 'builderState.fieldLabel.where')}
          placeholder={getCopy(themeId, 'builderState.whereFieldPlaceholder')}
          value={destination}
          onChange={onDestinationChange}
        />
      </div>
    </>
  );
}
