'use client';

// Session 12B — wizard screen 2 (lodging override).
// Radio list of lodging options with vote counts. Sub-copy varies by
// vote state: clear-winner (default selected), no-votes (no preselect),
// tied (no preselect). The drawer skips this screen entirely when the
// trip has only 1 lodging.
// Mockup frames 2 (clear winner) + 11 (no votes + tied).

import { getCopy } from '@/lib/copy/get-copy';
import { classifyVoteState, type LockWizardContext, type LodgingVoteState } from './types';

type Props = {
  ctx: LockWizardContext;
  selectedLodgingId: string | null;
  onSelect: (id: string) => void;
  onContinue: () => void;
};

function subCopyKey(voteState: LodgingVoteState): string {
  switch (voteState) {
    case 'no_votes': return 'lockWizard.lodgingOverride.sub.noVotes';
    case 'tied':     return 'lockWizard.lodgingOverride.sub.tied';
    case 'single':   return 'lockWizard.lodgingOverride.sub.singleSpot';
    case 'clear_winner':
    case 'none':
    default:         return 'lockWizard.lodgingOverride.sub.default';
  }
}

export function WizardLodgingOverrideScreen({
  ctx,
  selectedLodgingId,
  onSelect,
  onContinue,
}: Props) {
  const { themeId, lodgings, voteTotalVoters } = ctx;
  const voteState = classifyVoteState(lodgings);
  // For tied state, highlight the tied options. Both share the max vote count.
  const maxVotes = lodgings.reduce((m, l) => Math.max(m, l.voteCount), 0);
  const continueDisabled = !selectedLodgingId;

  return (
    <div className="lock-wizard-screen lock-wizard-screen--lodging-pick">
      <div className="lock-wizard-h">
        {getCopy(themeId, 'lockWizard.lodgingOverride.heading')}
      </div>
      <div className="lock-wizard-sub">
        {getCopy(themeId, subCopyKey(voteState))}
      </div>
      <div className="lock-wizard-radio-list">
        {lodgings.map((l) => {
          const isSelected = selectedLodgingId === l.id;
          const isTied = voteState === 'tied' && l.voteCount === maxVotes;
          const rowClass = `lock-wizard-radio-row${
            isSelected ? ' lock-wizard-radio-row--selected' : ''
          }${isTied && !isSelected ? ' lock-wizard-radio-row--tied' : ''}`;
          const meta =
            l.voteCount > 0
              ? getCopy(themeId, 'lockWizard.lodgingOverride.meta.voteCount', {
                  votes: l.voteCount,
                  total: voteTotalVoters,
                })
              : getCopy(themeId, 'lockWizard.lodgingOverride.meta.zero');
          return (
            <button
              key={l.id}
              type="button"
              className={rowClass}
              onClick={() => onSelect(l.id)}
              aria-pressed={isSelected}
            >
              <span className="lock-wizard-radio-circle" aria-hidden="true" />
              <span className="lock-wizard-radio-content">
                <span className="lock-wizard-radio-label">{l.name}</span>
                <span className="lock-wizard-radio-sub">{l.summary}</span>
              </span>
              <span
                className={`lock-wizard-radio-meta${
                  l.voteCount === 0 ? ' lock-wizard-radio-meta--muted' : ''
                }`}
              >
                {meta}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={`lock-wizard-cta${continueDisabled ? ' lock-wizard-cta--disabled' : ''}`}
        onClick={() => !continueDisabled && onContinue()}
        disabled={continueDisabled}
      >
        {getCopy(themeId, 'lockWizard.lodgingOverride.cta')}
      </button>
    </div>
  );
}
