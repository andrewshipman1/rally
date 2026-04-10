'use client';

// The sketch-state "the crew" dashed box. Shows existing member
// initials in an avatar cascade plus a '+' button that opens the
// invite modal (share link + email invite).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import { InviteModal } from './InviteModal';

type MemberLite = {
  id: string;
  user_id: string;
  user: { display_name: string | null } | null;
};

type Props = {
  themeId: ThemeId;
  tripId: string;
  slug: string;
  members: MemberLite[];
  organizerId: string;
};

function initial(m: MemberLite): string {
  const name = m.user?.display_name ?? '?';
  return name.slice(0, 1).toUpperCase();
}

export function SketchCrewField({ themeId, tripId, slug, members, organizerId }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

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
    <>
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
            onClick={() => setModalOpen(true)}
            aria-label={getCopy(themeId, 'builderState.shareLinkCopyAction')}
          >
            {getCopy(themeId, 'builderState.inviteButton')}
          </button>
        </div>
        <div className="crew-helper">
          {getCopy(themeId, 'builderState.crewHelper')}
        </div>
      </div>

      <InviteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tripId={tripId}
        slug={slug}
        themeId={themeId}
        onInvited={() => router.refresh()}
      />
    </>
  );
}
