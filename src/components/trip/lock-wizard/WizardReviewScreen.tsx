'use client';

// Session 12B — wizard screen 7 (final review).
// All decisions render as editable rows ("change" → jumpTo). The primary
// CTA `lock it in 🔒` calls fireLock with the assembled FireLockParams.
// In-flight: CTA disables to "locking…" (prevents double-submit).
// On error: lexicon-keyed error banner renders at the top; CTA flips to
// "refresh trip page →" / "try again".
// Mockup frames 8 (happy), 12 (all-individual), 16 (concurrent error).

import { differenceInCalendarDays, format } from 'date-fns';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import {
  fireLock,
  type FireLockAllocation,
  type FireLockParams,
  type FireLockResult,
} from '@/app/actions/fire-lock';
import {
  allocationKey,
  type LockWizardContext,
  type WizardState,
  type WizardStep,
} from './types';
import { formatDollars, parseCost } from './useWizardState';

type Props = {
  ctx: LockWizardContext;
  state: WizardState;
  steps: WizardStep[];
  onJumpTo: (stepKey: string) => void;
  onClose: () => void;
};

type ErrorKey =
  | 'concurrent'
  | 'already'
  | 'notOrganizer'
  | 'unauth'
  | 'notFound'
  | 'validation'
  | 'network';

// fireLock returns string codes (verbatim from the RPC RAISE EXCEPTION
// text + the action's pre-checks). Map to the wizard's error categories
// so the user sees a coherent banner.
function classifyError(code: string): ErrorKey {
  // RPC's CAS guard for already-locked-during-wizard race.
  if (code === 'concurrent_lock_attempt') return 'concurrent';
  // Action's pre-check + the RPC's own already-locked path.
  if (code === 'already_locked' || code === 'trip_not_in_sell_phase')
    return 'already';
  if (code === 'not_organizer') return 'notOrganizer';
  if (code === 'not_authenticated') return 'unauth';
  if (code === 'trip_not_found') return 'notFound';
  // RPC validation paths (per Lock-A release notes):
  // invalid_allocation_mode, missing_actual_cost_for_organizer_books,
  // headliner_item_id_mismatch, unknown_item_type, invalid_input,
  // malformed_rpc_response.
  if (
    code === 'invalid_allocation_mode' ||
    code === 'missing_actual_cost_for_organizer_books' ||
    code === 'headliner_item_id_mismatch' ||
    code === 'unknown_item_type' ||
    code === 'invalid_input' ||
    code === 'malformed_rpc_response' ||
    code === 'unknown_rpc_failure'
  ) {
    return 'validation';
  }
  return 'network';
}

export function WizardReviewScreen({
  ctx,
  state,
  steps,
  onJumpTo,
  onClose,
}: Props) {
  const { themeId } = ctx;
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);

  // Resolve the chosen lodging (or first when null — defensive; shouldn't
  // happen on review since override gates progression).
  const chosenLodging =
    ctx.lodgings.find((l) => l.id === state.lodgingChoiceId) ?? ctx.lodgings[0] ?? null;

  // Build the rows + the FireLockParams payload from current state.
  type ReviewRow = {
    label: string;
    value: string;
    valueTone?: 'accent' | 'muted';
    editStepKey: string | null;
  };
  const rows: ReviewRow[] = [];

  // Spot (lodging) — uses lodging allocation decision.
  if (chosenLodging) {
    const lodgingDecision = state.allocations[allocationKey('lodging', chosenLodging.id)];
    const allocStepKey = `allocation:lodging:${chosenLodging.id}`;
    if (lodgingDecision?.mode === 'organizer_books') {
      const parsed = parseCost(lodgingDecision.costInput);
      const costStr = parsed.ok ? formatDollars(parsed.dollars) : '—';
      rows.push({
        label: getCopy(themeId, 'lockWizard.review.label.spot'),
        value: getCopy(themeId, 'lockWizard.review.value.organizerBooks', {
          name: chosenLodging.name,
          cost: costStr,
        }),
        editStepKey: allocStepKey,
      });
    } else {
      rows.push({
        label: getCopy(themeId, 'lockWizard.review.label.spot'),
        value: getCopy(themeId, 'lockWizard.review.value.individual', {
          name: chosenLodging.name,
        }),
        editStepKey: allocStepKey,
      });
    }
  }

  // Headliner.
  if (ctx.headliner) {
    const hd = state.allocations[allocationKey('headliner', ctx.tripId)];
    const allocStepKey = `allocation:headliner:${ctx.tripId}`;
    if (hd?.mode === 'organizer_books') {
      const parsed = parseCost(hd.costInput);
      const costStr = parsed.ok ? formatDollars(parsed.dollars) : '—';
      rows.push({
        label: getCopy(themeId, 'lockWizard.review.label.headliner'),
        value: getCopy(themeId, 'lockWizard.review.value.organizerBooks', {
          name: ctx.headliner.name,
          cost: costStr,
        }),
        editStepKey: allocStepKey,
      });
    } else {
      rows.push({
        label: getCopy(themeId, 'lockWizard.review.label.headliner'),
        value: getCopy(themeId, 'lockWizard.review.value.individual', {
          name: ctx.headliner.name,
        }),
        editStepKey: allocStepKey,
      });
    }
  }

  // Transport (per item).
  for (const t of ctx.transport) {
    const td = state.allocations[allocationKey('transport', t.id)];
    const allocStepKey = `allocation:transport:${t.id}`;
    const label = getCopy(themeId, 'lockWizard.review.label.transport', { name: t.name });
    if (td?.mode === 'organizer_books') {
      const parsed = parseCost(td.costInput);
      const costStr = parsed.ok ? formatDollars(parsed.dollars) : '—';
      rows.push({
        label,
        value: getCopy(themeId, 'lockWizard.review.value.organizerBooksUnnamed', {
          cost: costStr,
        }),
        editStepKey: allocStepKey,
      });
    } else {
      rows.push({
        label,
        value: getCopy(themeId, 'lockWizard.review.value.individualUnnamed'),
        editStepKey: allocStepKey,
      });
    }
  }

  // Your share total — sum of organizer-books actual costs ÷ post-lock divisor.
  const orgBooksTotal = Object.values(state.allocations).reduce((sum, d) => {
    if (d?.mode !== 'organizer_books') return sum;
    const p = parseCost(d.costInput);
    return p.ok ? sum + p.dollars : sum;
  }, 0);
  const postLockDivisor = Math.max(1, ctx.inCount); // post-lock: holding → out
  const hasShared = orgBooksTotal > 0;
  rows.push({
    label: getCopy(themeId, 'lockWizard.review.label.yourShare'),
    value: hasShared
      ? getCopy(themeId, 'lockWizard.review.value.yourShare', {
          amount: Math.round(orgBooksTotal / postLockDivisor).toLocaleString('en-US'),
          attendees: ctx.inCount,
        })
      : getCopy(themeId, 'lockWizard.review.value.yourShareEmpty'),
    valueTone: hasShared ? 'accent' : 'muted',
    editStepKey: null,
  });

  // Booking deadline.
  let deadlineValue: string;
  if (state.lockDeadlineIso && ctx.dateStartIso) {
    const days = Math.max(
      0,
      differenceInCalendarDays(new Date(ctx.dateStartIso), new Date(state.lockDeadlineIso)),
    );
    deadlineValue = getCopy(themeId, 'lockWizard.review.value.deadline', {
      date: format(new Date(state.lockDeadlineIso), 'MMM d').toLowerCase(),
      days,
    });
  } else {
    deadlineValue = getCopy(themeId, 'lockWizard.review.value.deadlineNoDate');
  }
  rows.push({
    label: getCopy(themeId, 'lockWizard.review.label.bookingDeadline'),
    value: deadlineValue,
    editStepKey: 'verify', // no dedicated deadline screen in v0; verify shows the trip context
  });

  const isAllIndividual =
    Object.values(state.allocations).every((d) => d?.mode === 'individual_books') &&
    Object.keys(state.allocations).length > 0;

  async function handleFire() {
    if (submitting) return;
    setSubmitting(true);
    setErrorKey(null);

    // Build FireLockAllocation[] from state.
    const allocations: FireLockAllocation[] = [];
    if (chosenLodging) {
      const d = state.allocations[allocationKey('lodging', chosenLodging.id)];
      if (d?.mode) {
        const parsed = d.mode === 'organizer_books' ? parseCost(d.costInput) : null;
        allocations.push({
          itemType: 'lodging',
          itemId: chosenLodging.id,
          mode: d.mode,
          ...(d.mode === 'organizer_books' && parsed?.ok
            ? { actualCost: parsed.dollars }
            : {}),
        });
      }
    }
    if (ctx.headliner) {
      const d = state.allocations[allocationKey('headliner', ctx.tripId)];
      if (d?.mode) {
        const parsed = d.mode === 'organizer_books' ? parseCost(d.costInput) : null;
        allocations.push({
          itemType: 'headliner',
          itemId: ctx.tripId,
          mode: d.mode,
          ...(d.mode === 'organizer_books' && parsed?.ok
            ? { actualCost: parsed.dollars }
            : {}),
        });
      }
    }
    for (const t of ctx.transport) {
      const d = state.allocations[allocationKey('transport', t.id)];
      if (d?.mode) {
        const parsed = d.mode === 'organizer_books' ? parseCost(d.costInput) : null;
        allocations.push({
          itemType: 'transport',
          itemId: t.id,
          mode: d.mode,
          ...(d.mode === 'organizer_books' && parsed?.ok
            ? { actualCost: parsed.dollars }
            : {}),
        });
      }
    }

    const lockDeadline = state.lockDeadlineIso ?? ctx.commitDeadlineIso ?? new Date().toISOString();
    const hasAnyHandle =
      state.paymentHandles.venmo.trim() ||
      state.paymentHandles.zelle.trim() ||
      state.paymentHandles.cashapp.trim();

    const params: FireLockParams = {
      tripId: ctx.tripId,
      slug: ctx.slug,
      lodgingChoice: chosenLodging ? { lodgingId: chosenLodging.id } : null,
      allocations,
      lockDeadline,
      ...(hasAnyHandle
        ? {
            paymentHandles: {
              ...(state.paymentHandles.venmo.trim()
                ? { venmo: state.paymentHandles.venmo.trim() }
                : {}),
              ...(state.paymentHandles.zelle.trim()
                ? { zelle: state.paymentHandles.zelle.trim() }
                : {}),
              ...(state.paymentHandles.cashapp.trim()
                ? { cashapp: state.paymentHandles.cashapp.trim() }
                : {}),
            },
          }
        : {}),
    };

    let result: FireLockResult;
    try {
      result = await fireLock(params);
    } catch {
      setErrorKey('network');
      setSubmitting(false);
      return;
    }

    if (result.ok) {
      onClose();
      router.refresh();
      return;
    }

    setErrorKey(classifyError(result.error));
    setSubmitting(false);
  }

  const hasError = errorKey !== null;
  const headingSubKey = isAllIndividual
    ? 'lockWizard.review.subAllIndividual'
    : 'lockWizard.review.sub';
  // void steps to satisfy unused-param lint on the receiving end (kept for parity with state).
  void steps;

  return (
    <div className="lock-wizard-screen lock-wizard-screen--review">
      {hasError && errorKey && (
        <div className="lock-wizard-error">
          <div className="lock-wizard-error-title">
            {getCopy(themeId, `lockWizard.error.${errorKey}.heading`)}
          </div>
          <div className="lock-wizard-error-body">
            {getCopy(themeId, `lockWizard.error.${errorKey}.body`)}
          </div>
        </div>
      )}

      <div className="lock-wizard-h">
        {getCopy(themeId, 'lockWizard.review.heading')}
      </div>
      <div
        className="lock-wizard-sub"
        style={hasError ? { opacity: 0.5 } : undefined}
      >
        {getCopy(themeId, headingSubKey)}
      </div>

      {rows.map((row, idx) => (
        <div
          key={`${row.label}-${idx}`}
          className="lock-wizard-review-row"
          style={hasError ? { opacity: 0.4 } : undefined}
        >
          <div>
            <div className="lock-wizard-review-label">{row.label}</div>
            <div
              className={`lock-wizard-review-value${
                row.valueTone === 'accent'
                  ? ' lock-wizard-review-value--accent'
                  : row.valueTone === 'muted'
                    ? ' lock-wizard-review-value--muted'
                    : ''
              }`}
            >
              {row.value}
            </div>
          </div>
          {row.editStepKey && !hasError && (
            <button
              type="button"
              className="lock-wizard-review-edit"
              onClick={() => onJumpTo(row.editStepKey!)}
            >
              {getCopy(themeId, 'lockWizard.review.cta.editRow')}
            </button>
          )}
        </div>
      ))}

      {hasError ? (
        <>
          <button
            type="button"
            className="lock-wizard-cta"
            onClick={() => router.refresh()}
            style={{ marginTop: 18 }}
          >
            {getCopy(themeId, 'lockWizard.error.cta.refresh')}
          </button>
          <button
            type="button"
            className="lock-wizard-cta-secondary"
            onClick={() => {
              setErrorKey(null);
              void handleFire();
            }}
          >
            {getCopy(themeId, 'lockWizard.error.cta.retry')}
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className={`lock-wizard-cta${submitting ? ' lock-wizard-cta--disabled' : ''}`}
            onClick={() => void handleFire()}
            disabled={submitting}
            style={{ marginTop: 18 }}
          >
            {submitting
              ? getCopy(themeId, 'lockWizard.review.cta.firing')
              : getCopy(themeId, 'lockWizard.review.cta.fire')}
          </button>
          <button
            type="button"
            className="lock-wizard-cta-secondary"
            onClick={onClose}
          >
            {getCopy(themeId, 'lockWizard.review.cta.goBack')}
          </button>
        </>
      )}
    </div>
  );
}
