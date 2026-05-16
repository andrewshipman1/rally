'use client';

// Session 12B — thin progress bar at the top of every wizard screen.
// Fill width = (currentIndex + 1) / totalSteps, clamped [0, 1].

type Props = {
  currentIndex: number;
  totalSteps: number;
  /** Renders the fill in error red on the final-review error state. */
  errored?: boolean;
};

export function WizardProgressBar({ currentIndex, totalSteps, errored }: Props) {
  const ratio = totalSteps > 0
    ? Math.min(1, Math.max(0, (currentIndex + 1) / totalSteps))
    : 0;
  return (
    <div className="lock-wizard-progress">
      <div
        className={`lock-wizard-progress-fill${errored ? ' lock-wizard-progress-fill--error' : ''}`}
        style={{ width: `${ratio * 100}%` }}
        aria-hidden="true"
      />
    </div>
  );
}
