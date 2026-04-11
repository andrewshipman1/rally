'use client';

// Invite button for the inline crew section on the trip page.
// Opens the existing InviteModal (share link + email invite).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import { InviteModal } from './builder/InviteModal';

type Props = {
  tripId: string;
  slug: string;
  themeId: ThemeId;
};

export function CrewInviteButton({ tripId, slug, themeId }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button
          type="button"
          className="crew-invite-btn"
          onClick={() => setModalOpen(true)}
        >
          {getCopy(themeId, 'builderState.inviteButton')} {getCopy(themeId, 'tripPageShared.share.copy')}
        </button>
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
