'use client';

// Invite modal — two tabs: share the trip link or send an email invite.
// Wired to POST /api/invite for email sends. The share tab uses
// navigator.share (mobile) with clipboard fallback.

import { useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  open: boolean;
  onClose: () => void;
  tripId: string;
  slug: string;
  themeId: ThemeId;
  onInvited: () => void;
  hideShareTab?: boolean;
  /** Render without the overlay wrapper — for embedding inside BottomDrawer */
  renderInline?: boolean;
};

type Tab = 'share' | 'email';

export function InviteModal({ open, onClose, tripId, slug, themeId, onInvited, hideShareTab, renderInline }: Props) {
  const [tab, setTab] = useState<Tab>(hideShareTab ? 'email' : 'share');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!open) return null;

  const tripUrl = `${window.location.origin}/trip/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tripUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the input text
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: tripUrl, title: 'Join my trip on Rally!' });
      } catch {
        // User cancelled share — no-op
      }
    } else {
      await handleCopy();
    }
  };

  const handleSendInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    setToast(null);

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          email: email.trim(),
          name: name.trim() || null,
        }),
      });

      const data = await res.json();

      if (data.alreadyInvited) {
        setToast(getCopy(themeId, 'builderState.inviteAlreadyInvited'));
      } else if (data.success) {
        setToast(getCopy(themeId, 'builderState.inviteSentToast'));
        setEmail('');
        setName('');
        onInvited();
      } else {
        setToast(getCopy(themeId, 'builderState.inviteError'));
      }
    } catch {
      setToast(getCopy(themeId, 'builderState.inviteError'));
    } finally {
      setSending(false);
    }
  };

  const content = (
    <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="invite-header">
        <span className="invite-title">
          {getCopy(themeId, 'builderState.inviteModalTitle')}
        </span>
        <button type="button" className="invite-close" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Tabs */}
      {!hideShareTab && (
        <div className="invite-tabs">
          <button
            type="button"
            className={`invite-tab${tab === 'share' ? ' active' : ''}`}
            onClick={() => setTab('share')}
          >
            {getCopy(themeId, 'builderState.inviteTabShare')}
          </button>
          <button
            type="button"
            className={`invite-tab${tab === 'email' ? ' active' : ''}`}
            onClick={() => setTab('email')}
          >
            {getCopy(themeId, 'builderState.inviteTabEmail')}
          </button>
        </div>
      )}

      {/* Share tab */}
      {tab === 'share' && (
        <div className="invite-body">
          <div className="invite-link-row">
            <input
              type="text"
              className="invite-link-input"
              value={tripUrl}
              readOnly
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button type="button" className="invite-copy-btn" onClick={handleCopy}>
              {copied
                ? getCopy(themeId, 'builderState.inviteCopiedToast')
                : getCopy(themeId, 'builderState.inviteCopyButton')}
            </button>
          </div>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button type="button" className="invite-share-btn" onClick={handleShare}>
              {getCopy(themeId, 'builderState.inviteShareButton')}
            </button>
          )}
        </div>
      )}

      {/* Email tab */}
      {tab === 'email' && (
        <div className="invite-body">
          <input
            type="email"
            className="invite-input"
            placeholder={getCopy(themeId, 'builderState.inviteEmailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <input
            type="text"
            className="invite-input"
            placeholder={getCopy(themeId, 'builderState.inviteNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            className="invite-send-btn"
            disabled={!email.trim() || sending}
            onClick={handleSendInvite}
          >
            {sending
              ? getCopy(themeId, 'builderState.inviteSending')
              : getCopy(themeId, 'builderState.inviteSendButton')}
          </button>
          {toast && <div className="invite-toast">{toast}</div>}
        </div>
      )}
    </div>
  );

  if (renderInline) return content;

  return (
    <div className="invite-overlay" onClick={onClose}>
      {content}
    </div>
  );
}
