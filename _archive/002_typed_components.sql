-- Rally Database Schema v2
-- TYPED COMPONENTS replacing freeform blocks
-- Required fields (Sketch phase) vs Optional fields (Lock phase)

-- ============================================================
-- USERS (unchanged)
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
-- THEMES (unchanged)
-- ============================================================
create table public.themes (
  id uuid primary key default gen_random_uuid(),
  template_name text,
  template_category text,
  background_type text not null default 'gradient',
  background_value text not null,
  color_primary text not null default '#1a3a4a',
  color_accent text not null default '#e8c9a0',
  color_card text default 'rgba(255,255,255,0.08)',
  font_display text not null default 'Fraunces',
  font_body text not null default 'Outfit',
  is_system boolean default false,
  preview_image_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- TRIPS
-- ============================================================
create type trip_phase as enum ('sketch', 'sell', 'lock', 'go');

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.users(id),
  theme_id uuid references public.themes(id),

  name text not null,
  destination text,
  tagline text,
  date_start date,
  date_end date,
  cover_image_url text,

  phase trip_phase not null default 'sketch',
  commit_deadline timestamptz,
  group_size int default 0,

  share_slug text unique not null,

  essential_info jsonb default '[]'::jsonb,
  photo_album_url text,
  header_images jsonb default '[]'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_trips_slug on public.trips(share_slug);
create index idx_trips_organizer on public.trips(organizer_id);

-- ============================================================
-- LODGING
-- The centerpiece. Supports multiple options for voting.
--
-- Required (Sketch): link OR name, cost_per_night
-- Optional (Lock):   everything else
-- ============================================================
create type component_status as enum ('estimated', 'confirmed');

create table public.lodging (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,

  -- Required (Sketch phase - paste a link and a price)
  name text not null,                               -- auto-extracted from OG or manual
  link text,                                        -- Airbnb/hotel URL → OG scrape
  cost_per_night numeric(10,2),

  -- Auto-extracted from OG scrape
  og_title text,
  og_description text,
  og_image_url text,                                -- hero image from OG tags

  -- Optional (Lock phase)
  additional_photos jsonb default '[]'::jsonb,      -- organizer-uploaded screenshots
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  num_nights int,                                   -- calculated from trip dates or manual
  total_cost numeric(10,2),                         -- cost_per_night × num_nights
  bedrooms int,
  max_guests int,
  check_in_time text,                               -- "3:00 PM"
  check_out_time text,                              -- "11:00 AM"
  highlights jsonb default '[]'::jsonb,             -- ["Private pool", "Beachfront", ...]

  -- Status & booking
  status component_status not null default 'estimated',
  booked_by uuid references public.users(id),
  notes text,

  -- Voting (carousel)
  is_selected boolean default false,                -- the winning option after voting
  sort_order int default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_lodging_trip on public.lodging(trip_id);

-- ============================================================
-- LODGING VOTES
-- Each user votes for their preferred lodging option
-- ============================================================
create table public.lodging_votes (
  id uuid primary key default gen_random_uuid(),
  lodging_id uuid not null references public.lodging(id) on delete cascade,
  user_id uuid not null references public.users(id),
  created_at timestamptz default now(),
  unique(lodging_id, user_id)
);

-- ============================================================
-- FLIGHTS
-- Individual cost — everyone books their own.
--
-- Required (Sketch): route + estimated price
-- Optional (Lock):   flight number, exact times, airline
-- ============================================================
create table public.flights (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,

  -- Required (Sketch phase - "JFK → CUN, ~$280")
  departure_airport text not null,                  -- "JFK"
  arrival_airport text not null,                    -- "CUN"
  estimated_price numeric(10,2),

  -- Optional (Lock phase)
  airline text,                                     -- "JetBlue" → logo lookup
  flight_number text,                               -- "B6 531"
  departure_time timestamptz,
  arrival_time timestamptz,
  is_direct boolean,
  duration text,                                    -- "3h 45m"
  booking_link text,                                -- Google Flights / airline URL → OG scrape
  og_image_url text,

  -- Status
  status component_status not null default 'estimated',
  notes text,                                       -- "Book the 7am — let's all be on the same one"

  -- Display
  sort_order int default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_flights_trip on public.flights(trip_id);

-- ============================================================
-- TRANSPORT
-- Car rentals, taxis, public transit.
--
-- Required (Sketch): subtype + estimated cost
-- Optional (Lock):   provider, pickup details, booking
-- ============================================================
create type transport_subtype as enum ('car_rental', 'taxi', 'public_transit');

create table public.transport (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,

  -- Required (Sketch phase)
  subtype transport_subtype not null,
  estimated_total numeric(10,2),

  -- Optional (Lock phase)
  provider text,                                    -- "Hertz", "Uber" → logo lookup
  vehicle_type text,                                -- "SUV", "Sedan"
  daily_rate numeric(10,2),                         -- car rentals
  num_days int,                                     -- car rentals
  per_ride_cost numeric(10,2),                      -- taxi/rideshare
  route text,                                       -- "Airport → House"
  pickup_location text,
  pickup_time timestamptz,
  dropoff_location text,
  booking_link text,                                -- → OG scrape for image
  og_image_url text,

  -- Cost & status
  cost_type text not null default 'shared',         -- 'shared' or 'individual'
  status component_status not null default 'estimated',
  booked_by uuid references public.users(id),
  notes text,

  sort_order int default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_transport_trip on public.transport(trip_id);

-- ============================================================
-- RESTAURANTS
-- Simple: name, date, time, location.
--
-- Required (Sketch): name
-- Optional (Lock):   date, time, address, cost, reservation
-- ============================================================
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,

  -- Required (Sketch phase - just a name)
  name text not null,

  -- Auto-extracted
  link text,                                        -- Google Maps / Yelp / Resy → OG scrape
  og_image_url text,

  -- Optional (Lock phase)
  date date,
  time text,                                        -- "8:00 PM"
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  cost_per_person numeric(10,2),
  cost_type text default 'individual',              -- 'shared' or 'individual'
  status component_status not null default 'estimated',
  reserved_by uuid references public.users(id),
  confirmation_number text,
  notes text,

  sort_order int default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_restaurants_trip on public.restaurants(trip_id);

-- ============================================================
-- ACTIVITIES
-- Excursions, tours, yoga, etc.
--
-- Required (Sketch): name + estimated cost
-- Optional (Lock):   date, time, location, booking
-- ============================================================
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,

  -- Required (Sketch phase)
  name text not null,
  estimated_cost numeric(10,2),

  -- Auto-extracted
  link text,                                        -- Viator / Airbnb Experiences → OG scrape
  og_image_url text,

  -- Optional (Lock phase)
  date date,
  time text,                                        -- "9:00 AM"
  duration text,                                    -- "4 hours"
  location text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  booking_link text,
  cost_type text not null default 'individual',     -- 'shared' or 'individual'
  status component_status not null default 'estimated',
  booked_by uuid references public.users(id),
  notes text,                                       -- "Bring water shoes"

  sort_order int default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_activities_trip on public.activities(trip_id);

-- ============================================================
-- TRIP MEMBERS (unchanged)
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
  cost_share numeric(10,2),
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
-- POLLS (for date voting, not lodging — lodging has its own votes)
-- ============================================================
create type poll_type as enum ('date_range', 'option_vote');
create type poll_status as enum ('open', 'closed');

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  poll_type poll_type not null,
  question text,
  options jsonb not null default '[]'::jsonb,
  status poll_status not null default 'open',
  created_at timestamptz default now()
);

create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references public.users(id),
  selected_options jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  unique(poll_id, user_id)
);

-- ============================================================
-- COMMENTS (Group Chat / Hype Feed — unchanged)
-- ============================================================
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.users(id),
  text text not null,
  reactions jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create index idx_comments_trip on public.comments(trip_id);

-- ============================================================
-- EXPENSES (Go Phase — unchanged)
-- ============================================================
create type split_type as enum ('equal', 'custom', 'specific');

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  description text not null,
  amount numeric(10,2) not null,
  currency text default 'USD',
  category text,
  paid_by uuid not null references public.users(id),
  split_type split_type not null default 'equal',
  split_details jsonb default '{}'::jsonb,
  receipt_url text,
  created_at timestamptz default now()
);

create index idx_expenses_trip on public.expenses(trip_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.trips enable row level security;
alter table public.lodging enable row level security;
alter table public.lodging_votes enable row level security;
alter table public.flights enable row level security;
alter table public.transport enable row level security;
alter table public.restaurants enable row level security;
alter table public.activities enable row level security;
alter table public.trip_members enable row level security;
alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.comments enable row level security;
alter table public.expenses enable row level security;
alter table public.themes enable row level security;

-- Themes
create policy "System themes are public" on public.themes for select using (is_system = true);

-- Trips
create policy "Trips viewable by slug" on public.trips for select using (true);
create policy "Organizer can update trip" on public.trips for update using (auth.uid() = organizer_id);
create policy "Authenticated users can create trips" on public.trips for insert with check (auth.uid() = organizer_id);

-- All component tables: public read, organizer write
-- Lodging
create policy "Lodging viewable" on public.lodging for select using (true);
create policy "Organizer can manage lodging" on public.lodging for all using (
  exists (select 1 from public.trips where trips.id = lodging.trip_id and trips.organizer_id = auth.uid())
);

-- Lodging votes: anyone can vote
create policy "Lodging votes viewable" on public.lodging_votes for select using (true);
create policy "Users can vote on lodging" on public.lodging_votes for insert with check (auth.uid() = user_id);
create policy "Users can change lodging vote" on public.lodging_votes for delete using (auth.uid() = user_id);

-- Flights
create policy "Flights viewable" on public.flights for select using (true);
create policy "Organizer can manage flights" on public.flights for all using (
  exists (select 1 from public.trips where trips.id = flights.trip_id and trips.organizer_id = auth.uid())
);

-- Transport
create policy "Transport viewable" on public.transport for select using (true);
create policy "Organizer can manage transport" on public.transport for all using (
  exists (select 1 from public.trips where trips.id = transport.trip_id and trips.organizer_id = auth.uid())
);

-- Restaurants
create policy "Restaurants viewable" on public.restaurants for select using (true);
create policy "Organizer can manage restaurants" on public.restaurants for all using (
  exists (select 1 from public.trips where trips.id = restaurants.trip_id and trips.organizer_id = auth.uid())
);

-- Activities
create policy "Activities viewable" on public.activities for select using (true);
create policy "Organizer can manage activities" on public.activities for all using (
  exists (select 1 from public.trips where trips.id = activities.trip_id and trips.organizer_id = auth.uid())
);

-- Trip members
create policy "Members viewable" on public.trip_members for select using (true);
create policy "Anyone can RSVP" on public.trip_members for insert with check (auth.uid() = user_id);
create policy "Members can update own" on public.trip_members for update using (auth.uid() = user_id);

-- Comments
create policy "Comments viewable" on public.comments for select using (true);
create policy "Members can comment" on public.comments for insert with check (auth.uid() = user_id);

-- Expenses
create policy "Expenses viewable" on public.expenses for select using (true);
create policy "Members can log expenses" on public.expenses for insert with check (auth.uid() = paid_by);

-- Polls
create policy "Polls viewable" on public.polls for select using (true);
create policy "Organizer can manage polls" on public.polls for all using (
  exists (select 1 from public.trips where trips.id = polls.trip_id and trips.organizer_id = auth.uid())
);
create policy "Votes viewable" on public.poll_votes for select using (true);
create policy "Users can vote" on public.poll_votes for insert with check (auth.uid() = user_id);

-- Users
create policy "Users can read other users" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

create or replace function generate_share_slug()
returns trigger as $$
begin
  if new.share_slug is null then
    new.share_slug := encode(gen_random_bytes(6), 'base64');
    new.share_slug := replace(replace(replace(new.share_slug, '/', '_'), '+', '-'), '=', '');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_trips_share_slug
  before insert on public.trips
  for each row execute function generate_share_slug();

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger tr_users_updated before update on public.users for each row execute function update_updated_at();
create trigger tr_trips_updated before update on public.trips for each row execute function update_updated_at();
create trigger tr_lodging_updated before update on public.lodging for each row execute function update_updated_at();
create trigger tr_flights_updated before update on public.flights for each row execute function update_updated_at();
create trigger tr_transport_updated before update on public.transport for each row execute function update_updated_at();
create trigger tr_restaurants_updated before update on public.restaurants for each row execute function update_updated_at();
create trigger tr_activities_updated before update on public.activities for each row execute function update_updated_at();
create trigger tr_members_updated before update on public.trip_members for each row execute function update_updated_at();

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
