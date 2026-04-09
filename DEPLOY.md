# Rally — Deploy Runbook

Production deployment guide for Rally v0. Every step here is a step staging will also need in v0.1.

---

## Prerequisites

- Vercel account with project connected to this repo
- Supabase project (production)
- Resend account with verified sending domain
- Domain DNS configured to point to Vercel

---

## Environment variables

Set these on Vercel (Settings → Environment Variables). See `.env.example` for the template.

| Variable | Where to find it | Notes |
|----------|-----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Public, safe for client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key | Public, safe for client |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key | **Secret** — server-only |
| `RESEND_API_KEY` | Resend → API Keys | **Secret** — server-only |
| `RESEND_FROM_EMAIL` | Your verified domain | e.g. `Rally <hi@rally.app>` |
| `NEXT_PUBLIC_APP_URL` | Your production URL | e.g. `https://rally.app` |

**Never commit actual values.** Use `.env.local` for local dev, Vercel env vars for prod.

---

## Supabase setup

### Migrations

```bash
# Check what's applied
npx supabase db remote list

# Apply all pending migrations
npx supabase db push

# To roll back the last migration (destructive — use with care)
npx supabase migration repair <version> --status reverted
```

All 12 migrations (001–012) must be applied in order. They are idempotent where possible, but some (008: enum swap) are not reversible without data loss.

### Auth SMTP (Resend)

In the Supabase dashboard → Authentication → SMTP Settings:

| Field | Value |
|-------|-------|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your Resend API key |
| Sender email | Your verified domain address (e.g. `hi@rally.app`) |
| Sender name | `Rally` |

### Auth email templates

In Supabase dashboard → Authentication → Email Templates:

- **Magic Link**: paste contents of `supabase/email-templates/magic-link.html`
- **Confirm signup**: paste contents of `supabase/email-templates/confirmation.html`
- **Reset password**: paste contents of `supabase/email-templates/recovery.html`

The templates use `{{ .ConfirmationURL }}` — Supabase replaces this at send time.

### Auth settings

In Supabase dashboard → Authentication → URL Configuration:

- **Site URL**: `https://your-production-domain.com`
- **Redirect URLs**: add `https://your-production-domain.com/auth/callback`

In Authentication → Auth Providers:

- **Email**: enabled, confirm email = true
- **OTP Expiration**: 900 seconds (15 min)

### Point-in-time recovery (PITR)

In Supabase dashboard → Database → Backups:

- Enable PITR before first production deploy
- Verify it shows "Active" before proceeding

---

## Resend configuration

1. Add and verify your sending domain at [resend.com/domains](https://resend.com/domains)
2. Create a production API key at [resend.com/api-keys](https://resend.com/api-keys)
3. Set both `RESEND_API_KEY` and `RESEND_FROM_EMAIL` on Vercel
4. Test by sending a magic link to a real email address

---

## Deploy sequence

```bash
# 1. Ensure main is clean
git status  # should be clean
npx tsc --noEmit  # 0 errors
npx eslint src/  # 0 warnings
npx next build  # compiles

# 2. Push to main (triggers Vercel deploy)
git push origin main

# 3. Monitor build on Vercel dashboard
# Build should complete in ~90 seconds

# 4. Run smoke test (see below)
```

---

## Smoke test checklist

Run immediately after every deploy. If any step fails, roll back before investigating.

- [ ] Visit production URL — dashboard loads (or auth redirect)
- [ ] Sign up with a real email — magic link arrives via Resend (not Supabase default SMTP)
- [ ] Click magic link — lands on `/auth/setup` or dashboard
- [ ] Complete profile setup — name + bio saved
- [ ] Create a trip — builder loads with theme picker
- [ ] Select a theme — preview + commit works
- [ ] Fill trip details (name, destination, dates, cutoff) — autosaves
- [ ] Share trip link in incognito — invitee shell shows blurred plan
- [ ] Sign in as invitee — sees full trip page
- [ ] RSVP as "in" — confetti fires, sticky bar updates, crew page shows the RSVP
- [ ] Check `/trip/[slug]/buzz` — activity log shows RSVP event
- [ ] Check `/trip/[slug]/crew` — both members visible
- [ ] No console errors in DevTools for 5 minutes

---

## Rollback procedure

### Quick rollback (Vercel)

1. Go to Vercel dashboard → Deployments
2. Find the last known-good deployment
3. Click "..." → "Promote to Production"
4. This instantly points traffic to the previous build

### If a migration broke the DB

1. Roll back Vercel first (above)
2. Identify the broken migration version
3. `npx supabase migration repair <version> --status reverted`
4. If data was corrupted, use Supabase PITR to restore to a point before the migration
5. Fix the migration SQL, reapply

### If Resend/SMTP is broken

1. Auth still works — Supabase falls back to its built-in SMTP
2. Check Resend dashboard for delivery logs
3. Verify API key is valid and domain is still verified
4. Check Supabase SMTP settings match the values above

---

## Known deploy gotchas

1. **`.next` cache** — if the build seems stale, delete `.next/` and rebuild. Vercel does this automatically but local deploys may not.
2. **Supabase types** — if you change the DB schema, regenerate types before deploying: `npx supabase gen types typescript --linked > src/types/supabase.ts`
3. **Font loading** — Google Fonts are loaded via `<link>` tags in page components, not via `next/font`. This works but generates a lint warning (suppressed). Moving to `next/font` is v0.1 scope.
4. **Rate limiter** — uses Supabase `auth_rate_limits` table, not in-memory. Works across serverless instances. The table auto-cleans expired entries.
5. **Guest cookies** — signed, HttpOnly, 30-day rolling. If a user clears cookies, they appear as a new guest. No data loss — their RSVP is still in the DB tied to the guest user row.
