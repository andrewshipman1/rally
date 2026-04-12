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

  // ─── Lodging module (Session 8A) ────────────────────────────────
  'lodging.typePickerTitle':          'what kind of place?',
  'lodging.typeHomeRental':           'home rental',
  'lodging.typeHotel':                'hotel',
  'lodging.typeOther':                'other',
  'lodging.typeHomeRentalDesc':       'airbnb, vrbo, etc.',
  'lodging.typeHotelDesc':            'hotel, resort, inn',
  'lodging.typeOtherDesc':            'campsite, family home, etc.',
  'lodging.linkPlaceholder':          'paste a link',
  'lodging.linkHint':                 'auto-fills title + image',
  'lodging.titlePlaceholder':         'name this spot',
  'lodging.pricePlaceholder':         'total price ($)',
  'lodging.bedroomsPlaceholder':      'bedrooms',
  'lodging.maxGuestsPlaceholder':     'max guests',
  'lodging.costPerNightPlaceholder':  'cost per night ($)',
  'lodging.peoplePerRoomPlaceholder': 'people per room',
  'lodging.peoplePerRoomHint':        'how many share a room?',
  'lodging.changeType':               'change',
  'lodging.addButton':                'add option',
  'lodging.cancelButton':             'cancel',
  'lodging.addAnother':               '+ add another spot',
  'lodging.addFirst':                 '+ add a spot',
  'lodging.emptyState':               'no options yet \u2014 add a few places to compare',
  'lodging.viewListing':              'view listing \u2192',
  'lodging.countSuffix':              'options',
  'lodging.freeLabel':                'free',
  'lodging.totalLabel':               'total',
  'lodging.perNightLabel':            '/night',
  'lodging.nightsLabel':              'nights',
  'lodging.bedroomsLabel':            'bedrooms',
  'lodging.maxGuestsLabel':           'max guests',
  'lodging.perRoomLabel':             'per room',

  // Emoji keys (Session 8B — getCopy cleanup)
  'lodging.emojiHomeRental':          '🏠',
  'lodging.emojiHotel':               '🏨',
  'lodging.emojiOther':               '⛺',

  // Format operators (Session 8B)
  'lodging.timesSymbol':              '×',
  'lodging.equalsSymbol':             '=',
  'lodging.approxSymbol':             '~',
  'lodging.separatorDot':             ' · ',
  'lodging.closeSymbol':              '✕',
  'lodging.enrichingIndicator':       '...',

  // Crew-aware + edit flow (Session 8B)
  'lodging.roomsLabel':               'rooms',
  'lodging.editButton':               'save changes',

  // ─── Module labels (sketch phase) ───────────────────────────────
  'moduleLodging':           'the spot',
  'moduleLodgingEmpty':      'where are you staying?',
  'moduleFlights':           'getting there',
  'moduleFlightsEmpty':      'any flights to book?',
  'moduleFlightsName':       'route (e.g. JFK → BVI)',
  'moduleFlightsCost':       '$ per person',
  'moduleTransport':         'getting around',
  'moduleTransportEmpty':    'rental car? rideshare?',
  'moduleTransportName':     'route (e.g. airport → airbnb)',
  'moduleTransportCost':     '$ total',
  'moduleActivities':        'what to do',
  'moduleActivitiesEmpty':   'any must-dos?',
  'moduleActivitiesName':    'activity name',
  'moduleActivitiesCost':    '$ per person',
  'moduleProvisions':        'food & drink',
  'moduleProvisionsEmpty':   'rough grocery/food budget?',

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
