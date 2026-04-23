import type { TripWithDetails, TripCostSummary, ArrivalMode } from '@/types';
import type { ThemeId } from '@/lib/themes/types';
import { formatMoney } from '@/lib/money';
import { getCopy } from '@/lib/copy/get-copy';

// Session 9J — priority selector for the rollup's Accommodation line.
// Strict `>` keeps the first-added spot on ties, which matches AC.
function pickLodgingForRollup(
  lodging: TripWithDetails['lodging'],
): { spot: TripWithDetails['lodging'][number]; status: 'locked' | 'leading' | 'only-one' | 'first-added' } | null {
  if (lodging.length === 0) return null;
  const locked = lodging.find((l) => l.is_selected);
  if (locked) return { spot: locked, status: 'locked' };
  if (lodging.length === 1) return { spot: lodging[0], status: 'only-one' };
  let leader = lodging[0];
  let leaderVotes = leader.votes?.length ?? 0;
  for (const l of lodging) {
    const v = l.votes?.length ?? 0;
    if (v > leaderVotes) {
      leader = l;
      leaderVotes = v;
    }
  }
  if (leaderVotes > 0) return { spot: leader, status: 'leading' };
  return { spot: lodging[0], status: 'first-added' };
}

type Item = {
  label: string;
  val: number | null;
  icon: string;
  emphasize?: boolean;
  pending?: boolean;
};

export function CostBreakdown({
  trip,
  cost,
  dateStr,
  themeId,
  viewerArrival,
}: {
  trip: TripWithDetails;
  cost: TripCostSummary;
  dateStr: string;
  themeId: ThemeId;
  viewerArrival:
    | { mode: ArrivalMode | null; cost_cents: number | null }
    | null;
}) {
  // ─── Aggregation ─────────────────────────────────────────────────────
  const items: Item[] = [];

  if (cost.headliner_per_person > 0 && trip.headliner_description) {
    items.push({
      label: `the headliner · ${trip.headliner_description}`,
      val: cost.headliner_per_person,
      icon: '★',
      emphasize: true,
    });
  }

  const pick = pickLodgingForRollup(trip.lodging);
  if (pick) {
    const { spot: selectedLodging, status } = pick;
    const nights =
      selectedLodging.num_nights ||
      (trip.date_start && trip.date_end
        ? Math.ceil(
            (new Date(trip.date_end).getTime() - new Date(trip.date_start).getTime()) / 86400000
          )
        : 1);
    const lodgingCost =
      selectedLodging.total_cost || (selectedLodging.cost_per_night || 0) * nights;
    const perPerson = Math.round(lodgingCost / (cost.divisor_used));
    if (perPerson > 0) {
      const baseLabel = getCopy(themeId, 'tripPageShared.costBreakdown.lodging.label');
      const suffix =
        status === 'leading'
          ? ` ${getCopy(themeId, 'tripPageShared.costBreakdown.lodging.leadingSuffix')}`
          : '';
      const label = `${baseLabel} · ${selectedLodging.name}${suffix}`;
      items.push({ label, val: perPerson, icon: '🏠' });
    }
  }

  // 9O — single combined transport row (flights + transport).
  // AC11 math: round(sharedTransport / divisor) + indTransport + flightsTotal.
  // Single-item label uses the one item's display name; otherwise generic.
  const flightsTotal = trip.flights.reduce((s, f) => s + (f.estimated_price || 0), 0);
  const sharedTransport = trip.transport
    .filter((t) => t.cost_type === 'shared')
    .reduce((s, t) => s + (t.estimated_total || 0), 0);
  const indTransport = trip.transport
    .filter((t) => t.cost_type === 'individual')
    .reduce((s, t) => s + (t.estimated_total || 0), 0);
  const transportPerPerson =
    Math.round(sharedTransport / cost.divisor_used) + indTransport + flightsTotal;
  if (transportPerPerson > 0) {
    const baseTransport = getCopy(themeId, 'tripPageShared.costBreakdown.line.transport');
    const combinedCount = trip.flights.length + trip.transport.length;
    let transportLabel = baseTransport;
    if (combinedCount === 1) {
      const onlyFlight = trip.flights[0];
      const onlyTransport = trip.transport[0];
      if (onlyFlight) {
        const from = onlyFlight.departure_airport;
        const to = onlyFlight.arrival_airport;
        if (from && to) transportLabel = `${baseTransport} · ${from} → ${to}`;
      } else if (onlyTransport?.description) {
        transportLabel = `${baseTransport} · ${onlyTransport.description}`;
      }
    }
    items.push({ label: transportLabel, val: transportPerPerson, icon: '🚗' });
  }

  // 9O — meals row removed. Restaurants are go-phase data per the skill's
  // "pre-booked costs only in sketch/sell" rule. The restaurants table is
  // preserved; the row render is gone. Note: `cost.per_person_total` (the
  // hero) is server-computed and STILL includes restaurants via
  // `shared_total` + `individual_total` in calculateTripCost. Removing this
  // row does NOT change the hero number — the visible-rows-sum vs hero
  // delta is a known mismatch, logged in Session 9O release notes for a
  // follow-up server-side cleanup.

  if (cost.activities_per_person > 0) {
    items.push({
      label: getCopy(themeId, 'tripPageShared.costBreakdown.line.activities'),
      val: cost.activities_per_person,
      icon: '🤿',
    });
  }

  // 9O audit — `cost.provisions_per_person` and `cost.other_per_person`
  // do NOT exist in TripCostSummary (src/types/index.ts:417-436).
  // calculateTripCost only exposes activities_per_person. Adding those
  // fields is a data-layer change, out of scope for 9O. Flagged in Known
  // Issues; follow-up session to expose + render.

  // ─── Per-viewer personalization (Session 9B-2) ──────────────────────
  // "your way in" goes first (above the headliner) so the viewer reads
  // their own line at the top of the breakdown. Row renders in three
  // states keyed off (viewerArrival.mode, viewerArrival.cost_cents);
  // null-viewerArrival (logged-out / non-member edge) keeps the old
  // group-fallback hero + subtitle + no "your way in" row.
  const isPerViewer = viewerArrival !== null;
  const arrivalDollars =
    viewerArrival?.cost_cents != null ? viewerArrival.cost_cents / 100 : 0;

  // AC16 — per-viewer hero total. No double-count because:
  //   `cost.per_person_total` = per_person_shared + individual_total +
  //     headliner_per_person + activities_per_person (per calculateTripCost).
  //   `individual_total` pulls from `trip.flights` (the shared flight list,
  //     organizer-entered) and trip.transport[individual] + indRestaurants.
  //   `viewerArrival.cost_cents` comes from `trip_members.arrival_cost_cents`
  //     (9B-1), a DISTINCT per-member column with no overlap with trip.flights.
  // The two sources do not intersect, so adding arrivalDollars is additive,
  // not a double-count. Verified 9O.
  const yourTotal = isPerViewer
    ? cost.per_person_total + arrivalDollars
    : cost.per_person_total;

  if (isPerViewer) {
    const mode = viewerArrival.mode;
    const baseLabel = getCopy(themeId, 'tripPageShared.costBreakdown.yourWayInLabel');
    const label =
      mode == null
        ? baseLabel
        : `${baseLabel} · ${getCopy(themeId, `gettingHere.modeIcon.${mode}`)} ${getCopy(themeId, `gettingHere.modeLabel.${mode}`)}`.trim();
    items.unshift({
      label,
      val: viewerArrival.cost_cents != null ? viewerArrival.cost_cents / 100 : null,
      icon: '',
      emphasize: true,
      pending: viewerArrival.cost_cents == null,
    });
  }

  const heroLabel = isPerViewer
    ? getCopy(themeId, 'tripPageShared.costBreakdown.yourTotalLabel')
    : getCopy(themeId, 'tripPageShared.cost.perPersonLabel');
  const nightsMatch = dateStr.match(/(\d+)[–-](\d+)/);
  const nightsFromStr = nightsMatch
    ? parseInt(nightsMatch[2]) - parseInt(nightsMatch[1])
    : 3;
  const heroSubtitle = isPerViewer
    ? getCopy(themeId, 'tripPageShared.costBreakdown.subtitle')
    : `${nightsFromStr} ${getCopy(themeId, 'tripPageShared.cost.nightsSeparator')} ${
        cost.divisor_is_estimate
          ? `estimated for ${cost.divisor_used} people`
          : `${cost.divisor_used} going`
      }`;
  const pendingLabel = getCopy(themeId, 'tripPageShared.costBreakdown.yourWayInPending');

  // AC5 — eyebrow visible when any pending state exists: viewer arrival
  // unset, OR lodging is winning on votes but not yet locked.
  const lodgingStatus = pick?.status ?? null;
  const hasPending =
    (isPerViewer && viewerArrival?.cost_cents == null) ||
    lodgingStatus === 'leading';
  const eyebrowCopy = hasPending
    ? getCopy(themeId, 'tripPageShared.costBreakdown.eyebrow.firmingUp')
    : getCopy(themeId, 'tripPageShared.costBreakdown.eyebrow.settled');

  // AC18 — footer split.
  //   shared (displayed) = cost.per_person_shared =
  //     round((lodging + shared transport + shared restaurants +
  //            shared groceries) / divisor_used).
  //   yours  (displayed) = cost.individual_total =
  //     trip.flights + individual restaurants + individual transport.
  // Headliner, activities, and viewerArrival are NOT allocated into either
  // bucket by the current server math — they're summed directly into
  // per_person_total. Consequence: shared + yours < hero. Known mismatch
  // vs. the brief's definition; logged in Session 9O Known Issues.
  const sharedFooterText = getCopy(themeId, 'tripPageShared.costBreakdown.footer.shared', {
    amount: formatMoney(cost.per_person_shared),
  });
  const yoursFooterText = getCopy(themeId, 'tripPageShared.costBreakdown.footer.yours', {
    amount: formatMoney(cost.individual_total),
  });

  return (
    <div className="module-section cost-breakdown-module" style={{ marginTop: 14 }}>
      <div className="cost-breakdown-hero-block">
        <div className="cost-breakdown-hero-label">{heroLabel}</div>
        <div>
          <span className="cost-breakdown-amount">
            {'~'}
            {formatMoney(yourTotal)}
          </span>
          {isPerViewer && (
            <span className="cost-breakdown-per-you">
              {getCopy(themeId, 'tripPageShared.costBreakdown.perYouSuffix')}
            </span>
          )}
        </div>
        {heroSubtitle && <div className="cost-breakdown-sub">{heroSubtitle}</div>}
        <span className="cost-breakdown-eyebrow">{eyebrowCopy}</span>
      </div>

      <div className="cost-breakdown-body">
        <div className="cost-breakdown-rows">
          {items.map((b, idx) => (
            <div key={`${b.label}-${idx}`} className="cost-breakdown-row">
              <span className="cost-breakdown-row-icon">{b.icon}</span>
              <span
                className={`cost-breakdown-row-label${b.emphasize ? ' emphasize' : ''}`}
              >
                {b.label}
              </span>
              {b.pending ? (
                <span className="cost-breakdown-row-val pending">{pendingLabel}</span>
              ) : (
                <span
                  className={`cost-breakdown-row-val${b.emphasize ? ' emphasize' : ''}`}
                >
                  {formatMoney(b.val)}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="cost-breakdown-footer">
          <span>{sharedFooterText}</span>
          <span>{yoursFooterText}</span>
        </div>
      </div>
    </div>
  );
}
