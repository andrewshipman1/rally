'use client';

// Session 12B — in-drawer confirmation dialog. Renders as an
// absolutely-positioned overlay inside the wizard drawer panel,
// matching the mockup's pf-confirm-overlay pattern. No new portal
// or modal primitive — the dimmed wizard underneath shows through.
//
// Used by:
//   - edit-first confirmation (verify screen, secondary CTA)
//   - drawer-dismiss confirmation (any swipe-down past screen 1)

type Props = {
  heading: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  /** Visual treatment for the confirm button. 'destructive' = red. */
  confirmVariant?: 'primary' | 'destructive';
  onCancel: () => void;
  onConfirm: () => void;
};

export function WizardConfirmDialog({
  heading,
  body,
  cancelLabel,
  confirmLabel,
  confirmVariant = 'primary',
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className="lock-wizard-confirm-overlay" role="dialog" aria-modal="true">
      <div className="lock-wizard-confirm-dialog">
        <div className="lock-wizard-confirm-h">{heading}</div>
        <div className="lock-wizard-confirm-sub">{body}</div>
        <div className="lock-wizard-confirm-btn-row">
          <button
            type="button"
            className="lock-wizard-confirm-btn lock-wizard-confirm-btn--secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`lock-wizard-confirm-btn lock-wizard-confirm-btn--${confirmVariant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
