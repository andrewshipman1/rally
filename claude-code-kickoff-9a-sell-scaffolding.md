# Claude Code — Session 9A kickoff

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9: "Sell page scaffolding — publish the sketch"
                     → #### Session 9A: "Publish the sketch — render path rewire"
```

The parent Session 9 framing matters. Read it before 9A's scope. Also glance at the
**9B preview** at the end — that explains why the "Getting Here" slot is a JSX
comment and not a real component in 9A.

## Also read (context for the sell direction)

```
rally-fix-plan-v1.md → "Between Session 8 and Session 9: Sell Page Product Strategy"
rally-sell-phase-wireframe.html   (canonical module order, views 2 / 3 / 4)
```

## TL;DR

Session 9A is the **publishing moment**. It is NOT a rebuild. The modules are
already built on sketch; 9A rewires the sell render path in
`src/app/trip/[slug]/page.tsx` so sell renders the same modules in the right
order. Zero new components. Zero migrations. Zero new copy. Zero new data.

Module order on sell (top to bottom):

```
headliner
spot (lodging)
{/* Getting Here — Session 9B */}   ← reserved JSX comment, no component yet
transportation
everything else (activities + provisions, same shape as sketch)
crew (single <CrewSection>; delete the hero-adjacent going row)
cost summary (moved down from mid-page)
buzz
aux (<PlaylistCard> as its own slot, promoted out of <ExtrasSections>)
footer
```

Delete from sell: `<FlightCard>` iteration, standalone `<GroceriesCard>`
iteration, standalone `<ActivityCard>` iteration. Do NOT delete the underlying
components — only their call sites on sell.

## Hard don'ts

- Do NOT build any new component.
- Do NOT write any migration.
- Do NOT add any new copy string.
- Do NOT modify the internals of `CostBreakdown`, `CrewSection`,
  `PlaylistCard`, `ExtrasSections`, or the headliner component. Touch only
  their call sites in `page.tsx`.
- Do NOT touch the sketch render path (`SketchTripShell` and its children).
- Do NOT touch `InviteeShell`, blur / lock overlays, or any login flow
  (Session 10).
- Do NOT touch invite delivery / `transitionToSell` / `/api/invite`
  (Session 11).
- Do NOT build the countdown scoreboard, called-up sticker, or marquee
  (Session 14).
- Do NOT restyle any module or do copy audits — pixel polish is later 9-series
  work.
- Mobile-first at 375px.
- `rm -rf .next && npm run dev` before QA.
- `npx tsc --noEmit` clean before release notes.

## Likely escalation triggers (stop and flag)

1. **Headliner component isn't directly reusable in sell.** If lifting it
   from `SketchTripShell` requires a prop/export refactor rather than a
   simple render-call addition — STOP. Don't fork a sell-specific variant.
   Raise the options.
2. **Lock/go render path requires a different module order.** Sell/lock/go
   share the render block. If applying the new order breaks lock or go
   semantics — STOP. Flag before forking paths.
3. **Anything that smells like Session 9B** (adding a real Getting Here
   component, a migration, `arrival_*` fields, a "your way in" cost line).
   9A is the reserved comment only. 9B is a separate session.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9A — Release Notes` using the standard format.
