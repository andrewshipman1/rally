# Claude Code — Session 9C kickoff

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief

```
rally-fix-plan-v1.md → #### Session 9C: "Top chrome polish — marquee content + lowercase title"
                     → also: 9A release notes + 9A-fix + 9A Actuals
```

## Canonical references

```
rally-sell-phase-wireframe.html         (sell-phase wireframe — marquee content reference)
rally-9c-top-chrome-sell-mockup.html    (preview mockup — ONLY items #1 + #6 in scope for 9C)
rally-microcopy-lexicon-v0.md           (copy source of truth)
```

## TL;DR

Very narrow session, two deltas only:

1. **Marquee** — swap sketch content for the **existing** sell-phase
   content. Wire phase-awareness. Do NOT invent new strings. If no
   sell-phase string exists in the lexicon / theme files today, STOP and
   escalate.
2. **Trip title** — apply `text-transform: lowercase` via CSS. Organizer
   data stays as typed. Font stays Georgia italic 900.

That's it.

## Explicitly NOT in scope

- No new components of any kind (no live-dot row, no eyebrow, no date/
  destination meta, no theme postcard, no sticker rework).
- No new lexicon entries. Ever.
- No countdown or deadline banner work.
- No module work.
- No sketch-path changes.
- No `InviteeShell` changes.
- No data mutation.

## Hard don'ts

- Do NOT add new components.
- Do NOT add new lexicon entries. Escalate if gaps are found.
- Do NOT mutate `trip.name` or any other data.
- Do NOT modify `SketchTripShell` or any sketch-path rendering.
- Do NOT apply the CSS lowercase rule globally — scope it to the sell
  hero title class only so the sketch form title is unaffected.
- Do NOT touch the called-up sticker, logo, pill, countdown, banner,
  share link, add-to-calendar, organizer card, or any module.
- `rm -rf .next && npm run dev` before QA (kill orphan `next dev` procs
  first if the SST cache complains).
- `npx tsc --noEmit` clean before release notes.

## Likely escalation triggers

- **No sell-phase marquee string exists today** → STOP. Don't invent
  one. Raise: "the lexicon has `<X>` for sketch but no sell-phase
  entry. Options: (a) add an entry, (b) reuse sketch string, (c) build
  a phase-aware template. Recommend X because Y."
- **The hero title class is shared between sell and sketch** → STOP.
  Don't apply the lowercase rule globally. Raise how to scope it
  (new sell-only class vs. wrapper selector vs. separate hero
  component path).

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9C — Release Notes` using the standard format. Keep them
proportional — this is a ~15-minute session.
