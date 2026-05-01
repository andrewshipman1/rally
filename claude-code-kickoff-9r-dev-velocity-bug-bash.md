# Claude Code — Session 9R kickoff (bug bash — dev velocity + data integrity)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Part 3 applies. This is a **four-workstream session** — discipline
matters. Each workstream (BB-5, BB-4, BB-1, Open Item #1) has its
own scope, files, and ACs. Do not cross-contaminate. If you find
yourself patching a 5th thing, STOP and log it.

## Turbopack cache warning (pre-BB-5 fix)

Before BB-5 lands: standard recovery recipe.
```
pkill -9 node
lsof -iTCP:3000 -sTCP:LISTEN   # must be empty
lsof -iTCP:3001 -sTCP:LISTEN   # must be empty
cd ~/Desktop/claude/rally
rm -rf .next node_modules/.cache
npm run dev
# wait 30-60s after "Ready in Xs"
```

After BB-5 lands: this dance should no longer be required for
every restart. If it still is, the BB-5 fix didn't land — stop
and reassess before claiming AC2/AC3.

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9R: "Bug bash — dev velocity
                        + data integrity"
                     → also: ### Bug Backlog / §BB-1 / §BB-4 / §BB-5
                             (context + symptom clusters)
                     → also: ### Open items #1 (lodging null-nights)
                     → also: §Session 9Q Actuals (all sell-page
                             cleanup complete; this session is
                             strictly bug bash)
```

## Canonical code references

```
src/components/ui/Reveal.tsx                    (BB-4 target — IntersectionObserver audit)
next.config.js / next.config.ts                 (BB-5 target — disable persistent cache)
package.json                                    (BB-5 — possible webpack dev script)
supabase/migrations/021_arrival_columns.sql     (BB-1 — idempotent pattern template)
supabase/migrations/                            (BB-1 — new migration file lands here)
src/app/api/auth/** / src/app/actions/**        (BB-1 — signup audit for public.users upsert)
src/components/trip/builder/LodgingCard.tsx     (Open Item #1 — computeNights null-guard)
src/components/trip/builder/LodgingAddForm.tsx  (Open Item #1 — preview null-guard)
src/components/trip/builder/SketchModules.tsx   (Open Item #1 — date-range validation)
rally-microcopy-lexicon-v0.md                   (Open Item #1 — hint copy cross-ref)
```

## TL;DR

Four independent workstreams. Fix each, commit each (or bundle),
move on. Don't let one workstream expand into others.

1. **BB-5 — Turbopack cache.** Disable persistent caching
   (config flag or webpack fallback) so RocksDB .sst files
   don't corrupt during HMR bursts. Verify: 10+ HMR cycles
   without cache-corruption errors in stderr.

2. **BB-4 — Reveal opacity stuck.** Audit `Reveal.tsx`
   IntersectionObserver — below-fold modules never animate
   in. Likely `rootMargin` / `threshold` or mount-timing
   wiring issue. Fix + verify on Coachella scroll-down.

3. **BB-1 — UNIQUE(email) migration + signup audit.** The
   constraint exists in prod (ad-hoc SQL ran 2026-04-21) but
   not in migrations tree. Add migration file with idempotent
   `IF NOT EXISTS` pattern. Audit signup code for
   duplicate-creation path; add `ON CONFLICT (email)` safety.
   SQL probe for any remaining duplicates.

4. **Open Item #1 — Lodging null-nights `"?"` render.**
   `computeNights` returns null on inverted/unset dates,
   renders literal `"? nights"` to users. Three-piece fix:
   validate sketch date input, hide the computation line
   when nights null (show fallback hint from lexicon), audit
   other nights-dependent surfaces.

## Principle locked (Andrew, 2026-04-23)

**Front-load dev-velocity fixes.** BB-5 and BB-4 unblock every
subsequent QA pass. Fixing them first pays compound interest on
9S and beyond.

**BB-1 is the ONLY schema change in the 9X arc.** Treat with
extra care. Idempotent migration, no prod run during session,
Andrew deploys via his normal flow.

**Workstreams stay isolated.** If BB-4's Reveal fix surfaces an
issue in a module that consumes Reveal, log it — don't fix.
Single-workstream discipline per item.

**No lexicon inventions.** Open Item #1's fallback copy must
cross-reference the lexicon. If no match exists, escalate for
Andrew's sign-off.

## Hard don'ts

- Do NOT create new routes.
- Do NOT touch any other module (single-workstream discipline
  across four workstreams).
- Do NOT cross-contaminate: BB-5 doesn't touch Reveal.tsx, BB-4
  doesn't touch auth or migrations, BB-1 doesn't touch lodging,
  Open Item #1 doesn't touch auth.
- Do NOT run the BB-1 migration against prod. Local only.
- Do NOT add schema changes outside the single BB-1 migration
  file.
- Do NOT upgrade Next.js as a BB-5 fix path — version bump is
  out of scope, escalates.
- Do NOT rewrite `Reveal.tsx` wholesale. Audit + minimal fix.
  If the current implementation uses an animation library,
  work within it.
- Do NOT expand Open Item #1 beyond the three scope pieces
  (validation + preview null-guard + audit). If the audit
  surfaces 5+ sites needing null-guard, fix the two known
  ones and log the rest for 9S.
- Do NOT introduce strings not in `rally-microcopy-lexicon-v0.md`.

## Likely escalation triggers

1. **BB-5 fix requires Next version upgrade.** If
   `experimental.turbopackPersistentCaching: false` isn't a
   valid flag on the current Next version (check
   `package.json`) and `next dev --turbopack=false` /
   `--no-turbopack` also doesn't work, the remaining options
   are version bump or a wrapper script. Escalate before
   pursuing either.

2. **BB-4 Reveal uses a framer-motion / animation library
   controlling the observer.** If the fix requires library
   config changes or migration away from the library,
   escalate. Don't rewrite the Reveal API.

3. **BB-1 migration fails on local DB.** Local dev DB may not
   have the ad-hoc 2026-04-21 cleanup SQL applied — if it
   doesn't, and local has duplicates, the migration will
   fail on the UNIQUE constraint. Escalate with the SQL
   duplicate probe output.

4. **BB-1 signup audit reveals real duplicate-creation path.**
   If current code actively creates duplicates under race
   conditions (no `ON CONFLICT` handling), adding the clause
   is simple but may reveal a deeper auth-flow issue.
   Escalate before patching.

5. **Open Item #1 fallback hint has no lexicon entry.**
   Propose copy ("set trip dates to see total" or similar)
   and flag for Andrew's sign-off. Don't invent.

6. **Open Item #1 audit surfaces 5+ sites.** Fix the two
   known targets (LodgingCard + LodgingAddForm preview); log
   the rest for 9S.

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9R — Release Notes` using the standard format.

**Release notes must include:**
- Per-workstream status (each of BB-5, BB-4, BB-1, Open Item #1
  addressed independently).
- For BB-5: which fix option was applied, + stderr stays clean
  confirmation.
- For BB-4: before/after scroll behavior on Coachella.
- For BB-1: migration file name, SQL probe output (local DB
  duplicate check), signup audit findings (duplicate-creation
  path or none).
- For Open Item #1: list of nights-dependent surfaces audited
  + which were fixed vs logged.
- Commit structure (single 9R commit or four per-workstream
  commits — CC's call).
