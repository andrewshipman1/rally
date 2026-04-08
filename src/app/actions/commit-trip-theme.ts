'use server';

// Server action for committing a theme choice from the Phase 6 picker.
// Separate from update-trip-sketch.ts because that action's whitelist
// excludes theme_id on purpose (it's only for the inline-editable sketch
// fields). Theme commits resolve chassis id → DB template_name → theme
// row id, then write trips.theme_id.
//
// Allowed in sketch OR sell phase (forward-compat for a later phase
// that lets organizers swap vibes after lock/go is also fine, but the
// Phase 6 entry point is sketch-only).

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { templateNameFromChassisId } from '@/lib/themes/from-db';
import type { ThemeId } from '@/lib/themes/types';

type Result =
  | { ok: true; dbThemeId: string }
  | { ok: false; error: string };

export async function commitTripTheme(
  tripId: string,
  slug: string,
  chassisThemeId: ThemeId,
): Promise<Result> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not-authenticated' };

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('organizer_id, phase')
    .eq('id', tripId)
    .single();
  if (fetchError || !trip) return { ok: false, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false, error: 'not-organizer' };
  if (trip.phase !== 'sketch' && trip.phase !== 'sell') {
    return { ok: false, error: 'phase-locked' };
  }

  const templateName = templateNameFromChassisId(chassisThemeId);
  if (!templateName) return { ok: false, error: 'unknown-theme' };

  const { data: themeRow, error: themeError } = await supabase
    .from('themes')
    .select('id')
    .eq('template_name', templateName)
    .eq('is_system', true)
    .single();
  if (themeError || !themeRow) return { ok: false, error: 'theme-row-not-found' };

  const { error: updateError } = await supabase
    .from('trips')
    .update({ theme_id: themeRow.id })
    .eq('id', tripId);
  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true, dbThemeId: themeRow.id };
}
