# Claude Code — Session 9A-fix kickoff

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief + context

```
rally-fix-plan-v1.md → #### Session 9A — Release Notes
                     → 9A QA (2026-04-17) — blocking bug found note
                     → #### Session 9A-fix: "Headliner server→client boundary"
```

## TL;DR

One-bug hot fix. Sell trip pages 500 after publish with:

> Event handlers cannot be passed to Client Component props.
> `<... headliner={{...}} onOpen={function onOpen}>`

`page.tsx` is a server component. It passes `onOpen={() => {}}` to the
client `Headliner` component. Next.js 15 RSC rejects functions as props
across the server→client boundary — noop or not.

**Fix:** create a thin client wrapper and swap the call site. Two files.

1. New: `src/components/trip/SellHeadliner.tsx` — `'use client'` wrapper
   that holds the noop internally and renders `<Headliner ... onOpen={() => {}} />`.
2. Edit: `src/app/trip/[slug]/page.tsx` — replace `<Headliner ... onOpen={() => {}} />`
   with `<SellHeadliner ... />`. Swap imports accordingly.

That's it.

## Hard don'ts

- Do NOT modify `Headliner.tsx`. No prop-shape change, no `readOnly` flag,
  no default-arg on `onOpen`. Wrap it, don't change it.
- Do NOT address the "soft dead-end card" known issue — separate later
  polish session.
- Do NOT touch any other module, render-path ordering, or file.
- Do NOT rename anything.
- Do NOT add new copy strings.
- Two files touched only.
- `rm -rf .next && npm run dev` before QA (kill orphan `next dev` procs
  first if the SST cache complains — 8M rule + earlier QA lesson).
- `npx tsc --noEmit` clean before release notes.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9A-fix — Release Notes` using the standard format. Keep them
proportional to the scope — this is a 5-line fix.

## If you hit an escalation trigger

Stop and flag. None expected for a two-file wrapper, but if `Headliner`'s
internals turn out to require a behavior change to render cleanly on sell,
STOP before modifying the component.
