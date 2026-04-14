'use client';

// Session 8J — Headliner display component
//
// Renders the optional, singular trip-level "headliner." Two visual states:
// (1) populated — OG image hero + domain chip + title + cost pill + caption
// (2) null — dashed "+ the headliner" affordance + hint copy
//
// Tap anywhere → opens the drawer (owned by the parent SketchModules).
// Theme-agnostic: same label, same shape across every theme; accent
// color comes in via CSS vars.

import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

export type HeadlinerData = {
  description: string | null;
  costCents: number | null;
  costUnit: 'per_person' | 'total' | null;
  linkUrl: string | null;
  imageUrl: string | null;
  sourceTitle: string | null;
};

type Props = {
  themeId: ThemeId;
  headliner: HeadlinerData;
  onOpen: () => void;
};

function domainOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function Headliner({ themeId, headliner, onOpen }: Props) {
  const isSet = !!headliner.description;

  if (!isSet) {
    return (
      <button
        type="button"
        className="headliner-add"
        onClick={onOpen}
        aria-label={getCopy(themeId, 'builderState.headliner.addLabel')}
      >
        <span className="headliner-add-label">
          {getCopy(themeId, 'builderState.headliner.addLabel')}
        </span>
        <span className="headliner-add-hint">
          {getCopy(themeId, 'builderState.headliner.addHint')}
        </span>
      </button>
    );
  }

  const domain = domainOf(headliner.linkUrl);
  const dollars = headliner.costCents != null ? Math.round(headliner.costCents / 100) : 0;
  const unitLabel = headliner.costUnit === 'total'
    ? getCopy(themeId, 'builderState.headliner.costUnitTotal')
    : getCopy(themeId, 'builderState.headliner.costUnitPerPerson');

  return (
    <button
      type="button"
      className="headliner"
      onClick={onOpen}
    >
      <span className="headliner-eyebrow">
        {getCopy(themeId, 'builderState.headliner.eyebrow')}
      </span>
      {headliner.imageUrl && (
        <span
          className="headliner-og"
          style={{ backgroundImage: `url(${headliner.imageUrl})` }}
        >
          {domain && (
            <span className="headliner-og-domain">↗ {domain}</span>
          )}
        </span>
      )}
      <span className="headliner-body">
        <span className="headliner-title">{headliner.description}</span>
        <span className="headliner-cost-pill">
          <span className="headliner-cost-dollar">$</span>
          {dollars.toLocaleString('en-US')}
          {' '}{unitLabel}
          {' · '}
          {getCopy(themeId, 'builderState.headliner.estimateCaption')}
        </span>
        {domain && (
          <span className="headliner-caption">
            {getCopy(themeId, 'builderState.headliner.pulledFrom', { domain })}
          </span>
        )}
      </span>
    </button>
  );
}
