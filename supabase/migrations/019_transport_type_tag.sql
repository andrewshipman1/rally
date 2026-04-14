-- Session 8M: Transportation module rebuild.
-- Adds the 7-value type_tag enum + a canonical description column on
-- public.transport. Legacy subtype enum and columns (provider, vehicle_type,
-- daily_rate, num_days, per_ride_cost, route, pickup_*, dropoff_*) are
-- intentionally retained and silently deprecated — do not drop in this
-- migration.
--
-- Run note: this file is committed for local history. It was applied
-- manually to the hosted Supabase instance on 2026-04-14 because the
-- local environment has no Docker (see Session 8K Actuals, finding #1).

create type transport_type_tag as enum (
  'flight',
  'train',
  'rental_car_van',
  'charter_van_bus',
  'charter_boat',
  'ferry',
  'other'
);

alter table public.transport
  add column if not exists type_tag transport_type_tag,
  add column if not exists description text;

-- Backfill type_tag from legacy subtype for pre-existing rows
update public.transport
set type_tag = case subtype
  when 'car_rental'     then 'rental_car_van'::transport_type_tag
  when 'taxi'           then 'other'::transport_type_tag
  when 'public_transit' then 'train'::transport_type_tag
  else 'other'::transport_type_tag
end
where type_tag is null;

-- Backfill description with a sensible fallback chain
update public.transport
set description = coalesce(
  nullif(trim(route), ''),
  nullif(trim(provider), ''),
  nullif(trim(notes), ''),
  'transportation'
)
where description is null;

-- NOT NULL once backfill is safe
alter table public.transport
  alter column type_tag set not null,
  alter column description set not null;
