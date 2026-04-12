'use client';

// Sketch-phase invite roster. A lightweight name list where the
// organizer jots down who they plan to invite. Not user accounts —
// just strings. The going row avatar circles return in sell+.

import { useRef, useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  organizerName: string;
  rosterNames: string[];
  onAdd: (name: string) => void;
  onRemove: (index: number) => void;
};

export function InviteRoster({ themeId, organizerName, rosterNames, onAdd, onRemove }: Props) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInputValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="invite-roster">
      <div className="field-label">
        {getCopy(themeId, 'builderState.rosterLabel')}
      </div>

      <div className="roster-list">
        {/* Organizer — always first, not removable */}
        <div className="roster-item roster-item--organizer">
          <span className="roster-name">{getCopy(themeId, 'builderState.rosterYou')}</span>
        </div>

        {/* Added names */}
        {rosterNames.map((name, i) => (
          <div key={`${name}-${i}`} className="roster-item">
            <span className="roster-name">{name}</span>
            <button
              type="button"
              className="roster-remove"
              onClick={() => onRemove(i)}
              aria-label={`remove ${name}`}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add input */}
        <div className="roster-item roster-item--add">
          <input
            ref={inputRef}
            type="text"
            className="roster-add-input"
            placeholder={getCopy(themeId, 'builderState.rosterAddPlaceholder') as string}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
