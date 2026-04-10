# Rally — Step-by-Step Build Guide

## Phase 0: Setup (30 min)

### Step 1: Create Supabase Project
- Go to [supabase.com](https://supabase.com) → New Project
- Name it "rally", pick a region close to you, set a DB password
- Save these values (you'll need them in Step 4):
  - Project URL (`https://xxx.supabase.co`)
  - Anon Key (Settings → API → `anon` key)
  - Service Role Key (Settings → API → `service_role` key)

### Step 2: Run the Database Migration
- In Supabase Dashboard → SQL Editor → New Query
- Paste the entire contents of `supabase/migrations/001_initial_schema.sql`
- Click Run
- Verify: check Table Editor — you should see 9 tables (users, trips, themes, blocks, trip_members, polls, poll_votes, comments, expenses) and 12 theme rows

### Step 3: Enable Phone Auth
- Dashboard → Authentication → Providers → Phone
- Toggle ON
- You'll need Twilio credentials:
  - Create a [Twilio](https://twilio.com) account (free trial works)
  - Get: Account SID, Auth Token, and a Phone Number or Messaging Service SID
  - Enter these in Supabase Phone provider settings
- **Shortcut for development:** You can also enable Email auth temporarily to skip Twilio setup and move faster. Switch to phone later.

### Step 4: Create the Next.js Project
```bash
npx create-next-app@latest rally --typescript --tailwind --app --src-dir
cd rally
npm install @supabase/supabase-js @supabase/ssr
npm install date-fns lucide-react
```

### Step 5: Environment Variables
Create `.env.local` in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 6: Copy Starter Files
From the `rally-starter.tar.gz`, copy into your project:
- `src/types/index.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/settlements.ts`
- `src/lib/calendar.ts`

### Step 7: Verify
```bash
npm run dev
```
You should see the default Next.js page at `localhost:3000`. Setup is done.

---

## Phase 1: The Trip Page (Week 1)
*Goal: A shareable trip page that renders from database data.*

### Step 8: Create a Test Trip in Supabase
In SQL Editor, insert test data so you have something to render:
```sql
-- Create a test user
INSERT INTO users (id, phone, display_name, bio, instagram_handle)
VALUES ('00000000-0000-0000-0000-000000000001', '+15551234567', 'Andrew', 'Trip organizer extraordinaire', '@andrew.s');

-- Create a test trip
INSERT INTO trips (id, organizer_id, name, destination, tagline, date_start, date_end, phase, commit_deadline, group_size, theme_id)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Tulum',
  'Quintana Roo, Mexico',
  'Sun, cenotes & mezcal',
  '2026-07-16',
  '2026-07-19',
  'sell',
  '2026-06-01',
  6,
  (SELECT id FROM themes WHERE template_name = 'Euro Summer')
);

-- Add some blocks
INSERT INTO blocks (trip_id, name, cost, cost_type, tag_label, tag_emoji, external_link, sort_order) VALUES
('00000000-0000-0000-0000-000000000002', 'Casa Palapa — Beachfront Villa', 580, 'shared', 'The House', '🏠', 'https://airbnb.com/rooms/example', 0),
('00000000-0000-0000-0000-000000000002', 'JFK → CUN', 280, 'individual', 'Flights', '✈️', 'https://google.com/flights', 1),
('00000000-0000-0000-0000-000000000002', 'SUV from Cancún Airport', 135, 'shared', 'Rental Car', '🚗', NULL, 2),
('00000000-0000-0000-0000-000000000002', 'Cenote day trip + snorkeling', 65, 'individual', 'Activities', '🤿', NULL, 3),
('00000000-0000-0000-0000-000000000002', 'Groceries + group dinners', 120, 'shared', 'Meals', '🍽️', NULL, 4);
```

### Step 9: Build the Trip Page Route → CLAUDE CODE
**This is where you switch to Claude Code.**

Open the project in Claude Code and tell it:

> Build the trip page at `src/app/trip/[slug]/page.tsx`. This is a server-rendered page that:
> 1. Fetches the trip by `share_slug` from Supabase (with theme, blocks, and members joined)
> 2. Applies the theme's CSS variables (background, colors, fonts)
> 3. Renders the trip using the visual structure from `rally-sell-page.jsx` (the mockup)
> 4. The page should work at `localhost:3000/trip/{slug}`
>
> The types are in `src/types/index.ts`. The Supabase server client is in `src/lib/supabase/server.ts`.
> The test trip's slug is in the database — check the `share_slug` column.

### Step 10: Build Trip Page Components → CLAUDE CODE
Once the basic page renders, build each section as a component:

> Now break the trip page into components in `src/components/trip/`:
> 1. `Countdown.tsx` — live countdown to `commit_deadline`
> 2. `BlockCard.tsx` — renders a single block with cost, type badge (Split/Book yours), and link
> 3. `CostBreakdown.tsx` — per-person total with visual proportion bars
> 4. `GuestList.tsx` — list of trip members with RSVP status
> 5. `RsvpSection.tsx` — the RSVP UI (buttons, confirmation state)
>
> Use `rally-sell-page.jsx` as the visual reference for each component.

### Step 11: Add OG Meta Tags → CLAUDE CODE
> Add OpenGraph meta tags to the trip page so link previews work in iMessage/WhatsApp:
> - `og:title` = trip name
> - `og:description` = "{destination} • {dates} • ~${perPerson}/person"
> - `og:image` = cover_image_url (or generate one later)
> Use Next.js `generateMetadata` in the page file.

---

## Phase 2: Trip Creation (Week 2)
*Goal: An organizer can create a trip and add blocks through a UI.*

### Step 12: Auth Flow → CLAUDE CODE
> Build phone auth at `src/app/auth/page.tsx`:
> 1. Phone number input → send OTP via Supabase Auth
> 2. OTP verification screen
> 3. First-time users: quick profile setup (name, photo, bio, Instagram)
> 4. Redirect to dashboard after auth
>
> Store the user session. Use Supabase Auth helpers.

### Step 13: Dashboard → CLAUDE CODE
> Build the organizer dashboard at `src/app/page.tsx` (authenticated):
> 1. List of organizer's trips (fetched from Supabase)
> 2. Each trip shows: name, destination, date, phase badge, member count
> 3. "Create a trip" button
> 4. Clicking a trip goes to the editor

### Step 14: Trip Creation Form → CLAUDE CODE
> Build trip creation at `src/app/create/page.tsx`:
> 1. Form: trip name, destination, tagline, date range, cover image upload, commitment deadline
> 2. Theme picker: show grid of starter templates from the themes table. Clicking one previews the gradient.
> 3. On submit: insert into trips table, create a trip_member row for the organizer (role: organizer, rsvp: in), redirect to editor

### Step 15: Trip Editor & Block Management → CLAUDE CODE
> Build the trip editor at `src/app/edit/[id]/page.tsx`:
> 1. Show current trip details (editable)
> 2. List of blocks with drag-to-reorder
> 3. "Add block" form: name, link (optional), cost, cost type (shared/individual), tag label, tag emoji
> 4. If a link is pasted, call the `/api/enrich` endpoint to extract title + image
> 5. Preview button that opens the trip page in a new tab
> 6. "Share" button that copies the trip URL to clipboard

### Step 16: Link Enrichment API → CLAUDE CODE
> Build `src/app/api/enrich/route.ts`:
> 1. Accepts a URL in the request body
> 2. Fetches the page, parses OG tags (og:title, og:image, og:description)
> 3. Returns extracted data as JSON
> 4. Handle errors gracefully — if OG tags aren't available, return nulls

---

## Phase 3: RSVP & Collaboration (Week 3)
*Goal: Friends can RSVP, vote on dates, and chat on the trip page.*

### Step 17: RSVP Flow → CLAUDE CODE
> Build the RSVP API and UI:
> 1. `src/app/api/rsvp/route.ts` — accepts phone, name, email, rsvp status, trip_id
> 2. Creates or finds user by phone number
> 3. Creates trip_member row with RSVP status
> 4. Returns the user + member data
> 5. In `RsvpSection.tsx`: show phone input → OTP verify → RSVP buttons → confetti on confirm
> 6. After RSVP, show "Share to Story" button

### Step 18: Date Poll → CLAUDE CODE
> Build the date poll:
> 1. Organizer creates a poll in the editor (type: date_range, with date options)
> 2. `DatePoll.tsx` renders on the trip page with tappable options
> 3. Voting calls Supabase to insert/update poll_votes
> 4. Results show vote counts + mini avatars of who voted for each option

### Step 19: Group Chat → CLAUDE CODE
> Build the group chat / hype feed:
> 1. `GroupChat.tsx` renders comments from the comments table
> 2. Text input to post new comments (requires auth)
> 3. Emoji reactions: clicking an emoji on a comment updates the reactions JSON array
> 4. Use Supabase Realtime to subscribe to new comments (live updates)

### Step 20: Organizer Card & Profiles → CLAUDE CODE
> 1. `OrganizerCard.tsx` — shows organizer photo, name, bio, socials, "Message" button (sms: deeplink)
> 2. `ProfileModal.tsx` — tapping any avatar opens a modal with their profile (photo, bio, Instagram)
> 3. Fetch user data from the users table via trip_members join

---

## Phase 4: Polish & Ship (Week 4)
*Goal: It looks and feels like the mockup. Ready for real trips.*

### Step 21: Animations → CLAUDE CODE
> Add scroll-triggered animations to the trip page:
> 1. Each section fades up on scroll (IntersectionObserver)
> 2. Hero text animates in with staggered spring curves
> 3. Friend avatars pop in sequentially
> 4. Countdown separators pulse
> 5. Confetti burst on RSVP confirm (already in RsvpSection)
> 6. Date poll options scale up when selected

### Step 22: Theme Polish → CLAUDE CODE
> Make sure the theme system works end-to-end:
> 1. Fonts load from Google Fonts based on theme.font_display and theme.font_body
> 2. Background gradient renders correctly on the trip page
> 3. All UI components use CSS variables, not hardcoded colors
> 4. Test with 3-4 different themes (Euro Summer, Ski Chalet, Bachelorette, Minimal)

### Step 23: Share-to-Story Card → CLAUDE CODE
> Build OG image generation at `src/app/api/og/route.tsx`:
> 1. Use `@vercel/og` (Satori) to generate a 1080x1920 (9:16) image
> 2. Include: destination, dates, per-person cost, cover image, theme colors
> 3. Expose as `/api/og?slug={slug}`
> 4. Add a "Share to Story" button that downloads this image

### Step 24: Mobile Testing
- Open `localhost:3000/trip/{slug}` on your phone
- Check: does the countdown render? Do buttons work? Is the font loading?
- Fix any viewport issues

### Step 25: Deploy to Vercel
```bash
npm install -g vercel
vercel
```
- Set environment variables in Vercel dashboard
- Your trip page is now live at `your-app.vercel.app/trip/{slug}`

### Step 26: Dogfood It
- Create a real trip for your next group outing
- Share the link with friends
- Watch what happens. Take notes on what's confusing, what's missing, what they say.

---

## What Comes After

Once Sprint 1 is shipped and dogfooded:

- **Lock phase UI** — block status changes, recommended flights, payment tracker
- **Go phase** — essential info hub, expense tracker, settle up
- **Visual header builder** — collage grid in the editor
- **Calendar integration** — "Add to Calendar" buttons using the .ics utility
- **More templates** — expand the theme library based on what trips people plan

The PRD has the full roadmap through Week 20.
