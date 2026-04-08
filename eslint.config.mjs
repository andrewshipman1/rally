import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import react from "eslint-plugin-react";

// Chassis glyphs + structural text fragments that legitimately live in
// JSX literals because they're part of the design system, not translatable
// content. Updated when a new chassis glyph lands.
const ALLOWED_GLYPHS = [
  "rally",
  "!",
  "★",
  "↗",
  "↑",
  "→",
  "←",
  "·",
  "—",
  "🙌",
  "🧗",
  "📬",
  "🗝️ the spot",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { react },
    // No JSX text literals — all user-facing strings must come from
    // src/lib/copy/. New surfaces in Session 1 (auth, trip page chassis,
    // chassis components) honor this strictly. Legacy v0 surfaces still
    // contain inline strings; the rule fires as a WARNING there, with
    // TODO(session-N) markers showing when each surface ships its sweep.
    rules: {
      "react/jsx-no-literals": [
        "warn",
        {
          noStrings: false,
          ignoreProps: true,
          allowedStrings: ALLOWED_GLYPHS,
          // Allow whitespace inside JSX (newlines, indents, etc.)
          noAttributeStrings: false,
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
