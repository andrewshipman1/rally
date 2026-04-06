# Rally — Build Dependencies Map

A snapshot of what's built, what's blocked, and what depends on what. Use this to plan the next moves.

## Status overview

**Done (8/12 sections from the master prompt):**
- ✅ Section 1: Trip Editor Redesign (themed background, glass cards, inline hero, bottom toolbar)
- ✅ Section 3: Trip Description field
- ✅ Section 4: Optional Extras chip row (packing list, playlist, house rules, album)
- ✅ Section 5: Invite System (organizer-side; SMS/email sending TBD)
- ✅ Section 6: Cost Splitting Logic (counts `in` OR `maybe`)
- ✅ Section 8: Sticky bottom RSVP bar
- ✅ Section 9: Guest List horizontal scroll redesign
- ✅ Section 11: Customizable RSVP emojis
- ✅ Section 12: Calendar + Maps integration

**Remaining:**
- ⏳ Section 2: Header Builder (photo upload + collage management)
- ⏳ Section 7: Autocomplete (Google Places + IATA airports)
- ⏳ Section 10: Activity Feed (replaces group chat)

---

## External dependencies (need user / external action)

| What | Why | Blocks |
|---|---|---|
| **Google Maps API key** in `.env.local` (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...`) | Places autocomplete for trip destination, lodging address, restaurant address, activity location | Section 7 (location autocomplete only — IATA airports work without it) |
| **Supabase Storage bucket** named `rally-images` (public) | Photo uploads for the collage header builder + profile pics later | Section 2 (Header Builder) |
| **Twilio account** + Supabase phone provider config | SMS-based OTP auth + sending invite SMS | Phone auth (not blocking — email works); actually sending invite SMS (Section 5 part 2) |

---

## Code dependencies between sections

```
Section 1 (Trip Editor Redesign) ✅
  ↓
Section 4 (Extras Chips) ✅       — needs Section 1 layout
Section 5 (Invite System) ✅      — needs Section 1 layout
Section 11 (RSVP Emojis) ✅       — needs Section 1 toolbar

Section 8 (Sticky RSVP Bar) ✅
  ↓
Section 10 (Activity Feed)        — needs RSVPs to actually persist (currently local-only)
                                  — needs comments to actually persist (currently local-only)

Section 9 (Guest List) ✅
  ↑ feeds from members table — already populated by Section 5 invites

Section 7 (Autocomplete)
  ├── IATA Airports — static JSON, no deps
  └── Google Places — needs API key
       ↓ stores lat/lng on:
       ├── trip.destination (no field for it currently — would need migration)
       ├── lodging.latitude/longitude ✅ (already in schema)
       ├── restaurant.latitude/longitude ✅
       └── activity.latitude/longitude ✅
              ↓ enables better
              Section 12 Maps deeplinks (already work with text address — lat/lng makes them precise)

Section 2 (Header Builder)
  ├── needs Supabase Storage bucket
  ├── stores URLs in trip.header_images jsonb ✅ (already in schema + types)
  └── CollageHeader component already reads header_images ✅
```

---

## ⚠️ Things wired up but NOT actually persisting yet

These look like they work in the UI but data doesn't save to Supabase. They're tracked client-side only. This is from skipping Steps 17 + 19 in the original build guide.

| Component | What's local | What it should do | Blocks |
|---|---|---|---|
| **StickyRsvpBar** | RSVP click sets local state, shows confetti | Should `upsert` into `trip_members` (find/create user, update rsvp) | Section 10 (activity feed pulls from comments + members), Section 6 cost recalc, anything reading "current user's RSVP" |
| **GroupChat** | New comments append to local array | Should `INSERT` into `comments` table with `type: 'comment'` | Section 10 (feed reads from comments) |
| **DatePoll** | Selected dates set local state | Should `upsert` into `poll_votes` | Date polls actually working |

---

## Schema state

The database is on **migration 003** with:

**Tables (typed components v2):**
- `users`, `themes`, `trips`, `trip_members`
- `lodging` + `lodging_votes` (with carousel voting)
- `flights`, `transport`, `restaurants`, `activities`
- `polls`, `poll_votes`, `comments`, `expenses`

**Trip table includes (post-migration 003):**
- `description` text
- `packing_list` jsonb
- `playlist_url` text
- `house_rules` text
- `rsvp_emojis` jsonb (default `{going: 🙌, maybe: 🤔, cant: 😢}`)
- `header_images` jsonb (already existed, populated by future header builder)

**Comments table includes:**
- `type` text default `'comment'` (will be `'comment'` or `'rsvp'` for activity feed)

**RLS policies:**
- Users INSERT (own profile)
- Trip members INSERT (organizer can invite)
- Trip members DELETE (organizer can uninvite)

---

## What's missing that the master prompt assumed

The master prompt assumed Steps 17 (RSVP backend) and 19 (Group Chat realtime) were already built. They aren't. To get Section 10 (Activity Feed) working properly, we need to:

1. **Build the RSVP API** (`/api/rsvp/route.ts`):
   - Accepts email/phone, name, status, trip_id
   - Creates or finds user (similar to invite system, uses service role)
   - Upserts trip_member row
   - When RSVP changes, also inserts a row in `comments` with `type: 'rsvp'` so the activity feed picks it up

2. **Wire StickyRsvpBar to call the API** instead of just setting local state.

3. **Build the comment POST endpoint** OR have GroupChat directly INSERT to comments table (the table has RLS allowing authenticated users to comment, but this needs auth — anonymous trip viewers can't comment without logging in via the RSVP flow first).

4. **Add Supabase Realtime subscription** to the activity feed so new RSVPs/comments appear live.

---

## Recommended next moves (3 paths)

### Path A: Complete the build properly (recommended)
1. Build RSVP backend (the missing Step 17)
2. Wire StickyRsvpBar to persist
3. Wire GroupChat to persist + listen via Realtime
4. Build Section 10 (Activity Feed) on top of the persisted data
5. Build Section 7 IATA airports (no API key needed)
6. Wait on Section 2 (Header Builder) and Google Places until external deps are ready

**Estimated work:** 2-3 hours

### Path B: Knock out IATA airports first (small win)
1. Section 7 IATA airports only
2. Then come back for the persistence work + Activity Feed

**Estimated work:** 30-45 min for IATA, then path A

### Path C: Build everything that doesn't need external setup
1. RSVP backend + persistence
2. Comment persistence
3. Section 10 Activity Feed
4. Section 7 IATA airports
5. Stub out Google Places autocomplete components (ready for the API key)
6. Stub out Header Builder UI (ready for the storage bucket)

**Estimated work:** 3-4 hours

---

## Things to consider asking Chat about

These are the design decisions that would benefit from a deeper conversation before implementation:

1. **RSVP UX flow for non-authenticated visitors** — Does someone need to sign in (magic link) before they can RSVP? Or can they enter their phone/email inline on the trip page (similar to Partiful)? The original PRD said "phone OTP," but that needs Twilio.

2. **Activity Feed pagination** — How many entries to show? Newest at top, infinite scroll, or "Load more" button?

3. **Realtime vs polling** — Supabase Realtime is more elegant but adds complexity. For an MVP, polling every 30 seconds might be fine.

4. **Guest list privacy** — Should non-members be able to see the full guest list? Currently anyone with the link can.

5. **Cost recalculation timing** — When someone changes their RSVP from `pending` → `in`, the per-person cost drops. Should we show "Cost dropped to $X!" as a notification in the feed?

6. **Header builder UX** — Should the organizer drag-and-drop into a fixed grid layout? Or auto-arrange based on number of photos? What's the max photo count (5? 10?)

7. **Profile pictures** — Currently we render colored initials. Should we add profile photo upload as part of the auth/profile setup flow?

8. **Trip "phase" automation** — Currently the organizer manually sets sketch/sell/lock/go. Should some transitions be automatic (e.g., lock at the commit_deadline)?
