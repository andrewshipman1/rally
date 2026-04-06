-- Rally — Master Features Migration
-- Adds fields needed for: descriptions, extras, invite system,
-- customizable RSVP emojis, activity feed.

-- ============================================================
-- TRIPS: new fields
-- ============================================================
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS packing_list jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS playlist_url text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS house_rules text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS rsvp_emojis jsonb
  DEFAULT '{"going": "🙌", "maybe": "🤔", "cant": "😢"}'::jsonb;

-- ============================================================
-- COMMENTS: type field for activity feed
-- ============================================================
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS type text DEFAULT 'comment';
-- type: 'comment' | 'rsvp'

-- ============================================================
-- USERS: INSERT policy (must re-add after schema reset)
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- TRIP_MEMBERS: allow organizer to insert invited members
-- (Currently only "auth.uid() = user_id" — need to allow organizer to invite others)
-- ============================================================
DROP POLICY IF EXISTS "Organizer can invite members" ON public.trip_members;
CREATE POLICY "Organizer can invite members" ON public.trip_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_id AND trips.organizer_id = auth.uid()
    )
  );

-- Allow organizer to also delete invited members (uninvite)
DROP POLICY IF EXISTS "Organizer can manage members" ON public.trip_members;
CREATE POLICY "Organizer can manage members" ON public.trip_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_id AND trips.organizer_id = auth.uid()
    )
  );
