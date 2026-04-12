'use client';

// The inline-editable field block that replaces the usual
// eyebrow + title + tagline layout inside .chassis .header when
// the trip is in sketch state. Composes InlineFields for name,
// tagline, location, and RSVP-by deadline, plus the merged WhenField
// for dates. State is fully lifted — the parent owns the values and
// the autosave queue.

import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import { InlineField } from './InlineField';
import { WhenField } from './WhenField';

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

/** Return the day before `iso` as yyyy-mm-dd, or undefined. */
function dayBefore(iso: string | null): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

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
  const rsvpMax = dayBefore(dateStart);

  const handleDateStartChange = (v: string) => {
    onDateStartChange(v);
    // If RSVP deadline is on or after the new start, clear it
    if (commitDeadline && v && commitDeadline >= v) {
      onCommitDeadlineChange('');
    }
  };

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
      {/* Row 1: WHEN (wide) + RSVP BY */}
      <div className="field-row">
        <WhenField
          themeId={themeId}
          dateStart={dateStart}
          dateEnd={dateEnd}
          onDateStartChange={handleDateStartChange}
          onDateEndChange={onDateEndChange}
        />
        <InlineField
          variant="rsvp-by"
          label={getCopy(themeId, 'builderState.fieldLabel.rsvpBy')}
          placeholder={getCopy(themeId, 'builderState.rsvpByPlaceholder')}
          value={commitDeadline}
          inputType="date"
          onChange={onCommitDeadlineChange}
          max={rsvpMax}
        />
      </div>
      {/* Row 2: WHERE (full width) */}
      <InlineField
        variant="where"
        label={getCopy(themeId, 'builderState.fieldLabel.where')}
        placeholder={getCopy(themeId, 'builderState.whereFieldPlaceholder')}
        value={destination}
        onChange={onDestinationChange}
      />
    </>
  );
}
