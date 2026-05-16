// Session 12B — Lock-B wizard types.
//
// Shared between useWizardState, the per-screen components, and the
// LockWizardDrawer host. The wizard never persists to the server until
// the final-review submit (which calls fireLock once with the full
// FireLockParams payload).

import type { ThemeId } from '@/lib/themes/types';

// ─── Per-item context (input to step generation + screens) ─────────

export type WizardItemType = 'lodging' | 'headliner' | 'transport';

/** Lodging option as the wizard sees it (vote-augmented). */
export type WizardLodgingOption = {
  id: string;
  name: string;
  /** Total estimate in dollars (e.g., cost_per_night × nights, or total_cost). */
  estimateDollars: number | null;
  /** One-line meta string for the radio row, e.g., "$1,200/night · 3 nights · 5 rooms". */
  summary: string;
  voteCount: number;
  isVoteWinner: boolean;
};

export type WizardHeadliner = {
  /** Headliner description (no separate name on Trip). */
  name: string;
  /** Total estimate in dollars for cost.hint and review row. */
  estimateDollars: number | null;
  /** Per-person cost for allocation.sub.headliner (display only). null when not per-person. */
  perPersonDollars: number | null;
};

export type WizardTransportItem = {
  id: string;
  /** Transport description (route or label). */
  name: string;
  /** Estimated total dollars. */
  estimateDollars: number | null;
};

/** What the wizard needs from the trip to compute step sequence + render content. */
export type LockWizardContext = {
  // Identity / chrome
  tripId: string;
  slug: string;
  themeId: ThemeId;
  tripName: string;
  destination: string | null;
  dateStartIso: string | null;
  dateEndIso: string | null;
  /** Used as default lock_deadline (organizer can edit on review screen). */
  commitDeadlineIso: string | null;
  // Crew counts (sell-state). holding members get bumped to out on lock.
  inCount: number;
  holdingCount: number;
  outCount: number;
  /** Total voters considered for the vote-meta line ("4 of 6"). */
  voteTotalVoters: number;
  // Allocatable inventory
  lodgings: WizardLodgingOption[];
  headliner: WizardHeadliner | null;
  transport: WizardTransportItem[];
  /** Pre-existing payment handles on the organizer's user row. */
  organizerHandles: {
    venmo: string | null;
    zelle: string | null;
    cashapp: string | null;
  };
};

// ─── Wizard state shape ────────────────────────────────────────────

export type AllocationMode = 'organizer_books' | 'individual_books';

/** Per-item decision. Keyed in WizardState.allocations by `${itemType}:${itemId}`. */
export type AllocationDecision = {
  mode: AllocationMode | null;
  /** Raw input string (preserves typing state, formatted to dollars on submit). */
  costInput: string;
};

export type WizardState = {
  /** Map: `${itemType}:${itemId}` → decision. Keys mirror what comes through `key()`. */
  allocations: Record<string, AllocationDecision>;
  /** Selected lodging id. Defaults from vote winner on init; user can override on screen 2. */
  lodgingChoiceId: string | null;
  /** Payment-handle inputs (always present in state; only used when the payment screen fires). */
  paymentHandles: { venmo: string; zelle: string; cashapp: string };
  /** Booking deadline ISO. Defaults to commitDeadlineIso. */
  lockDeadlineIso: string | null;
};

export function allocationKey(itemType: WizardItemType, itemId: string): string {
  return `${itemType}:${itemId}`;
}

// ─── Step sequence (computed) ──────────────────────────────────────

export type WizardStep =
  | { kind: 'verify' }
  | { kind: 'lodgingPick' }
  | {
      kind: 'allocation';
      itemType: WizardItemType;
      itemId: string;
      itemName: string;
      estimateDollars: number | null;
      /** Headliner has a per-person display string. */
      perPersonDollars?: number | null;
    }
  | { kind: 'payment' }
  | { kind: 'review' };

/** Unique key for a step (used for currentStepKey navigation). */
export function stepKey(step: WizardStep): string {
  switch (step.kind) {
    case 'verify':
    case 'lodgingPick':
    case 'payment':
    case 'review':
      return step.kind;
    case 'allocation':
      return `allocation:${step.itemType}:${step.itemId}`;
  }
}

/** Vote-state classifier for the override screen's sub-copy. */
export type LodgingVoteState = 'none' | 'single' | 'no_votes' | 'tied' | 'clear_winner';

export function classifyVoteState(lodgings: WizardLodgingOption[]): LodgingVoteState {
  if (lodgings.length === 0) return 'none';
  if (lodgings.length === 1) return 'single';
  const totals = lodgings.map((l) => l.voteCount).sort((a, b) => b - a);
  if (totals[0] === 0) return 'no_votes';
  if (totals[0] === totals[1]) return 'tied';
  return 'clear_winner';
}
