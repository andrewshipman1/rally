// Rally Type Definitions v2
// Typed components replacing freeform blocks

export type TripPhase = 'sketch' | 'sell' | 'lock' | 'go';
export type ComponentStatus = 'estimated' | 'confirmed';
export type RsvpStatus = 'in' | 'holding' | 'out' | 'pending';
export type PaymentStatus = 'unpaid' | 'paid';
export type MemberRole = 'organizer' | 'guest';
export type PollType = 'date_range' | 'option_vote';
export type PollStatus = 'open' | 'closed';
export type SplitType = 'equal' | 'custom' | 'specific';
export type TransportSubtype = 'car_rental' | 'taxi' | 'public_transit';
// Session 9B-1 — per-member arrival mode for the Getting Here module.
export type ArrivalMode = 'flight' | 'drive' | 'train' | 'other';
// Session 8M — 7-value tag replacing the legacy subtype enum for sketch entry.
export type TransportTypeTag =
  | 'flight'
  | 'train'
  | 'rental_car_van'
  | 'charter_van_bus'
  | 'charter_boat'
  | 'ferry'
  | 'other';
export type ExpenseCategory = 'food' | 'transport' | 'activities' | 'groceries' | 'misc';

// ─── Core Entities ───

export interface User {
  id: string;
  phone: string;
  email: string | null;
  display_name: string;
  profile_photo_url: string | null;
  bio: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  home_city: string | null;
  dietary_restrictions: string | null;
  venmo_handle: string | null;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  template_name: string | null;
  template_category: 'setting' | 'occasion' | null;
  background_type: 'gradient' | 'image' | 'pattern' | 'solid';
  background_value: string;
  color_primary: string;
  color_accent: string;
  color_card: string;
  font_display: string;
  font_body: string;
  is_system: boolean;
  preview_image_url: string | null;
  created_at: string;
}

export interface Trip {
  id: string;
  organizer_id: string;
  theme_id: string | null;
  name: string;
  destination: string | null;
  tagline: string | null;
  description: string | null;
  date_start: string | null;
  date_end: string | null;
  cover_image_url: string | null;
  phase: TripPhase;
  commit_deadline: string | null;
  group_size: number;
  share_slug: string;
  essential_info: EssentialInfoItem[];
  photo_album_url: string | null;
  header_images: HeaderImage[];
  packing_list: PackingItem[];
  playlist_url: string | null;
  // Session 8Q — "the aux" OG enrichment + curator byline
  playlist_og_image: string | null;
  playlist_og_title: string | null;
  playlist_set_by_name: string | null;
  playlist_set_at: string | null;
  house_rules: string | null;
  rsvp_emojis: RsvpEmojis;
  chassis_theme_id: string | null;
  archived_at: string | null;
  // Session 8J — "the headliner" (singular trip-level premise)
  headliner_description: string | null;
  headliner_cost_cents: number | null;
  headliner_cost_unit: 'per_person' | 'total' | null;
  headliner_link_url: string | null;
  headliner_image_url: string | null;
  headliner_source_title: string | null;
  // Session 8K — sketch-phase activities collapse to a single per-person
  // estimate (stored as whole dollars × 100 = cents). Nullable = unset.
  activities_estimate_per_person_cents: number | null;
  created_at: string;
  updated_at: string;
}

export interface PackingItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface RsvpEmojis {
  going: string;
  maybe: string;
  cant: string;
}

// ─── Typed Components ───

export interface Lodging {
  id: string;
  trip_id: string;
  // Required (Sketch)
  name: string;
  link: string | null;
  cost_per_night: number | null;
  accommodation_type: 'home_rental' | 'hotel' | 'other';
  people_per_room: number | null;
  // OG scrape
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  // Optional (Lock)
  additional_photos: string[];
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  num_nights: number | null;
  total_cost: number | null;
  bedrooms: number | null;
  max_guests: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  highlights: string[];
  status: ComponentStatus;
  booked_by: string | null;
  notes: string | null;
  is_selected: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LodgingVote {
  id: string;
  lodging_id: string;
  user_id: string;
  created_at: string;
}

export interface Flight {
  id: string;
  trip_id: string;
  // Required (Sketch)
  departure_airport: string;
  arrival_airport: string;
  estimated_price: number | null;
  // Optional (Lock)
  airline: string | null;
  flight_number: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  is_direct: boolean | null;
  duration: string | null;
  booking_link: string | null;
  og_image_url: string | null;
  status: ComponentStatus;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Transport {
  id: string;
  trip_id: string;
  // Session 8M — sketch-phase canonical fields.
  type_tag: TransportTypeTag;
  description: string;
  estimated_total: number | null;
  cost_type: 'shared' | 'individual';
  booking_link: string | null;
  og_image_url: string | null;
  // Legacy (pre-8M). Retained for backward-compat reads and silent deprecation.
  subtype?: TransportSubtype | null;
  provider?: string | null;
  vehicle_type?: string | null;
  daily_rate?: number | null;
  num_days?: number | null;
  per_ride_cost?: number | null;
  route?: string | null;
  pickup_location?: string | null;
  pickup_time?: string | null;
  dropoff_location?: string | null;
  status: ComponentStatus;
  booked_by: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  trip_id: string;
  // Required (Sketch)
  name: string;
  // OG scrape
  link: string | null;
  og_image_url: string | null;
  // Optional (Lock)
  date: string | null;
  time: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cost_per_person: number | null;
  cost_type: 'shared' | 'individual';
  status: ComponentStatus;
  reserved_by: string | null;
  confirmation_number: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  trip_id: string;
  // Required (Sketch)
  name: string;
  estimated_cost: number | null;
  // OG scrape
  link: string | null;
  og_image_url: string | null;
  // Optional (Lock)
  date: string | null;
  time: string | null;
  duration: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  booking_link: string | null;
  cost_type: 'shared' | 'individual';
  status: ComponentStatus;
  booked_by: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Grocery {
  id: string;
  trip_id: string;
  name: string;
  estimated_total: number | null;
  store_name: string | null;
  store_address: string | null;
  latitude: number | null;
  longitude: number | null;
  cost_type: 'shared' | 'individual';
  status: ComponentStatus;
  booked_by: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Other Entities ───

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: MemberRole;
  rsvp: RsvpStatus;
  payment_status: PaymentStatus;
  payment_requested_at: string | null;
  cost_share: number | null;
  plus_one: boolean;
  plus_one_name: string | null;
  invite_opened_at: string | null;
  decline_reason: string | null;
  arrival_flight: string | null;
  arrival_time: string | null;
  // Session 9B-1 — Getting Here module (per-member arrival).
  arrival_mode: ArrivalMode | null;
  arrival_cost_cents: number | null;
  arrival_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Poll {
  id: string;
  trip_id: string;
  poll_type: PollType;
  question: string | null;
  options: PollOption[];
  status: PollStatus;
  created_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  selected_options: string[];
  created_at: string;
}

export interface Comment {
  id: string;
  trip_id: string;
  user_id: string;
  text: string;
  reactions: Reaction[];
  type: 'comment' | 'rsvp';
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory | null;
  paid_by: string;
  split_type: SplitType;
  split_details: Record<string, number>;
  receipt_url: string | null;
  created_at: string;
}

// ─── Supporting Types ───

export interface EssentialInfoItem { label: string; value: string; }
export interface HeaderImage { url: string; position: string; label: string; }
export interface PollOption { id: string; label: string; image_url?: string; }
export interface Reaction { emoji: string; user_id: string; }

// ─── Activity Log ───

export type ActivityEventType =
  | 'rsvp_in'
  | 'rsvp_holding'
  | 'rsvp_out'
  | 'plus_one_added'
  | 'vote_cast'
  | 'lodging_locked'
  | 'activity_added'
  | 'extra_added'
  | 'theme_changed'
  | 'phase_lock'
  | 'phase_go'
  | 'trip_created'
  | 'cutoff_passed';

export interface ActivityLogEntry {
  id: string;
  trip_id: string;
  actor_id: string | null;
  event_type: ActivityEventType;
  target_id: string | null;
  target_type: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// ─── Computed / Joined Types ───

export interface TripWithDetails extends Trip {
  organizer: User;
  theme: Theme | null;
  lodging: (Lodging & { votes: (LodgingVote & { user: User })[] })[];
  flights: Flight[];
  transport: Transport[];
  restaurants: Restaurant[];
  activities: Activity[];
  groceries: Grocery[];
  members: (TripMember & { user: User })[];
  polls: (Poll & { votes: (PollVote & { user: User })[] })[];
  comments: (Comment & { user: User })[];
}

export interface ExpenseWithUser extends Expense {
  paid_by_user: User;
}

export interface MemberBalance {
  user: User;
  total_owed: number;
  total_owing: number;
  net: number;
}

export interface Settlement {
  from: User;
  to: User;
  amount: number;
}

// ─── Cost Calculator ───

export interface TripCostSummary {
  shared_total: number;
  individual_total: number;
  per_person_shared: number;
  per_person_total: number;
  confirmed_count: number;
  divisor_used: number;
  divisor_is_estimate: boolean;
  /**
   * Session 8J — headliner contribution expressed as per-person dollars.
   * `per_person` unit adds the value directly; `total` unit divides by
   * divisor_used. 0 if no headliner is set.
   */
  headliner_per_person: number;
  /**
   * Session 8K — activities contribution expressed as per-person dollars.
   * Sourced from the single trip-level estimate column. 0 if unset.
   */
  activities_per_person: number;
  /**
   * Session 9P — per-person dollars for the groceries row with name 'Provisions'.
   * CostBreakdown renders this as its own row. 0 if unset.
   */
  provisions_per_person: number;
  /**
   * Session 9P — per-person dollars for the "other" bucket: the groceries
   * row named 'Other' PLUS any shared grocery rows with legacy names (pre-8P
   * data that predates the Provisions/Other split). Rolling legacy rows in
   * preserves hero numbers on older trips without a schema migration.
   */
  other_per_person: number;
}

/**
 * Session 9P — priority selector for the rollup's Accommodation line.
 * Shared between client render (CostBreakdown row label) and server math
 * (calculateTripCost). Strict `>` on the leader comparison keeps the
 * first-added spot on ties. Pre-9P the server used
 * `find(is_selected) || lodging[0]`, which mismatched the client when
 * a spot was winning votes but not yet locked (Mexico trip, 2026-04).
 */
export function pickLodgingForRollup(
  lodging: TripWithDetails['lodging'],
):
  | {
      spot: TripWithDetails['lodging'][number];
      status: 'locked' | 'leading' | 'only-one' | 'first-added';
    }
  | null {
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

export function calculateTripCost(trip: TripWithDetails): TripCostSummary {
  // Count members who are 'in' or 'holding' (not 'out' or 'pending')
  const confirmed = trip.members.filter(m => m.rsvp === 'in' || m.rsvp === 'holding').length;

  // If fewer than 2 actual confirmed, fall back to group_size as an estimate
  let divisor_used: number;
  let divisor_is_estimate: boolean;
  if (confirmed < 2 && trip.group_size && trip.group_size > 0) {
    divisor_used = trip.group_size;
    divisor_is_estimate = true;
  } else {
    divisor_used = Math.max(1, confirmed);
    divisor_is_estimate = false;
  }

  // Session 9P — use the shared `pickLodgingForRollup` util so the server
  // rollup agrees with the client row (locked → leading-vote → first-added).
  const pick = pickLodgingForRollup(trip.lodging);
  const selectedLodging = pick?.spot ?? null;
  const nights = selectedLodging?.num_nights ||
    (trip.date_start && trip.date_end
      ? Math.ceil((new Date(trip.date_end).getTime() - new Date(trip.date_start).getTime()) / 86400000)
      : 1);
  const lodgingCost = selectedLodging
    ? (selectedLodging.total_cost || (selectedLodging.cost_per_night || 0) * nights)
    : 0;

  const sharedTransport = trip.transport.filter(t => t.cost_type === 'shared').reduce((s, t) => s + (t.estimated_total || 0), 0);
  // Session 9P — restaurants dropped from the sketch/sell rollup.
  // Restaurants are go-phase data per the skill's "pre-booked costs only"
  // rule; they shouldn't contribute to the sell hero. The restaurants
  // table + queries are preserved for later go-phase work.
  const sharedGroceries = (trip.groceries || [])
    .filter(g => g.cost_type === 'shared')
    .reduce((s, g) => s + (g.estimated_total || 0), 0);
  const shared_total = lodgingCost + sharedTransport + sharedGroceries;

  const flights = trip.flights.reduce((s, f) => s + (f.estimated_price || 0), 0);
  const indTransport = trip.transport.filter(t => t.cost_type === 'individual').reduce((s, t) => s + (t.estimated_total || 0), 0);
  const individual_total = flights + indTransport;

  // Session 8J — headliner contribution. `per_person` unit adds
  // directly, `total` unit divides by divisor_used. Stored in cents,
  // surfaced as whole dollars.
  let headliner_per_person = 0;
  if (trip.headliner_description && trip.headliner_cost_cents != null) {
    const dollars = trip.headliner_cost_cents / 100;
    headliner_per_person = trip.headliner_cost_unit === 'total'
      ? Math.round(dollars / divisor_used)
      : Math.round(dollars);
  }

  // Session 8K — activities estimate is already per-person, add directly.
  const activities_per_person =
    trip.activities_estimate_per_person_cents != null
      ? Math.round(trip.activities_estimate_per_person_cents / 100)
      : 0;

  // Session 9P — surface Provisions + Other as their own per-person rows.
  // `other` sweeps up legacy shared grocery rows (pre-8P data) so we never
  // silently drop money from an existing trip's hero.
  const sharedGroceryRows = (trip.groceries || []).filter((g) => g.cost_type === 'shared');
  const provisionsTotal = sharedGroceryRows
    .filter((g) => g.name === 'Provisions')
    .reduce((s, g) => s + (g.estimated_total || 0), 0);
  const otherTotal = sharedGroceryRows
    .filter((g) => g.name !== 'Provisions')
    .reduce((s, g) => s + (g.estimated_total || 0), 0);
  const provisions_per_person = Math.round(provisionsTotal / divisor_used);
  const other_per_person = Math.round(otherTotal / divisor_used);

  // Per-row per-person values for the shared bucket. Computing each row
  // independently is what makes the visible CostBreakdown rows sum (by
  // construction) to `per_person_shared` — the pre-9P `round(sum/divisor)`
  // shape introduced rounding drift vs the rendered rows.
  const lodging_per_person = Math.round(lodgingCost / divisor_used);
  const shared_transport_per_person = Math.round(sharedTransport / divisor_used);

  // Session 9P — per_person_shared now holds the shared bucket total that
  // the footer displays: lodging + shared transport + provisions + other +
  // headliner + activities (each already per-person). Viewer arrival is
  // the one remaining component, added into `yours` at render time since
  // it's per-viewer (trip_members.arrival_cost_cents), not trip-level.
  const per_person_shared =
    lodging_per_person +
    shared_transport_per_person +
    provisions_per_person +
    other_per_person +
    headliner_per_person +
    activities_per_person;

  // Session 9P — hero is just shared + individual. Headliner + activities
  // already rolled into `per_person_shared` above; don't double-count.
  const per_person_total = per_person_shared + individual_total;

  return {
    shared_total,
    individual_total,
    per_person_shared,
    per_person_total,
    confirmed_count: confirmed,
    divisor_used,
    divisor_is_estimate,
    headliner_per_person,
    activities_per_person,
    provisions_per_person,
    other_per_person,
  };
}

// ─── Theme CSS Variables ───

export interface ThemeCSSVars {
  '--rally-bg': string;
  '--rally-primary': string;
  '--rally-accent': string;
  '--rally-card': string;
  '--rally-font-display': string;
  '--rally-font-body': string;
}

export function themeToCSS(theme: Theme): ThemeCSSVars {
  return {
    '--rally-bg': theme.background_value,
    '--rally-primary': theme.color_primary,
    '--rally-accent': theme.color_accent,
    '--rally-card': theme.color_card,
    '--rally-font-display': `'${theme.font_display}', serif`,
    '--rally-font-body': `'${theme.font_body}', sans-serif`,
  };
}
