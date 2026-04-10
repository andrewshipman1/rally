# Claude Code — QA Bug Fixes (Priority Order)

Work through these in order. Each has a priority level. Don't skip P0s.

## 1. AUTH ARCHITECTURE FIX (P0 — M1)

The current auth is broken: identity is stored in localStorage as plain JSON with no server validation. Anyone can impersonate anyone. Fix:

**For the organizer (editor side):** Supabase Auth with email magic link is already working. Keep this.

**For guests (trip page RSVP):** Replace localStorage identity with server-issued httpOnly cookies:
1. When a guest RSVPs via `/api/rsvp`, the server creates/finds a user by email, then sets a signed httpOnly cookie with the user ID
2. All subsequent requests (`/api/comments`, poll votes, etc.) validate this cookie server-side before allowing the action
3. Remove ALL localStorage identity reads/writes (`rally:identity`)
4. The StickyRsvpBar reads the user's RSVP status from the server cookie, not localStorage
5. If no valid cookie exists, show the RSVP form. If a valid cookie exists, show their current status.

**On every mutating API endpoint (`/api/rsvp`, `/api/comments`, any future ones):**
- Validate the httpOnly cookie server-side
- If no valid cookie: return 401
- Exception: `/api/rsvp` itself creates the cookie (it's the "login" for guests)

## 2. INPUT VALIDATION + SECURITY (P0 — M1.3, M1.4, N2, N3, N4)

### API input validation
Add Zod validation on `/api/rsvp` and `/api/comments`:

**`/api/rsvp`:**
- `name`: required, string, 1-80 chars, strip HTML tags
- `email`: required, valid email format (use Zod `.email()`)
- `status`: required, enum `['in', 'out', 'maybe']`
- `tripId`: required, valid UUID
- Return 400 with `{ error: "Invalid request" }` on validation failure. Never return 500.

**`/api/comments`:**
- `text`: required, string, 1-1000 chars, strip HTML tags
- `tripId`: required, valid UUID
- Require valid auth cookie (from fix #1)
- Rate limit: max 10 comments per user per minute (simple in-memory counter for MVP)
- Return 400 on validation failure, 401 on no auth, 429 on rate limit

### URL scheme allowlist
In the link enrichment flow and block save handlers:
- Only allow `http://` and `https://` URL schemes
- Parse with `new URL()`, reject on throw
- Block private IP ranges on server-side enrichment fetch (127.0.0.1, 192.168.x.x, 10.x.x.x, 169.254.x.x, ::1) to prevent SSRF
- Client-side: validate before submitting, show error "Please enter a valid URL starting with https://"

### Name field sanitization
- Strip HTML tags from all text inputs at storage time (name, notes, description, comment text)
- Use a simple regex: `.replace(/<[^>]*>/g, '')`
- Never render any user-provided text with `dangerouslySetInnerHTML`

### Cost field validation
- `min=0`, `max=1000000`, `step=0.01`
- Parse as float, reject `NaN`, `Infinity`, negative values
- Server-side: same validation before DB write
- Show inline error: "Enter a valid amount"

## 3. EDITOR AUTHORIZATION (P0 — L2.1)

Verify and fix:
1. Every server action in the editor must check `session.user.id === trip.organizer_id`
2. If no session or wrong user, redirect to `/auth`
3. Test: open `/edit/{tripId}` in an incognito window — it should NOT load the editor
4. The trip ID in the URL being a UUID is NOT sufficient security — always verify ownership server-side

## 4. COUNTDOWN HYDRATION FIX (P0 — N1, L1.1)

In `<Countdown>`:
- Initialize time values with `useState(null)` 
- Compute countdown only inside `useEffect` (client-side only)
- Render `--` placeholders during SSR
- Remove any `Date.now()` or `new Date()` calls from the render path
- Verify the React hydration error is gone from the console

## 5. PER-PERSON COST FIX (P0 — L1.4)

Never divide shared costs by 1 when it's misleading:
- If `trip.group_size > 0` and fewer than 2 people have RSVP'd in/maybe, use `group_size` as the divisor
- Show: "~$997/person · estimated for 6 people"
- Once 2+ members are in/maybe, switch to actual count: "~$997/person · 6 going"
- Update `calculateTripCost()` in `src/types/index.ts` accordingly

## 6. REACTIVE UI AFTER RSVP (P0 — L1.5)

After a successful RSVP:
- Call `router.refresh()` to revalidate the server-rendered page data
- Guest List count, Per-Person Cost, and Who's In must all update without a full page reload
- Test: RSVP as a new person, verify the headcount increments and cost decreases immediately

## 7. ORGANIZER SMS DEEPLINK (P0 — L1.7)

The "Message organizer" button has `href="sms:"` with no phone number:
- Pull `organizer.phone` or `organizer.email` from the server
- If phone exists: `href="sms:+14155551212"`
- If no phone (email auth): `href="mailto:organizer@email.com"` with subject "Question about [Trip Name]"
- If neither: hide the button entirely

## 8. MISSING TRIP PAGE SECTIONS (P1 — L1.6)

The trip page is missing sections from the PRD. Build what's missing:
- **Organizer Card** — should render between the hero and the countdown. Photo, name, bio, "Organizer" badge, message button. (Currently only a broken SMS button in the toolbar.)
- **Date Poll** — if a poll exists for this trip, render the multi-select date poll component
- Verify all 5 typed component cards render: Lodging, Flights, Transport, Restaurants, Activities. If any typed components exist in the DB but aren't rendering, fix the query.

## 9. ADD GROCERIES BLOCK TYPE (P1 — N5)

Add a 6th typed component: Groceries.

DB migration:
```sql
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
```

Add the Groceries type to `src/types/index.ts`. Add an "Add Groceries" button to the editor. Add a GroceriesCard component to the trip page.

## 10. UI POLISH BUGS (P1-P2)

### L1.8 — Empty RSVP form submit
Add inline validation. Disable "Lock it in" button until name + email are filled. Show error messages under empty fields on submit attempt.

### L1.9 — Activity feed empty state
After someone RSVPs, the activity section should show their RSVP entry, not "No activity yet."

### L1.10 — Name truncation inconsistency
Create a shared `displayName(name: string, maxLen: number = 20)` helper. Use it everywhere names render.

### L1.11 — Long title overflow in hero
Use `font-size: clamp(1.5rem, 5vw, 3.5rem)` on the hero title. Set `overflow-wrap: break-word`.

### L1.12 — "1 going" before any real RSVPs
If the only member is the organizer, show "Andrew's hosting" instead of "1 going."

### L2.2 — Title clips in editor input
Make the title input grow with content: use a `textarea` with `rows={1}` and auto-resize, or CSS `field-sizing: content`.

### L2.3 — Remove guest has no confirmation
Add an undo toast: "Robert removed. Undo (5s)" with a timer.

### N6 — Minimal theme invisible label
In the theme picker, detect light backgrounds and use dark text for the label. Check if `color_primary` is light (convert to HSL, check lightness > 60%) and swap text color accordingly.

### N7.1 — Commit deadline has no bounds
Add `min={new Date().toISOString().split('T')[0]}` and `max={trip.date_start}` to the deadline date picker. Show error if deadline is after trip start or in the past.

### "Shared Alt" chip typo
Rename to "Shared Album" in the editor UI.

## 11. COMMIT DEADLINE VALIDATION (P1 — item 20, 21)

- Validate: `date_end >= date_start` (block save if end is before start)
- Validate: `commit_deadline <= date_start` (deadline can't be after the trip starts)  
- Validate: `commit_deadline >= today` at creation time
- Show inline error messages for each violation

## 12. CLEANUP TEST DATA (housekeeping)

Run in Supabase SQL Editor:
```sql
DELETE FROM public.comments WHERE text LIKE '[QA%' OR text LIKE '[QA-%';
DELETE FROM public.trip_members WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE '%@test.example' OR email = 'attacker@evil.example');
DELETE FROM public.users WHERE email LIKE '%@test.example' OR email = 'attacker@evil.example';
DELETE FROM public.users WHERE phone = 'notaphonenumber';
```

Also remove any duplicate "Andrew Shipman" user that was created via the impersonation test (keep the one with the earliest `created_at`).

## ORDER: Work through 1-12 in sequence. Items 1-3 are security — do them first. Then 4-7 (core UX). Then 8-12 (features + polish).
