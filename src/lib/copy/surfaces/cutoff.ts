// §5.19 — Cutoff date (required-to-lock).
import type { Templated, ThemeVars } from '@/lib/themes/types';

export const cutoff: Record<string, Templated> = {
  'fieldLabel':              'decide by',
  'fieldPlaceholder.sketch': 'pick a deadline (required to lock)',
  'fieldPlaceholder.sell':   'pick a deadline',
  'helper':                  'after this, the door closes. pick honestly.',

  'display':                 ({ date, days }: ThemeVars) => `decide by ${date ?? '?'} · ${days ?? 0} days left`,

  'banner.t7':               'one week to lock this in.',
  'banner.t3':               "72h. who's coming?",
  'banner.t0':               ({ n_hold }: ThemeVars) => `today's the day. ${n_hold ?? 0} still holding.`,
  'banner.passed':           ({ n_in }: ThemeVars) => `time's up. locking with the ${n_in ?? 0} yes's.`,

  'lockValidationError':     "can't lock without a cutoff date.",
};
