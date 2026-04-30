// Phase 5 — locked plan summary shown to unauthenticated invitees.
//
// Renders a small "the plan" card (flight / lodging / activity / total)
// using real trip data. By default `.locked-body` blurs via filter:
// blur(4px) + aria-hidden=true and the `.locked-overlay` shows a
// "sign in to see the plan ↑" pill.
//
// 10D additions:
//   - `unlocked` prop adds an `.unlocked` class to the root section,
//     triggering the CSS reveal transition (blur 4px → 0 over 600ms,
//     overlay opacity 1 → 0 starting ~300ms in). aria-hidden flips
//     to "false" so screen readers can read the rows once revealed.
//   - `linkSent` prop swaps the overlay copy from
//     `inviteeState.lockedOverlayMessage` to `…lockedOverlayMessageSent`
//     and adds a `.sent` modifier class for the lime-accent treatment.

import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { Lodging, Flight, Activity, TripCostSummary } from '@/types';

type Props = {
  themeId: ThemeId;
  lodging: Lodging[];
  flights: Flight[];
  activities: Activity[];
  cost: TripCostSummary;
  unlocked?: boolean;
  linkSent?: boolean;
};

export function LockedPlan({
  themeId,
  lodging,
  flights,
  activities,
  cost,
  unlocked = false,
  linkSent = false,
}: Props) {
  const lodgingRow = lodging[0];
  const flightRow = flights[0];
  const activityRow = activities[0];

  // Sent state only matters while still locked — once unlocked, the
  // overlay fades out regardless of its copy.
  const showSentOverlay = linkSent && !unlocked;
  const overlayMessageKey = showSentOverlay
    ? 'inviteeState.lockedOverlayMessageSent'
    : 'inviteeState.lockedOverlayMessage';

  return (
    <div
      className={`locked-section${unlocked ? ' unlocked' : ''}`}
      role="region"
      aria-label="Trip plan preview"
    >
      <div className="locked-header">
        <div className="locked-title">
          {getCopy(themeId, 'inviteeState.lockedSectionHeader')}
        </div>
        <div className="locked-pill">
          {getCopy(themeId, 'inviteeState.lockedSectionPill')}
        </div>
      </div>

      <div className="locked-body" aria-hidden={unlocked ? 'false' : 'true'}>
        {flightRow && (
          <div className="locked-row">
            <span className="locked-label">
              {flightRow.airline ?? `${flightRow.departure_airport} → ${flightRow.arrival_airport}`}
            </span>
            <span>
              {flightRow.estimated_price != null
                ? `$${Math.round(flightRow.estimated_price)}`
                : '—'}
            </span>
          </div>
        )}
        {lodgingRow && (
          <div className="locked-row">
            <span className="locked-label">{lodgingRow.name}</span>
            <span>
              {lodgingRow.total_cost != null
                ? `$${Math.round(lodgingRow.total_cost)}`
                : lodgingRow.cost_per_night != null
                  ? `$${Math.round(lodgingRow.cost_per_night)}/nt`
                  : '—'}
            </span>
          </div>
        )}
        {activityRow && (
          <div className="locked-row">
            <span className="locked-label">{activityRow.name}</span>
            <span>
              {activityRow.estimated_cost != null
                ? `$${Math.round(activityRow.estimated_cost)}`
                : '—'}
            </span>
          </div>
        )}
        <div className="locked-row">
          <span className="locked-label">
            {getCopy(themeId, 'tripPageShared.cost.h2')}
          </span>
          <span>{getCopy(themeId, 'tripPageShared.cost.currencySymbol')}{Math.round(cost.per_person_total)}</span>
        </div>
      </div>

      <div
        className={`locked-overlay${showSentOverlay ? ' sent' : ''}`}
        role="alert"
        aria-live="polite"
      >
        <div className="locked-overlay-pill">
          {getCopy(themeId, overlayMessageKey)}
        </div>
      </div>
    </div>
  );
}
