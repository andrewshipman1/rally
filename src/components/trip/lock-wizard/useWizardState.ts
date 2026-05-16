'use client';

// Session 12B — wizard state hook + step-sequence computation.
//
// Owns the wizard's React state and derives the ordered list of
// WizardSteps from current trip context + state. Skip-on-the-fly
// is intrinsic to computeSteps: the list shrinks/grows when state
// changes that affect step visibility (e.g., flipping every
// allocation to "individual_books" drops the payment screen).
//
// Drawer-dismiss reset is handled by the parent (LockWizardDrawer):
// the `resetKey` increments to remount the hook with fresh state.

import { useCallback, useMemo, useState } from 'react';
import {
  allocationKey,
  classifyVoteState,
  stepKey,
  type AllocationDecision,
  type AllocationMode,
  type LockWizardContext,
  type WizardItemType,
  type WizardState,
  type WizardStep,
} from './types';

function initialState(ctx: LockWizardContext): WizardState {
  // Default lodging choice: vote winner if there's a clear winner OR only
  // one option. For no-votes / tied, leave null so the user must pick.
  const voteState = classifyVoteState(ctx.lodgings);
  let lodgingChoiceId: string | null = null;
  if (voteState === 'single') {
    lodgingChoiceId = ctx.lodgings[0].id;
  } else if (voteState === 'clear_winner') {
    lodgingChoiceId = ctx.lodgings.find((l) => l.isVoteWinner)?.id ?? ctx.lodgings[0].id;
  }
  return {
    allocations: {},
    lodgingChoiceId,
    paymentHandles: { venmo: '', zelle: '', cashapp: '' },
    lockDeadlineIso: ctx.commitDeadlineIso,
  };
}

function computeSteps(ctx: LockWizardContext, state: WizardState): WizardStep[] {
  const steps: WizardStep[] = [{ kind: 'verify' }];

  const allocatable = ctx.lodgings.length + (ctx.headliner ? 1 : 0) + ctx.transport.length;
  if (allocatable === 0) {
    // Empty-trip block: verify is the only screen, with a disabled
    // continue. Wizard length effectively 1 of 1.
    return steps;
  }

  // Lodging override only when 2+ options exist.
  if (ctx.lodgings.length > 1) {
    steps.push({ kind: 'lodgingPick' });
  }

  // Lodging allocation runs against the chosen spot (or first when null).
  if (ctx.lodgings.length >= 1) {
    const chosen =
      ctx.lodgings.find((l) => l.id === state.lodgingChoiceId) ?? ctx.lodgings[0];
    steps.push({
      kind: 'allocation',
      itemType: 'lodging',
      itemId: chosen.id,
      itemName: chosen.name,
      estimateDollars: chosen.estimateDollars,
    });
  }

  if (ctx.headliner) {
    steps.push({
      kind: 'allocation',
      itemType: 'headliner',
      itemId: ctx.tripId, // RPC convention: headliner allocations key off trip id
      itemName: ctx.headliner.name,
      estimateDollars: ctx.headliner.estimateDollars,
      perPersonDollars: ctx.headliner.perPersonDollars,
    });
  }

  for (const t of ctx.transport) {
    steps.push({
      kind: 'allocation',
      itemType: 'transport',
      itemId: t.id,
      itemName: t.name,
      estimateDollars: t.estimateDollars,
    });
  }

  // Payment-handle screen fires only when (a) ≥1 allocation is organizer_books
  // AND (b) the organizer has zero existing handles. Either gate skips it.
  const anyOrganizerBooks = Object.values(state.allocations).some(
    (a) => a.mode === 'organizer_books',
  );
  const hasHandles =
    !!ctx.organizerHandles.venmo ||
    !!ctx.organizerHandles.zelle ||
    !!ctx.organizerHandles.cashapp;
  if (anyOrganizerBooks && !hasHandles) {
    steps.push({ kind: 'payment' });
  }

  steps.push({ kind: 'review' });
  return steps;
}

export type UseWizardStateApi = {
  state: WizardState;
  steps: WizardStep[];
  currentStepKey: string;
  currentStep: WizardStep;
  currentIndex: number;
  totalSteps: number;
  /** True when current step is the empty-trip blocked verify. */
  isEmptyTrip: boolean;
  // navigation
  goNext: () => void;
  goBack: () => void;
  jumpTo: (key: string) => void;
  // state mutators
  setLodgingChoice: (id: string) => void;
  setAllocationMode: (itemType: WizardItemType, itemId: string, mode: AllocationMode) => void;
  setAllocationCost: (itemType: WizardItemType, itemId: string, costInput: string) => void;
  setPaymentHandle: (
    field: 'venmo' | 'zelle' | 'cashapp',
    value: string,
  ) => void;
  setLockDeadline: (iso: string | null) => void;
  /** Skip the payment-handle screen — applies no handle writes. */
  skipPayment: () => void;
};

export function useWizardState(ctx: LockWizardContext): UseWizardStateApi {
  const [state, setState] = useState<WizardState>(() => initialState(ctx));
  const [currentStepKey, setCurrentStepKey] = useState<string>('verify');

  const steps = useMemo(() => computeSteps(ctx, state), [ctx, state]);
  const isEmptyTrip =
    ctx.lodgings.length === 0 && ctx.headliner === null && ctx.transport.length === 0;

  // Resolve currentStep from key — if the key is no longer present (e.g.,
  // the payment step was just removed because the user flipped an allocation
  // to individual), fall back to the previous step in the list, or verify.
  let currentIndex = steps.findIndex((s) => stepKey(s) === currentStepKey);
  if (currentIndex < 0) {
    // Try to find the closest preceding step by name prefix.
    currentIndex = 0;
  }
  const currentStep = steps[currentIndex] ?? steps[0];

  const goNext = useCallback(() => {
    setCurrentStepKey((prev) => {
      const nextSteps = computeSteps(ctx, state);
      const idx = nextSteps.findIndex((s) => stepKey(s) === prev);
      if (idx < 0 || idx >= nextSteps.length - 1) return prev;
      return stepKey(nextSteps[idx + 1]);
    });
  }, [ctx, state]);

  const goBack = useCallback(() => {
    setCurrentStepKey((prev) => {
      const nextSteps = computeSteps(ctx, state);
      const idx = nextSteps.findIndex((s) => stepKey(s) === prev);
      if (idx <= 0) return prev;
      return stepKey(nextSteps[idx - 1]);
    });
  }, [ctx, state]);

  const jumpTo = useCallback((key: string) => {
    setCurrentStepKey(key);
  }, []);

  const setLodgingChoice = useCallback((id: string) => {
    setState((s) => ({ ...s, lodgingChoiceId: id }));
  }, []);

  const setAllocationMode = useCallback(
    (itemType: WizardItemType, itemId: string, mode: AllocationMode) => {
      setState((s) => {
        const k = allocationKey(itemType, itemId);
        const prev = s.allocations[k];
        const next: AllocationDecision = { mode, costInput: prev?.costInput ?? '' };
        return { ...s, allocations: { ...s.allocations, [k]: next } };
      });
    },
    [],
  );

  const setAllocationCost = useCallback(
    (itemType: WizardItemType, itemId: string, costInput: string) => {
      setState((s) => {
        const k = allocationKey(itemType, itemId);
        const prev = s.allocations[k];
        const next: AllocationDecision = { mode: prev?.mode ?? null, costInput };
        return { ...s, allocations: { ...s.allocations, [k]: next } };
      });
    },
    [],
  );

  const setPaymentHandle = useCallback(
    (field: 'venmo' | 'zelle' | 'cashapp', value: string) => {
      setState((s) => ({ ...s, paymentHandles: { ...s.paymentHandles, [field]: value } }));
    },
    [],
  );

  const setLockDeadline = useCallback((iso: string | null) => {
    setState((s) => ({ ...s, lockDeadlineIso: iso }));
  }, []);

  const skipPayment = useCallback(() => {
    setState((s) => ({ ...s, paymentHandles: { venmo: '', zelle: '', cashapp: '' } }));
    // Advance from payment to review on skip; computeSteps still drops the
    // payment screen so the next render lands cleanly.
    setCurrentStepKey('review');
  }, []);

  return {
    state,
    steps,
    currentStepKey: stepKey(currentStep),
    currentStep,
    currentIndex,
    totalSteps: steps.length,
    isEmptyTrip,
    goNext,
    goBack,
    jumpTo,
    setLodgingChoice,
    setAllocationMode,
    setAllocationCost,
    setPaymentHandle,
    setLockDeadline,
    skipPayment,
  };
}

// ─── Cost-input parser (shared by allocation + review) ─────────────

/**
 * Parse a user-typed cost string into dollars + a validation verdict.
 * Accepts "1200", "1,200", "1200.50", "$1,200". Rejects empty / NaN / ≤0
 * for organizer-books allocations.
 */
export type CostParseResult =
  | { ok: true; dollars: number }
  | { ok: false; reason: 'empty' | 'invalid' };

export function parseCost(raw: string): CostParseResult {
  const trimmed = raw.trim().replace(/^\$/, '').replace(/,/g, '');
  if (trimmed === '') return { ok: false, reason: 'empty' };
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return { ok: false, reason: 'invalid' };
  return { ok: true, dollars: Math.round(n * 100) / 100 };
}

/** Format a dollar amount for display, e.g., 18000 → "$18,000". */
export function formatDollars(n: number): string {
  if (!Number.isFinite(n)) return '$0';
  if (Number.isInteger(n)) return `$${n.toLocaleString('en-US')}`;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
