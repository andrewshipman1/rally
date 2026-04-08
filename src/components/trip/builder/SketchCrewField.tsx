'use client';

// The sketch-state "the crew" dashed box. Shows existing member
// initials in an avatar cascade plus a '+' button that copies the
// trip's invite link to the clipboard. Phase 4 does NOT ship an
// invite modal — the organizer shares the URL manually and invitees
// use the existing RSVP flow to join.

import { useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type MemberLite = {
  id: string;
  user_id: string;
  user: { display_name: string | null } | null;
};

type Props = {
  themeId: ThemeId;
  slug: string;
  members: MemberLite[];
  organizerId: string;
};

function initial(m: MemberLite): string {
  const name = m.user?.display_name ?? '?';
  return name.slice(0, 1).toUpperCase();
}

export function SketchCrewField({ themeId, slug, members, organizerId }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/trip/${slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failures are silent in phase 4 — the user can copy from the URL bar.
    }
  };

  // Organizer first, then everyone else. Dedupe by user_id.
  const seen = new Set<string>();
  const ordered = [...members].sort((a, b) => {
    if (a.user_id === organizerId) return -1;
    if (b.user_id === organizerId) return 1;
    return 0;
  });
  const unique = ordered.filter((m) => {
    if (seen.has(m.user_id)) return false;
    seen.add(m.user_id);
    return true;
  });

  return (
    <div className="field-crew">
      <div className="field-label">{getCopy(themeId, 'builderState.crewLabel')}</div>
      <div className="crew-row">
        {unique.map((m) => (
          <div key={m.id} className="av" style={{ background: 'var(--sticker-bg)' }}>
            {initial(m)}
          </div>
        ))}
        <button
          type="button"
          className="av av-add"
          onClick={handleCopy}
          aria-label={getCopy(themeId, 'builderState.shareLinkCopyAction')}
        >
          {getCopy(themeId, 'builderState.inviteButton')}
        </button>
      </div>
      <div className="crew-helper">
        {copied
          ? getCopy(themeId, 'builderState.shareLinkCopiedToast')
          : getCopy(themeId, 'builderState.crewHelper')}
      </div>
    </div>
  );
}
