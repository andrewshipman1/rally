# Claude Code — Session 9S kickoff (invite-then-signup orphan merge flow)

## First, read the session guard

```
.claude/skills/rally-session-guard/SKILL.md
```

Part 3 applies. This is a **data-integrity session touching live
auth flow.** Multi-table transaction required. Prod data at stake.
Treat every change with extra caution — verify against a throwaway
test email before shipping.

## Turbopack recovery (now automatic)

Thanks to 9R's band-aid (`"dev": "rm -rf .next && next dev"`),
cache corruption should not block this session. If it does, the
band-aid didn't land — stop and verify `package.json:6`.

## Then read the brief

```
rally-fix-plan-v1.md → ### Session 9S: "Invite-then-signup orphan
                        merge flow"
                     → also: ### Session 9R Actuals (partial BB-1
                             audit, upsert-on-id shipped,
                             invite-flow duplicate paths flagged)
                     → also: §BB-1 (historical 2026-04-21 manual
                             cleanup that this session automates)
```

## Canonical code references

```
src/app/api/invite/route.ts (lines 62-73, 78-98)    (PRIMARY — the insert paths creating orphans)
src/components/auth/ProfileSetup.tsx                 (WIRE-IN — call mergeOrphan() before upsert)
src/lib/auth/                                        (NEW file — mergeOrphan() utility lands here)

src/types/supabase.ts                                (FK types for public.users)
supabase/migrations/021_arrival_columns.sql          (precedent for multi-step DO $$ pattern)
supabase/migrations/022_users_email_unique.sql       (9R's new UNIQUE constraint — don't modify)
```

## TL;DR

9R added `UNIQUE(email)` on `public.users`. Invite-then-signup now
fails with "Failed to save profile" because:

1. `/api/invite` creates an orphan row with email X (the invite record)
2. Invitee later signs up via magic link → gets a new auth user with a new id + same email X
3. ProfileSetup tries to insert a row with the new id + same email → UNIQUE(email) throws

Fix: **merge the orphan into the auth user's row on signup**, then
ProfileSetup's upsert becomes a no-op.

Three pieces:

1. **Audit invite-insert paths** — document exact row shape and the
   full FK list pointing at `public.users.id`.
2. **`mergeOrphan(email)` utility** — locates orphan, migrates FKs,
   deletes orphan, all in one transaction.
3. **Wire into ProfileSetup** — call `mergeOrphan` before the
   existing upsert-on-id.

## Principle locked (Andrew, 2026-04-23)

**Multi-table transaction or RPC.** Half-applied merges leave
broken data. If the Supabase JS client doesn't support
transactions for this shape, write a PostgreSQL function + RPC.
Don't ship partial-merge code.

**Verify against a throwaway email before production.** Don't
test the merge against real invite records. Use a test email in
a throwaway row, confirm the merge works end-to-end, THEN ship.

**Orphan rows have value until signup.** Don't auto-merge on the
invite-create side — the orphan IS the invite record; it needs
to exist to hold FKs (trip_members, etc.) until the invitee
signs up. Merge fires only on the signup side.

**Defense-in-depth.** UNIQUE(email) is the DB-level guard. The
merge function is the app-level guard. Both exist; the merge
prevents the UNIQUE from ever tripping in the normal flow.

## Hard don'ts

- Do NOT modify the `UNIQUE(email)` constraint from 9R. It stays.
- Do NOT introduce new schema columns. Merge operates on existing
  tables only.
- Do NOT delete the invite insert paths. Orphan rows are the
  invite records.
- Do NOT use raw SQL string concatenation in the merge function.
  Parameterized queries only (via Supabase client or via an RPC
  function).
- Do NOT ship half-transactional code. If the JS client can't do
  multi-table transactions, STOP and use an RPC / PostgreSQL
  function.
- Do NOT test merge against real production user data. Use a
  throwaway email in a throwaway row.
- Do NOT modify `trip_members` data model or any FK column.
- Do NOT add organizer edit affordances or UI changes. This is
  strictly auth-flow data fix.
- Do NOT create new routes.

## Likely escalation triggers

1. **Supabase JS client lacks transaction support.** If
   `supabase.rpc()` on a PostgreSQL function is needed, write
   the function, add it via a new migration, and call it from
   `mergeOrphan`. Flag before going down this path — it adds
   a migration file (schema change) to what was originally a
   code-only session.

2. **FK list is larger than the 2026-04-21 cleanup captured.**
   That cleanup handled trip_members + ~10 others. If new
   tables have been added since, they need FK migration too.
   Before writing merge code, grep for all FK references to
   `public.users.id` in migration files. Document the full
   list in release notes.

3. **Phone-only invites (no email).**
   `api/invite/route.ts:62-73` creates rows where `phone=X,
   email=null`. UNIQUE(email) doesn't constrain nulls. These
   orphans never trip the UNIQUE but also don't have an
   email to look up on signup — no merge possible. Flag scope
   — do we extend merge to phone-based lookup, or accept
   phone-only orphans as a separate known issue?

4. **Double-submit race in ProfileSetup.** If ProfileSetup is
   called twice concurrently (double-click, form-submit race),
   two merges could race. The transaction isolates the DB
   side; the app side needs its own lock or idempotency key.
   Flag if a race window is observed.

5. **Orphan-with-non-matching-id.** What if the orphan has
   trip_members FKs AND the auth user ALSO has trip_members
   FKs for a different trip? Merge must UPDATE not OVERWRITE
   the trip_members rows. Document the merge semantics —
   "orphan FKs migrate INTO auth user's row, ADDITIVELY, never
   replacing auth user's existing relations."

## When done

Write release notes in `rally-fix-plan-v1.md` under
`#### Session 9S — Release Notes`. Must include:

- **Full FK list** pointing at `public.users.id` (for future
  maintenance).
- **Transaction mechanism** used (direct client, RPC, other).
- **Test plan evidence** — SQL trace of a throwaway-email merge
  before/after state.
- **Regression verification** — fresh signup + repeated-submit
  still work.
- **Commit shape** (single 9S or split by file cluster).
