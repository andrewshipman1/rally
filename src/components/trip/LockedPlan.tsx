// Phase 5 — locked plan summary shown to unauthenticated invitees.
//
// Renders a small "the plan" card (flight / lodging / activity / total)
// using real trip data, then applies filter: blur(4px) via `.locked-body`
// and drops an absolutely-positioned "sign in to see the plan ↑" pill
// over it via `.locked-overlay`. The blurred body is aria-hidden so
// screen readers don't read garbled numbers.
//
// Semantics: login gate, not RSVP gate. The numbers exist on the page
// (so the blur has something to blur), but they're unreadable until
// the viewer converts via the sticky bar's primary CTA.

import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { Lodging, Flight, Activity, TripCostSummary } from '@/types';

type Props = {
  themeId: ThemeId;
  lodging: Lodging[];
  flights: Flight[];
  activities: Activity[];
  cost: TripCostSummary;
};

export function LockedPlan({ themeId, lodging, flights, activities, cost }: Props) {
  const lodgingRow = lodging[0];
  const flightRow = flights[0];
  const activityRow = activities[0];

  return (
    <div className="locked-section">
      <div className="locked-header">
        <div className="locked-title">
          {getCopy(themeId, 'inviteeState.lockedSectionHeader')}
        </div>
        <div className="locked-pill">
          {getCopy(themeId, 'inviteeState.lockedSectionPill')}
        </div>
      </div>

      <div className="locked-body" aria-hidden="true">
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

      <div className="locked-overlay">
        <div className="locked-overlay-pill">
          {getCopy(themeId, 'inviteeState.lockedOverlayMessage')}
        </div>
      </div>
    </div>
  );
}
