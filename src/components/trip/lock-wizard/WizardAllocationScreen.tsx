'use client';

// Session 12B — wizard screens 3, 4, 5 (allocation, parametrized per item).
// Binary buttons: "I'm booking" vs "each attendee books". When the user
// picks "I'm booking", an inline cost field appears prefilled with the
// estimate. Continue is disabled until (a) a mode is picked AND (b) the
// cost validates (organizer_books path only).
// Mockup frames 3 (two states) + 4 (cost validation) + 5 (headliner)
// + 6 (transport) + 10 (single-lodging).

import { useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import {
  formatDollars,
  parseCost,
} from './useWizardState';
import type {
  AllocationDecision,
  AllocationMode,
  LockWizardContext,
  WizardItemType,
} from './types';

type Props = {
  ctx: LockWizardContext;
  itemType: WizardItemType;
  itemId: string;
  itemName: string;
  estimateDollars: number | null;
  /** Headliner only — per-person dollar amount for sub-copy. */
  perPersonDollars?: number | null;
  decision: AllocationDecision | undefined;
  onModeChange: (mode: AllocationMode) => void;
  onCostChange: (input: string) => void;
  onContinue: () => void;
};

export function WizardAllocationScreen({
  ctx,
  itemType,
  itemName,
  estimateDollars,
  perPersonDollars,
  decision,
  onModeChange,
  onCostChange,
  onContinue,
}: Props) {
  const { themeId } = ctx;
  const mode = decision?.mode ?? null;

  // Cost input starts empty if user hasn't touched it; we PREFILL via the
  // local "uncontrolled-but-tracked" pattern — when decision.costInput is
  // empty and the user hasn't modified, render the estimate as placeholder
  // value. When the user types, we store their string in state.
  const initialCost =
    decision?.costInput && decision.costInput.length > 0
      ? decision.costInput
      : estimateDollars != null
        ? String(estimateDollars)
        : '';
  const [costRaw, setCostRaw] = useState<string>(initialCost);
  const [touched, setTouched] = useState<boolean>(false);

  const parsed = parseCost(costRaw);
  const showError = touched && mode === 'organizer_books' && !parsed.ok;

  // Disable continue when no mode picked OR organizer_books and cost invalid.
  const continueDisabled =
    mode === null || (mode === 'organizer_books' && !parsed.ok);

  const headingKey =
    itemType === 'lodging'
      ? 'lockWizard.allocation.heading.lodging'
      : itemType === 'headliner'
        ? 'lockWizard.allocation.heading.headliner'
        : 'lockWizard.allocation.heading.transport';

  // Sub-copy varies by item type.
  let sub: string;
  if (itemType === 'lodging') {
    sub = getCopy(themeId, 'lockWizard.allocation.sub.lodging');
  } else if (itemType === 'headliner') {
    sub = getCopy(themeId, 'lockWizard.allocation.sub.headliner', {
      label: itemName,
      cost: perPersonDollars != null ? formatDollars(perPersonDollars) : '—',
    });
  } else {
    sub = getCopy(themeId, 'lockWizard.allocation.sub.transport', {
      route: itemName,
    });
  }

  const orgBooksSubKey =
    itemType === 'lodging'
      ? 'lockWizard.allocation.organizerBooks.sub.lodging'
      : itemType === 'headliner'
        ? 'lockWizard.allocation.organizerBooks.sub.headliner'
        : 'lockWizard.allocation.organizerBooks.sub.transport';
  const indBooksSubKey =
    itemType === 'lodging'
      ? 'lockWizard.allocation.individualBooks.sub.lodging'
      : itemType === 'headliner'
        ? 'lockWizard.allocation.individualBooks.sub.headliner'
        : 'lockWizard.allocation.individualBooks.sub.transport';

  function pick(next: AllocationMode) {
    onModeChange(next);
    // When flipping to organizer_books, push the current local cost up.
    if (next === 'organizer_books') {
      onCostChange(costRaw);
    } else {
      // Clear the parent's cost when switching to individual; reset touched
      // so re-flipping doesn't immediately show stale error.
      onCostChange('');
      setTouched(false);
    }
  }

  function handleCostType(value: string) {
    setCostRaw(value);
    setTouched(true);
    onCostChange(value);
  }

  function handleCostBlur() {
    setTouched(true);
  }

  function handleContinue() {
    if (continueDisabled) {
      // Force-touch so error renders if user hits the disabled CTA.
      setTouched(true);
      return;
    }
    onContinue();
  }

  return (
    <div className="lock-wizard-screen lock-wizard-screen--allocation">
      <div className="lock-wizard-h">
        {getCopy(themeId, headingKey, { name: itemName })}
      </div>
      <div className="lock-wizard-sub">{sub}</div>

      <div className="lock-wizard-binary">
        <button
          type="button"
          className={`lock-wizard-binary-btn${mode === 'organizer_books' ? ' lock-wizard-binary-btn--selected' : ''}`}
          onClick={() => pick('organizer_books')}
          aria-pressed={mode === 'organizer_books'}
        >
          <span className="lock-wizard-binary-btn-label">
            {getCopy(themeId, 'lockWizard.allocation.organizerBooks.label')}
          </span>
          <span className="lock-wizard-binary-btn-sub">
            {getCopy(themeId, orgBooksSubKey)}
          </span>
        </button>
        <button
          type="button"
          className={`lock-wizard-binary-btn${mode === 'individual_books' ? ' lock-wizard-binary-btn--selected' : ''}`}
          onClick={() => pick('individual_books')}
          aria-pressed={mode === 'individual_books'}
        >
          <span className="lock-wizard-binary-btn-label">
            {getCopy(themeId, 'lockWizard.allocation.individualBooks.label')}
          </span>
          <span className="lock-wizard-binary-btn-sub">
            {getCopy(themeId, indBooksSubKey)}
          </span>
        </button>
      </div>

      {mode === 'organizer_books' && (
        <div className={`lock-wizard-cost-input${showError ? ' lock-wizard-cost-input--invalid' : ''}`}>
          <div className="lock-wizard-cost-input-label">
            {getCopy(themeId, 'lockWizard.cost.label')}
          </div>
          <div className="lock-wizard-cost-input-field">
            <span className="lock-wizard-cost-input-currency">$</span>
            <input
              type="text"
              inputMode="decimal"
              className="lock-wizard-cost-input-amount"
              value={costRaw}
              onChange={(e) => handleCostType(e.target.value)}
              onBlur={handleCostBlur}
              placeholder={getCopy(themeId, 'lockWizard.cost.placeholder')}
              aria-label={getCopy(themeId, 'lockWizard.cost.label')}
            />
          </div>
          {showError ? (
            <div className="lock-wizard-cost-input-error">
              {parsed.ok
                ? ''
                : parsed.reason === 'empty'
                  ? getCopy(themeId, 'lockWizard.cost.error.empty')
                  : getCopy(themeId, 'lockWizard.cost.error.invalid')}
            </div>
          ) : (
            <div className="lock-wizard-cost-input-hint">
              {estimateDollars != null
                ? getCopy(themeId, 'lockWizard.cost.hint', {
                    estimate: formatDollars(estimateDollars),
                  })
                : getCopy(themeId, 'lockWizard.cost.hintNoEstimate')}
            </div>
          )}
        </div>
      )}

      {mode === 'individual_books' && (
        <div className="lock-wizard-no-cost-note">
          {getCopy(themeId, 'lockWizard.allocation.noCostNote')}
        </div>
      )}

      <button
        type="button"
        className={`lock-wizard-cta${continueDisabled ? ' lock-wizard-cta--disabled' : ''}`}
        onClick={handleContinue}
        disabled={continueDisabled}
      >
        {getCopy(themeId, 'lockWizard.allocation.cta')}
      </button>
    </div>
  );
}
