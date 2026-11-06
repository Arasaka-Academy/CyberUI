# CyberUI Tailwind migration implementation plan

**Goal:** Adopt Tailwind v4 across the component library, documentation and all application scenes while preserving CyberUI's appearance and public React APIs.

**Architecture:** Share one prefixed, token-backed Tailwind theme. Author common component and page styles with Tailwind utilities and `@apply`; retain CSS Modules for semantic/state selectors, shared style ownership and precise geometric artwork. Combine shared classes through direct module imports and `cx`, because Vite's Tailwind pre-plugin does not recompile CSS Modules `composes` dependencies. Place defaults in the `components` cascade layer so application utilities can override them. Omit Preflight to preserve the existing scoped baseline.

**Tech stack:** React 19, Tailwind 4.3.4, Vite 7, CSS Modules, PostCSS, Stylelint, Playwright, Vitest.

**Authorization:** The user's request to migrate the whole project supersedes the earlier ORBIT-only pilot boundary. Work proceeds sequentially in this checkout; no commit, push or publication is requested.

## Constraints

- Keep existing component APIs, tokens, seven dark/light schemes, Chinese/English, accessibility and responsive behavior.
- Package consumers receive compiled CSS and require no Tailwind build plugin.
- Registry source consumers explicitly configure Tailwind v4 with Vite or PostCSS/Next.js. Document and test this changed source-authoring requirement.
- Use `tw:` consistently, resolve semantic tokens at the consuming element, and preserve exact container breakpoints.
- Preserve earlier pilot changes and evidence. Record the new migration separately under `artifacts/tailwind/`.
- Do not change geometry, artwork, animation behavior or product content to accommodate the framework.

## Task 1: Characterize and establish shared compilation

- [x] Save a temporary source snapshot and production/browser baselines.
- [x] Add a failing regression for utility overrides of component defaults.
- [x] Configure Tailwind in library/docs builds and export a reusable token theme.
- [x] Replace the ORBIT-only entry with a shared documentation entry.

## Task 2: Migrate component and page styles

- [x] Migrate all component modules and docs CSS through explicit property mappings; retain exact values and declaration order.
- [x] Put scoped baseline, component defaults and application utilities in the appropriate layers.
- [x] Check compiled declarations against the source snapshot, including shorthands, important declarations and CSS Modules composition.
- [x] Tighten style checks for the new authoring convention and shared references.

## Task 3: Deliver source and package integrations

- [x] Follow CSS `@reference` dependencies in the Registry and declare its Tailwind compiler dependency.
- [x] Configure independent Vite and Next.js consumers with real Tailwind builds.
- [x] Test consumer utilities, runtime theme overrides, focus/Escape, all 65 examples, and the packed package without Tailwind.
- [x] Regenerate Registry sources and update installation guidance in both languages.

## Task 4: Validate and measure

- [x] Run typecheck, lint, unit tests, production builds and full browser regressions.
- [x] Compare component/page screenshots and geometry to the new baseline; inspect differences.
- [x] Record CSS raw/gzip sizes and repeated build times without claiming a speedup from overlapping timings.
- [x] Document final authoring conventions, migration scope, compatibility and validation limits.

## Task 5: Review and finish

- [x] Review sequentially for correctness, maintainability, cascade, source delivery and accessibility.
- [x] Close task-owned servers, verify Registry freshness and `git diff --check`, and mark the todo complete.
- [x] Report concrete results and any remaining limitations; leave changes uncommitted.

## Results

45 unit tests and all 68 Chromium browser tests pass, together with types, lint, production builds and independent packed/Vite/Next.js consumers. The 89-record computed-style baseline and 32 screenshots show no differences in default Neon dark. Three build measurements and final CSS size checks are recorded under `artifacts/tailwind/`; see `docs/styles.md` for costs and compatibility boundaries. The sequential review has no unresolved findings. No commit, push or publication was requested.
