-- ============================================================
-- 010_theme_backfill.sql
-- Fix template_name mismatches from 007 and replace placeholder
-- gradients with real palette values from rally-theme-content-system.md.
--
-- 007 inserted: 'Reunion', 'Festival', 'Desert', 'Camping'
-- from-db.ts expects: 'Reunion Weekend', 'Festival Run', 'Desert Trip', 'Camping Trip'
-- Without this fix, 4 of 6 new themes silently fall back to just-because.
-- ============================================================

-- Fix template_name mismatches
UPDATE public.themes SET template_name = 'Reunion Weekend' WHERE template_name = 'Reunion';
UPDATE public.themes SET template_name = 'Festival Run'    WHERE template_name = 'Festival';
UPDATE public.themes SET template_name = 'Desert Trip'     WHERE template_name = 'Desert';
UPDATE public.themes SET template_name = 'Camping Trip'    WHERE template_name = 'Camping';

-- Replace placeholder gradients and colors with real palette values.
-- Gradients are two-stop (bg → accent) at 168deg, matching the existing
-- theme seed pattern.

UPDATE public.themes SET
  background_value = 'linear-gradient(168deg, #0f0e10 0%, #e84a1a 100%)',
  color_primary    = '#0f0e10',
  color_accent     = '#e84a1a'
WHERE template_name = 'Boys Trip';

UPDATE public.themes SET
  background_value = 'linear-gradient(168deg, #f4ede0 0%, #b84a2f 100%)',
  color_primary    = '#f4ede0',
  color_accent     = '#b84a2f'
WHERE template_name = 'Reunion Weekend';

UPDATE public.themes SET
  background_value = 'linear-gradient(168deg, #1a0a2e 0%, #ff3a8c 100%)',
  color_primary    = '#1a0a2e',
  color_accent     = '#ff3a8c'
WHERE template_name = 'Festival Run';

UPDATE public.themes SET
  background_value = 'linear-gradient(168deg, #f4e4cf 0%, #d94a1a 100%)',
  color_primary    = '#f4e4cf',
  color_accent     = '#d94a1a'
WHERE template_name = 'Desert Trip';

UPDATE public.themes SET
  background_value = 'linear-gradient(168deg, #e8e4d4 0%, #8a4a1a 100%)',
  color_primary    = '#e8e4d4',
  color_accent     = '#8a4a1a'
WHERE template_name = 'Camping Trip';

UPDATE public.themes SET
  background_value = 'linear-gradient(168deg, #e4f4e8 0%, #ff5a3a 100%)',
  color_primary    = '#e4f4e8',
  color_accent     = '#ff5a3a'
WHERE template_name = 'Tropical';
