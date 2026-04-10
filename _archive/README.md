# _archive/ — Deprecated files from the pre-redesign era

These files are kept for historical reference only. **Do not pass them to Claude Code.** The current source of truth lives in the parent Rally folder.

| File | Why it's archived |
|---|---|
| `claude-code-all-prompts.md` | Original 11-prompt greenfield kickoff. Superseded by `../claude-code-kickoff-v2.md`. Assumes a clean slate and the old design direction. |
| `claude-code-all-prompts copy.md` | Duplicate of the above. |
| `claude-code-master-prompt.md` | Partiful-inspired redesign prompt (12 features). Partially contradicts the QA fixes (localStorage auth vs. httpOnly cookies) and the new design system. Folded into `../claude-code-kickoff-v2.md`. |
| `claude-code-qa-fixes.md` | P0–P2 bug/security fix list from QA. The critical items (auth overhaul, Zod validation, URL allowlist, countdown hydration, reactive RSVP) are folded into `../claude-code-kickoff-v2.md`. |
| `rally-build-guide.md` | 26-step build guide from pre-redesign. Superseded by the phase HTML specs (`../rally-phase-*.html`) as the source of truth for structure. |
| `rally-sell-page.jsx` | Original visual target for the trip page. Superseded by `../rally-phase-2-theme-system.html` + the chassis kernel in phase 1. |
| `rally-starter.tar.gz` | Empty Next.js starter archive used during initial scaffolding. |
| `002_typed_components.sql` | Old typed-components migration. Should already be applied to Supabase; kept here for reference. Session 1 of the new kickoff will write fresh migrations to rename `maybe` → `holding` and add theme fields. |
| `types-index.ts` | Stale loose copy of `src/types/index.ts`. The canonical file is in `../src/types/`. |
| `rally-prd-v4 copy.docx` | Duplicate of `../rally-prd-v4.docx`. |
| `{supabase` | Malformed folder name (comma in name, tar extraction artifact). Contains a broken copy of the supabase + src dirs. The canonical copies are in `../supabase/` and `../src/`. |

**If you need to restore any of these to the working directory, just `mv` them back. Nothing is gone.**
