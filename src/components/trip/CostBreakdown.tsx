import type { TripWithDetails, TripCostSummary } from '@/types';
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

export function CostBreakdown({
  trip,
  cost,
  dateStr,
  themeId,
}: {
  trip: TripWithDetails;
  cost: TripCostSummary;
  dateStr: string;
  themeId: ThemeId;
}) {
  // Build breakdown line items from typed components.
  // Session 8J: headliner renders first with accent emphasis when present.
  const items: { label: string; val: number; icon: string; emphasize?: boolean }[] = [];

  if (cost.headliner_per_person > 0 && trip.headliner_description) {
    items.push({
      label: `the headliner · ${trip.headliner_description}`,
      val: cost.headliner_per_person,
      icon: '★',
      emphasize: true,
    });
  }

  // Session 9J — priority-ordered display-spot for the Accommodation
  // rollup line: locked winner → leading vote (ties: first-added) →
  // single option → first-added. Status drives the "(so far)" suffix.
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
  if (flightsTotal > 0) items.push({ label: 'Flights', val: flightsTotal, icon: '✈️' });

  const sharedTransport = trip.transport
    .filter((t) => t.cost_type === 'shared')
    .reduce((s, t) => s + (t.estimated_total || 0), 0);
  const indTransport = trip.transport
    .filter((t) => t.cost_type === 'individual')
    .reduce((s, t) => s + (t.estimated_total || 0), 0);
  const transportPerPerson =
    Math.round(sharedTransport / (cost.divisor_used)) + indTransport;
  if (transportPerPerson > 0) items.push({ label: 'Transport', val: transportPerPerson, icon: '🚗' });

  const sharedMeals = trip.restaurants
    .filter((r) => r.cost_type === 'shared')
    .reduce((s, r) => s + (r.cost_per_person || 0), 0);
  const indMeals = trip.restaurants
    .filter((r) => r.cost_type === 'individual')
    .reduce((s, r) => s + (r.cost_per_person || 0), 0);
  const mealsPerPerson = sharedMeals + indMeals;
  if (mealsPerPerson > 0) items.push({ label: 'Meals', val: Math.round(mealsPerPerson), icon: '🍽️' });

  // Session 8K — activities sources from the single trip-level estimate
  // (already per-person). Legacy activities line-item aggregation retired.
  if (cost.activities_per_person > 0) {
    items.push({ label: 'Activities', val: cost.activities_per_person, icon: '🤿' });
  }

  const nightsMatch = dateStr.match(/(\d+)[–-](\d+)/);
  const nights = nightsMatch ? parseInt(nightsMatch[2]) - parseInt(nightsMatch[1]) : 3;

  return (
    <GlassCard>
      <div style={{ padding: '4px 0', textAlign: 'center' }}>
        <div
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          {getCopy(themeId, 'tripPageShared.cost.perPersonLabel')}
        </div>
        <div
          style={{
            fontFamily: 'var(--rally-font-display)',
            fontSize: 52,
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          {'~'}{formatMoney(cost.per_person_total)}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3, marginBottom: 16 }}>
          {nights} {getCopy(themeId, 'tripPageShared.cost.nightsSeparator')}{' '}
          {cost.divisor_is_estimate
            ? `estimated for ${cost.divisor_used} people`
            : `${cost.divisor_used} going`}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, textAlign: 'left' }}>
          {items.map((b) => (
            <div
              key={b.label}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  style={{
                    fontSize: 13,
                    color: b.emphasize ? 'var(--rally-accent)' : undefined,
                  }}
                >
                  {b.icon}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: b.emphasize ? 'var(--rally-accent)' : 'rgba(255,255,255,0.6)',
                    fontWeight: b.emphasize ? 700 : 400,
                  }}
                >
                  {b.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 70,
                    height: 4,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,.1)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${cost.per_person_total > 0 ? (b.val / cost.per_person_total) * 100 : 0}%`,
                      background: 'var(--rally-accent)',
                      borderRadius: 2,
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: b.emphasize ? 'var(--rally-accent)' : '#fff',
                    fontWeight: b.emphasize ? 800 : 600,
                    minWidth: 36,
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatMoney(b.val)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Badge
            text={`🏠 Shared: ~${formatMoney(cost.per_person_shared, '/pp')}`}
            bg="rgba(45,107,90,.2)"
            color="#7ecdb8"
          />
          <Badge
            text={`✈️ Book yours: ~${formatMoney(cost.individual_total)}`}
            bg="rgba(26,58,74,.2)"
            color="rgba(255,255,255,.7)"
          />
        </div>
      </div>
    </GlassCard>
  );
}
