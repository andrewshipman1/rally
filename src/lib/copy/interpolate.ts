// render(): the single point where Templated values become strings.
//
// Two template forms per lexicon §5.22:
//   1. Function: (vars) => string                    — preferred for vars
//   2. Raw string with {token} placeholders          — fine for static or
//                                                      simple substitutions
//
// Unknown {tokens} are intentionally left visible (e.g. "{name}") so missing
// vars are loud in dev. Don't throw — UI shouldn't crash on a missing prop.

import type { Templated, ThemeVars } from '@/lib/themes/types';

export function render(t: Templated, vars: ThemeVars = {}): string {
  if (typeof t === 'function') return t(vars);
  return t.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const v = vars[key];
    return v != null ? String(v) : `{${key}}`;
  });
}
