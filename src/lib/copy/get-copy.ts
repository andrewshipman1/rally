// getCopy(): the single read API for every user-facing string.
//
// Path semantics: "<surface>.<key.with.dots>"
//   - surface       = first segment, matches a Lexicon top-level key
//   - key.with.dots = remainder, matches BOTH a flat key in
//                     lexicon[surface] AND a nested path in theme.strings
//
// Resolution order: theme override → lexicon default → path string fallback.
// All hits flow through render() so {token} substitution is uniform.

import { lexicon } from './index';
import { themesById } from '@/lib/themes';
import { render } from './interpolate';
import type { Templated, ThemeId, ThemeVars } from '@/lib/themes/types';

function splitPath(path: string): { surface: string; key: string } {
  const dot = path.indexOf('.');
  if (dot < 0) return { surface: path, key: '' };
  return { surface: path.slice(0, dot), key: path.slice(dot + 1) };
}

/** Walk a nested object by dotted key. Returns undefined on miss. */
function readNested(obj: unknown, dottedKey: string): unknown {
  if (!dottedKey) return undefined;
  const parts = dottedKey.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function isTemplated(v: unknown): v is Templated {
  return typeof v === 'string' || typeof v === 'function';
}

/**
 * Resolve a copy key for a given theme. Theme strings override lexicon
 * defaults; both run through render() for {token} substitution.
 */
export function getCopy(themeId: ThemeId, path: string, vars: ThemeVars = {}): string {
  const { surface, key } = splitPath(path);

  // 1. Theme override (nested walk; surface segment is dropped because
  //    theme.strings is shaped per-theme, not per-surface).
  const theme = themesById[themeId];
  if (theme) {
    const fromTheme = readNested(theme.strings, key);
    if (isTemplated(fromTheme)) return render(fromTheme, vars);
  }

  // 2. Lexicon default (flat record lookup on the surface).
  const surfaceMap = (lexicon as unknown as Record<string, Record<string, Templated>>)[surface];
  if (surfaceMap) {
    const fromLex = surfaceMap[key];
    if (isTemplated(fromLex)) return render(fromLex, vars);
  }

  // 3. Last-ditch fallback so the UI never crashes on a missing key.
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[copy] missing key: ${path} for theme ${themeId}`);
  }
  return path;
}
