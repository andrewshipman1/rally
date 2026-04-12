# Lodging Module Spec — Sketch Phase

## Overview

The lodging module lets the organizer add 2–5 accommodation options during
sketch phase. These options carry into sell phase where the group votes on them
and per-person costs are calculated.

Three accommodation types, each with a slightly different input flow and cost
model:

| Type | Example | Cost Model |
|------|---------|------------|
| Home rental | Airbnb, VRBO | Total price (all-in for the stay) |
| Hotel | Marriott, boutique hotel | Cost per night × nights × rooms needed |
| Other | Campsite, family home, hostel | Total price (may be $0) |

---

## User Flow — Sketch Phase

### Empty State

```
THE SPOT

  No options yet — add a few places to compare

  [ + add a spot ]
```

### Step 1: Pick Accommodation Type

Organizer taps "+ add a spot" → type selector appears:

```
What kind of place?

  [ 🏠 Home rental ]    Airbnb, VRBO, etc.
  [ 🏨 Hotel ]          Hotel, resort, inn
  [ ⛺ Other ]           Campsite, family home, etc.
```

### Step 2: Add Details (varies by type)

#### Home Rental Flow

```
HOME RENTAL

  ┌─────────────────────────────┐
  │  🔗 paste a link            │  ← optional, triggers enrichment
  └─────────────────────────────┘

  → If link pasted: auto-fills title + image from OG tags
  → Organizer can edit any auto-filled field

  ┌─────────────────────────────┐
  │  Title *                    │  ← auto or manual (required)
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │  Total price *              │  ← manual (required, all-in)
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │  Bedrooms                   │  ← optional (useful for sell phase)
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │  Max guests                 │  ← optional (useful for sell phase)
  └─────────────────────────────┘

  [ image ]  ← auto from OG or upload (optional)

  [ Add option ]    [ Cancel ]
```

**Sell phase cost math:** total price ÷ confirmed attendees = per person

#### Hotel Flow

```
HOTEL

  ┌─────────────────────────────┐
  │  🔗 paste a link            │  ← optional, triggers enrichment
  └─────────────────────────────┘

  → If link pasted: auto-fills title + image from OG tags

  ┌─────────────────────────────┐
  │  Title *                    │  ← auto or manual (required)
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │  Cost per night *           │  ← manual (required)
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │  People per room *          │  ← manual (required, e.g. 2)
  └─────────────────────────────┘

  Nights: auto-calculated from trip dates (shown, not editable here)
  Estimate: cost per night × nights = $X total

  [ image ]  ← auto from OG or upload (optional)

  [ Add option ]    [ Cancel ]
```

**Sell phase cost math:**
- Rooms needed = total attendees ÷ people per room (rounded up)
- Total = cost per night × nights × rooms needed
- Per person = total ÷ attendees

Note: nights auto-updates if trip dates change.

#### Other Flow

```
OTHER

  ┌─────────────────────────────┐
  │  Title *                    │  ← manual (required)
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │  🔗 paste a link            │  ← optional
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │  Total price                │  ← manual (optional, could be $0)
  └─────────────────────────────┘

  [ image ]  ← upload only (optional)

  [ Add option ]    [ Cancel ]
```

**Sell phase cost math:** total price ÷ confirmed attendees = per person
(if $0, free for everyone)

---

### Step 3: Card Display

After adding, each option shows as a card:

```
THE SPOT                                    2 options

┌──────────────────────────────────────────────────┐
│  [OG image or uploaded image]                    │
│                                                  │
│  🏠 Home rental                                  │
│  Beach House on the Cape                         │
│  $6,000 total                                    │
│  3 bedrooms · 8 max guests                       │
│  airbnb.com/rooms/123...                    [ ✕ ]│
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  [OG image]                                      │
│                                                  │
│  🏨 Hotel                                        │
│  Harbor Hotel Hyannis                            │
│  $289/night × 4 nights = ~$1,156                 │
│  2 per room                                      │
│  marriott.com/harbor...                     [ ✕ ]│
└──────────────────────────────────────────────────┘

[ + add another spot ]
```

### Card Fields by Type

**Home rental card:**
- Type badge (🏠 Home rental)
- Title
- Total price
- Bedrooms + max guests (if provided)
- Link (truncated, clickable)
- Image (if available)
- Remove button (✕)

**Hotel card:**
- Type badge (🏨 Hotel)
- Title
- Cost per night × nights = estimate
- People per room
- Link (truncated, clickable)
- Image (if available)
- Remove button (✕)

**Other card:**
- Type badge (⛺ Other)
- Title
- Total price (or "Free" if $0)
- Link (if provided, truncated, clickable)
- Image (if available)
- Remove button (✕)

---

## Data Model

Uses existing `lodging` table. New/updated fields needed:

| Field | Column | Type | Required | Notes |
|-------|--------|------|----------|-------|
| Accommodation type | `accommodation_type` | enum: 'home_rental', 'hotel', 'other' | Yes | **NEW — needs migration** |
| Title | `name` | text | Yes | Existing |
| Link | `link` | text | No | Existing |
| Total price | `total_cost` | numeric | Yes (home rental, other) | Existing |
| Cost per night | `cost_per_night` | numeric | Yes (hotel) | Existing |
| People per room | `people_per_room` | integer | Yes (hotel) | **NEW — needs migration** |
| Bedrooms | `bedrooms` | integer | No | Existing |
| Max guests | `max_guests` | integer | No | Existing |
| OG title | `og_title` | text | No | Existing (auto from enrichment) |
| OG description | `og_description` | text | No | Existing (auto from enrichment) |
| OG image | `og_image_url` | text | No | Existing (auto from enrichment) |
| Uploaded image | `additional_photos` | jsonb | No | Existing (array of URLs) |

**New columns needed:**
```sql
-- Accommodation type
DO $$ BEGIN
  CREATE TYPE accommodation_type AS ENUM ('home_rental', 'hotel', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

ALTER TABLE lodging ADD COLUMN IF NOT EXISTS accommodation_type accommodation_type NOT NULL DEFAULT 'home_rental';

-- People per room (hotel-specific)
ALTER TABLE lodging ADD COLUMN IF NOT EXISTS people_per_room integer;
```

**Computed values (not stored, calculated at render):**
- Hotel total estimate = `cost_per_night` × nights (from trip date range)
- Per-person cost (sell phase) = total ÷ confirmed attendees
- Hotel rooms needed (sell phase) = attendees ÷ people_per_room (rounded up)

---

## Sketch vs Sell Phase Behavior

| Behavior | Sketch | Sell |
|----------|--------|------|
| Who can add options | Organizer only | Organizer only |
| Who can see options | Organizer only | All attendees |
| Voting | No | Yes — group votes on preferred option |
| Per-person cost | Not shown | Shown (computed from attendees) |
| Room assignments | No | Hotel type — rooms needed computed |
| Lock/confirm | No | Organizer locks the winning option |
| Remove option | Yes (✕) | Organizer only, before lock |

---

## UX Principles

**Link out to research:** Every card with a link should have a prominent,
tappable link that opens in a new tab. The organizer (and later, voters in sell)
will be bouncing between Rally and property listings to compare. Make the link
the most obvious action on the card — not buried in small text.

**Mobile-first / tab-switching friendly:** This is primarily used on iPhone
Chrome. The organizer is likely copying a URL from an Airbnb tab, switching to
Rally, pasting it, then switching back. Key implications:
- Paste should be the primary input — one tap into the link field, paste, done
- Auto-enrichment should fire on paste (no separate "submit" for the link)
- Form state must survive tab switches (no loss on blur/background)
- Inputs should be large tap targets, not fiddly

**Design system:** All UI must use the existing Rally chassis design system
(themes, CSS variables, typography). No standalone styles — this renders inside
the `.chassis` wrapper with `data-theme` applied. Reference existing builder
components (SketchHeader, PostcardImage) for patterns.

---

## Edge Cases

- **No trip dates set:** Hotel estimate shows "cost per night × ? nights" —
  prompt organizer to set dates first, or show per-night only
- **Only one option:** Fine — no comparison needed, but organizer can still add more
- **Link enrichment fails:** Fields stay empty, organizer fills manually
- **$0 price (family home):** Show "Free" on card
- **Image upload:** Uses existing `trip-covers` bucket + upload utility
- **Tab switch during paste:** Form state preserved — no data loss if
  organizer switches to Airbnb tab and back
- **Long URLs:** Truncate display on card but keep full URL for tap-through
