// §5.16 — Builder state (the trip page IS the builder).
//
// Sketch state copy: empty-field placeholders, handwritten hint, disabled
// CTA, scaffolding marquee, and the ungate threshold. Everything a trip
// page needs when it has no title, no dates, and no crew yet.
import type { Templated } from '@/lib/themes/types';

export const builderState: Record<string, Templated> = {
  // ─── Top of page ────────────────────────────────────────────────
  'liveRow':               'draft · only you can see this',
  'sticker':               'new rally ✨',
  'eyebrow':               'you started this',

  // ─── Inline field labels (small caps above each field) ──────────
  'fieldLabel.name':       'name it',
  'fieldLabel.oneLine':    'one line',
  'fieldLabel.when':       'when',
  'fieldLabel.where':      'where',

  // ─── Inline fields (placeholders in sketch state) ───────────────
  'titlePlaceholder':      'untitled rally',
  'taglinePlaceholder':    'why are we doing this?',
  'whenFieldPlaceholder':  'tbd ↓',
  'whereFieldPlaceholder': 'somewhere ↓',

  // ─── Handwritten hint beneath the title ─────────────────────────
  'titleHint':             'give it a name only your group would get',

  // ─── Empty countdown card ───────────────────────────────────────
  'countdownNum':          '??',
  'countdownLabel':        "days until — set a date and i'll start counting",
  'countdownFlag':         'soon™',

  // ─── Crew field ─────────────────────────────────────────────────
  'crewLabel':             'the crew',
  'crewHelper':            "just you so far. who's in?",
  'inviteButton':          '+',

  // ─── Scaffolding marquee (sketch state only) ────────────────────
  'marqueeScaffolding':    'tap to name · set the dates · invite the crew · send it',

  // ─── Sticky bottom bar ──────────────────────────────────────────
  'saveDraftButton':       '✏️',
  'ctaDisabled':           'add the basics first',
  'ctaReady':              'send it to the group 🚀',

  // ─── Share link ─────────────────────────────────────────────────
  'shareLinkCopyAction':   'copy the invite link ↗',
  'shareLinkCopiedToast':  'link copied. drop it in the chat.',

  // ─── Footer ─────────────────────────────────────────────────────
  'footer':                'made with rally',
};
