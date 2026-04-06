CREATE TABLE public.groceries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null default 'Grocery Run',
  estimated_total numeric(10,2),
  store_name text,
  store_address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  cost_type text not null default 'shared',
  status component_status not null default 'estimated',
  booked_by uuid references public.users(id),
  notes text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX idx_groceries_trip ON public.groceries(trip_id);

ALTER TABLE public.groceries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groceries viewable" ON public.groceries FOR SELECT USING (true);
CREATE POLICY "Organizer can manage groceries" ON public.groceries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = groceries.trip_id AND trips.organizer_id = auth.uid())
);

CREATE TRIGGER tr_groceries_updated BEFORE UPDATE ON public.groceries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
