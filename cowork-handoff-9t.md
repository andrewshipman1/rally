# Cowork handoff — Rally, resuming after 9S

Paste this into a fresh Cowork window to resume Rally work.

---

Continuing the Rally project. Start by reading the session-guard
skill to orient:

```
/sessions/charming-keen-hypatia/mnt/rally/.claude/skills/rally-session-guard/SKILL.md
```

Then read the fix plan to see where we are:

```
/sessions/charming-keen-hypatia/mnt/rally/rally-fix-plan-v1.md
```

**Current state (as of 2026-04-23):**

- Sell-page module cleanup arc is COMPLETE. Every major module on
  the sell page uses the `.module-section` primitive with consistent
  typography and theme tokens. Sessions 9H through 9S all shipped.
- 9P + 9Q + 9R + 9S code stack was pushed to prod on 2026-04-23
  in 5 sequential commits on top of 9O (83be97d).
- Migrations 022 (UNIQUE(email)) and 023 (orphan-merge function)
  are both live in prod.
- `package.json` now has `"dev": "rm -rf .next && next dev"` as a
  Turbopack cache-corruption band-aid (BB-5 temporary fix).

**Next up: Session 9T.**

Scope is undefined — the fix plan has a "Session 9T: Scope TBD"
section listing the accumulated backlog but deliberately NOT
locking a session framing.

**First task:** work with Andrew to define 9T's scope. Options in
the backlog (see §Session 9T in the fix plan for the full list):

- *Tier 2 visible bugs:* BB-3 cost formatting (`$3000` vs `$3,000`),
  Open Item #3 headliner href duplication, passport `n_nights ?? '?'`.
- *Tier 3 hygiene:* DatePoll drift, `members as any` cast, orphan
  buzz route, dead CSS sweep, deprecated lexicon keys, 9O eyebrow
  cross-ref.
- *Tier 4 infra:* BB-5 Next version bump (separate from bug-bash).
- *Other:* group-fallback live verification, activity_log probe,
  phone-only orphan gap.

Don't pre-scope 9T before Andrew weighs in — the previous Cowork
session made that mistake and had to back out. Ask Andrew what
theme / which items / how many workstreams feels right.

**Workflow reminders (from the skill):**

- Single-module discipline, even in bug-bash sessions — each item
  scoped to its own files, no cross-contamination.
- Any new user-facing strings need `rally-microcopy-lexicon-v0.md`
  cross-reference; escalate rather than invent.
- Turbopack cache-corruption workaround is live (band-aid script).
  If a dev-server flake still happens, the real fix waits for Next
  16.3.x with RocksDB corruption fix.
- Reveal animation observer fixed in 9R; modules animate in on
  scroll below fold.

**Session loop to follow** (per the skill):
1. Brief — scope 9T with Andrew, write to fix plan
2. Execute — draft CC kickoff, Andrew runs CC
3. Release notes — intake CC's output
4. QA — verify ACs
5. Update plan — close 9T, queue 9U if needed

Ask Andrew what he wants in 9T before drafting anything.
