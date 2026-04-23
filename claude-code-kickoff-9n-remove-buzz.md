# Claude Code — Session 9N kickoff (remove legacy buzz section from sell render)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies. This is a very small
session — single-file surgical change — but single-module discipline
still holds.

## Turbopack cache warning (BB-5)

Standard recovery before starting the dev server:
```
pkill -9 node
lsof -iTCP:3000 -sTCP:LISTEN   # must be empty
lsof -iTCP:3001 -sTCP:LISTEN   # must be empty
cd ~/Desktop/claude/rally
rm -rf .next node_modules/.cache
npm run dev
# wait 30-60s after "Ready in Xs"
```

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9N: "Remove legacy buzz section
                        from sell render"
                     → also: 9M Actuals — CrewInviteButton removal
                             is the precedent (file preserved on
                             disk, render call deleted only).
                     → also: BB-5 (Turbopack workaround)
```

## Canonical code references

```
/trip/sjtIcYZB     (Coachella sell — currently shows the buzz section; verify it's gone post-change)

src/app/trip/[slug]/page.tsx                   (SINGLE FILE TO MODIFY)

src/components/trip/BuzzSection.tsx            (REFERENCE ONLY — do not modify, do not delete)
src/lib/buzz.ts                                (REFERENCE ONLY — do not modify, do not delete)
src/lib/copy/surfaces/buzz.ts                  (REFERENCE ONLY — do not modify, do not delete)
src/app/trip/[slug]/buzz/page.tsx              (ORPHAN ROUTE — do not modify in 9N; flag for follow-up)
```

## TL;DR

The buzz section on the sell trip page (title + subtitle + horizontal
rule + dashed-border compose area) is a pre-redesign leftover that
can't be properly QA'd without multi-user test fixtures. Remove it
from the render surface. Keep all underlying files on disk for when
buzz gets a dedicated design session later.

Four code sites to remove in `src/app/trip/[slug]/page.tsx`:

1. Line 27: `import { BuzzSection } from '@/components/trip/BuzzSection';`
2. Line 28: `import { getBuzzFeed } from '@/lib/buzz';`
3. Lines 263–264: the `getBuzzFeed` fetch call (+ surrounding comment)
4. Lines 535–544: the `<Reveal><BuzzSection .../></Reveal>` render block (+ preceding comment)

Plus update the module-order ascii comment at line 332 to drop "buzz"
from the sequence.

That's the whole change. ~15 lines deleted across one file.

## Principle locked (Andrew, 2026-04-22)

**Preserve the files, pull the render.** Same pattern 9M used for
`CrewInviteButton`. `BuzzSection.tsx`, `lib/buzz.ts`, and the buzz
lexicon stay on disk, unmodified. When buzz returns with a proper
design, those files are either reused as-is or rewritten cleanly
from the preserved baseline.

**No scope creep.** Don't refactor `getBuzzFeed`, don't touch the
types, don't sweep dead CSS under `.chassis .buzz-*`, don't delete
the orphan `/trip/[slug]/buzz/route`. All of those are separate
decisions. This session is strictly the four-site surgery in page.tsx.

## Hard don'ts

- Do NOT delete or modify `BuzzSection.tsx`, `lib/buzz.ts`, or
  `lib/copy/surfaces/buzz.ts`. Files return when buzz gets its
  dedicated design session.
- Do NOT delete or modify `src/app/trip/[slug]/buzz/page.tsx` — the
  orphan route. It's a three-screen-rule violation but out of 9N
  scope. Flag in release notes.
- Do NOT remove any CSS rules under `.chassis .buzz-*` in
  `globals.css`. Dead code cleanup lives in a different bug-bash.
- Do NOT refactor or rename any buzz-related types, functions, or
  variables. If the unused-import TypeScript warning surfaces during
  tsc, that's expected — the imports are the things you're removing.
- Do NOT touch any other module. This is a page.tsx single-file
  change. `git status` at the end should show exactly one src/
  file modified.

## Likely escalation triggers

1. **Orphan variable usage.** `buzzDays` is currently a const at
   line 264; removing its declaration should have no other
   consumers in page.tsx (it's only passed to `<BuzzSection>`).
   Confirm via grep before removing — if something else
   downstream reads it, flag.

2. **Comment-block removal.** Line 535's preceding comment
   (`{/* 8 · Buzz — inline activity feed */}`) and line 263's
   comment (`// Fetch buzz feed for inline section`) should be
   removed alongside their code. Confirm the surrounding module-
   numbering comments still read correctly — if module 8 (buzz)
   was referenced elsewhere, renumbering or dropping may be
   needed. If non-trivial, flag.

3. **Module-order comment at line 332.** Current text is
   `everything-else → crew → cost → buzz → aux → extras(lock/go)`.
   Should become `everything-else → crew → cost → aux →
   extras(lock/go)`. If the exact wording differs from what's in
   the brief (line wrapping, punctuation), match reality and
   update accordingly.

4. **tsc unused-import warnings.** After removing the imports,
   tsc should be silent. If removing `import { getBuzzFeed }`
   surfaces an unused-import warning on some other buzz-related
   import you missed, grep the file again and remove stragglers.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9N — Release Notes` using the standard format
(What was built / What changed from the brief / What to test /
Known issues).

Cowork picks up at Step 3 → Step 4 from there. Given the scope,
expect QA to be quick — mostly grep verifications + one live load.
