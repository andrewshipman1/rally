// Rally lexicon types — copy layer.
// The Lexicon shape is the global string registry, surface-keyed.
// Each surfaces/{name}.ts file exports a Record matching one slot here.
// Themes override individual keys via ThemeStrings; getCopy() does the merge.

import type { Templated } from '@/lib/themes/types';

/**
 * Top-level lexicon shape. One entry per microcopy lexicon section.
 * Surface keys mirror lexicon §5.x order for grep-ability.
 */
export interface Lexicon {
  common: Record<string, Templated>;
  landing: Record<string, Templated>;
  dashboard: Record<string, Templated>;
  createTrip: Record<string, Templated>;
  /** §5.4 + share-link + made-with-rally footer globals */
  tripPageShared: Record<string, Templated>;
  tripPageSketch: Record<string, Templated>;
  tripPageSell: Record<string, Templated>;
  tripPageLock: Record<string, Templated>;
  tripPageGo: Record<string, Templated>;
  lockFlow: Record<string, Templated>;
  /** §5.10 — global RSVP chip icons (🙌/🧗/—) live here, NOT in themes */
  rsvp: Record<string, Templated>;
  emptyStates: Record<string, Templated>;
  errors: Record<string, Templated>;
  toasts: Record<string, Templated>;
  emails: Record<string, Templated>;
  passport: Record<string, Templated>;
  builderState: Record<string, Templated>;
  inviteeState: Record<string, Templated>;
  nudges: Record<string, Templated>;
  cutoff: Record<string, Templated>;
  lodgingVoting: Record<string, Templated>;
  extras: Record<string, Templated>;
  /** §5.23 */
  themePicker: Record<string, Templated>;
  /** §5.24 */
  auth: Record<string, Templated>;
  /** §5.25 (renumbered from §5.22) */
  crew: Record<string, Templated>;
  /** §5.26 (renumbered from §5.23) */
  buzz: Record<string, Templated>;
  /** §5.27 — profile inline editing */
  profile: Record<string, Templated>;
}

export type SurfaceKey = keyof Lexicon;
