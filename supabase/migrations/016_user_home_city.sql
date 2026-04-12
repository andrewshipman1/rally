-- Add home_city text column to users table for "based in" field.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS home_city text;
