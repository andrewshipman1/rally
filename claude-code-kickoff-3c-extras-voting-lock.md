# Rally — Claude Code Kickoff, Session 3C (Extras + Lodging voting + Lock flow)

**Paste this as your opening prompt in a fresh Claude Code session.** 3A and 3B must both be closed and green before starting this. If either is open, stop and finish first.

---

## Context

3A shipped the schema + Session 2 debt. 3B shipped the three read-heavy surfaces (Buzz, Dashboard, Passport).

Your job this session (**3C**) is three write-side workflows:

- **Phase 7 — Extras drawer write-side** (packing list, playlist URL, house rules text, shared album link)
- **Phase 8 — Lodging voting write-side** (cast vote, change vote, organizer locks winner)
- **Lock flow** — the sketch → sell → lock phase transition, the cutoff gate, the ceremony, the T-3 / T-0 deadline nudges

All three write to the DB. All three depend on 3A's schema being landed. All three reuse lexicon that Session 2 already populated.

Master plan: `session-3-master-scope.md`.

## Before you write a single line of code

### Preflight 1 — Read the surfaces + lexicon you're touching

1. `session-3-master-scope.md` — specifically the **3C section**.
2. `rally-microcopy-lexicon-v0.md` — only §5.9 (lock flow), §5.18 (deadline nudges), §5.20 (lodging voting), §5.21 (extras). Do not read the whole file.
3. `rally-phase-7-extras.html`
4. `rally-phase-8-lodging-voting.html`
5. `src/components/LodgingGallery.tsx` (or wherever the read-only lodging gallery lives today) — you're wiring votes to this existing component.
6. `src/components/EditorToolbar.tsx` — this is where the lock-related strings currently live, inline. You're pulling them out.
7. One of the existing server actions in the codebase — pick whichever RSVP or comment action exists. **This is your template for the new actions.** Follow its validation/auth pattern.

After reading, give me a 5-bullet summary: the server action pattern you'll copy, the lock flow strings you're pulling out of EditorToolbar, where the extras read-side lives, the lodging vote data shape, and any lexicon gap.

### Preflight 2 — Verify 3A + 3B shipped

- `trips.chassis_theme_id` populated for seeded trips.
- Buzz, Dashboard, Passport routes all render.
- No `dbRsvpToRally` references.
- `tsc --noEmit` clean.

If any fail, stop and report.

## Hard rules

1. **No inline user-facing strings.** Everything through `copy.ts`.
2. **Theme variables only.**
3. **Every mutating server action has Zod validation.** Follow the Session 1 pattern — strip HTML, URL scheme allowlist, field bounds.
4. **Every mutating server action re-reads auth from the httpOnly cookie.** No client-supplied user IDs.
5. **Organizer-only actions check organizer status server-side.** Not just a UI gate.
6. **Checkpoint after each of the three workflows.**
7. **No new surface work.** 3C is write-side wiring only. If you find yourself building a new page, you're off scope.
8. **30-minute rule on deferrals.**

## This session's scope (3C — write-side workflows)

### Workflow 1 — Phase 7 Extras drawer write-side

The read-only extras renderer already exists. Lexicon §5.21 is already populated. Your job is the write path.

Four extras to wire:

- **Packing list** — text list, add/remove items. Server action: `addPackingItem`, `removePackingItem`.
- **Playlist URL** — single URL. Server action: `setPlaylistUrl`. URL scheme allowlist (http/https only).
- **House rules text** — free-form text. Server action: `setHouseRules`. Length cap (1000 chars), strip HTML.
- **Shared album link** — single URL. Server action: `setAlbumUrl`. URL scheme allowlist.

All four are organizer-editable by default. Check the PRD / scope doc for whether any are crew-editable in v0 — default to organizer-only if unclear.

**Checkpoint:** Open the extras drawer on a seeded trip as organizer. Add a packing item, set a playlist URL, set house rules, set an album link. Reload. Confirm persistence. Open as a non-organizer — confirm read-only.

### Workflow 2 — Phase 8 Lodging voting write-side

The existing `LodgingGallery` displays vote counts. Your job is the write path.

- Server action: `castLodgingVote(tripId, lodgingOptionId)` — upserts a row in `lodging_votes` keyed by (trip_id, user_id).
- Server action: `changeLodgingVote(tripId, lodgingOptionId)` — same upsert, different target.
- Server action: `lockLodgingWinner(tripId, lodgingOptionId)` — organizer only. Sets a `winner_lodging_id` on the trip row (or equivalent). Once locked, voting is closed.
- Vote counts update reactively (`router.refresh()` on successful vote).
- UI wires from lexicon §5.20 — "vote for the house," "change your pick," "organizer locked {option}," etc.

**Checkpoint:** Seed a trip with 3 lodging options. As user A, cast a vote. As user B, cast a different vote. Confirm counts update. As organizer, lock a winner. Confirm voting is closed and the locked state renders.

### Workflow 3 — Lock flow

Organizer-only workflow for the sketch → sell → lock phase transition. Right now, the lock strings are inline in `EditorToolbar.tsx`. Pull them out into a chassis-styled flow.

Components:

- **Cutoff date gate** — lock is disabled until a cutoff date is set. String: "set a cutoff date to lock it in" (or per lexicon §5.9).
- **"Lock it in" ceremony** — confirmation step before the transition. Explains what locks and what doesn't. Organizer confirms.
- **Server action: `lockTrip(tripId)`** — organizer only. Transitions the trip's phase state from sell → lock. Enforces cutoff date set. Enforces at least 1 RSVP'd-in.
- **T-3 / T-0 deadline nudges** — lexicon §5.18. These are UI banners on the trip page that show up 3 days before cutoff and on cutoff day. Read-only display, no action — they're nudges, not modals.
- **Post-lock confirmation** — lexicon §5.9 has the post-lock strings. UI reflects locked state (RSVP bar says "locked in," etc.).

**Delete** the lock-related strings from `EditorToolbar.tsx` once the new flow owns them. Do not delete `EditorToolbar.tsx` itself — that's 3D.

**Checkpoint:** Create a sketch trip, try to lock without a cutoff date (should be blocked), set a cutoff, lock, confirm the trip state transitions. Check the T-3 nudge renders if you fake the clock to 3 days before cutoff.

### Final checkpoint

Stop. Tell me:

- What's built (files touched, files new, server actions added).
- Any validation gaps or auth gaps.
- Remaining 3C debt.
- `tsc --noEmit` + lint status.
- What new 3D items surfaced.

## What's NOT in this session

- **Dashboard, Passport, Buzz** — 3B, already shipped.
- **Buzz compose + react write paths** — still deferred. These will either land in 3C as a late add or slip to v0.1. Decide at checkpoint 1 whether there's time.
- **Dead-code sweep** — 3D. Leave `EditorToolbar.tsx` alive even after pulling its strings out.
- **Motion, a11y, deploy** — 3D.

## Start here

1. Run preflights 1–2. Report.
2. Extras → checkpoint → Lodging voting → checkpoint → Lock flow → checkpoint → final.
3. Do not chain.

**Begin with preflight 1.**
