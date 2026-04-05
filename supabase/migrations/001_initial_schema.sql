-- Rally Database Schema
-- Run this in Supabase SQL Editor or as a migration
-- Implements: Users, Trips, Themes, Blocks, TripMembers, Polls, PollVotes, Comments, Expenses

-- ============================================================
-- USERS
-- Phone-based identity. No separate organizer/guest distinction.
-- Everyone enters Rally the same way.
-- ============================================================
create table public.users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  email text,
  display_name text not null,
  profile_photo_url text,
  bio text,
  instagram_handle text,
  tiktok_handle text,
  dietary_restrictions text,
  venmo_handle text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- THEMES
-- CSS variable presets. Templates are rows in this table.
-- Custom themes are also rows, linked to a specific trip.
-- ============================================================
create table public.themes (
  id uuid primary key default gen_random_uuid(),
  template_name text,                              -- null for custom themes
  template_category text,                          -- 'setting' | 'occasion' | null
  background_type text not null default 'gradient', -- 'gradient' | 'image' | 'pattern' | 'solid'
  background_value text not null,                   -- CSS gradient string, image URL, etc.
  color_primary text not null default '#1a3a4a',
  color_accent text not null default '#e8c9a0',
  color_card text default 'rgba(255,255,255,0.08)',
  font_display text not null default 'Fraunces',
  font_body text not null default 'Outfit',
  is_system boolean default false,                  -- true for built-in templates
  preview_image_url text,                           -- thumbnail for template picker
  created_at timestamptz default now()
);

-- ============================================================
-- TRIPS
-- The core entity. Phase drives the entire UI.
-- ============================================================
create type trip_phase as enum ('sketch', 'sell', 'lock', 'go');

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.users(id),
  theme_id uuid references public.themes(id),

  -- Basic info
  name text not null,
  destination text,
  tagline text,
  date_start date,
  date_end date,
  cover_image_url text,
  
  -- Lifecycle
  phase trip_phase not null default 'sketch',
  commit_deadline timestamptz,
  group_size int default 0,                        -- expected headcount (pre-RSVP estimate)
  
  -- Sharing
  share_slug text unique not null,                 -- URL slug: rally.app/trip/{slug}
  
  -- Go phase
  essential_info jsonb default '[]'::jsonb,        -- [{label: "WiFi", value: "beach2024"}, ...]
  photo_album_url text,
  
  -- Collage header images
  header_images jsonb default '[]'::jsonb,         -- [{url, position, label}, ...]
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_trips_slug on public.trips(share_slug);
create index idx_trips_organizer on public.trips(organizer_id);

-- ============================================================
-- BLOCKS
-- Freeform trip components. No rigid taxonomy.
-- cost_type and status are the only structure.
-- ============================================================
create type block_cost_type as enum ('shared', 'individual');
create type block_status as enum ('estimated', 'confirmed');

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  
  -- Content
  name text not null,
  image_urls jsonb default '[]'::jsonb,            -- array of image URLs
  external_link text,                               -- Airbnb URL, flight search, etc.
  notes text,
  
  -- Cost
  cost numeric(10,2),
  cost_type block_cost_type not null default 'shared',
  status block_status not null default 'estimated',
  booked_by uuid references public.users(id),       -- who fronted the money
  
  -- Location & time (for calendar export + map deeplinks)
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  event_datetime timestamptz,                       -- for calendar export
  
  -- Display
  sort_order int default 0,
  tag_label text,                                   -- "The House", "Flights", "Activities", etc.
  tag_emoji text,                                   -- "🏠", "✈️", "🤿", etc.
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_blocks_trip on public.blocks(trip_id);

-- ============================================================
-- TRIP MEMBERS
-- Join table: User <-> Trip. Tracks RSVP, payment, trip-specific info.
-- ============================================================
create type rsvp_status as enum ('in', 'out', 'maybe', 'pending');
create type payment_status as enum ('unpaid', 'paid');
create type member_role as enum ('organizer', 'guest');

create table public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.users(id),
  
  role member_role not null default 'guest',
  rsvp rsvp_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  cost_share numeric(10,2),                         -- calculated share for this person
  
  -- Trip-specific guest details
  plus_one boolean default false,
  arrival_flight text,
  arrival_time timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  unique(trip_id, user_id)
);

create index idx_trip_members_trip on public.trip_members(trip_id);
create index idx_trip_members_user on public.trip_members(user_id);

-- ============================================================
-- POLLS
-- Date polls and option votes (A vs B).
-- ============================================================
create type poll_type as enum ('date_range', 'option_vote');
create type poll_status as enum ('open', 'closed');

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  
  poll_type poll_type not null,
  question text,
  options jsonb not null default '[]'::jsonb,       -- [{id, label, image_url?}, ...]
  status poll_status not null default 'open',
  
  created_at timestamptz default now()
);

create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references public.users(id),
  selected_options jsonb not null default '[]'::jsonb, -- array of option IDs
  
  created_at timestamptz default now(),
  unique(poll_id, user_id)
);

-- ============================================================
-- COMMENTS (Group Chat / Hype Feed)
-- ============================================================
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.users(id),
  
  text text not null,
  reactions jsonb default '[]'::jsonb,              -- [{emoji, user_id}, ...]
  
  created_at timestamptz default now()
);

create index idx_comments_trip on public.comments(trip_id);

-- ============================================================
-- EXPENSES (Go Phase - Live Expense Tracker)
-- ============================================================
create type split_type as enum ('equal', 'custom', 'specific');

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  
  description text not null,
  amount numeric(10,2) not null,
  currency text default 'USD',
  category text,                                    -- 'food', 'transport', 'activities', 'groceries', 'misc'
  
  paid_by uuid not null references public.users(id),
  split_type split_type not null default 'equal',
  split_details jsonb default '{}'::jsonb,          -- {user_id: amount, ...} for custom splits
  
  receipt_url text,
  
  created_at timestamptz default now()
);

create index idx_expenses_trip on public.expenses(trip_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.trips enable row level security;
alter table public.blocks enable row level security;
alter table public.trip_members enable row level security;
alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.comments enable row level security;
alter table public.expenses enable row level security;
alter table public.themes enable row level security;

-- Themes: anyone can read system themes
create policy "System themes are public" on public.themes for select using (is_system = true);

-- Trips: public read via share_slug (for the trip page), members can update
create policy "Trips viewable by slug" on public.trips for select using (true);
create policy "Organizer can update trip" on public.trips for update using (
  auth.uid() = organizer_id
);
create policy "Authenticated users can create trips" on public.trips for insert with check (
  auth.uid() = organizer_id
);

-- Blocks: anyone can read (trip page is public), organizer can write
create policy "Blocks viewable with trip" on public.blocks for select using (true);
create policy "Organizer can manage blocks" on public.blocks for all using (
  exists (select 1 from public.trips where trips.id = blocks.trip_id and trips.organizer_id = auth.uid())
);

-- Trip members: members can read, anyone can insert (RSVP), member can update own
create policy "Members viewable" on public.trip_members for select using (true);
create policy "Anyone can RSVP" on public.trip_members for insert with check (
  auth.uid() = user_id
);
create policy "Members can update own" on public.trip_members for update using (
  auth.uid() = user_id
);

-- Comments: anyone on trip can read and write
create policy "Comments viewable" on public.comments for select using (true);
create policy "Members can comment" on public.comments for insert with check (
  auth.uid() = user_id
);

-- Expenses: trip members can read and write
create policy "Expenses viewable" on public.expenses for select using (true);
create policy "Members can log expenses" on public.expenses for insert with check (
  auth.uid() = paid_by
);

-- Polls: public read, organizer write
create policy "Polls viewable" on public.polls for select using (true);
create policy "Organizer can manage polls" on public.polls for all using (
  exists (select 1 from public.trips where trips.id = polls.trip_id and trips.organizer_id = auth.uid())
);

-- Poll votes: public read, voter can write
create policy "Votes viewable" on public.poll_votes for select using (true);
create policy "Users can vote" on public.poll_votes for insert with check (
  auth.uid() = user_id
);

-- Users: own profile editable, basic info viewable by trip co-members
create policy "Users can read other users" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (
  auth.uid() = id
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Generate a unique share slug
create or replace function generate_share_slug()
returns trigger as $$
begin
  if new.share_slug is null then
    new.share_slug := encode(gen_random_bytes(6), 'base64');
    -- Replace URL-unsafe chars
    new.share_slug := replace(replace(replace(new.share_slug, '/', '_'), '+', '-'), '=', '');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_trips_share_slug
  before insert on public.trips
  for each row execute function generate_share_slug();

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger tr_users_updated_at before update on public.users for each row execute function update_updated_at();
create trigger tr_trips_updated_at before update on public.trips for each row execute function update_updated_at();
create trigger tr_blocks_updated_at before update on public.blocks for each row execute function update_updated_at();
create trigger tr_members_updated_at before update on public.trip_members for each row execute function update_updated_at();

-- ============================================================
-- SEED: Starter themes
-- ============================================================
insert into public.themes (template_name, template_category, background_type, background_value, color_primary, color_accent, font_display, font_body, is_system) values
  ('Euro Summer',    'setting',  'gradient', 'linear-gradient(168deg, #122c35 0%, #2d6b5a 28%, #d4a574 62%, #f5e6d0 100%)', '#1a3a4a', '#e8c9a0', 'Fraunces', 'Outfit', true),
  ('Beach Trip',     'setting',  'gradient', 'linear-gradient(165deg, #0a4d68 0%, #088395 30%, #05bfdb 60%, #f0e5cf 100%)', '#0a4d68', '#f0e5cf', 'Fraunces', 'Outfit', true),
  ('Ski Chalet',     'setting',  'gradient', 'linear-gradient(170deg, #1a1a2e 0%, #16213e 30%, #5c7a99 65%, #d4dfe6 100%)', '#1a1a2e', '#d4dfe6', 'Playfair Display', 'DM Sans', true),
  ('City Weekend',   'setting',  'gradient', 'linear-gradient(165deg, #0f0f0f 0%, #1a1a1a 35%, #333333 65%, #e8e8e8 100%)', '#0f0f0f', '#e8e8e8', 'Syne', 'Outfit', true),
  ('Wine Country',   'setting',  'gradient', 'linear-gradient(168deg, #2d1b2e 0%, #5c2d50 30%, #8b4557 55%, #d4a574 80%, #f0e5cf 100%)', '#2d1b2e', '#d4a574', 'Cormorant Garamond', 'Outfit', true),
  ('Lake Weekend',   'setting',  'gradient', 'linear-gradient(168deg, #1a3a2a 0%, #2d5a3a 30%, #6b8f71 55%, #c4b99a 80%, #e8dcc8 100%)', '#1a3a2a', '#c4b99a', 'Fraunces', 'Outfit', true),
  ('Bachelorette',   'occasion', 'gradient', 'linear-gradient(165deg, #4a1942 0%, #c2185b 35%, #f06292 60%, #fce4ec 100%)', '#4a1942', '#fce4ec', 'Playfair Display', 'DM Sans', true),
  ('Birthday Trip',  'occasion', 'gradient', 'linear-gradient(168deg, #1a1a2e 0%, #e65100 30%, #ff9800 55%, #fff3e0 100%)', '#1a1a2e', '#fff3e0', 'Syne', 'Outfit', true),
  ('Couples Trip',   'occasion', 'gradient', 'linear-gradient(170deg, #1a1a2e 0%, #3e2723 30%, #8d6e63 55%, #d7ccc8 85%, #efebe9 100%)', '#1a1a2e', '#d7ccc8', 'Cormorant Garamond', 'Outfit', true),
  ('Wellness Retreat','occasion','gradient', 'linear-gradient(168deg, #1b2e1b 0%, #2e5a2e 30%, #81c784 55%, #e8f5e9 100%)', '#1b2e1b', '#e8f5e9', 'Cormorant Garamond', 'Outfit', true),
  ('Just Because',   'occasion', 'gradient', 'linear-gradient(165deg, #1a237e 0%, #283593 30%, #5c6bc0 55%, #e8eaf6 100%)', '#1a237e', '#e8eaf6', 'Fraunces', 'Outfit', true),
  ('Minimal',        null,       'solid',    '#fafaf9', '#1a1a1a', '#525252', 'Outfit', 'Outfit', true);
