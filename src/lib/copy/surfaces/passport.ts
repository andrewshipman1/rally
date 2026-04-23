// §5.15 — Profile / passport page.
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const passport: Record<string, Templated> = {
  // ─── Page chrome ────────────────────────────────────────────────
  'pageTitle':            'your passport',

  // ─── Profile head ───────────────────────────────────────────────
  'handlePlaceholder':    "what's your role in the group chat?",
  'estLine':              ({ year, n_countries }: ThemeVars) =>
    `est ${year ?? '?'} · ${n_countries ?? 0} ${Number(n_countries) === 1 ? 'country' : 'countries'} deep`,

  // ─── Stat strip ─────────────────────────────────────────────────
  'statTrips':            'trips done',
  'statRideOrDies':       'ride or dies',
  'statCountries':        'countries',

  // ─── Stamps section ─────────────────────────────────────────────
  'sectionStamps':        'your passport',
  'sectionStampsSub':     'every rally, stamped',
  'stampMeta':            ({ month, year, n_nights }: ThemeVars) => {
    const dateBit = month != null && year != null
      ? `${month} '${String(year).slice(-2)}`
      : null;
    const nightsBit = n_nights != null ? `${n_nights} nights` : null;
    return [dateBit, nightsBit].filter(Boolean).join(' · ');
  },
  'emptyStamps':          'first stamp is the hardest',
  'emptyStampsSub':       'start a rally or wait for a friend to call you up',

  // ─── Ride or dies section ───────────────────────────────────────
  'sectionRod':           'ride or dies',
  'sectionRodSub':        'the people who keep showing up',
  'rodCount':             ({ n }: ThemeVars) => `${n ?? '?'} ${Number(n) === 1 ? 'trip' : 'trips'}`,
  'emptyRod':             'no ride or dies yet',
  'emptyRodSub':          'one trip and this fills up',

  // ─── CTA ────────────────────────────────────────────────────────
  'ctaCreate':            'start a new one 🔥',
};
