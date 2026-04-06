// Rally Type Definitions v2
// Typed components replacing freeform blocks

export type TripPhase = 'sketch' | 'sell' | 'lock' | 'go';
export type ComponentStatus = 'estimated' | 'confirmed';
export type RsvpStatus = 'in' | 'out' | 'maybe' | 'pending';
export type PaymentStatus = 'unpaid' | 'paid';
export type MemberRole = 'organizer' | 'guest';
export type PollType = 'date_range' | 'option_vote';
export type PollStatus = 'open' | 'closed';
export type SplitType = 'equal' | 'custom' | 'specific';
export type TransportSubtype = 'car_rental' | 'taxi' | 'public_transit';
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
  house_rules: string | null;
  rsvp_emojis: RsvpEmojis;
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
  // Required (Sketch)
  subtype: TransportSubtype;
  estimated_total: number | null;
  // Optional (Lock)
  provider: string | null;
  vehicle_type: string | null;
  daily_rate: number | null;
  num_days: number | null;
  per_ride_cost: number | null;
  route: string | null;
  pickup_location: string | null;
  pickup_time: string | null;
  dropoff_location: string | null;
  booking_link: string | null;
  og_image_url: string | null;
  cost_type: 'shared' | 'individual';
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

// ─── Other Entities ───

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: MemberRole;
  rsvp: RsvpStatus;
  payment_status: PaymentStatus;
  cost_share: number | null;
  plus_one: boolean;
  arrival_flight: string | null;
  arrival_time: string | null;
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

// ─── Computed / Joined Types ───

export interface TripWithDetails extends Trip {
  organizer: User;
  theme: Theme | null;
  lodging: (Lodging & { votes: (LodgingVote & { user: User })[] })[];
  flights: Flight[];
  transport: Transport[];
  restaurants: Restaurant[];
  activities: Activity[];
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
}

export function calculateTripCost(trip: TripWithDetails): TripCostSummary {
  // Count members who are 'in' or 'maybe' (not 'out' or 'pending')
  const confirmed = trip.members.filter(m => m.rsvp === 'in' || m.rsvp === 'maybe').length || 1;

  const selectedLodging = trip.lodging.find(l => l.is_selected) || trip.lodging[0];
  const nights = selectedLodging?.num_nights ||
    (trip.date_start && trip.date_end
      ? Math.ceil((new Date(trip.date_end).getTime() - new Date(trip.date_start).getTime()) / 86400000)
      : 1);
  const lodgingCost = selectedLodging
    ? (selectedLodging.total_cost || (selectedLodging.cost_per_night || 0) * nights)
    : 0;

  const sharedTransport = trip.transport.filter(t => t.cost_type === 'shared').reduce((s, t) => s + (t.estimated_total || 0), 0);
  const sharedRestaurants = trip.restaurants.filter(r => r.cost_type === 'shared').reduce((s, r) => s + (r.cost_per_person || 0) * confirmed, 0);
  const sharedActivities = trip.activities.filter(a => a.cost_type === 'shared').reduce((s, a) => s + (a.estimated_cost || 0) * confirmed, 0);
  const shared_total = lodgingCost + sharedTransport + sharedRestaurants + sharedActivities;

  const flights = trip.flights.reduce((s, f) => s + (f.estimated_price || 0), 0);
  const indActivities = trip.activities.filter(a => a.cost_type === 'individual').reduce((s, a) => s + (a.estimated_cost || 0), 0);
  const indRestaurants = trip.restaurants.filter(r => r.cost_type === 'individual').reduce((s, r) => s + (r.cost_per_person || 0), 0);
  const indTransport = trip.transport.filter(t => t.cost_type === 'individual').reduce((s, t) => s + (t.estimated_total || 0), 0);
  const individual_total = flights + indActivities + indRestaurants + indTransport;

  const per_person_shared = Math.round(shared_total / confirmed);
  const per_person_total = per_person_shared + individual_total;

  return { shared_total, individual_total, per_person_shared, per_person_total, confirmed_count: confirmed };
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
