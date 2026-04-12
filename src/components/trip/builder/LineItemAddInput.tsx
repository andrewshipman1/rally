'use client';

// Shared input: name + optional cost line item. Used by flights,
// transportation, and activities modules in Session 8. Standalone for now.

import { useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type LineItem = {
  name: string;
  cost?: number;
};

type Props = {
  themeId: ThemeId;
  label: string;
  onAdd: (item: LineItem) => void;
  namePlaceholder?: string;
  costPlaceholder?: string;
};

export function LineItemAddInput({ themeId, label, onAdd, namePlaceholder, costPlaceholder }: Props) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({
      name: trimmed,
      cost: cost ? Number(cost) : undefined,
    });
    setName('');
    setCost('');
  };

  return (
    <div className="line-item-input">
      <div className="field-label">{label}</div>
      <div className="line-item-row">
        <input
          type="text"
          className="line-item-name"
          placeholder={namePlaceholder ?? (getCopy(themeId, 'builderState.lineItemNamePlaceholder') as string)}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <input
          type="number"
          className="line-item-cost"
          placeholder={costPlaceholder ?? (getCopy(themeId, 'builderState.lineItemCostPlaceholder') as string)}
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          min={0}
        />
        <button
          type="button"
          className="line-item-add-btn"
          onClick={handleAdd}
          disabled={!name.trim()}
        >
          {getCopy(themeId, 'builderState.lineItemAddButton')}
        </button>
      </div>
    </div>
  );
}
