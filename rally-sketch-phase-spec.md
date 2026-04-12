# Sketch Phase — Page Spec

**Date:** April 11, 2026
**Purpose:** Flat reference for Claude Code. Describes exactly what the sketch phase
looks like top to bottom for the organizer. No interactivity, no other phases.
Mirrors the Session 7A/7B/8 briefs in `rally-fix-plan-v1.md`.

**Who sees sketch phase:** Organizer only. No crew, no invitees.
**URL:** `/trip/[slug]` — same URL as every other phase.

---

## Page Layout (top to bottom)

### 1. Marquee Strip

Scrolling banner, full width, dark background, gold text.

```
tap to name ★ set the dates ★ invite the crew ★ send it ✏️
```

**Status:** ✅ Built. No changes needed.

---

### 2. Header

The header contains all the "basics" the organizer fills in.

#### 2a. Live Row
```
● draft · only you can see this
```
Blinking red dot + status text. Sketch always shows "draft · only you can see this."

**Status:** ✅ Built.

#### 2b. Wordmark Row
```
rally!          [postcard 📷]          [new rally ✨]
```
Three elements in a row:
- **"rally!"** — Shrikhand font, left-aligned
- **Postcard image** — small (64px wide, ~48px tall) image object between wordmark and sticker. Slightly rotated. Dashed border when empty (sketch tap target with 📷 icon). If organizer uploads an image, shows the image with solid border. **If no image is uploaded, this element does not render at all in sell+ phases.** Stores to `cover_image_url` on the trip.
- **Sticker** — "new rally ✨" in Caveat font, rotated, yellow background

**Status:** Postcard is 🔴 new. Wordmark and sticker are ✅ built.

#### 2c. Eyebrow
```
[★ you started this]
```
Yellow pill badge.

**Status:** ✅ Built.

#### 2d. Title Field
```
┌─────────────────────────────────┐
│  NAME IT                        │
│  untitled rally                 │  ← placeholder, dashed border
└─────────────────────────────────┘
↑ give it a name only your group would get
```
Dashed border = editable/empty. Solid border = filled. Hint text below.
Shrikhand font for the value. Saves to trip `name`.

**Status:** ✅ Built.

#### 2e. Tagline Field
```
┌─────────────────────────────────┐
│  ONE LINE                       │
│  why are we doing this?         │  ← placeholder, dashed border
└─────────────────────────────────┘
```
Caveat font for the value. Saves to trip `tagline`.

**Status:** ✅ Built.

#### 2f. Date + Location Row
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  START   │  │  END     │  │  WHERE   │
│  tbd ↓   │  │  tbd ↓   │  │  somewhere ↓ │
└──────────┘  └──────────┘  └──────────┘
```
Three fields in a horizontal row:
- **Start** — date picker, saves to `date_start`
- **End** — date picker, saves to `date_end`
- **Where** — text input, saves to `location`

Currently this is a single "when" field. **Needs to be split into start + end.**

**Status:** 🟡 Needs change. Single "when" exists, needs splitting into start/end.

#### 2g. RSVP-By Field
```
┌─────────────────────────────────┐
│  RSVP BY                        │
│  set a deadline ↓               │  ← placeholder, dashed border
└─────────────────────────────────┘
```
New field below the date/location row. Date picker. Saves to `commit_deadline`.
This is the date that drives the sell-phase countdown ("X days to lock it in").

**Status:** 🔴 New. Field and DB column both need building.

---

### 3. Countdown

**Not rendered in sketch phase.** `display:none`. Appears in sell+ when dates exist.

**Status:** ✅ Built, but currently shows an empty state ("??") in sketch. **Needs to be hidden entirely.**

---

### 4. Invite Roster

Replaces the going row (avatar circles) in sketch phase.

```
WHO TO INVITE

┌──────────────────────┐
│  you (organizer)     │
└──────────────────────┘
┌──────────────────────┐
│  + add a person      │  ← text input
└──────────────────────┘
```

Simple name list. Not user accounts — just names as pre-invite placeholders.
The organizer adds people they plan to invite. When the trip publishes to sell,
the going row switches back to avatar circles.

Data model: needs a table or column to store roster names per trip.

**Status:** 🔴 New.

---

### 5. Module Sections

All modules render in sketch as empty states with input prompts.
**Session 7A does not build module inputs** — that's Session 8.
Modules should be visible with their current empty states.

Module order:
1. **Lodging** — "the spot" — empty state prompt
2. **Flights** — "getting there" — empty state prompt
3. **Transportation** — "getting around" — empty state prompt
4. **Activities** — "what to do" — empty state prompt
5. **Provisions** — "food & drink" — empty state with estimate input (Session 8)
6. **Extras** — "extras" — empty state prompt

No cost summary in sketch. No crew section, buzz, or organizer card — those are sell+.

**Status:** 🟡 Modules exist but with varying empty states. Provisions is 🔴 new.

---

### 6. Footer

```
wherever you go, go together ✈️
rally v0
```

**Status:** ✅ Built.

---

### 7. Sticky Bar

Pinned to bottom of screen. Four buttons:

```
┌────┬────┬─────────────┬─────────────┐
│ ←  │ 🎨 │  save draft  │  publish →  │
└────┴────┴─────────────┴─────────────┘
```

- **← (back)** — navigates to `/` (dashboard)
- **🎨 (theme)** — opens existing `ThemePickerSheet` bottom sheet
- **save draft** — persists all field values, stays in sketch
- **publish →** — gated on required fields (name + at least one date). Transitions trip to sell phase. This is the moment invites become possible.

**Status:** 🟡 Sticky bar exists but has old layout (✏️ + "add the basics first"). Needs full replacement.

---

## What Does NOT Appear in Sketch

These elements exist in sell+ but are hidden/absent in sketch:

- Countdown (hidden)
- Going row avatars (replaced by invite roster)
- Share / invite link (appears in sell after publish)
- Organizer card
- Cost summary
- Crew section (full grouped list)
- Buzz feed
- RSVP sticky bar (crew/invitee)

---

## Field Summary

| Field | DB Column | Input Type | Required for Publish? |
|-------|-----------|-----------|----------------------|
| Title | `name` | Text | Yes |
| Tagline | `tagline` | Text | No |
| Start date | `date_start` | Date picker | Yes (at least one date) |
| End date | `date_end` | Date picker | No |
| Location | `location` | Text | No |
| RSVP by | `commit_deadline` | Date picker | No |
| Cover image | `cover_image_url` | Image upload | No |
| Theme | `theme_id` | Theme picker sheet | No |
| Invite roster | TBD | Text input (add names) | No |

---

## Session Mapping

| Spec Section | Session | Status |
|-------------|---------|--------|
| 2f. Split dates | 7A | To build |
| 2g. RSVP-by | 7A | To build |
| 2b. Postcard image | 7A | To build |
| 3. Hide countdown | 7A | To build |
| 7. Sticky bar | 7A | To build |
| 4. Invite roster | 7B | To build |
| Shared input components | 7B | To build |
| 5. Module inputs | 8 | To build |
