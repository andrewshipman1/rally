-- ============================================================
-- 007_new_themes.sql
-- Seed the 6 themes missing from 002_typed_components.sql so the
-- theme picker (Session 2 Phase 6) has all 17 tiles queryable.
--
-- Themes added: Boys Trip, Reunion, Festival, Desert, Camping, Tropical
--
-- NOTE: rally-theme-content-system.md does NOT specify explicit CSS
-- gradient strings for these 6 themes — it lists palette color chips
-- and accent colors. The gradients below are CONSTRUCTED from those
-- palette dominants as placeholders; they are queryable (so the picker
-- renders something for each tile) but need design sign-off before
-- beta. Fonts default to Fraunces/Outfit (same as existing seeds); the
-- theme content doc does not specify per-theme fonts for these 6.
-- Session 3 should replace the gradient strings + fonts with the
-- final-design values and drop this note.
-- ============================================================

insert into public.themes (template_name, template_category, background_type, background_value, color_primary, color_accent, font_display, font_body, is_system) values
  ('Boys Trip', 'occasion', 'gradient', 'linear-gradient(168deg, #0f0e10 0%, #e84a1a 50%, #4aa3d9 100%)', '#0f0e10', '#e84a1a', 'Fraunces', 'Outfit', true),
  ('Reunion',   'occasion', 'gradient', 'linear-gradient(168deg, #f4ede0 0%, #b84a2f 50%, #2d6b8f 100%)', '#f4ede0', '#b84a2f', 'Fraunces', 'Outfit', true),
  ('Festival',  'occasion', 'gradient', 'linear-gradient(168deg, #1a0a2e 0%, #ff3a8c 50%, #5aff9e 100%)', '#1a0a2e', '#ff3a8c', 'Fraunces', 'Outfit', true),
  ('Desert',    'setting',  'gradient', 'linear-gradient(168deg, #f4e4cf 0%, #d94a1a 50%, #7a5a8f 100%)', '#f4e4cf', '#d94a1a', 'Fraunces', 'Outfit', true),
  ('Camping',   'setting',  'gradient', 'linear-gradient(168deg, #e8e4d4 0%, #8a4a1a 50%, #4a7a3a 100%)', '#e8e4d4', '#8a4a1a', 'Fraunces', 'Outfit', true),
  ('Tropical',  'setting',  'gradient', 'linear-gradient(168deg, #e4f4e8 0%, #ff5a3a 50%, #3ab8d4 100%)', '#e4f4e8', '#ff5a3a', 'Fraunces', 'Outfit', true);
