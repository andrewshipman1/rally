'use client';

// The inline-editable field block that replaces the usual
// eyebrow + title + tagline layout inside .chassis .header when
// the trip is in sketch state. Composes InlineFields for name,
// tagline, start/end dates, location, and RSVP-by deadline.
// State is fully lifted — the parent owns the values and the
// autosave queue.

import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import { InlineField } from './InlineField';

type Props = {
  themeId: ThemeId;
  name: string;
  tagline: string | null;
  destination: string | null;
  dateStart: string | null;
  dateEnd: string | null;
  commitDeadline: string | null;
  onNameChange: (next: string) => void;
  onTaglineChange: (next: string) => void;
  onDestinationChange: (next: string) => void;
  onDateStartChange: (next: string) => void;
  onDateEndChange: (next: string) => void;
  onCommitDeadlineChange: (next: string) => void;
};

export function SketchHeader({
  themeId,
  name,
  tagline,
  destination,
  dateStart,
  dateEnd,
  commitDeadline,
  onNameChange,
  onTaglineChange,
  onDestinationChange,
  onDateStartChange,
  onDateEndChange,
  onCommitDeadlineChange,
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
          variant="start"
          label={getCopy(themeId, 'builderState.fieldLabel.start')}
          placeholder={getCopy(themeId, 'builderState.whenFieldPlaceholder')}
          value={dateStart}
          inputType="date"
          onChange={onDateStartChange}
        />
        <InlineField
          variant="end"
          label={getCopy(themeId, 'builderState.fieldLabel.end')}
          placeholder={getCopy(themeId, 'builderState.whenFieldPlaceholder')}
          value={dateEnd}
          inputType="date"
          onChange={onDateEndChange}
        />
        <InlineField
          variant="where"
          label={getCopy(themeId, 'builderState.fieldLabel.where')}
          placeholder={getCopy(themeId, 'builderState.whereFieldPlaceholder')}
          value={destination}
          onChange={onDestinationChange}
        />
      </div>
      <InlineField
        variant="rsvp-by"
        label={getCopy(themeId, 'builderState.fieldLabel.rsvpBy')}
        placeholder={getCopy(themeId, 'builderState.rsvpByPlaceholder')}
        value={commitDeadline}
        inputType="date"
        onChange={onCommitDeadlineChange}
      />
    </>
  );
}
