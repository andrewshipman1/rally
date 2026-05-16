'use client';

// Session 12B — Lock-B wizard orchestrator.
//
// Reuses Rally's BottomDrawer primitive (per brief). All wizard chrome
// (dark surface, progress bar, step tag, screens) renders inside the
// drawer body; CSS overrides via the .lock-wizard-shell wrapper class
// re-theme the panel for the dark-surface mockup intent.
//
// Lifecycle:
//   - Wizard state lives in useWizardState, keyed on a resetKey that
//     bumps on confirmed dismiss. resetKey also bumps when the parent
//     re-opens after a previous close, so each open starts fresh.
//   - Drawer-dismiss intent (Escape / backdrop / swipe / explicit close)
//     past screen 1 shows the dismiss-confirmation overlay; on screen 1
//     it closes directly (cancel semantics).
//   - "edit first" on the verify screen shows the edit-first confirmation
//     overlay; on confirm, fires onEditFirstConfirm (which navigates to
//     edit-on-sell mode with entry_point=lock_wizard).
//   - On fireLock success, the review screen calls onClose + router.refresh.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomDrawer } from '@/components/trip/BottomDrawer';
import { getCopy } from '@/lib/copy/get-copy';
import { useWizardState } from './useWizardState';
import { WizardProgressBar } from './WizardProgressBar';
import { WizardConfirmDialog } from './WizardConfirmDialog';
import { WizardVerifyScreen } from './WizardVerifyScreen';
import { WizardLodgingOverrideScreen } from './WizardLodgingOverrideScreen';
import { WizardAllocationScreen } from './WizardAllocationScreen';
import { WizardPaymentHandleScreen } from './WizardPaymentHandleScreen';
import { WizardReviewScreen } from './WizardReviewScreen';
import { allocationKey, stepKey, type LockWizardContext } from './types';

type Props = {
  open: boolean;
  ctx: LockWizardContext;
  /** Called when wizard should close without confirmation (e.g., fire success, cancel from screen 1). */
  onClose: () => void;
  /** Called when the user confirms "edit first" — should navigate to ?edit=1&entry=lock_wizard and close drawer. */
  onEditFirstConfirm: () => void;
};

type Overlay = null | 'editFirst' | 'dismiss';

export function LockWizardDrawer({ open, ctx, onClose, onEditFirstConfirm }: Props) {
  // resetKey controls hook identity. Bumps when:
  //   - the drawer goes from closed → open (so each open is fresh)
  //   - the user confirms "discard" on the dismiss dialog
  const [resetKey, setResetKey] = useState(0);
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setResetKey((k) => k + 1);
    }
    prevOpenRef.current = open;
  }, [open]);

  return open ? (
    <WizardInner
      key={resetKey}
      ctx={ctx}
      onClose={onClose}
      onEditFirstConfirm={onEditFirstConfirm}
      onDiscard={() => setResetKey((k) => k + 1)}
    />
  ) : null;
}

function WizardInner({
  ctx,
  onClose,
  onEditFirstConfirm,
  onDiscard,
}: {
  ctx: LockWizardContext;
  onClose: () => void;
  onEditFirstConfirm: () => void;
  /** Bumps resetKey in parent so the next render fully resets state. */
  onDiscard: () => void;
}) {
  const wizard = useWizardState(ctx);
  const [overlay, setOverlay] = useState<Overlay>(null);

  const isPastFirst = wizard.currentStepKey !== 'verify';

  // Intercept drawer-dismiss: past screen 1 → confirm; else close.
  const handleClose = useCallback(() => {
    if (isPastFirst) {
      setOverlay('dismiss');
      return;
    }
    onClose();
  }, [isPastFirst, onClose]);

  const stepLabel = useMemo(() => {
    switch (wizard.currentStep.kind) {
      case 'verify': return getCopy(ctx.themeId, 'lockWizard.stepTag.label.verify');
      case 'lodgingPick': return getCopy(ctx.themeId, 'lockWizard.stepTag.label.lodgingPick');
      case 'allocation':
        if (wizard.currentStep.itemType === 'lodging') {
          return getCopy(ctx.themeId, 'lockWizard.stepTag.label.lodgingAlloc');
        }
        if (wizard.currentStep.itemType === 'headliner') {
          return getCopy(ctx.themeId, 'lockWizard.stepTag.label.headliner');
        }
        return getCopy(ctx.themeId, 'lockWizard.stepTag.label.transport');
      case 'payment': return getCopy(ctx.themeId, 'lockWizard.stepTag.label.payment');
      case 'review': return getCopy(ctx.themeId, 'lockWizard.stepTag.label.review');
    }
  }, [ctx.themeId, wizard.currentStep]);

  const stepTagText = getCopy(ctx.themeId, 'lockWizard.stepTag.format', {
    step: wizard.currentIndex + 1,
    total: wizard.totalSteps,
    label: stepLabel,
  });

  const backCancelLabel = isPastFirst
    ? getCopy(ctx.themeId, 'lockWizard.stepTag.back')
    : getCopy(ctx.themeId, 'lockWizard.stepTag.cancel');

  function handleBackOrCancel() {
    if (isPastFirst) {
      wizard.goBack();
    } else {
      // Screen 1 cancel = close drawer (no confirmation).
      onClose();
    }
  }

  function renderScreen() {
    switch (wizard.currentStep.kind) {
      case 'verify':
        return (
          <WizardVerifyScreen
            ctx={ctx}
            isEmptyTrip={wizard.isEmptyTrip}
            onContinue={wizard.goNext}
            onEditFirst={() => setOverlay('editFirst')}
          />
        );
      case 'lodgingPick':
        return (
          <WizardLodgingOverrideScreen
            ctx={ctx}
            selectedLodgingId={wizard.state.lodgingChoiceId}
            onSelect={wizard.setLodgingChoice}
            onContinue={wizard.goNext}
          />
        );
      case 'allocation': {
        const step = wizard.currentStep;
        const k = allocationKey(step.itemType, step.itemId);
        return (
          <WizardAllocationScreen
            ctx={ctx}
            itemType={step.itemType}
            itemId={step.itemId}
            itemName={step.itemName}
            estimateDollars={step.estimateDollars}
            perPersonDollars={step.perPersonDollars}
            decision={wizard.state.allocations[k]}
            onModeChange={(mode) => wizard.setAllocationMode(step.itemType, step.itemId, mode)}
            onCostChange={(input) => wizard.setAllocationCost(step.itemType, step.itemId, input)}
            onContinue={wizard.goNext}
          />
        );
      }
      case 'payment':
        return (
          <WizardPaymentHandleScreen
            ctx={ctx}
            handles={wizard.state.paymentHandles}
            onChange={wizard.setPaymentHandle}
            onSave={wizard.goNext}
            onSkip={wizard.skipPayment}
          />
        );
      case 'review':
        return (
          <WizardReviewScreen
            ctx={ctx}
            state={wizard.state}
            steps={wizard.steps}
            onJumpTo={wizard.jumpTo}
            onClose={onClose}
          />
        );
    }
  }

  // For empty-trip: still display step 1 of 1 (verify-blocked).
  const errored = false; // review screen owns its own error styling
  void errored;
  void stepKey; // referenced for symmetry; the hook handles routing

  return (
    <BottomDrawer
      open={true}
      onClose={handleClose}
      title=""
      themeId={ctx.themeId}
    >
      <div className="lock-wizard-shell">
        <WizardProgressBar
          currentIndex={wizard.currentIndex}
          totalSteps={wizard.totalSteps}
        />
        <div className="lock-wizard-step-tag">
          <span>{stepTagText}</span>
          <button
            type="button"
            className="lock-wizard-step-tag-back"
            onClick={handleBackOrCancel}
          >
            {backCancelLabel}
          </button>
        </div>
        <div className="lock-wizard-body">{renderScreen()}</div>

        {overlay === 'editFirst' && (
          <WizardConfirmDialog
            heading={getCopy(ctx.themeId, 'lockWizard.verify.editFirst.heading')}
            body={getCopy(ctx.themeId, 'lockWizard.verify.editFirst.sub')}
            cancelLabel={getCopy(ctx.themeId, 'lockWizard.verify.editFirst.cta.stay')}
            confirmLabel={getCopy(ctx.themeId, 'lockWizard.verify.editFirst.cta.confirm')}
            confirmVariant="primary"
            onCancel={() => setOverlay(null)}
            onConfirm={() => {
              setOverlay(null);
              onEditFirstConfirm();
            }}
          />
        )}

        {overlay === 'dismiss' && (
          <WizardConfirmDialog
            heading={getCopy(ctx.themeId, 'lockWizard.dismiss.heading')}
            body={getCopy(ctx.themeId, 'lockWizard.dismiss.sub', {
              count: wizard.currentIndex + 1,
            })}
            cancelLabel={getCopy(ctx.themeId, 'lockWizard.dismiss.cta.keep')}
            confirmLabel={getCopy(ctx.themeId, 'lockWizard.dismiss.cta.discard')}
            confirmVariant="destructive"
            onCancel={() => setOverlay(null)}
            onConfirm={() => {
              setOverlay(null);
              onDiscard();
              onClose();
            }}
          />
        )}
      </div>
    </BottomDrawer>
  );
}
