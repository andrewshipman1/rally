'use client';

// Session 8M — TransportAddForm
//
// Drawer body for the transportation module. Built against
// rally-transportation-wireframe.html (frames 4–7). Required chip-based
// type picker with inline definition, split toggle whose default follows
// the selected tag (but locks in on manual override), drawer-only OG
// enrichment via enrichUrl, and inline server-action error surfacing
// (8J/8K pattern).

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { Transport, TransportTypeTag } from '@/types';
import { enrichUrl, type OgData } from '@/lib/enrich-url';
import {
  addTransport,
  updateTransport,
  removeTransport,
} from '@/app/actions/sketch-modules';

const TAG_ORDER: TransportTypeTag[] = [
  'flight',
  'train',
  'rental_car_van',
  'charter_van_bus',
  'charter_boat',
  'ferry',
  'other',
];

const TAG_EMOJI: Record<TransportTypeTag, string> = {
  flight: '✈️',
  train: '🚆',
  rental_car_van: '🚗',
  charter_van_bus: '🚐',
  charter_boat: '⛵',
  ferry: '⛴',
  other: '·',
};

// Lexicon keys use camelCase for multi-word tags; map once here.
const TAG_COPY_KEY: Record<TransportTypeTag, string> = {
  flight: 'flight',
  train: 'train',
  rental_car_van: 'rentalCarVan',
  charter_van_bus: 'charterVanBus',
  charter_boat: 'charterBoat',
  ferry: 'ferry',
  other: 'other',
};

// Default split per tag — matches wireframe annotation table.
const DEFAULT_SPLIT: Record<TransportTypeTag, 'individual' | 'shared'> = {
  flight: 'individual',
  train: 'individual',
  rental_car_van: 'shared',
  charter_van_bus: 'shared',
  charter_boat: 'shared',
  ferry: 'individual',
  other: 'shared',
};

function domainOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

type Props = {
  themeId: ThemeId;
  tripId: string;
  slug: string;
  editing?: Transport | null;
  onDone: () => void;
};

export function TransportAddForm({ themeId, tripId, slug, editing, onDone }: Props) {
  const router = useRouter();
  const isEditing = !!editing;

  const [description, setDescription] = useState(editing?.description ?? '');
  const [typeTag, setTypeTag] = useState<TransportTypeTag | null>(editing?.type_tag ?? null);
  const [cost, setCost] = useState(
    editing?.estimated_total != null ? String(Math.round(editing.estimated_total)) : '',
  );
  const [costType, setCostType] = useState<'individual' | 'shared'>(
    editing?.cost_type ?? 'individual',
  );
  // Editing an existing row means the organizer already chose (or
  // accepted the default for) that row — treat edit mode as overridden
  // so chip changes don't clobber the saved split.
  const [costTypeOverridden, setCostTypeOverridden] = useState(isEditing);

  const [link, setLink] = useState(editing?.booking_link ?? '');
  const [ogData, setOgData] = useState<OgData | null>(
    editing?.og_image_url
      ? { title: null, description: null, image: editing.og_image_url }
      : null,
  );
  const [enriching, setEnriching] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChipTap = useCallback((tag: TransportTypeTag) => {
    setTypeTag(tag);
    setError(null);
    if (!costTypeOverridden) {
      setCostType(DEFAULT_SPLIT[tag]);
    }
  }, [costTypeOverridden]);

  const handleSplitTap = useCallback((next: 'individual' | 'shared') => {
    setCostType(next);
    setCostTypeOverridden(true);
    setError(null);
  }, []);

  const handleLinkChange = useCallback(async (value: string) => {
    setLink(value);
    setError(null);
    if (!/^https?:\/\/.+/.test(value)) {
      setOgData(null);
      return;
    }
    setEnriching(true);
    const og = await enrichUrl(value);
    // Only keep the preview if there's actually something to show.
    if (og && (og.title || og.image)) {
      setOgData(og);
    } else {
      setOgData(null);
    }
    setEnriching(false);
  }, []);

  const trimmedDescription = description.trim();
  const costNum = Number.parseInt(cost, 10);
  const canSave =
    trimmedDescription.length > 0 &&
    !!typeTag &&
    Number.isInteger(costNum) &&
    costNum > 0 &&
    !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSave || !typeTag) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      type_tag: typeTag,
      description: trimmedDescription,
      estimated_total: costNum,
      cost_type: costType,
      booking_link: link.trim() || null,
      og_image_url: ogData?.image || null,
    };

    const result = isEditing
      ? await updateTransport(tripId, slug, editing!.id, payload)
      : await addTransport(tripId, slug, payload);

    setSubmitting(false);
    if (result.ok) {
      router.refresh();
      onDone();
    } else {
      console.error('[Transport] save failed:', result.error);
      setError(getCopy(themeId, 'builderState.transport.saveError'));
    }
  }, [canSave, typeTag, trimmedDescription, costNum, costType, link, ogData, isEditing, tripId, slug, editing, router, onDone, themeId]);

  const handleRemove = useCallback(async () => {
    if (!editing) return;
    if (!removeConfirm) {
      setRemoveConfirm(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await removeTransport(tripId, slug, editing.id);
    setSubmitting(false);
    if (result.ok) {
      router.refresh();
      onDone();
    } else {
      console.error('[Transport] remove failed:', result.error);
      setError(getCopy(themeId, 'builderState.transport.saveError'));
    }
  }, [editing, removeConfirm, tripId, slug, router, onDone, themeId]);

  const domain = domainOf(link);
  const showEnrichPreview = !!(ogData?.image || ogData?.title) || enriching;
  const tagLabelKey = typeTag ? TAG_COPY_KEY[typeTag] : null;
  const tagLabel = tagLabelKey
    ? getCopy(themeId, `builderState.transport.tagLabel.${tagLabelKey}`)
    : null;
  const splitHint = typeTag && tagLabel
    ? getCopy(themeId, 'builderState.transport.splitDefaultHintPost').replace('{tag}', tagLabel)
    : getCopy(themeId, 'builderState.transport.splitDefaultHintPre');

  return (
    <div className="transport-form">
      {/* Framing line — always visible */}
      <div className="transport-form-framing">
        {getCopy(themeId, 'builderState.transport.drawerFraming')}
      </div>

      {/* Description */}
      <div className="transport-form-field">
        <label className="transport-form-label">
          {getCopy(themeId, 'builderState.transport.descriptionLabel')}
          <span className="transport-form-req" aria-hidden>*</span>
        </label>
        <input
          className="transport-form-input"
          type="text"
          maxLength={200}
          placeholder={getCopy(themeId, 'builderState.transport.descriptionPlaceholder')}
          value={description}
          onChange={(e) => { setDescription(e.target.value); setError(null); }}
        />
      </div>

      {/* Type chip picker (required) */}
      <div className="transport-form-field">
        <label className="transport-form-label">
          {getCopy(themeId, 'builderState.transport.typeLabel')}
          <span className="transport-form-req" aria-hidden>*</span>
        </label>
        <div className="transport-form-chips" role="radiogroup">
          {TAG_ORDER.map((tag) => {
            const key = TAG_COPY_KEY[tag];
            const selected = typeTag === tag;
            return (
              <button
                key={tag}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`transport-form-chip${selected ? ' transport-form-chip--selected' : ''}`}
                onClick={() => handleChipTap(tag)}
              >
                <span className="transport-form-chip-emoji" aria-hidden>{TAG_EMOJI[tag]}</span>
                {getCopy(themeId, `builderState.transport.tagLabel.${key}`)}
              </button>
            );
          })}
        </div>
        {typeTag && tagLabelKey && (
          <div className="transport-form-definition">
            <strong>{tagLabel}</strong>
            {' — '}
            {getCopy(themeId, `builderState.transport.tagDefinition.${tagLabelKey}`)}
          </div>
        )}
      </div>

      {/* Cost + split toggle */}
      <div className="transport-form-field">
        <label className="transport-form-label">
          {getCopy(themeId, 'builderState.transport.costLabel')}
          <span className="transport-form-req" aria-hidden>*</span>
        </label>
        <div className="transport-form-cost-row">
          <input
            className="transport-form-input transport-form-cost-input"
            type="text"
            inputMode="numeric"
            placeholder={getCopy(themeId, 'builderState.transport.costPlaceholder')}
            value={cost}
            onChange={(e) => { setCost(e.target.value.replace(/[^0-9]/g, '')); setError(null); }}
          />
          <div className="transport-form-split" role="group">
            <button
              type="button"
              className={`transport-form-split-btn${costType === 'individual' ? ' transport-form-split-btn--active' : ''}`}
              onClick={() => handleSplitTap('individual')}
            >
              {getCopy(themeId, 'builderState.transport.splitIndividual')}
            </button>
            <button
              type="button"
              className={`transport-form-split-btn${costType === 'shared' ? ' transport-form-split-btn--active' : ''}`}
              onClick={() => handleSplitTap('shared')}
            >
              {getCopy(themeId, 'builderState.transport.splitGroup')}
            </button>
          </div>
        </div>
        <div className="transport-form-hint">{splitHint}</div>
      </div>

      {/* Link (optional) — drawer-only enrichment */}
      <div className="transport-form-field">
        <label className="transport-form-label">
          {getCopy(themeId, 'builderState.transport.linkLabel')}
        </label>
        <input
          className="transport-form-input"
          type="url"
          inputMode="url"
          placeholder={getCopy(themeId, 'builderState.transport.linkPlaceholder')}
          value={link}
          onChange={(e) => void handleLinkChange(e.target.value)}
          onBlur={(e) => void handleLinkChange(e.target.value)}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text');
            if (pasted) void handleLinkChange(pasted);
          }}
        />
        {showEnrichPreview && (
          <div
            className={`transport-form-enrich${enriching && !ogData?.image ? ' transport-form-enrich--loading' : ''}`}
          >
            <div
              className="transport-form-enrich-hero"
              style={ogData?.image ? { backgroundImage: `url(${ogData.image})` } : undefined}
            >
              {domain && (
                <span className="transport-form-enrich-domain">{domain}</span>
              )}
            </div>
            {(ogData?.title || enriching) && (
              <div className="transport-form-enrich-body">
                {enriching && !ogData?.title ? (
                  <span>{getCopy(themeId, 'builderState.transport.enrichingIndicator')}</span>
                ) : (
                  <span className="transport-form-enrich-title">{ogData?.title}</span>
                )}
              </div>
            )}
          </div>
        )}
        <div className="transport-form-hint">
          {getCopy(themeId, 'builderState.transport.linkHelper')}
        </div>
      </div>

      {/* Inline save-failure error (8J/8K pattern) */}
      {error && (
        <div className="transport-form-error" role="alert">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="transport-form-actions">
        <button
          type="button"
          className="transport-form-submit"
          disabled={!canSave}
          onClick={() => void handleSubmit()}
        >
          {isEditing
            ? getCopy(themeId, 'builderState.transport.saveEdit')
            : getCopy(themeId, 'builderState.transport.saveAdd')}
        </button>
        {isEditing && (
          <button
            type="button"
            className={`transport-form-remove${removeConfirm ? ' transport-form-remove--confirm' : ''}`}
            onClick={() => void handleRemove()}
            disabled={submitting}
          >
            {getCopy(themeId, 'builderState.transport.remove')}
          </button>
        )}
      </div>

      {isEditing && removeConfirm && (
        <div className="transport-form-confirm-bar">
          <strong>{getCopy(themeId, 'builderState.transport.removeConfirm')}</strong>
          {' · '}
          {getCopy(themeId, 'builderState.transport.removeConfirmHint')}
        </div>
      )}
    </div>
  );
}
