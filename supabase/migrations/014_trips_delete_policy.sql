-- Allow organizer to delete their own trips
create policy "Organizer can delete trip"
  on public.trips
  for delete
  using (auth.uid() = organizer_id);
