import type { TripWithDetails, TripCostSummary } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';

export function CostBreakdown({
  trip,
  cost,
  dateStr,
}: {
  trip: TripWithDetails;
  cost: TripCostSummary;
  dateStr: string;
}) {
  // Build breakdown line items from typed components
  const items: { label: string; val: number; icon: string }[] = [];

  const selectedLodging = trip.lodging.find((l) => l.is_selected) || trip.lodging[0];
  if (selectedLodging) {
    const nights =
      selectedLodging.num_nights ||
      (trip.date_start && trip.date_end
        ? Math.ceil(
            (new Date(trip.date_end).getTime() - new Date(trip.date_start).getTime()) / 86400000
          )
        : 1);
    const lodgingCost =
      selectedLodging.total_cost || (selectedLodging.cost_per_night || 0) * nights;
    const perPerson = Math.round(lodgingCost / (cost.confirmed_count || 1));
    if (perPerson > 0) items.push({ label: 'Accommodation', val: perPerson, icon: '🏠' });
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
    Math.round(sharedTransport / (cost.confirmed_count || 1)) + indTransport;
  if (transportPerPerson > 0) items.push({ label: 'Transport', val: transportPerPerson, icon: '🚗' });

  const sharedMeals = trip.restaurants
    .filter((r) => r.cost_type === 'shared')
    .reduce((s, r) => s + (r.cost_per_person || 0), 0);
  const indMeals = trip.restaurants
    .filter((r) => r.cost_type === 'individual')
    .reduce((s, r) => s + (r.cost_per_person || 0), 0);
  const mealsPerPerson = sharedMeals + indMeals;
  if (mealsPerPerson > 0) items.push({ label: 'Meals', val: Math.round(mealsPerPerson), icon: '🍽️' });

  const sharedActs = trip.activities
    .filter((a) => a.cost_type === 'shared')
    .reduce((s, a) => s + (a.estimated_cost || 0), 0);
  const indActs = trip.activities
    .filter((a) => a.cost_type === 'individual')
    .reduce((s, a) => s + (a.estimated_cost || 0), 0);
  const activitiesPerPerson =
    Math.round(sharedActs / (cost.confirmed_count || 1)) + indActs;
  if (activitiesPerPerson > 0)
    items.push({ label: 'Activities', val: activitiesPerPerson, icon: '🤿' });

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
          Estimated per person
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
          ~${cost.per_person_total}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3, marginBottom: 16 }}>
          {nights} nights • {cost.confirmed_count} {cost.confirmed_count === 1 ? 'person' : 'people'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, textAlign: 'left' }}>
          {items.map((b) => (
            <div
              key={b.label}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 13 }}>{b.icon}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{b.label}</span>
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
                    color: '#fff',
                    fontWeight: 600,
                    minWidth: 36,
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  ${b.val}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Badge
            text={`🏠 Shared: ~$${cost.per_person_shared}/pp`}
            bg="rgba(45,107,90,.2)"
            color="#7ecdb8"
          />
          <Badge
            text={`✈️ Book yours: ~$${cost.individual_total}`}
            bg="rgba(26,58,74,.2)"
            color="rgba(255,255,255,.7)"
          />
        </div>
      </div>
    </GlassCard>
  );
}
