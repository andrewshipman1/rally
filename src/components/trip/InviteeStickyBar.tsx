'use client';

// Phase 5 — invitee sticky bar. Two CTAs:
//
//   "can't make it"  — outline button, opens a tiny confirm modal that
//                      shows inviteeState.cantMakeItConfirm and routes
//                      to "/" on confirm. No DB write: the viewer has
//                      no identity yet, so there's nothing to persist.
//
//   "see the plan →" — primary pulsing CTA, a plain <Link> to
//                      /auth?trip=<slug>. The existing magic-link flow
//                      handles sign-in and routes the user back to the
//                      trip page as an authenticated viewer.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  slug: string;
  /** First-name form of the inviter for the decline-confirm copy. */
  inviterFirst: string | null;
};

export function InviteeStickyBar({ themeId, slug, inviterFirst }: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmMsg = getCopy(themeId, 'inviteeState.cantMakeItConfirm', {
    inviter_first: inviterFirst ?? undefined,
  });

  return (
    <>
      <div className="sticky">
        <button
          type="button"
          className="cant-make-it"
          onClick={() => setShowConfirm(true)}
        >
          {getCopy(themeId, 'inviteeState.secondaryCta')}
        </button>
        <Link href={`/auth?trip=${encodeURIComponent(slug)}`} className="see-plan">
          {getCopy(themeId, 'inviteeState.primaryCta')}
        </Link>
      </div>

      {showConfirm && (
        <div
          className="invitee-confirm-backdrop"
          onClick={() => setShowConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="invitee-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="invitee-confirm-msg">{confirmMsg}</div>
            <div className="invitee-confirm-actions">
              <button type="button" onClick={() => setShowConfirm(false)}>
                {getCopy(themeId, 'inviteeState.cantMakeItConfirmNo')}
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => router.push('/')}
              >
                {getCopy(themeId, 'inviteeState.cantMakeItConfirmYes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
