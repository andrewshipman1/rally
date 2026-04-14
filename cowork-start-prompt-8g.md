# Cowork Start Prompt — Session 8G

Paste this into a new Cowork session:

---

We're working on Rally. Read `CLAUDE.md` first, which will point you to the session guard skill.

We're at **Step 2 → Step 3** in the session loop. Claude Code needs to execute the **Session 8G brief** in `rally-fix-plan-v1.md`. The brief is written and ready.

**Quick context:**
- Session 8F built collapsible sections + bottom drawers for crew and lodging
- QA found 2 bugs. Bug 1 (lodging section border) was fixed in the last Cowork session (CSS only in `globals.css`). Bug 2 (URL auto-enrich broken in drawer) is the only thing in the 8G brief.
- The 8G brief is scoped to one bug: pasting a URL into the lodging add form inside the BottomDrawer doesn't trigger OG enrichment. It worked when the form was inline. Now that it renders inside a `createPortal`, enrichment doesn't fire.

**What to do:** Hand the 8G brief to Claude Code. When CC finishes, share the release notes here and we'll QA.
