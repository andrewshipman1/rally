# Claude Code — Master Build Prompt (All Action Items)

Paste this into Claude Code. It consolidates all outstanding work.

---

I have a list of features and design changes for Rally. Work through them in order. After each section, tell me what you built so I can review before moving on.

Reference files:
- `rally-sell-page.jsx` — visual target for the trip page
- `src/types/index.ts` — current type definitions
- The Partiful-inspired design direction described below

## 1. Trip Editor Redesign — Edit Inside the Theme

The trip editor (`/edit/[id]`) should NOT look like a white admin form. It should render with the trip's selected theme as the background — the organizer is editing inside the preview. Glass card form fields on the themed background. What you see is what guests will see.

- Editor background = the trip's theme gradient/image (same as the trip page)
- All form sections are glass cards (frosted glass, backdrop-blur) on top of the theme
- Persistent bottom toolbar with 3 tabs: **Theme** (template picker + font selector), **Effect** (animations toggle), **Settings** (deadline, group size, privacy)
- Font style selector: horizontal scrollable tabs (like Partiful's Classic / Eclectic / Fancy / Literary). Each option changes the display font on the trip title in real time.
- The hero/header section is editable in-place: tap to change cover image, edit title inline, edit tagline inline
- Save button top right, X to close top left

## 2. Header Builder

Within the trip editor, add a section to manage the collage header:
- Upload photos (destination shots, group selfies, Airbnb screenshots) to Supabase Storage
- Arrange them in the collage grid layout
- Remove the placeholder text labels ("Beach sunset", "Cenote swim", etc.) — only show when no real photos are uploaded
- Store uploaded image URLs in the trip's `header_images` jsonb field
- Pencil/edit icon overlay on the header image area to trigger the builder

## 3. Trip Description Field

Add an "Add a description of your trip" textarea to the trip editor and trip page:
- In the editor: large freeform text area on a glass card, placeholder: "Sell the trip... why should your friends come?"
- On the trip page: renders below the organizer card as casual, emoji-friendly text
- Add a `description` text field to the trips table in Supabase:
```sql
ALTER TABLE public.trips ADD COLUMN description text;
```
- Update the Trip type in `src/types/index.ts` to include `description: string | null`

## 4. Optional Extras Chip Row

In the trip editor, add a horizontal scrollable row of optional add-on chips below the description:
- `+ Packing List` — opens a simple checklist builder (store as jsonb on trip)
- `+ Playlist` — paste a Spotify/Apple Music link (store as `playlist_url` on trip)
- `+ House Rules` — freeform text (store as `house_rules` on trip)
- `+ Shared Album` — paste Apple Photos / Google Photos link (already have `photo_album_url`)

Add these fields to the trips table:
```sql
ALTER TABLE public.trips ADD COLUMN packing_list jsonb default '[]'::jsonb;
ALTER TABLE public.trips ADD COLUMN playlist_url text;
ALTER TABLE public.trips ADD COLUMN house_rules text;
```

On the trip page, render these as collapsible sections if they have content.

## 5. Invite System

The trip editor needs an "Invite People" section:
- Organizer adds invitees by phone number or email
- This creates a `trip_member` row with `rsvp: 'pending'`
- Invited people receive an SMS or email with the trip link (for now, just create the member row — we'll add SMS sending later)
- Show invited people in the editor with their RSVP status
- On the trip page, invited-but-pending people show in the Who's In section as "Invited"

## 6. Cost Splitting Logic

Update the cost calculation:
- Shared costs divide by count of members with rsvp = 'in' OR 'maybe' (NOT 'out' or 'pending')
- When only one person (the organizer), show the full undivided cost
- Update `calculateTripCost()` in `src/types/index.ts`:
```typescript
const confirmed = trip.members.filter(m => m.rsvp === 'in' || m.rsvp === 'maybe').length || 1;
```
- Per-person cost on the trip page updates in real time as RSVPs change
- Show "Split X ways" with the actual count next to the per-person amount

## 7. Autocomplete

### Locations (Google Places)
- Trip destination field: Google Places autocomplete (cities/regions)
- Lodging address: Google Places autocomplete (full addresses)
- Restaurant address: Google Places autocomplete
- Activity location: Google Places autocomplete
- Store lat/lng from the selected place in the component's latitude/longitude fields
- Every address on the trip page should have a maps deeplink icon (pin icon that opens Google Maps / Apple Maps)

### Airports (IATA)
- Flight departure/arrival fields: airport code autocomplete
- Use a static JSON file of major airports (~500 entries): code, city, name, country
- Filter client-side as user types
- Example: typing "JFK" shows "JFK — John F. Kennedy International, New York"
- Example: typing "New" shows JFK, LGA, EWR
- Display format on trip page: "JFK → CUN" (codes only)

Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local` (I'll provide the key — just build the components to use it).

## 8. Sticky Bottom RSVP Bar (Partiful-style)

On the trip page, add a sticky bottom bar that's always visible as you scroll:
- Left side: your RSVP emoji + status ("Going" / "Maybe" / "Edit your RSVP")
- Right side: comment button (💬) + share button (📤)
- Frosted glass background with the theme's accent color
- If not yet RSVP'd, the bar shows the RSVP buttons instead
- This replaces the current inline RSVP section — move RSVP to the sticky bar

## 9. Guest List — Horizontal Photo Scroll

Replace the vertical guest list with a Partiful-style horizontal scroll:
- Section header: "Guest List" with count ("6 Going") and "View all" link
- Horizontal row of circular profile photos (real photos or colored initials)
- Overflow shows "+N" chip at the end
- "View all" opens a full guest list modal with RSVP status per person
- Tapping any avatar opens the profile modal (already built)

## 10. Activity Feed (Replaces Group Chat)

Replace the current "Group Chat" section with a Partiful-style Activity Feed that mixes RSVPs and comments:
- RSVP events: "Andrew rsvped Going 😘 · 5d" with Reply button
- Comments: "Marcus: Adding a taco crawl 🌮 · 18h" with React + Reply buttons
- Comment button at top right: "✏️ Comment"
- Feed is chronological, newest at top
- Each entry has the user's profile photo, name, action, timestamp
- Emoji reactions on both RSVPs and comments
- When someone RSVPs, it auto-creates an activity entry (store in comments table with a `type` field: 'comment' | 'rsvp')

Add a `type` field to comments:
```sql
ALTER TABLE public.comments ADD COLUMN type text default 'comment';
```

## 11. Customizable RSVP Emojis

Let the organizer pick the emoji set for RSVP buttons:
- Default: 🙌 Going / 🤔 Maybe / 😢 Can't make it
- Alternative sets the organizer can choose in the editor (under Settings tab)
- Store as `rsvp_emojis` jsonb on the trip: `{going: "🙌", maybe: "🤔", cant: "😢"}`

Add to trips table:
```sql
ALTER TABLE public.trips ADD COLUMN rsvp_emojis jsonb default '{"going": "🙌", "maybe": "🤔", "cant": "😢"}'::jsonb;
```

## 12. One-Tap Calendar + Maps

- "Add to Calendar" button below the trip dates (generates .ics using `src/lib/calendar.ts`)
- Maps pin icon next to every address (lodging, restaurants, activities) — deeplinks to Google Maps / Apple Maps based on lat/lng
- Notification bell icon (placeholder for now — V2 feature)

## Order of priority:

Build in this order:
1. Trip Editor Redesign (#1) — this is the foundation for everything else
2. Trip Description (#3) + Extras Chips (#4) — quick wins in the editor
3. Invite System (#5) + Cost Logic (#6) — core functionality
4. Autocomplete (#7) — location + airport search
5. Header Builder (#2) — photo management
6. Sticky RSVP Bar (#8) — trip page UX
7. Guest List Redesign (#9) — trip page UX
8. Activity Feed (#10) — replaces group chat
9. Customizable RSVP (#11) — polish
10. Calendar + Maps (#12) — integration polish
