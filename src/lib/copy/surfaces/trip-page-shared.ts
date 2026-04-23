// §5.4 — Trip page shared elements (across all phase states).
// Includes share-link copy and the made-with-rally footer globals.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const tripPageShared: Record<string, Templated> = {
  // Header / chrome
  'liveIndicator':       'trip is live',
  'wordmark':            'rally!',

  // Going row
  'going.label':         "who's coming 👇",
  'going.labelAlt':      'the crew',
  'going.labelN':        ({ n }: ThemeVars) => `${n ?? 0} going 👇`,
  'going.empty':         "0 yes's so far. you'll be the first one in.",

  // Countdown labels (sit below the day number on the .countdown block)
  'countdown.label.signature': 'days until liftoff',
  'countdown.label.tbd':       'tbd',
  'countdown.label.toLock':    'days to lock it in',

  // Module section titles
  'flights.h2':          'flights',
  // Session 9K — aligned to approved lexicon §5.29 + mockup
  // section title ("transportation"). Previous value "getting
  // around" predated the sketch module rename in 8M.
  'transport.h2':        'transportation',
  'groceries.h2':        'groceries',

  // Lodging
  'lodging.h2':          'the spot',
  'lodging.carouselCta': 'scroll the listing',

  // Cost
  'cost.h2':             'what it runs',
  'cost.lineLabel':      'per person, all in',
  'cost.subLabel':       'flights not included. obviously.',

  // Polls
  'polls.h2':            'quick votes',

  // Activity
  'activity.h2':         "what's happening",
  'activity.empty':      "quiet so far. you'll be the first thing here.",

  // Footer (poetic — only used on the live trip page)
  'footer.poetic':       'rally is a doorway, not an app. close it and go pack.',

  // Share
  'share.copy':          'copy the invite link ↗',

  // ActivityCard
  'activity.bookCta':    'Book \u2192',

  // AddToCalendarButton
  'calendar.cta':        '\ud83d\udcc5 Add to Calendar',

  // CostBreakdown
  'cost.perPersonLabel': 'Estimated per person',
  'cost.nightsSeparator': 'nights \u2022',

  // CostBreakdown — lodging line (Session 9J)
  'costBreakdown.lodging.label':         'lodging',
  'costBreakdown.lodging.leadingSuffix': '(so far)',

  // CostBreakdown — per-viewer hero + "your way in" row (Session 9B-2).
  // "your total" / "~$X / you" only renders when a viewerArrival is
  // available; null-viewer fallback keeps the old group hero copy.
  'costBreakdown.yourTotalLabel':     'your total',
  'costBreakdown.perYouSuffix':       ' / you',
  'costBreakdown.yourWayInLabel':     'your way in',
  'costBreakdown.yourWayInPending':   '(pending)',
  'costBreakdown.subtitle':           'your total will firm up once the crew fills in.',

  // CostBreakdown — line-item labels ported off hardcoded strings.
  'costBreakdown.line.flights':       'flights',
  'costBreakdown.line.transport':     'transport',
  'costBreakdown.line.meals':         'meals',
  'costBreakdown.line.activities':    'activities',
  // Session 9P — provisions + other rows render between activities and
  // the footer, gated on `>0`. Labels mirror the sketch module (lowercase,
  // noun fragments; lexicon §5.4).
  'costBreakdown.line.provisions':    'provisions',
  'costBreakdown.line.other':         'other',

  // CostBreakdown — footer badges (theme-token colored at CSS layer).
  // Session 9O — `sharedBadge` / `bookYoursBadge` deprecated in favor of
  // `footer.shared` / `footer.yours` below; keys stay for dead-key sweep.
  'costBreakdown.sharedBadge':        ({ amount }: ThemeVars) => `🏠 shared · ${amount ?? '—'}/pp`,
  'costBreakdown.bookYoursBadge':     ({ amount }: ThemeVars) => `✈️ book yours · ${amount ?? '—'}`,

  // CostBreakdown — Session 9O footer (subtle row replacing the pill stack).
  // Amount comes pre-formatted via formatMoney at the call site.
  'costBreakdown.footer.shared':      ({ amount }: ThemeVars) => `🏠 shared · ${amount ?? '—'}`,
  'costBreakdown.footer.yours':       ({ amount }: ThemeVars) => `✈️ yours · ${amount ?? '—'}`,

  // CostBreakdown — Session 9O eyebrow (top-right of hero block).
  // Renders "firming up" when any pending state exists (viewer arrival
  // unset, or lodging leading-vote-unlocked); "looking solid" otherwise.
  'costBreakdown.eyebrow.firmingUp':  'firming up',
  'costBreakdown.eyebrow.settled':    'looking solid',

  // FlightCard
  'flight.perPerson':    'per person',
  'flight.searchCta':    'Search flights \u2192',

  // Footer
  'footer.madeWith':     'Made with',
  'footer.brand':        'Rally!',
  'footer.ctaCreate':    'Plan your own trip \u2192',

  // OrganizerCard
  'organizer.chatIcon':  '\ud83d\udcac',

  // TransportCard
  'transport.days':      'days',
  'transport.total':     'total',
  'transport.checkCta':  'Check rates \u2192',

  // TransportCard + FlightCard (Session 9K) — compact-card sell surface.
  // Strings mirror builderState.transport.* for visual parity; separate
  // surface so sell can evolve independently. Cross-referenced against
  // rally-microcopy-lexicon-v0.md §5.29 (approved).
  'transport.typeLabel.flight':        'flight',
  'transport.typeLabel.train':         'train',
  'transport.typeLabel.rentalCarVan':  'rental car/van',
  'transport.typeLabel.charterVanBus': 'charter van/bus',
  'transport.typeLabel.charterBoat':   'charter boat',
  'transport.typeLabel.ferry':         'ferry',
  'transport.typeLabel.other':         'other',
  'transport.splitGroup':              'group split',
  'transport.splitIndividual':         'individual',

  // LockedPlan
  'cost.currencySymbol': '$',

  // Session 9D — countdown scoreboard unit labels (structural, phase-agnostic).
  'scoreboard.units.days':    'days',
  'scoreboard.units.hours':   'hrs',
  'scoreboard.units.minutes': 'min',
  'scoreboard.units.seconds': 'sec',
};
