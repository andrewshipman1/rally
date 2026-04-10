# Claude Code — Rally Kickoff Prompt

## First: Copy these files into your rally project directory

Run these from inside your `rally` project folder (~/rally or wherever you created it):

```bash
# The build guide and reference files - adjust paths if they downloaded elsewhere
cp ~/Downloads/rally-build-guide.md .
cp ~/Downloads/rally-sell-page.jsx .
cp ~/Downloads/rally-prd-v4.docx .
cp ~/Downloads/claude-code-prompt.md .
cp ~/Desktop/Rally/rally/README.md ./RALLY-README.md
```

If any files aren't in Downloads, check ~/Desktop/Rally/ instead.

---

## Prompt 1: Kickoff (paste this first)

I'm building Rally — a group travel planning app. Think "Partiful for group trips." Organizers build themed, shareable trip pages. Friends open a link, see the house, check the cost, and RSVP.

### Key files already in this project:

- `rally-build-guide.md` — step-by-step build sequence, 26 steps. I've completed Steps 1–7 (setup). Start at Step 8.
- `rally-sell-page.jsx` — interactive React mockup of the Sell-phase trip page. This is the VISUAL TARGET. Match this design exactly.
- `rally-prd-v4.docx` — full PRD. Reference for product decisions.
- `RALLY-README.md` — project overview, architecture, and setup context.
- `src/types/index.ts` — TypeScript types matching the database schema
- `src/lib/supabase/server.ts` — Supabase server client for SSR
- `src/lib/supabase/client.ts` — Supabase browser client
- `src/lib/settlements.ts` — expense settlement algorithm
- `src/lib/calendar.ts` — .ics calendar export utility

### Architecture:

- Next.js 14+ App Router with server-rendered trip pages
- Supabase for Postgres, auth (email for now, phone later), realtime (group chat), and storage (images)
- Tailwind CSS for styling
- Theme system: each trip has a theme (from the themes table) that maps to CSS custom properties. The trip page renders using these variables.
- Phase-driven UI: trip page URL is `/trip/[slug]`. Layout adapts based on `trip.phase` (sketch/sell/lock/go).

### What's done:

- Supabase project live with full schema (9 tables, 12 starter themes)
- Email auth enabled (phone auth via Twilio coming later)
- Next.js project scaffolded with Tailwind
- All types, lib files, and starter themes in place
- `.env.local` configured

### Start at Step 8 in rally-build-guide.md:

Seed test data into Supabase, then build the server-rendered trip page at `/trip/[slug]`. Work through the build guide steps in order. After each step, tell me what you built and what's next.

---

## Prompt 2: After the trip page is rendering

Now break the trip page into components in `src/components/trip/`:
1. `Countdown.tsx` — live countdown to `commit_deadline`
2. `BlockCard.tsx` — renders a single block with cost, type badge (Split/Book yours), and optional link
3. `CostBreakdown.tsx` — per-person total with visual proportion bars, shared vs individual split
4. `GuestList.tsx` — list of trip members with RSVP status badges, tappable avatars
5. `OrganizerCard.tsx` — organizer photo, name, bio, socials, "Message" button
6. `RsvpSection.tsx` — "You coming or what?" with three options, confetti on confirm, "Share to Story" CTA after
7. `GroupChat.tsx` — comment feed with emoji reactions and text input

Use `rally-sell-page.jsx` as the visual reference for each component. Use the theme CSS variables, not hardcoded colors. Add scroll-triggered fade-in animations on each section.

---

## Prompt 3: Add OG tags and link previews

Add OpenGraph meta tags to the trip page using Next.js `generateMetadata`:
- `og:title` = trip name
- `og:description` = "{destination} • {dates} • ~${perPerson}/person"
- `og:image` = cover_image_url
Make sure link previews work when pasted into iMessage/WhatsApp.

---

## Prompt 4: Auth flow

Build email auth (we'll swap to phone later):
1. Auth page at `src/app/auth/page.tsx` — email + magic link via Supabase Auth
2. First-time users: quick profile setup (name, photo, bio, Instagram handle)
3. After auth, redirect to dashboard
4. Store user session with Supabase Auth helpers

---

## Prompt 5: Dashboard + trip creation

Build:
1. Dashboard at `src/app/page.tsx` (authenticated) — list of organizer's trips, "Create a trip" button
2. Trip creation at `src/app/create/page.tsx` — form with name, destination, tagline, dates, cover image, commitment deadline
3. Theme picker: show grid of starter templates from the themes table, clicking one previews the gradient
4. On submit: insert trip, create trip_member row for organizer (role: organizer, rsvp: in), redirect to editor

---

## Prompt 6: Trip editor + block management

Build the trip editor at `src/app/edit/[id]/page.tsx`:
1. Editable trip details
2. List of blocks with drag-to-reorder
3. "Add block" form: name, link (optional), cost, cost type (shared/individual), tag label + emoji
4. Link enrichment: when a URL is pasted, call `/api/enrich` to extract title + image via OG tags
5. Preview button → opens trip page in new tab
6. Share button → copies trip URL to clipboard

Build the enrichment API at `src/app/api/enrich/route.ts` — fetches a URL, parses OG tags, returns title + image + description.

---

## Prompt 7: RSVP flow

Build the RSVP system:
1. API at `src/app/api/rsvp/route.ts` — accepts email, name, rsvp status, trip_id
2. Creates or finds user by email
3. Creates trip_member row
4. In `RsvpSection.tsx`: email input → RSVP buttons → confetti on "I'm so in" → "Share to Story" button appears

---

## Prompt 8: Date poll + option voting

1. Organizer creates polls in the editor (type: date_range or option_vote)
2. `DatePoll.tsx` on trip page — tappable date options with vote counts and mini avatars
3. Voting saves to poll_votes table via Supabase
4. Option voting: visual side-by-side (Airbnb A vs B)

---

## Prompt 9: Group chat with realtime

Build the group chat:
1. `GroupChat.tsx` renders comments from the comments table
2. Text input to post (requires auth)
3. Emoji reactions: tapping adds to reactions JSON array
4. Supabase Realtime subscription for live updates
5. Style it like the "The group chat" section in `rally-sell-page.jsx`

---

## Prompt 10: Animations + polish

Add animations to the trip page:
1. IntersectionObserver-based scroll fade-in on every section (staggered delays)
2. Hero text: staggered spring curves on load
3. Friend avatars: sequential pop-in
4. Countdown separators: pulse animation
5. Confetti burst on RSVP (already in RsvpSection)
6. Date poll options: scale up on selection
7. Guest list: slide in from left

Then test with multiple themes (Euro Summer, Ski Chalet, Bachelorette, Minimal) to make sure CSS variables work across all of them.

---

## Prompt 11: Story card + deploy

1. Build OG image generation at `src/app/api/og/route.tsx` using `@vercel/og` (Satori)
2. Generate a 1080x1920 (9:16) story card with destination, dates, cost, cover image, theme colors
3. "Share to Story" button downloads this image
4. Then deploy: `npx vercel`
