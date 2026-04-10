# Claude Code — Rally Prompts (Updated)

All prompts reflect the typed component schema (v2). Paste one at a time, in order.

---

## Prompt 1: Schema Reset + Kickoff

I'm building Rally — a group travel planning app. Think "Partiful for group trips."

The database schema has been updated. The old `blocks` table is gone — replaced by typed component tables. Here's what needs to happen:

1. Run the DROP SQL below in Supabase SQL Editor to clear the old schema:

```sql
drop table if exists public.expenses cascade;
drop table if exists public.poll_votes cascade;
drop table if exists public.polls cascade;
drop table if exists public.comments cascade;
drop table if exists public.trip_members cascade;
drop table if exists public.blocks cascade;
drop table if exists public.trips cascade;
drop table if exists public.themes cascade;
drop table if exists public.users cascade;
drop type if exists trip_phase cascade;
drop type if exists block_cost_type cascade;
drop type if exists block_status cascade;
drop type if exists rsvp_status cascade;
drop type if exists payment_status cascade;
drop type if exists member_role cascade;
drop type if exists poll_type cascade;
drop type if exists poll_status cascade;
drop type if exists split_type cascade;
drop function if exists generate_share_slug cascade;
drop function if exists update_updated_at cascade;
```

2. Then run the new migration from `002_typed_components.sql` in Supabase SQL Editor.

3. The updated types are in `src/types/index.ts` — read that file.

### Key files in this project:

- `rally-build-guide.md` — step-by-step build sequence
- `rally-sell-page.jsx` — interactive React mockup. VISUAL TARGET.
- `rally-prd-v4.docx` — full PRD with all product decisions
- `RALLY-README.md` — project overview and architecture
- `src/types/index.ts` — TypeScript types (v2, typed components)
- `src/lib/supabase/server.ts` + `client.ts` — Supabase clients
- `src/lib/settlements.ts` — expense settlement algorithm
- `src/lib/calendar.ts` — .ics calendar export
- `002_typed_components.sql` — new database schema

### Architecture:

- Next.js 14+ App Router, Tailwind CSS
- Supabase: Postgres, Auth (email for now, phone later), Realtime, Storage
- 5 typed component tables: `lodging`, `flights`, `transport`, `restaurants`, `activities`
- Each component has required fields (Sketch phase, fast entry) and optional fields (Lock phase, detailed planning)
- `lodging` supports multiple options with `lodging_votes` table for carousel voting
- Theme system: CSS custom properties from the `themes` table
- Phase-driven UI: `/trip/[slug]` adapts based on `trip.phase` (sketch/sell/lock/go)
- Date polls use binary multi-select ("check all that work"), not ranking
- Late joiners can RSVP during Lock phase — per-person shared cost recalculates down

### Start:

Seed test data (a test user, a test trip with Euro Summer theme, 2 lodging options, a flight, a rental car, a restaurant, and an activity). Then build the server-rendered trip page at `/trip/[slug]`.

---

## Prompt 2: Trip Page Components

Break the trip page into components in `src/components/trip/`:

1. `Countdown.tsx` — live countdown to `commit_deadline`
2. `LodgingCarousel.tsx` — swipeable carousel of lodging options. Each card shows OG image, name, price/night, highlights. Vote button with count + voter avatars. If only one option, render as single rich card.
3. `FlightCard.tsx` — route, estimated price, airline logo. Tagged "Book yours."
4. `TransportCard.tsx` — subtype icon, provider logo, cost, split/individual badge
5. `RestaurantCard.tsx` — name, date, time, OG image. Simple list style.
6. `ActivityCard.tsx` — name, cost, OG image, split/individual badge
7. `CostBreakdown.tsx` — per-person total with visual proportion bars, shared vs individual. Uses `calculateTripCost()` from types.
8. `GuestList.tsx` — trip members with RSVP status, tappable to profile modal
9. `OrganizerCard.tsx` — photo, name, bio, socials, "Message" button
10. `RsvpSection.tsx` — "You coming or what?" with 3 options, confetti on confirm, "Share to Story" CTA
11. `DatePoll.tsx` — multi-select dates, vote counts + mini avatars per option
12. `GroupChat.tsx` — comment feed with emoji reactions, text input
13. `ProfileModal.tsx` — tappable avatar opens modal with photo, bio, socials

Use `rally-sell-page.jsx` as the visual reference. Use theme CSS variables. Add scroll-triggered fade-in animations.

---

## Prompt 3: OG Tags

Add OpenGraph meta tags to the trip page using Next.js `generateMetadata`:
- `og:title` = trip name
- `og:description` = "{destination} • {dates} • ~${perPerson}/person"
- `og:image` = cover_image_url

---

## Prompt 4: Auth

Build email auth (phone via Twilio later):
1. Auth page at `src/app/auth/page.tsx` — email magic link via Supabase Auth
2. First-time users: profile setup (name, photo, bio, Instagram)
3. Redirect to dashboard after auth

---

## Prompt 5: Dashboard + Trip Creation

1. Dashboard at `src/app/page.tsx` — list of trips, "Create a trip" button
2. Trip creation at `src/app/create/page.tsx`:
   - Name, destination, tagline, dates, cover image, commitment deadline
   - Theme picker: grid of templates from themes table
   - On submit: insert trip + trip_member (organizer, rsvp: in), redirect to editor

---

## Prompt 6: Trip Editor

Build `src/app/edit/[id]/page.tsx`:
1. Editable trip details
2. Add component buttons: "Add Lodging", "Add Flight", "Add Transport", "Add Restaurant", "Add Activity"
3. Each opens a minimal form with only the required Sketch-phase fields:
   - Lodging: paste link + cost/night
   - Flight: departure airport + arrival airport + price
   - Transport: subtype + estimated cost
   - Restaurant: name (that's it)
   - Activity: name + estimated cost
4. Link enrichment: when URL pasted, call `/api/enrich` for OG title + image
5. Lodging: can add multiple options (for carousel voting)
6. Preview button → trip page in new tab
7. Share button → copy URL to clipboard

Build `/api/enrich/route.ts` — fetch URL, parse OG tags, return title + image.

---

## Prompt 7: RSVP

1. API at `/api/rsvp/route.ts` — accepts email, name, rsvp status, trip_id
2. Creates/finds user, creates trip_member
3. UI: email input → RSVP buttons → confetti on "I'm so in" → "Share to Story"
4. Late joiners: RSVP works in Lock phase too. Per-person cost recalculates when new member joins.

---

## Prompt 8: Lodging Voting + Date Polls

1. Lodging carousel voting:
   - Authenticated users tap "Vote" on their preferred option
   - Vote inserts into `lodging_votes` table (one vote per user per option — can change)
   - Vote counts + voter avatars update in real time
   - Organizer can mark winner: `is_selected = true`
2. Date polls:
   - Multi-select: "check all dates that work for you"
   - Show vote count + mini avatars per option
   - Organizer picks the winner
   - Keep it fast — votable in under 5 seconds

---

## Prompt 9: Group Chat

1. `GroupChat.tsx` — comments from `comments` table
2. Text input (requires auth)
3. Emoji reactions on comments
4. Supabase Realtime for live updates
5. Style like "The group chat" in `rally-sell-page.jsx`

---

## Prompt 10: Animations + Polish

1. Scroll-triggered fade-in (IntersectionObserver) on every section
2. Hero text: staggered spring curves
3. Avatars: sequential pop-in
4. Countdown separators: pulse
5. Confetti on RSVP
6. Date poll: scale on selection
7. Guest list: slide from left
8. Test with multiple themes (Euro Summer, Ski Chalet, Bachelorette, Minimal)

---

## Prompt 11: Story Card + Deploy

1. OG image at `/api/og/route.tsx` using `@vercel/og` — 1080x1920 (9:16) with destination, dates, cost, theme colors
2. "Share to Story" downloads this image
3. Deploy: `npx vercel`
