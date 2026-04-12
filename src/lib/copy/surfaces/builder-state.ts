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
  'fieldLabel.start':      'start',
  'fieldLabel.end':        'end',
  'fieldLabel.rsvpBy':     'rsvp by',

  // ─── Inline fields (placeholders in sketch state) ───────────────
  'titlePlaceholder':      'untitled rally',
  'taglinePlaceholder':    'why are we doing this?',
  'whenFieldPlaceholder':  'tbd ↓',
  'whereFieldPlaceholder': 'somewhere ↓',
  'rsvpByPlaceholder':     'set a deadline ↓',

  // ─── Handwritten hint beneath the title ─────────────────────────
  'titleHint':             'give it a name only your group would get',

  // ─── Empty countdown card ───────────────────────────────────────
  'countdownNum':          '??',
  'countdownLabel':        "days until — set a date and i'll start counting",
  'countdownFlag':         'soon™',

  // ─── Crew field (sell+ going row) ────────────────────────────────
  'crewLabel':             'the crew',
  'crewHelper':            "just you so far. who's in?",
  'inviteButton':          '+',

  // ─── Invite roster (sketch phase) ──────────────────────────────
  'rosterLabel':           'who to invite',
  'rosterYou':             'you (organizer)',
  'rosterAddPlaceholder':  '+ add a person',
  'inviteListCount':       '$1 invited',
  'inviteListOrganizer':   'organizer',
  'inviteListRemoveLabel': 'remove',

  // ─── Shared input components (Session 7B) ──────────────────────
  'estimatePrefix':          '~$',
  'estimatePlaceholder':     'rough estimate',
  'linkPastePlaceholder':    'paste a link',
  'linkManualToggle':        'or add manually',
  'linkNamePlaceholder':     'name',
  'linkPricePlaceholder':    '$ price',
  'lineItemNamePlaceholder': 'what is it',
  'lineItemCostPlaceholder': '$',
  'lineItemAddButton':       '+',

  // ─── Scaffolding marquee (sketch state only) ────────────────────
  'marqueeScaffolding':    'tap to name · set the dates · invite the crew · send it',

  // ─── Sticky bottom bar ──────────────────────────────────────────
  'saveDraftButton':       '✏️',
  'ctaDisabled':           'add the basics first',
  'ctaReady':              'send it to the group 🚀',
  'stickyBack':            '←',
  'stickyTheme':           '🎨',
  'stickyDraft':           'save draft',
  'stickyPublish':         'publish →',
  'stickyPublishDisabled': 'name + date to publish',

  // ─── Share link ─────────────────────────────────────────────────
  'shareLinkCopyAction':   'copy the invite link ↗',
  'shareLinkCopiedToast':  'link copied. drop it in the chat.',

  // ─── Invite modal ──────────────────────────────────────────────
  'inviteModalTitle':      'add to the crew',
  'inviteTabShare':        'share link',
  'inviteTabEmail':        'send invite',
  'inviteCopyButton':      'copy',
  'inviteCopiedToast':     'copied!',
  'inviteShareButton':     'share ↗',
  'inviteEmailPlaceholder':'their email',
  'inviteNamePlaceholder': 'their name (optional)',
  'inviteSendButton':      'send invite 📩',
  'inviteSending':         'sending…',
  'inviteSentToast':       'invite sent!',
  'inviteAlreadyInvited':  'already on the crew',
  'inviteError':           'something went wrong. try again?',

  // ─── Footer ─────────────────────────────────────────────────────
  'footer':                'made with rally',

  // ─── Editor panel labels ────────────────────────────────────────
  'panel.theme':           'Pick a theme',
  'panel.effects':         'Effects',
  'panel.effectsPlaceholder': 'Animations & confetti effects coming soon',
  'panel.phase':           'Phase',
  'panel.deadline':        'Commit deadline',
  'panel.rsvpEmojis':      'RSVP emojis',
  'panel.shareLink':       'Share link',
  'panel.copyShareLink':   'Copy share link',
};
