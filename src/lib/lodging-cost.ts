import type { Lodging } from '@/types';

/**
 * Single source of truth for the GROUP-level lodging cost (in dollars).
 *
 * - hotel: cost_per_night * nights * ceil(divisor / people_per_room).
 *   The rooms multiplier is what makes a 9-person trip with 2 per room
 *   need 5 rooms — omitting it under-counts by a factor of `rooms`,
 *   which is exactly what bit us when CostBreakdown + calculateTripCost
 *   showed 5x-low values vs the LodgingCard property card.
 * - home_rental + other: spot.total_cost (authoritative when set).
 *
 * `nights` is passed in by the caller rather than derived here so that
 * each surface keeps its existing nights-resolution semantics — the
 * brief explicitly flagged the "nights resolution semantics differ
 * between callers" risk and this signature sidesteps it.
 *
 * Pure / deterministic. Returns 0 for shapes with insufficient data
 * (e.g. hotel with null cost_per_night, free "other" lodging).
 */
export function computeLodgingGroupTotal(
  spot: Lodging,
  divisor: number,
  nights: number,
): number {
  if (spot.accommodation_type === 'hotel') {
    const perRoom = spot.people_per_room || 1;
    const safeDivisor = divisor > 0 ? divisor : 1;
    const rooms = Math.ceil(safeDivisor / perRoom);
    return Math.round((spot.cost_per_night || 0) * nights * rooms);
  }
  return spot.total_cost ?? 0;
}
