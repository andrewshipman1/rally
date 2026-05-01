# Session 10B — Domain Cutover Checklist

**Date:** 2026-04-27
**Domain:** `rallyapp.travel`
**Framing:** Cowork-only execution per Option B. No CC session, no
brief in fix plan. Tracked here; closed in fix plan §Session 10B
when verified.

**Strategy:** Three parallel setups (Vercel app domain, Resend
sender domain, Supabase URL config) followed by env updates and
a smoke test. DNS propagation is the main wait — usually 5-30 min
per record set.

---

## 0. Pre-flight

**Registrar:** Vercel (domain purchased through Vercel directly).
This means DNS records live in Vercel's DNS panel, not at an
external registrar. **Significant simplification:**

- ✅ **Vercel custom domain** — auto-configured by Vercel (Phase 1
  below is mostly verification, not setup)
- ✅ **DNS for the app** — Vercel manages it
- ✅ **SSL** — Vercel auto-provisions Let's Encrypt
- ⚠️ **DNS records for Resend** — still need to be added, but they
  go in Vercel's DNS panel for `rallyapp.travel`, not an external
  registrar
- ⚠️ **App env vars** — `NEXT_PUBLIC_APP_URL` + `RESEND_FROM_EMAIL`
  still need manual updates in Vercel's env settings
- ⚠️ **Supabase Auth URL config** — still manual

**Sender address.** Default plan: send invites from
`Rally <hi@rallyapp.travel>` (apex domain, simple address). If
you want to isolate email on a subdomain (best practice at scale,
overkill for v0), let me know and I'll adjust the Resend records
accordingly. Leaning apex unless you say otherwise.

**Things you'll have open simultaneously:**
- Vercel dashboard (vercel.com) — for env vars + DNS panel
- Resend dashboard (resend.com)
- Supabase dashboard (supabase.com)

---

## 1. Vercel custom domain — VERIFY (likely already done)

Since the domain was purchased through Vercel and connected to
the project, this phase is mostly verification. Vercel's
domain-registration flow auto-creates the DNS records pointing
the apex at the Vercel project, sets up `www` redirect, and
provisions SSL.

**Verification only:**

1. Vercel → your Rally project → **Settings** → **Domains** —
   confirm `rallyapp.travel` is listed with "Valid Configuration"
2. Optionally also confirm `www.rallyapp.travel` exists as a
   redirect target (Vercel usually adds this by default; if not,
   add it manually since users will sometimes type `www.`)
3. Open `https://rallyapp.travel` in a browser — Rally loads
   (you'll see the app, though URLs IN the app still reference
   the preview URL until env vars update in step 4)
4. Confirm HTTPS works — no cert warnings, lock icon shows valid
   cert

**If something's off:**
- If domain isn't listed: it's possible the purchase didn't
  auto-attach to this project. Check Vercel → your account →
  Domains → `rallyapp.travel` → which project it's connected
  to. Move it to the Rally project if needed.
- If app loads but with errors: check Vercel deployment logs.
- If HTTPS fails: SSL provisioning can take a few minutes after
  domain attaches; wait + retry.

**Verification:**
- [ ] `rallyapp.travel` listed in Vercel project's domains with
      green status
- [ ] `https://rallyapp.travel` loads the Rally app
- [ ] `www.rallyapp.travel` redirects to apex (or domain config
      is set up to do so)
- [ ] HTTPS works

---

## 2. Resend sender domain — VERIFY (Andrew used auto-configure)

Andrew chose Resend's auto-configure flow, which uses Vercel's
API to write the DNS records directly into the
`rallyapp.travel` zone. No manual record entry needed. Just
wait + verify.

**Verification only:**

1. **Resend → Domains → `rallyapp.travel`** — refresh until all
   DNS records (MX / SPF / DKIM / DMARC) show green checkmarks
2. Domain status reads **"verified"**

**Expected wait:** 5-15 min after the auto-configure runs.
Vercel-managed DNS propagates fast.

**If not verifying after 30 min:** check Vercel → Domains →
`rallyapp.travel` → DNS Records to confirm Resend's records
actually landed. Sometimes the auto-configure UX completes but
the records aren't fully written. Manual entry from Resend's
displayed values is the fallback.

**Verification:**
- [ ] All Resend DNS records show "verified" in the dashboard
- [ ] Resend shows the domain status as "verified"

**Note on existing API keys:** No changes needed to your
existing `rally-production` API key. Once the domain is
verified, that key can send from any verified domain on the
account.

---

## 3. Supabase Auth URL Configuration

**Steps:**

1. Supabase → your Rally project → **Authentication** → **URL
   Configuration**
2. **Site URL** field: change from current value (probably
   `http://localhost:3000` or the Vercel preview URL) to:
   ```
   https://rallyapp.travel
   ```
3. **Redirect URLs** allowlist: add the following entries (one per
   line in Supabase's UI):
   ```
   https://rallyapp.travel/**
   https://rallyapp.travel/auth/callback
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   ```
   The `**` wildcard allows any path under those domains. Keep the
   `localhost:3000` entries so dev still works.
4. Save

**Verification:**
- [ ] Site URL = `https://rallyapp.travel`
- [ ] Redirect URLs allowlist includes both prod + localhost
      patterns

---

## 4. Vercel environment variables

**Only after** Vercel + Resend domains are both verified above.

**Steps:**

1. Vercel → your Rally project → **Settings** → **Environment
   Variables**
2. Update **`NEXT_PUBLIC_APP_URL`**:
   - Find the existing entry (probably set to the preview URL or
     localhost)
   - Edit → new value: `https://rallyapp.travel`
   - Apply to: all environments (Production, Preview, Development
     — though Development typically uses `.env.local`)
3. Update or add **`RESEND_FROM_EMAIL`**:
   - If exists: edit → new value: `Rally <hi@rallyapp.travel>`
   - If not exists: Add → name=`RESEND_FROM_EMAIL`,
     value=`Rally <hi@rallyapp.travel>`
   - Apply to: Production (and Preview if you want preview deploys
     to send from the verified domain too)
4. Vercel auto-redeploys after env changes — confirm the redeploy
   triggers (or manually redeploy if it doesn't)

**Verification:**
- [ ] `NEXT_PUBLIC_APP_URL=https://rallyapp.travel` in prod env
- [ ] `RESEND_FROM_EMAIL=Rally <hi@rallyapp.travel>` in prod env
- [ ] Latest Vercel deployment is green

**Optional: update local `.env.local`:**
- Update `NEXT_PUBLIC_APP_URL` if you want local dev to mirror
  prod URLs in any UI/copy that references them
- Set `RESEND_FROM_EMAIL` locally if you want dev to send from the
  verified domain too (otherwise it falls back to
  `Rally <onboarding@resend.dev>` for local sends)

---

## 5. Smoke test

After everything's deployed:

**App-side:**
- [ ] Load `https://rallyapp.travel` — Rally loads
- [ ] Sign in via magic link — magic link email arrives, click
      lands you back at `https://rallyapp.travel/auth/callback`
      (or wherever your redirect lands), signed in successfully
- [ ] Trip page link copying — verify share links use
      `https://rallyapp.travel/trip/<slug>` not the preview URL
      (this validates `NEXT_PUBLIC_APP_URL` propagated)

**Email-side:**
- [ ] Add a new invitee to a sell-phase trip via the existing
      invite flow — confirm the email arrives FROM
      `hi@rallyapp.travel` (not `onboarding@resend.dev`)
- [ ] Check spam folder if email doesn't land in inbox — first
      sends from a fresh domain often hit spam until reputation
      builds; sending to a few different inboxes (gmail, outlook,
      apple) gives you signal

---

## 6. CC pass (small)

After all the above is done, kick a tiny CC session to
double-check the codebase for anything stale:

**Kickoff prompt to paste into CC:**

```
Session 10B verification — domain cutover post-flight.

Andrew has cut Rally over to `rallyapp.travel` (custom domain in
Vercel, custom sender in Resend, Supabase Auth URL config updated).
This session is a verification + cleanup pass.

Tasks:
1. Read this checklist: `rally-10b-domain-cutover-checklist.md`
   for context on what was done.
2. Grep `src/` for any hardcoded references to:
   - `rally-gold.vercel.app`
   - `*.vercel.app`
   - `localhost:3000` in non-fallback positions (i.e., not as the
     `||` default for `process.env.NEXT_PUBLIC_APP_URL`)
3. Grep `src/` for any hardcoded `from` addresses or email-sender
   strings that should now use `RESEND_FROM_EMAIL` instead.
4. Grep `supabase/` for any URL references that need updating
   (auth callbacks, etc.).
5. If any hits surface: assess whether they need updating, fix
   if trivial, escalate if scope-ambiguous.
6. Run `npx tsc --noEmit` and `npm run build` to confirm clean.
7. Report findings + any fixes applied.

DO NOT modify env vars (those are in Vercel + .env.local;
out of scope).
DO NOT modify DNS records (handled in dashboards already).
DO NOT modify the migration history.

Expected outcome: most likely zero code changes — Cowork's
pre-flight already confirmed only two non-hardcoded uses of
`NEXT_PUBLIC_APP_URL`. This session is belt-and-suspenders.

Produce release notes under §Session 10B as
"#### Session 10B — Release Notes" in the fix plan.
```

After CC reports back, Cowork closes 10B with an Actuals block
in the fix plan.

---

## What NOT to do

- **Don't delete the Vercel preview URL** (`rally-gold.vercel.app`)
  — it's auto-managed by Vercel for preview deploys; deleting it
  could break preview environments
- **Don't switch the existing Resend API key** — `rally-production`
  works fine for the new domain
- **Don't apply migration 025 (10A)** — that's a separate
  concern; should already be applied
- **Don't fire any test invites until step 5** — wait until env
  vars are updated, otherwise the email send will use the old
  sandbox sender

---

## Rollback plan (if something goes wrong)

If the cutover breaks production:

1. **Revert env vars in Vercel** to old values (Vercel keeps env
   var history; one-click revert)
2. **Vercel domain** can stay (no harm; just doesn't route traffic
   if env points back at preview URL)
3. **Resend domain** can stay (verified domains don't break
   anything; just adds a sender option)
4. **Supabase URL config** — keep both old + new in the redirect
   allowlist so reverting env doesn't break magic-link redirects
   for in-flight signups

The riskiest step is the env var update — that's the only place
where a typo could break prod. Vercel preview deploys (on
non-main branches) keep using their auto-assigned preview URLs,
so the prod env change doesn't affect previews.

---

## Sign-off

Once steps 1-6 are verified and CC's release notes land, Cowork
writes a §Session 10B Actuals block in the fix plan and marks
10B complete. Then we proceed to 10C (publish-time fan-out + invite
tokens) — the next sub-session in the attendee arc.
