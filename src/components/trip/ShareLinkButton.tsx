'use client';

// "Copy the invite link" button for sell+ trips. Copies the trip URL
// to clipboard and swaps the button text to a toast confirmation.

import { useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  slug: string;
  themeId: ThemeId;
};

export function ShareLinkButton({ slug, themeId }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/trip/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button type="button" className="share-btn" onClick={handleCopy}>
      {copied
        ? getCopy(themeId, 'toasts.linkCopied')
        : getCopy(themeId, 'tripPageShared.share.copy')}
    </button>
  );
}
