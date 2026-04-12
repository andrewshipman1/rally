'use client';

// Shared input: single ~$ estimate field. Used by provisions module
// in Session 8. Standalone for now — not wired to any module.

import { useRef, useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
};

export function EstimateInput({ themeId, label, value, onChange, placeholder }: Props) {
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filled = value !== null && value > 0;

  const handleActivate = () => {
    setActive(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div
      className={`estimate-input ${filled ? 'filled' : ''} ${active ? 'active' : ''}`}
      onClick={!active && !filled ? handleActivate : undefined}
    >
      <div className="field-label">{label}</div>
      <div className="estimate-input-row">
        <span className="estimate-prefix">
          {getCopy(themeId, 'builderState.estimatePrefix')}
        </span>
        {active || filled ? (
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
        ) : (
          <span className="placeholder">
            {placeholder ?? getCopy(themeId, 'builderState.estimatePlaceholder')}
          </span>
        )}
      </div>
    </div>
  );
}
