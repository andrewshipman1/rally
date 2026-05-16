'use client';

// Session 12B — wizard screen 6 (payment-handle prompt).
// Only fires when (a) the organizer has zero existing handles AND
// (b) at least one allocation is "I'm booking". Either path can be
// skipped via "skip — I'll add later" (saves nothing).
// Save & continue requires venmo to be filled (the only required field
// per mockup; zelle + cashapp explicit "optional" labels).
// Mockup frame 7 (empty + venmo-filled states).

import { getCopy } from '@/lib/copy/get-copy';
import type { LockWizardContext } from './types';

type Props = {
  ctx: LockWizardContext;
  handles: { venmo: string; zelle: string; cashapp: string };
  onChange: (field: 'venmo' | 'zelle' | 'cashapp', value: string) => void;
  onSave: () => void;
  onSkip: () => void;
};

export function WizardPaymentHandleScreen({
  ctx,
  handles,
  onChange,
  onSave,
  onSkip,
}: Props) {
  const { themeId } = ctx;
  const venmoFilled = handles.venmo.trim().length > 0;
  const saveDisabled = !venmoFilled;

  return (
    <div className="lock-wizard-screen lock-wizard-screen--payment">
      <div className="lock-wizard-h">
        {getCopy(themeId, 'lockWizard.paymentHandle.heading')}
      </div>
      <div className="lock-wizard-sub">
        {getCopy(themeId, 'lockWizard.paymentHandle.sub')}
      </div>

      <HandleField
        themeId={themeId}
        labelKey="lockWizard.paymentHandle.venmo.label"
        placeholderKey="lockWizard.paymentHandle.venmo.placeholder"
        value={handles.venmo}
        onChange={(v) => onChange('venmo', v)}
      />
      <HandleField
        themeId={themeId}
        labelKey="lockWizard.paymentHandle.zelle.label"
        placeholderKey="lockWizard.paymentHandle.zelle.placeholder"
        value={handles.zelle}
        onChange={(v) => onChange('zelle', v)}
      />
      <HandleField
        themeId={themeId}
        labelKey="lockWizard.paymentHandle.cashapp.label"
        placeholderKey="lockWizard.paymentHandle.cashapp.placeholder"
        value={handles.cashapp}
        onChange={(v) => onChange('cashapp', v)}
      />

      <button
        type="button"
        className={`lock-wizard-cta${saveDisabled ? ' lock-wizard-cta--disabled' : ''}`}
        onClick={() => !saveDisabled && onSave()}
        disabled={saveDisabled}
      >
        {getCopy(themeId, 'lockWizard.paymentHandle.cta.save')}
      </button>
      <button
        type="button"
        className="lock-wizard-cta-secondary"
        onClick={onSkip}
      >
        {getCopy(themeId, 'lockWizard.paymentHandle.cta.skip')}
      </button>
    </div>
  );
}

function HandleField({
  themeId,
  labelKey,
  placeholderKey,
  value,
  onChange,
}: {
  themeId: LockWizardContext['themeId'];
  labelKey: string;
  placeholderKey: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const label = getCopy(themeId, labelKey);
  const placeholder = getCopy(themeId, placeholderKey);
  return (
    <div className="lock-wizard-input-field">
      <div className="lock-wizard-input-label">{label}</div>
      <input
        type="text"
        className="lock-wizard-input-box"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
      />
    </div>
  );
}
