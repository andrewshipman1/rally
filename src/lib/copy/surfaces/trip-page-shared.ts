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
  'transport.h2':        'getting around',
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

  // LockedPlan
  'cost.currencySymbol': '$',

  // Session 9D — countdown scoreboard unit labels (structural, phase-agnostic).
  'scoreboard.units.days':    'days',
  'scoreboard.units.hours':   'hrs',
  'scoreboard.units.minutes': 'min',
  'scoreboard.units.seconds': 'sec',
};
