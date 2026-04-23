-- Session 9R BB-1 — Capture the UNIQUE(email) constraint that was
-- applied ad-hoc to prod during the 2026-04-21 orphan-row cleanup
-- (duplicate `shipman.andrew@gmail.com` rows). The data cleanup
-- itself was one-time and lives in session notes; this migration
-- captures only the schema guard going forward so the migrations
-- tree stays in sync with prod.
--
-- Idempotent by construction: wrapping the ALTER TABLE in a
-- guarded DO block means running against prod (where the
-- constraint already exists) is a no-op. `supabase migration up`
-- on a fresh DB will land the constraint; on prod it swallows the
-- duplicate_object error and continues.

DO $$ BEGIN
  ALTER TABLE public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN duplicate_table THEN null;
END $$;
