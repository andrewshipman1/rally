'use client';

// Shared input: paste a URL or enter details manually. Used by
// lodging module in Session 8. Standalone for now.

import { useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type SubmitData = {
  url?: string;
  name?: string;
  price?: number;
};

type Props = {
  themeId: ThemeId;
  label: string;
  onSubmit: (data: SubmitData) => void;
};

export function LinkPasteInput({ themeId, label, onSubmit }: Props) {
  const [mode, setMode] = useState<'link' | 'manual'>('link');
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleLinkSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onSubmit({ url: trimmed });
    setUrl('');
  };

  const handleManualSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSubmit({
      name: trimmedName,
      price: price ? Number(price) : undefined,
    });
    setName('');
    setPrice('');
  };

  return (
    <div className="link-paste-input">
      <div className="field-label">{label}</div>

      {mode === 'link' ? (
        <div className="link-paste-url-row">
          <input
            type="url"
            className="link-paste-field"
            placeholder={getCopy(themeId, 'builderState.linkPastePlaceholder') as string}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleLinkSubmit();
              }
            }}
          />
          <button
            type="button"
            className="link-paste-toggle"
            onClick={() => setMode('manual')}
          >
            {getCopy(themeId, 'builderState.linkManualToggle')}
          </button>
        </div>
      ) : (
        <div className="link-paste-manual-row">
          <input
            type="text"
            className="link-paste-field"
            placeholder={getCopy(themeId, 'builderState.linkNamePlaceholder') as string}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleManualSubmit();
              }
            }}
          />
          <input
            type="number"
            className="link-paste-price"
            placeholder={getCopy(themeId, 'builderState.linkPricePlaceholder') as string}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={0}
          />
          <button
            type="button"
            className="link-paste-toggle"
            onClick={() => setMode('link')}
          >
            {getCopy(themeId, 'builderState.linkPastePlaceholder')}
          </button>
        </div>
      )}
    </div>
  );
}
