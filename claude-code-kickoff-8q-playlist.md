# Claude Code — Session 8Q kickoff

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Follow Part 3. Pre-flight checklist applies.

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 8Q: "The Aux — Playlist Fun Pass + Phase-Gate Other Extras"
```

## Canonical wireframe

```
rally-playlist-wireframe.html
```

Four frames: empty · saved (enriched) · saved (fallback) · lock phase regression.

## TL;DR

Rebuild the playlist module — rebrand as **"the aux"** — with OG enrichment (reuse `/api/enrich`), a CSS equalizer animation, a "set by {name}" byline, and a playful voice. Phase-gate the other extras: **playlist visible in sketch + sell; packing / house rules / photo album hidden until lock/go/done**. Playlist stays in its current position; don't reposition anything. Full copy overhaul (title "the aux", captions "who's on?" / "aux cord secured", etc. — see brief).

## Hard don'ts

- Do NOT delete `PackingSection`, `HouseRulesSection`, or `PhotoAlbumSection`.
- Do NOT reposition the extras block or touch any other sketch module.
- Do NOT add per-crew song submissions, embedded players, or song counts.
- Do NOT add new color tokens or primitives. Reuse 8N `.module-section`.
- Do NOT write a migration without flagging first — the OG columns for playlist may not exist yet. If they don't, STOP and escalate before touching `supabase/migrations/`.
- Enrichment failures must not block save. URL alone is valid.
- Reduced-motion disables the equalizer.
- No hardcoded copy — all via `getCopy` + lexicon.
- Mobile-first at 375px.
- `rm -rf .next && npm run dev` before QA (8M rule).
- `npx tsc --noEmit` clean before release notes.

## When done

Write release notes in `rally-fix-plan-v1.md` under `#### Session 8Q — Release Notes` using the standard format.

## If you hit an escalation trigger

Stop. State what, state why, state options, recommend but do NOT act. The OG migration question is the most likely trigger — flag it before writing any schema change.
