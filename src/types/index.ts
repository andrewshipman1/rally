// Rally Type Definitions
// Maps 1:1 to Supabase schema

export type TripPhase = 'sketch' | 'sell' | 'lock' | 'go';
export type BlockCostType = 'shared' | 'individual';
export type BlockStatus = 'estimated' | 'confirmed';
export type RsvpStatus = 'in' | 'out' | 'maybe' | 'pending';
export type PaymentStatus = 'unpaid' | 'paid';
export type MemberRole = 'organizer' | 'guest';
export type PollType = 'date_range' | 'option_vote';
export type PollStatus = 'open' | 'closed';
export type SplitType = 'equal' | 'custom' | 'specific';

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
  created_at: string;
  updated_at: string;
}

export interface Block {
  id: string;
  trip_id: string;
  name: string;
  image_urls: string[];
  external_link: string | null;
  notes: string | null;
  cost: number | null;
  cost_type: BlockCostType;
  status: BlockStatus;
  booked_by: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  event_datetime: string | null;
  sort_order: number;
  tag_label: string | null;
  tag_emoji: string | null;
  created_at: string;
  updated_at: string;
}

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

export interface EssentialInfoItem {
  label: string;
  value: string;
}

export interface HeaderImage {
  url: string;
  position: string; // CSS grid position
  label: string;
}

export interface PollOption {
  id: string;
  label: string;
  image_url?: string;
}

export interface Reaction {
  emoji: string;
  user_id: string;
}

export type ExpenseCategory = 'food' | 'transport' | 'activities' | 'groceries' | 'misc';

// ─── Computed / Joined Types ───

export interface TripWithDetails extends Trip {
  organizer: User;
  theme: Theme | null;
  blocks: Block[];
  members: (TripMember & { user: User })[];
  polls: (Poll & { votes: (PollVote & { user: User })[] })[];
  comments: (Comment & { user: User })[];
}

export interface ExpenseWithUser extends Expense {
  paid_by_user: User;
}

export interface MemberBalance {
  user: User;
  total_owed: number;    // what they owe others
  total_owing: number;   // what others owe them
  net: number;           // positive = they owe, negative = they're owed
}

export interface Settlement {
  from: User;
  to: User;
  amount: number;
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
