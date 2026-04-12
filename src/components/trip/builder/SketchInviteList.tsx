'use client';

// Sketch-phase invite list. Shows real trip_members data (name +
// contact info + remove) instead of the old text-only roster.
// The "+" button opens InviteModal for share link or email invite.
// Organizer row is shown first and is not removable.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import { InviteModal } from './InviteModal';

type MemberWithUser = {
  id: string;
  user_id: string;
  role: string;
  user: { display_name: string | null; email: string | null; phone: string } | null;
};

type Props = {
  themeId: ThemeId;
  tripId: string;
  slug: string;
  members: MemberWithUser[];
  organizerId: string;
};

export function SketchInviteList({ themeId, tripId, slug, members, organizerId }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
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

  const guestCount = unique.filter((m) => m.user_id !== organizerId).length;
  const countLabel = getCopy(themeId, 'builderState.inviteListCount').replace('$1', String(guestCount));

  async function handleRemove(memberId: string) {
    setRemoving(memberId);
    try {
      const res = await fetch(`/api/invite?memberId=${memberId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setRemoving(null);
    }
  }

  function contactInfo(m: MemberWithUser): string | null {
    if (m.user?.email) return m.user.email;
    if (m.user?.phone && m.user.phone !== `email:${m.user.email}`) return m.user.phone;
    return null;
  }

  return (
    <>
      <div className="invite-roster">
        <div className="invite-roster-header">
          <span className="field-label">{getCopy(themeId, 'builderState.crewLabel')}</span>
          {guestCount > 0 && <span className="invite-roster-count">{countLabel}</span>}
        </div>

        <div className="roster-list">
          {unique.map((m) => {
            const isOrganizer = m.user_id === organizerId;
            const displayName = m.user?.display_name || '?';
            const contact = contactInfo(m);

            return (
              <div
                key={m.id}
                className={`roster-item${isOrganizer ? ' roster-item--organizer' : ''}`}
              >
                <div className="roster-item-info">
                  <span className="roster-name">{displayName}</span>
                  {isOrganizer ? (
                    <span className="roster-role">
                      {getCopy(themeId, 'builderState.inviteListOrganizer')}
                    </span>
                  ) : contact ? (
                    <span className="roster-contact">{contact}</span>
                  ) : null}
                </div>
                {!isOrganizer && (
                  <button
                    type="button"
                    className="roster-remove"
                    disabled={removing === m.id}
                    onClick={() => handleRemove(m.id)}
                    aria-label={getCopy(themeId, 'builderState.inviteListRemoveLabel')}
                  >
                    &times;
                  </button>
                )}
              </div>
            );
          })}

          <div className="roster-item roster-item--add">
            <button
              type="button"
              className="roster-add-btn"
              onClick={() => setModalOpen(true)}
            >
              {getCopy(themeId, 'builderState.inviteButton')}
            </button>
          </div>
        </div>
      </div>

      <InviteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tripId={tripId}
        slug={slug}
        themeId={themeId}
        onInvited={() => router.refresh()}
        hideShareTab
      />
    </>
  );
}
