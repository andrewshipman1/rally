# Rally — The Partiful for Group Trips

**Sketch it. Sell it. Lock it. Live it.**

Rally is a web-based group travel planning tool. Organizers build themed, shareable trip pages. Friends open a link, see the house, check the cost, and RSVP — no app download, no password.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres + Auth + Realtime + Storage) |
| Auth | Supabase Auth with SMS OTP via Twilio |
| Hosting | Vercel |
| OG Images | Vercel OG / Satori (story cards + link previews) |

## Project Structure

```
rally/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    ← Full database schema
├── src/
│   ├── app/
│   │   ├── page.tsx                  ← Landing / Dashboard
│   │   ├── trip/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          ← Public trip page (SSR)
│   │   ├── create/
│   │   │   └── page.tsx              ← Trip creation wizard
│   │   ├── edit/
│   │   │   └── [id]/
│   │   │       └── page.tsx          ← Trip editor
│   │   └── api/
│   │       ├── trips/                ← Trip CRUD
│   │       ├── blocks/               ← Block CRUD
│   │       ├── rsvp/                 ← RSVP endpoint
│   │       ├── og/                   ← OG image generation
│   │       └── enrich/               ← Link enrichment (OG scraping)
│   ├── components/
│   │   ├── trip/                     ← Trip page components
│   │   │   ├── TripHero.tsx
│   │   │   ├── BlockCard.tsx
│   │   │   ├── CostBreakdown.tsx
│   │   │   ├── Countdown.tsx
│   │   │   ├── DatePoll.tsx
│   │   │   ├── GuestList.tsx
│   │   │   ├── GroupChat.tsx
│   │   │   ├── RsvpSection.tsx
│   │   │   ├── OrganizerCard.tsx
│   │   │   ├── ProfileModal.tsx
│   │   │   └── ExpenseTracker.tsx
│   │   ├── editor/                   ← Trip creation/editing
│   │   │   ├── ThemePicker.tsx
│   │   │   ├── BlockEditor.tsx
│   │   │   ├── HeaderBuilder.tsx
│   │   │   └── TripForm.tsx
│   │   ├── ui/                       ← Shared UI primitives
│   │   │   ├── GlassCard.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Button.tsx
│   │   └── layout/
│   │       └── ThemeProvider.tsx      ← Applies theme CSS vars
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             ← Browser client
│   │   │   └── server.ts             ← Server client (SSR)
│   │   ├── og-scraper.ts             ← Link enrichment
│   │   ├── settlements.ts            ← Expense settlement algorithm
│   │   └── calendar.ts               ← .ics generation
│   ├── types/
│   │   └── index.ts                  ← All TypeScript types
│   └── styles/
│       └── globals.css
└── README.md
```

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Enable Phone Auth:
   - Dashboard → Authentication → Providers → Phone
   - Add Twilio credentials (Account SID, Auth Token, Messaging Service SID)
4. Create a storage bucket called `rally-images` (public)

### 2. Create Next.js Project

```bash
npx create-next-app@latest rally --typescript --tailwind --app --src-dir
cd rally

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install date-fns                    # date formatting
npm install @vercel/og                  # OG image generation
npm install lucide-react                # icons
```

### 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Copy Source Files

Copy `src/types/index.ts` into your project. Then start building with Claude Code.

## Build Sequence (Sprint 1)

The goal of Sprint 1 is one working loop:

**Organizer creates trip → adds house + flights → shares link → friend opens, sees trip page, RSVPs**

### Week 1: Foundation
- [ ] Supabase schema deployed
- [ ] Phone auth working (SMS OTP)
- [ ] Trip creation form (name, destination, dates, cover image)
- [ ] Theme picker with starter templates
- [ ] Add block flow (paste link, add cost, tag shared/individual)
- [ ] Basic trip editor

### Week 2: The Trip Page
- [ ] Server-rendered trip page at `/trip/[slug]`
- [ ] Theme CSS variables applied from database
- [ ] Hero section with cover image
- [ ] Block cards (house, flights, etc.)
- [ ] Per-person cost calculator
- [ ] Countdown timer
- [ ] RSVP flow with phone verification
- [ ] OG meta tags for link previews

### Week 3: Polish & Share
- [ ] Link enrichment (paste URL → extract title + image)
- [ ] Date poll
- [ ] Who's In section
- [ ] Share-to-story card generation
- [ ] Organizer card with profile
- [ ] Group chat (basic: post + reactions)
- [ ] Animations (scroll fade-in, confetti on RSVP)

## Claude Code Kickoff

When you open this project in Claude Code, start with:

```
I'm building Rally — a group travel planning app (the Partiful for group trips).

The full PRD, database schema, and type definitions are in the project.
- PRD: rally-prd-v4.docx (reference for product decisions)
- Schema: supabase/migrations/001_initial_schema.sql
- Types: src/types/index.ts
- Mockup reference: rally-sell-page.jsx

Start by setting up the Supabase client and the trip page route at /trip/[slug].
The trip page should be server-rendered, themed using CSS variables from the
theme table, and display all trip blocks with costs.
```

## Key Design Decisions

1. **Phone-based auth for everyone.** No passwords. SMS OTP via Supabase/Twilio. The word "account" never appears in the UI.

2. **Freeform blocks, not typed components.** A block is a block. `cost_type` (shared/individual) and `status` (estimated/confirmed) are the only structure.

3. **Theme = CSS variables.** Each theme maps to CSS custom properties. Templates are database rows. No theme-specific code paths.

4. **Phase-driven UI.** Same URL (`/trip/[slug]`), four modes (Sketch/Sell/Lock/Go). The page layout adapts based on `trip.phase`.

5. **Public trip page, auth for actions.** Anyone can view a trip page. RSVP, voting, and commenting require phone verification.
