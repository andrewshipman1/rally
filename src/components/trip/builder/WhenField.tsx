'use client';

// Merged "when" field. Two native <input type="date"> elements styled
// as a single field displaying "May 29 → Jun 1". Tap opens the start
// picker; after selecting start, auto-focuses the end picker. End date
// min = start date.

import { useRef } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  dateStart: string | null;
  dateEnd: string | null;
  onDateStartChange: (next: string) => void;
  onDateEndChange: (next: string) => void;
};

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function WhenField({
  themeId,
  dateStart,
  dateEnd,
  onDateStartChange,
  onDateEndChange,
}: Props) {
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const hasStart = !!dateStart;
  const hasEnd = !!dateEnd;
  const filled = hasStart || hasEnd;

  const displayText = hasStart && hasEnd
    ? `${formatDate(dateStart)} ${getCopy(themeId, 'builderState.whenArrow')} ${formatDate(dateEnd)}`
    : hasStart
      ? `${formatDate(dateStart)} ${getCopy(themeId, 'builderState.whenArrow')} …`
      : null;

  const handleTap = () => {
    startRef.current?.showPicker();
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onDateStartChange(val);
    // Auto-advance to end picker after selecting start
    if (val) {
      setTimeout(() => endRef.current?.showPicker(), 100);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateEndChange(e.target.value);
  };

  const className = [
    'field',
    'field-when',
    filled ? 'filled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className} onClick={!filled ? handleTap : undefined}>
      <div className="field-label">{getCopy(themeId, 'builderState.fieldLabel.when')}</div>
      {filled ? (
        <div className="when-display" onClick={handleTap}>
          <span className="field-input when-text">{displayText}</span>
          {/* Hidden native date inputs */}
          <input
            ref={startRef}
            type="date"
            className="when-hidden-input"
            value={dateStart ?? ''}
            onChange={handleStartChange}
          />
          <input
            ref={endRef}
            type="date"
            className="when-hidden-input"
            value={dateEnd ?? ''}
            min={dateStart ?? undefined}
            onChange={handleEndChange}
          />
        </div>
      ) : (
        <>
          <div className="placeholder" onClick={handleTap}>
            {getCopy(themeId, 'builderState.whenFieldPlaceholder')}
          </div>
          <input
            ref={startRef}
            type="date"
            className="when-hidden-input"
            value={dateStart ?? ''}
            onChange={handleStartChange}
          />
          <input
            ref={endRef}
            type="date"
            className="when-hidden-input"
            value={dateEnd ?? ''}
            min={dateStart ?? undefined}
            onChange={handleEndChange}
          />
        </>
      )}
    </div>
  );
}
