'use client';

// Session 12B — wizard screen 1 (verification).
// Two variants:
//   - happy: trip-state summary card + bump-divisor note + continue + edit-first
//   - blocked: empty-trip info banner, continue disabled, only edit-first usable
// Mockup frames 1 (happy) + 9 (blocked).

import { format } from 'date-fns';
import { getCopy } from '@/lib/copy/get-copy';
import { classifyVoteState, type LockWizardContext } from './types';

type Props = {
  ctx: LockWizardContext;
  /** True when the trip has zero allocatable items — blocks continue. */
  isEmptyTrip: boolean;
  onContinue: () => void;
  onEditFirst: () => void;
};

function formatDateRange(startIso: string | null, endIso: string | null): string {
  if (!startIso || !endIso) return '—';
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    return `${format(s, 'MMM d').toLowerCase()} → ${format(e, 'd').toLowerCase()}`;
  } catch {
    return '—';
  }
}

export function WizardVerifyScreen({ ctx, isEmptyTrip, onContinue, onEditFirst }: Props) {
  const { themeId } = ctx;
  const preLockDivisor = ctx.inCount + ctx.holdingCount;
  const postLockDivisor = ctx.inCount;
  const showBumpNote = ctx.holdingCount > 0;

  if (isEmptyTrip) {
    return (
      <div className="lock-wizard-screen lock-wizard-screen--verify">
        <div className="lock-wizard-h">
          {getCopy(themeId, 'lockWizard.verify.blocked.heading')}
        </div>
        <div className="lock-wizard-sub">
          {getCopy(themeId, 'lockWizard.verify.blocked.sub')}
        </div>
        <div className="lock-wizard-info">
          <div className="lock-wizard-info-title">
            {getCopy(themeId, 'lockWizard.verify.blocked.bannerTitle')}
          </div>
          <div className="lock-wizard-info-body">
            • {getCopy(themeId, 'lockWizard.verify.blocked.lodging')}
            <br />
            • {getCopy(themeId, 'lockWizard.verify.blocked.headliner')}
            <br />
            •{' '}
            {getCopy(themeId, 'lockWizard.verify.blocked.transport', {
              count: ctx.transport.length,
            })}
          </div>
        </div>
        <button
          type="button"
          className="lock-wizard-cta lock-wizard-cta--disabled"
          disabled
        >
          {getCopy(themeId, 'lockWizard.verify.cta.continue')}
        </button>
        <button
          type="button"
          className="lock-wizard-cta-secondary"
          onClick={onEditFirst}
        >
          {getCopy(themeId, 'lockWizard.verify.cta.editFirst')}
        </button>
      </div>
    );
  }

  // Happy variant — summary card
  const voteState = classifyVoteState(ctx.lodgings);
  const winner = ctx.lodgings.find((l) => l.isVoteWinner) ?? ctx.lodgings[0];
  let voteValue: string;
  switch (voteState) {
    case 'clear_winner':
      voteValue = getCopy(themeId, 'lockWizard.verify.summary.voteValue', {
        name: winner.name,
        votes: winner.voteCount,
        total: ctx.voteTotalVoters,
      });
      break;
    case 'tied':
      voteValue = getCopy(themeId, 'lockWizard.verify.summary.voteTied');
      break;
    case 'no_votes':
      voteValue = getCopy(themeId, 'lockWizard.verify.summary.voteNoVotes');
      break;
    case 'single':
      voteValue = getCopy(themeId, 'lockWizard.verify.summary.voteSingle', {
        name: ctx.lodgings[0].name,
      });
      break;
    case 'none':
      voteValue = getCopy(themeId, 'lockWizard.verify.summary.voteNone');
      break;
  }

  const itemsToAllocate =
    ctx.lodgings.length + (ctx.headliner ? 1 : 0) + ctx.transport.length;

  return (
    <div className="lock-wizard-screen lock-wizard-screen--verify">
      <div className="lock-wizard-h">
        {getCopy(themeId, 'lockWizard.verify.heading')}
      </div>
      <div className="lock-wizard-sub">
        {getCopy(themeId, 'lockWizard.verify.sub')}
      </div>
      <div className="lock-wizard-card">
        <SummaryRow themeId={themeId} keyLabel="trip" value={ctx.tripName} />
        <SummaryRow
          themeId={themeId}
          keyLabel="when"
          value={formatDateRange(ctx.dateStartIso, ctx.dateEndIso)}
        />
        <SummaryRow
          themeId={themeId}
          keyLabel="where"
          value={ctx.destination?.toLowerCase() ?? '—'}
        />
        <SummaryRow
          themeId={themeId}
          keyLabel="crew"
          value={getCopy(themeId, 'lockWizard.verify.summary.crewValue', {
            inCount: ctx.inCount,
            holdingCount: ctx.holdingCount,
            outCount: ctx.outCount,
          })}
        />
        <SummaryRow themeId={themeId} keyLabel="lodgingVote" value={voteValue} />
        <SummaryRow
          themeId={themeId}
          keyLabel="items"
          value={String(itemsToAllocate)}
        />
      </div>
      {showBumpNote && (
        <div className="lock-wizard-bump-note">
          ⓘ{' '}
          {getCopy(themeId, 'lockWizard.verify.bumpNote', {
            from: preLockDivisor,
            to: postLockDivisor,
          })}
        </div>
      )}
      <button type="button" className="lock-wizard-cta" onClick={onContinue}>
        {getCopy(themeId, 'lockWizard.verify.cta.continue')}
      </button>
      <button
        type="button"
        className="lock-wizard-cta-secondary"
        onClick={onEditFirst}
      >
        {getCopy(themeId, 'lockWizard.verify.cta.editFirst')}
      </button>
    </div>
  );
}

function SummaryRow({
  themeId,
  keyLabel,
  value,
}: {
  themeId: LockWizardContext['themeId'];
  keyLabel: 'trip' | 'when' | 'where' | 'crew' | 'lodgingVote' | 'items';
  value: string;
}) {
  return (
    <div className="lock-wizard-card-row">
      <span className="lock-wizard-card-row-key">
        {getCopy(themeId, `lockWizard.verify.summary.${keyLabel}`)}
      </span>
      <span className="lock-wizard-card-row-value">{value}</span>
    </div>
  );
}
