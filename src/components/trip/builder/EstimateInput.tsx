'use client';

// Shared input: single ~$ estimate field. Used by provisions +
// activities + other in the Session 8P "everything else" module.
// Session 8P: display uses toLocaleString() when blurred so large
// numbers read "~$50,000" instead of "~$50000". Input stays raw
// numeric while focused.

import { useRef, useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  /** Optional helper copy rendered below the input row. */
  hint?: string;
};

export function EstimateInput({ themeId, label, value, onChange, placeholder, hint }: Props) {
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filled = value !== null && value > 0;

  const handleActivate = () => {
    setActive(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Session 8P — display formatting on blur. The <input type="number">
  // keeps a raw numeric value while active; when blurred, we swap in a
  // formatted readonly span so "50000" renders as "50,000".
  const formattedValue = value !== null ? value.toLocaleString('en-US') : '';

  return (
    <div
      className={`estimate-input ${filled ? 'filled' : ''} ${active ? 'active' : ''}`}
      onClick={!active ? handleActivate : undefined}
    >
      <div className="field-label">{label}</div>
      <div className="estimate-input-row">
        <span className="estimate-prefix">
          {getCopy(themeId, 'builderState.estimatePrefix')}
        </span>
        {active ? (
          <input
            ref={inputRef}
            type="number"
            className="estimate-field"
            value={value ?? ''}
            placeholder={placeholder ?? (getCopy(themeId, 'builderState.estimatePlaceholder') as string)}
            onChange={(e) => {
              const n = e.target.value ? Number(e.target.value) : null;
              onChange(n);
            }}
            onBlur={() => setActive(false)}
            min={0}
          />
        ) : filled ? (
          <span className="estimate-display">{formattedValue}</span>
        ) : (
          <span className="placeholder">
            {placeholder ?? getCopy(themeId, 'builderState.estimatePlaceholder')}
          </span>
        )}
      </div>
      {hint && <p className="estimate-input-hint">{hint}</p>}
    </div>
  );
}
