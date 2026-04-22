# Claude Code — Session 9M kickoff (crew: bordered module-section + collapsible state sections)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies. Pay particular
attention to single-module discipline (Part 1) — this session
rebuilds CrewSection's outer shell + interaction pattern, and
has a real temptation to spread into sibling modules. Don't.

## Turbopack cache warning (BB-5)

The Turbopack persistent-cache corruption bit us hard in 9K
and 9L QA (`Cannot find module '[turbopack]_runtime.js'`,
`ENOENT build-manifest.json`, RocksDB `.sst` file errors).
Before starting the dev server:

```
pkill -9 node
lsof -iTCP:3000 -sTCP:LISTEN   # must be empty
lsof -iTCP:3001 -sTCP:LISTEN   # must be empty
cd ~/Desktop/claude/rally
rm -rf .next node_modules/.cache
npm run dev
# WAIT 30-60 seconds after "Ready in Xs" before loading any URL
```

If it wedges mid-session: repeat the dance. Don't fight it.

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9M: "Crew — bordered module-section
                        + collapsible state sections"
                     → also: 9K Actuals (module rebuild precedent)
                     → also: 9L Actuals (extraction precedent)
                     → also: BB-5 (Turbopack workaround)
                     → also: Session 10+ → "Organizer edit-on-sell"
                             (context on why crew stays strictly
                             read-only on sell)
```

## Canonical design reference — READ BEFORE WRITING CODE

```
rally-9m-crew-sell-mockup.html   ← Path A + Path C combined; read before code
```

The mockup's `<style>` block contains implementation-ready CSS
for every new class (`.crew-state-collapsible`, `.crew-state-header`,
`.crew-state-pile`, `.crew-pile-av`, `.crew-pile-more`,
`.crew-chevron`, `.crew-state-rows-wrap`, plus the softened
`.crew-tally-pill`). Row 4 frames show default-collapsed and
"in"-expanded states. Annotations at the bottom document
decisions already made (host marker, eyebrow copy, pending gate,
etc.).

If anything on screen contradicts the mockup, the mockup wins.
If the brief and mockup disagree, STOP and ask.

## Canonical code references

```
/trip/sjtIcYZB                                  (Coachella sell — real crew data; 1 in)
/trip/TheVfl1-                                  (VEGAS BABY sketch — for regression check)

src/components/trip/CrewSection.tsx             (REBUILD — shell + state loop)
src/components/trip/CrewAvatarTap.tsx           (REFERENCE ONLY — do not modify)
src/components/trip/CrewInviteButton.tsx        (REFERENCE ONLY — do not modify; file stays)

src/app/trip/[slug]/page.tsx (lines 484–495)    (render site — should need no JSX changes)
src/lib/copy/surfaces/crew.ts                   (ADD eyebrow lexicon keys)
src/app/globals.css                             (REBUILD .chassis .crew-* tree around line 2718)

src/components/trip/CostBreakdown.tsx           (DO NOT MODIFY — crew doesn't contribute to cost; preserve)
src/types/index.ts                              (DO NOT MODIFY)
src/components/trip/builder/SketchModules.tsx   (DO NOT MODIFY — sketch crew surface is separate)
```

## TL;DR

Crew module has pre-module-section drift: no bordered container,
24px title (other modules use 18px), loud solid-dark tally pills
(same treatment we retired from transport in 9K), and flat
listing that doesn't scale past ~5 people without dominating
the page.

Two paths picked from the mockup, combined:

1. **Path A — wrap crew in `.module-section`.** Bordered rounded
   container matching siblings. 18px title + Caveat eyebrow at
   0.5 opacity. Softened tally pills (subtle ink-on-ink via
   `color-mix`, not solid dark).

2. **Path C — collapsible state sections with avatar pile preview.**
   Each state (in / holding / out / pending) renders collapsed
   by default as `tally pill + first 5 avatars + "+N" chip +
   chevron`. Tap expands to the full roster for that state.
   Independent toggle per state. All closed on page load. Pending
   renders only when `pendingCount > 0`.

Side cleanup: **remove the "+ copy the invite link" button from
the render surface.** The end-to-end invite flow isn't mapped
yet (invite delivery is Session 11). Keep `CrewInviteButton.tsx`
file unmodified — just don't render it in CrewSection.

Lexicon addition: new eyebrow copy `"{n} rallied · {total} total"`
(when total > n) / `"{n} rallied"` (when equal).

## Principle locked (Andrew, 2026-04-22)

**Crew joins the module-section pattern.** The "humans are
different from stuff" argument (Path B) is defensible but we
chose Path A — consistency with siblings wins. Bordered
container, sibling typography, softened tally pills.

**Collapsible is a first-class interaction, not a nice-to-have.**
Path C's collapse behavior must be real: `useState` keyed by
state name, `<button>` elements with `aria-expanded`, keyboard
toggle via space/enter, independent per-state state. Don't
cheat with CSS-only `<details>` unless you can prove ARIA
semantics are clean (probably not worth the fight).

**Profile photos are the hero visual element.** Avatars at
36px (row view) and 28px (pile preview). Don't upsize — at
36px+ photos start dominating the text hierarchy. Empty-photo
fallback stays first-initial on `var(--sticker-bg)`.

**Crew is read-only for every viewer.** No organizer edit
affordances on sell. Back-to-sketch view toggle (future
session) is the organizer edit path. Don't add pencils,
drawers, or role-conditional UI to crew in 9M.

## Hard don'ts

- Do NOT create any new routes. Three-screen rule holds.
- Do NOT touch any other module. No headliner, no spot, no
  getting-here, no transport, no everything-else, no cost
  summary, no buzz, no aux, no header/hero/countdown/marquee/
  sticky-bar edits. Single-module discipline.
- Do NOT modify `CrewAvatarTap.tsx`. The avatar-tap →
  passport-drawer mechanic stays bit-exact. Dynamic photo
  `background-image` inline style on the avatar circle
  (CrewSection.tsx:159-161) is acceptable — it's data-driven,
  not static.
- Do NOT modify `CrewInviteButton.tsx`. File stays unmodified.
  Only the render-call in CrewSection goes away.
- Do NOT modify `builder/SketchModules.tsx` or anything in
  `src/components/trip/builder/`. Sketch-side crew surface
  is a separate future session.
- Do NOT add any organizer-aware rendering — no `isOrganizer`
  branch on the viewer role to show different UI. Sell is
  read-only for every viewer.
- Do NOT fix the `members={members as any}` type cast at
  page.tsx:487. Logged as a separate BB item. Out of scope.
- Do NOT change data model, types, or schema. No `RallyRsvp`
  enum changes, no `TripMember` prop shape changes.
- Do NOT introduce strings not in `rally-microcopy-lexicon-v0.md`.
  New lexicon keys go through cross-reference; any mismatch
  escalates.
- Do NOT change cost math. Crew doesn't contribute to
  CostBreakdown but preservation guardrail requires zero math
  regression across the page.
- Do NOT render empty states inside collapsed shells. Per the
  mockup: state sections with count === 0 are hidden entirely.
  No more "everyone's decided" / "nobody's out" placeholders
  cluttering the collapsed view.
- Mobile-first at 375px. All interactions testable at mobile
  width. Pile avatars must stack cleanly at 28px without wrap.
- `npx tsc --noEmit` clean before release notes.

## Likely escalation triggers

1. **Eyebrow copy approval.** Brief proposes two lexicon keys:
   `crew.eyebrowRalliedPartial` (`"{n} rallied · {total} total"`)
   and `crew.eyebrowRalliedAll` (`"{n} rallied"`). Cross-reference
   `rally-microcopy-lexicon-v0.md` before committing. If
   approved copy differs, use the lexicon's. If lexicon has no
   entry, escalate rather than invent.

2. **Pile avatar count.** Mockup specifies 5 avatars + "+N"
   chip when > 5. If 5 looks off at 375px (too wide or
   underwhelming), flag and propose 3 or 4 instead. Don't
   silently change.

3. **`crew.hostMarker` value.** Read the current value —
   whatever emoji/text it returns, match it in the row rendering.
   The mockup shows `👑 host` as a stand-in. If the lexicon
   returns `"🌟 host"` or just `"host"` or something else, use
   that. Do NOT replace the host marker copy as part of 9M.

4. **Pending state data shape.** Mockup shows "pending" as a
   4th collapsible section when count > 0. Verify the current
   `members` query includes pending-RSVP rows. If pending isn't
   populated today (maybe the query filters to in/holding/out
   only), flag. Either fix the upstream query (escalate — it's
   out of scope) OR render only the three non-pending states
   and log pending as a follow-up.

5. **Keyboard accessibility regression.** CrewAvatarTap is
   already a `<button>` (line 18 of that file). Don't introduce
   a button-in-button nesting by wrapping its parent row in
   another button. The state-section header is a button
   (collapsible toggle), but individual crew rows inside the
   expanded body stay as `<li>` with the avatar-button inside.

6. **CSS class bleed into sketch.** The `.chassis .crew-*`
   block is used by sketch's crew surface too. Adding new
   `.chassis .crew-state-*` classes should be additive and
   scoped to the collapsible pattern only — don't modify
   existing `.chassis .crew-row*` or `.chassis .crew-title`
   rules that sketch consumes. If you need to remove/modify
   an existing class (e.g., `.crew-inline`, `.crew-summary`),
   confirm via grep it's not referenced in `builder/` before
   removing.

7. **`crew-invite-btn` CSS rule in globals.css.** Existing
   rule at ~line 4094. Leave it for now — BB item for
   follow-up lexicon/CSS audit. Don't remove the CSS even
   though the render path goes away, unless you can confirm
   nothing in `builder/` uses it.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9M — Release Notes` using the standard format
(What was built / What changed from the brief / What to test /
Known issues).

Cowork picks up at Step 3 (intake release notes) → Step 4 (QA
against the 23 ACs) from there.
