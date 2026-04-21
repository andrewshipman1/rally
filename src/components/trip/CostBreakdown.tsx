import type { TripWithDetails, TripCostSummary, ArrivalMode } from '@/types';
import type { ThemeId } from '@/lib/themes/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
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
  // ─── Aggregation (unchanged from 9J baseline) ───────────────────────
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

  const flightsTotal = trip.flights.reduce((s, f) => s + (f.estimated_price || 0), 0);
  if (flightsTotal > 0) {
    items.push({
      label: getCopy(themeId, 'tripPageShared.costBreakdown.line.flights'),
      val: flightsTotal,
      icon: '✈️',
    });
  }

  const sharedTransport = trip.transport
    .filter((t) => t.cost_type === 'shared')
    .reduce((s, t) => s + (t.estimated_total || 0), 0);
  const indTransport = trip.transport
    .filter((t) => t.cost_type === 'individual')
    .reduce((s, t) => s + (t.estimated_total || 0), 0);
  const transportPerPerson =
    Math.round(sharedTransport / (cost.divisor_used)) + indTransport;
  if (transportPerPerson > 0) {
    items.push({
      label: getCopy(themeId, 'tripPageShared.costBreakdown.line.transport'),
      val: transportPerPerson,
      icon: '🚗',
    });
  }

  const sharedMeals = trip.restaurants
    .filter((r) => r.cost_type === 'shared')
    .reduce((s, r) => s + (r.cost_per_person || 0), 0);
  const indMeals = trip.restaurants
    .filter((r) => r.cost_type === 'individual')
    .reduce((s, r) => s + (r.cost_per_person || 0), 0);
  const mealsPerPerson = sharedMeals + indMeals;
  if (mealsPerPerson > 0) {
    items.push({
      label: getCopy(themeId, 'tripPageShared.costBreakdown.line.meals'),
      val: Math.round(mealsPerPerson),
      icon: '🍽️',
    });
  }

  if (cost.activities_per_person > 0) {
    items.push({
      label: getCopy(themeId, 'tripPageShared.costBreakdown.line.activities'),
      val: cost.activities_per_person,
      icon: '🤿',
    });
  }

  // ─── Session 9B-2 — Per-viewer personalization ──────────────────────
  // "your way in" goes first (above the headliner) so the viewer reads
  // their own line at the top of the breakdown. Row renders in three
  // states keyed off (viewerArrival.mode, viewerArrival.cost_cents);
  // null-viewerArrival (logged-out / non-member edge) keeps the old
  // group-fallback hero + subtitle + no "your way in" row.
  const isPerViewer = viewerArrival !== null;
  const arrivalDollars =
    viewerArrival?.cost_cents != null ? viewerArrival.cost_cents / 100 : 0;
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

  const nightsMatch = dateStr.match(/(\d+)[–-](\d+)/);
  const nights = nightsMatch ? parseInt(nightsMatch[2]) - parseInt(nightsMatch[1]) : 3;

  // Denominator for row progress bars: yourTotal in per-viewer mode so
  // the "your way in" line shows the correct fraction of the
  // personalized total; cost.per_person_total in fallback.
  const barDenominator = isPerViewer ? yourTotal : cost.per_person_total;

  const heroLabel = isPerViewer
    ? getCopy(themeId, 'tripPageShared.costBreakdown.yourTotalLabel')
    : getCopy(themeId, 'tripPageShared.cost.perPersonLabel');
  const heroSubtitle = isPerViewer
    ? getCopy(themeId, 'tripPageShared.costBreakdown.subtitle')
    : `${nights} ${getCopy(themeId, 'tripPageShared.cost.nightsSeparator')} ${
        cost.divisor_is_estimate
          ? `estimated for ${cost.divisor_used} people`
          : `${cost.divisor_used} going`
      }`;
  const pendingLabel = getCopy(themeId, 'tripPageShared.costBreakdown.yourWayInPending');
  const sharedBadgeText = getCopy(themeId, 'tripPageShared.costBreakdown.sharedBadge', {
    amount: formatMoney(cost.per_person_shared),
  });
  const bookYoursBadgeText = getCopy(themeId, 'tripPageShared.costBreakdown.bookYoursBadge', {
    amount: formatMoney(cost.individual_total),
  });

  return (
    <GlassCard>
      <div className="cost-breakdown">
        <div className="cost-breakdown-hero">
          <div className="cost-breakdown-label">{heroLabel}</div>
          <div>
            <span className="cost-breakdown-total">
              {'~'}
              {formatMoney(yourTotal)}
            </span>
            {isPerViewer && (
              <span className="cost-breakdown-per-you">
                {getCopy(themeId, 'tripPageShared.costBreakdown.perYouSuffix')}
              </span>
            )}
          </div>
          <div className="cost-breakdown-subtitle">{heroSubtitle}</div>
        </div>

        <div className="cost-breakdown-rows">
          {items.map((b, idx) => {
            const pct =
              b.val != null && barDenominator > 0
                ? Math.min(100, (b.val / barDenominator) * 100)
                : 0;
            return (
              <div key={`${b.label}-${idx}`} className="cost-breakdown-row">
                <span
                  className={`cost-breakdown-row-label${b.emphasize ? ' emphasize' : ''}`}
                >
                  {b.icon && <span className="cost-breakdown-row-icon">{b.icon}</span>}
                  <span>{b.label}</span>
                </span>
                <div className="cost-breakdown-row-meter">
                  {b.pending ? (
                    <span className="cost-breakdown-row-val pending">{pendingLabel}</span>
                  ) : (
                    <>
                      <div className="cost-breakdown-bar-track">
                        <div
                          className="cost-breakdown-bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span
                        className={`cost-breakdown-row-val${b.emphasize ? ' emphasize' : ''}`}
                      >
                        {formatMoney(b.val)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="cost-breakdown-badges">
          <Badge
            text={sharedBadgeText}
            bg="var(--cost-badge-shared-bg)"
            color="var(--cost-badge-shared-fg)"
          />
          <Badge
            text={bookYoursBadgeText}
            bg="var(--cost-badge-yours-bg)"
            color="var(--cost-badge-yours-fg)"
          />
        </div>
      </div>
    </GlassCard>
  );
}
