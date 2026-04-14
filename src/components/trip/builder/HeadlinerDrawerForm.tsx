'use client';

// Session 8J — HeadlinerDrawerForm
//
// Drawer body for "the headliner" (add + edit modes). Four states in the
// wireframe: add empty / enriching / ready / edit with remove. Fields, in
// order: link (top) → description → cost row (number + unit toggle).
//
// Enrichment reuses the shared enrichUrl helper (src/lib/enrich-url.ts)
// — same call lodging makes. Non-blocking: form stays interactive while
// the fetch is pending.

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import { enrichUrl } from '@/lib/enrich-url';
import {
  updateHeadliner,
  removeHeadliner,
} from '@/app/actions/update-trip-sketch';

const DESCRIPTION_MAX = 80;

export type HeadlinerInitial = {
  description: string | null;
  costCents: number | null;
  costUnit: 'per_person' | 'total' | null;
  linkUrl: string | null;
  imageUrl: string | null;
  sourceTitle: string | null;
};

type Props = {
  themeId: ThemeId;
  tripId: string;
  slug: string;
  initial: HeadlinerInitial;
  onDone: () => void;
};

function domainOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function HeadlinerDrawerForm({ themeId, tripId, slug, initial, onDone }: Props) {
  const router = useRouter();
  const isEditing = initial.description != null;

  const [link, setLink] = useState(initial.linkUrl ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [cost, setCost] = useState(
    initial.costCents != null ? String(Math.round(initial.costCents / 100)) : '',
  );
  const [costUnit, setCostUnit] = useState<'per_person' | 'total'>(
    initial.costUnit ?? 'per_person',
  );
  const [imageUrl, setImageUrl] = useState<string | null>(initial.imageUrl ?? null);
  const [sourceTitle, setSourceTitle] = useState<string | null>(initial.sourceTitle ?? null);

  const [enriching, setEnriching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  // Session 8K (8J patch) — surface server-action failures inline so
  // the drawer stops failing silently. Cleared on any field change.
  const [error, setError] = useState<string | null>(null);

  // Fire enrichment on change — matches lodging behavior (no same-URL
  // guard). Non-blocking: form stays usable during the fetch.
  const handleLinkChange = useCallback(async (value: string) => {
    setLink(value);
    setError(null);
    if (!/^https?:\/\/.+/.test(value)) return;
    setEnriching(true);
    const og = await enrichUrl(value);
    if (og) {
      if (og.image) setImageUrl(og.image);
      if (og.title) {
        setSourceTitle(og.title);
        if (!description) setDescription(og.title.slice(0, DESCRIPTION_MAX));
      }
    }
    setEnriching(false);
  }, [description]);

  const trimmedDescription = description.trim();
  const costNum = Number.parseInt(cost, 10);
  const canSave =
    trimmedDescription.length > 0 &&
    trimmedDescription.length <= DESCRIPTION_MAX &&
    Number.isInteger(costNum) &&
    costNum > 0 &&
    !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSave) return;
    setSubmitting(true);
    setError(null);
    const result = await updateHeadliner(tripId, slug, {
      description: trimmedDescription.slice(0, DESCRIPTION_MAX),
      costCents: costNum * 100,
      costUnit,
      linkUrl: link.trim() || null,
      imageUrl: imageUrl ?? null,
      sourceTitle: sourceTitle ?? null,
    });
    setSubmitting(false);
    if (result.ok) {
      router.refresh();
      onDone();
    } else {
      console.error('[Headliner] updateHeadliner failed:', result.error);
      setError(getCopy(themeId, 'builderState.headliner.saveError'));
    }
  }, [canSave, tripId, slug, trimmedDescription, costNum, costUnit, link, imageUrl, sourceTitle, router, onDone, themeId]);

  const handleRemove = useCallback(async () => {
    if (!removeConfirm) {
      setRemoveConfirm(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await removeHeadliner(tripId, slug);
    setSubmitting(false);
    if (result.ok) {
      router.refresh();
      onDone();
    } else {
      console.error('[Headliner] removeHeadliner failed:', result.error);
      setError(getCopy(themeId, 'builderState.headliner.saveError'));
    }
  }, [removeConfirm, tripId, slug, router, onDone, themeId]);

  const showImage = !!imageUrl || enriching;
  const domain = domainOf(link);

  return (
    <div className="headliner-form">
      {/* Link — top */}
      <div className="headliner-form-field">
        <label className="headliner-form-label">
          {getCopy(themeId, 'builderState.headliner.linkLabel')}
        </label>
        <input
          className="headliner-form-input"
          type="url"
          inputMode="url"
          placeholder={getCopy(themeId, 'builderState.headliner.linkPlaceholder')}
          value={link}
          onChange={(e) => void handleLinkChange(e.target.value)}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text');
            if (pasted) void handleLinkChange(pasted);
          }}
        />
        {enriching ? (
          <div className="headliner-form-loading">
            <span className="headliner-form-spinner" aria-hidden />
            {getCopy(themeId, 'builderState.headliner.enrichingIndicator')}
          </div>
        ) : (
          <div className="headliner-form-hint">
            {getCopy(themeId, 'builderState.headliner.linkHint')}
          </div>
        )}
      </div>

      {/* OG preview hero (when image present or loading) */}
      {showImage && (
        <div
          className={`headliner-form-og${enriching && !imageUrl ? ' headliner-form-og--loading' : ''}`}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        >
          {domain && (
            <span className="headliner-form-og-domain">↗ {domain}</span>
          )}
        </div>
      )}

      {/* Description */}
      <div className="headliner-form-field">
        <label className="headliner-form-label">
          {getCopy(themeId, 'builderState.headliner.descriptionLabel')}
        </label>
        <input
          className="headliner-form-input"
          type="text"
          maxLength={DESCRIPTION_MAX}
          placeholder={getCopy(themeId, 'builderState.headliner.descriptionPlaceholder')}
          value={description}
          onChange={(e) => { setDescription(e.target.value); setError(null); }}
        />
      </div>

      {/* Cost + unit toggle */}
      <div className="headliner-form-field">
        <label className="headliner-form-label">
          {getCopy(themeId, 'builderState.headliner.costLabel')}
        </label>
        <div className="headliner-form-cost-row">
          <input
            className="headliner-form-input headliner-form-cost-input"
            type="text"
            inputMode="decimal"
            placeholder="$"
            value={cost}
            onChange={(e) => { setCost(e.target.value.replace(/[^0-9]/g, '')); setError(null); }}
          />
          <div className="headliner-form-unit-toggle" role="group">
            <button
              type="button"
              className={`headliner-form-unit${costUnit === 'per_person' ? ' headliner-form-unit--active' : ''}`}
              onClick={() => { setCostUnit('per_person'); setError(null); }}
            >
              {getCopy(themeId, 'builderState.headliner.costUnitPerPerson')}
            </button>
            <button
              type="button"
              className={`headliner-form-unit${costUnit === 'total' ? ' headliner-form-unit--active' : ''}`}
              onClick={() => { setCostUnit('total'); setError(null); }}
            >
              {getCopy(themeId, 'builderState.headliner.costUnitTotal')}
            </button>
          </div>
        </div>
      </div>

      {/* Inline server-action error (8K/8J patch) */}
      {error && (
        <div className="headliner-form-error" role="alert">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="headliner-form-actions">
        <button
          type="button"
          className="headliner-form-submit"
          disabled={!canSave}
          onClick={() => void handleSubmit()}
        >
          {isEditing
            ? getCopy(themeId, 'builderState.headliner.saveEdit')
            : getCopy(themeId, 'builderState.headliner.saveAdd')}
        </button>
        {isEditing && (
          <button
            type="button"
            className={`headliner-form-remove${removeConfirm ? ' headliner-form-remove--confirm' : ''}`}
            onClick={() => void handleRemove()}
            disabled={submitting}
          >
            {getCopy(themeId, 'builderState.headliner.remove')}
          </button>
        )}
      </div>

      {isEditing && removeConfirm && (
        <div className="headliner-form-confirm-bar">
          <strong>{getCopy(themeId, 'builderState.headliner.removeConfirm')}</strong>
          {' · '}
          {getCopy(themeId, 'builderState.headliner.removeConfirmHint')}
        </div>
      )}
    </div>
  );
}
