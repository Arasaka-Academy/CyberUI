---
status: complete
priority: p1
issue_id: "003"
tags: [components, registry, documentation]
dependencies: []
---

# GitHub component source distribution

## Problem Statement
Allow consumers to own and edit individual CyberUI components without publishing CyberUI packages to npm.

## Findings
The clean main branch has 65 catalogue components grouped in eight source modules and two CSS modules. shadcn 4.23.0 supports GitHub registries, custom file targets, and pinned refs.

## Proposed Solutions
Split the canonical components and styles; generate a tracked GitHub registry with complete per-item file closures and local imports; expose installation and manual-source documentation.

## Recommended Action
Implement the user-approved GitHub Registry plan sequentially on codex/github-component-registry. Preserve public package APIs and all existing interactions.

## Acceptance Criteria
- [x] All 65 components have independent source and styles.
- [x] Generated registry is self-contained, reproducible, and checked for drift.
- [x] Bilingual docs offer GitHub installation, source copying, and Vite/Next setup.
- [x] Independent Vite/Next builds, CLI installation and overwrite behavior pass.
- [x] Existing typecheck, lint, unit, browser and package-consumer checks pass.
- [x] GitHub installation is verified from a concrete commit when available.

## Work Log
- 2026-11-05: User approved implementation. Confirmed clean main and created the implementation branch.
- 2026-11-05: 65 entries pass the official registry validator; 31 unit tests and the complete 42-test browser suite pass. Packed-package consumer and standalone Vite source consumer pass. Next framework downloads are in progress.
- 2026-11-05: Standalone Vite and Next 16.4.5 pass all 65 examples, production builds, runtime rendering and interactions. Verified official Next/SWC tarballs were cached after download timeouts. Byte comparison exposed CLI Tailwind transformations; registry:file targets now preserve all 159 delivered files exactly, including SVG and whitespace. GitHub-ref validation follows the implementation push.
- 2026-11-05: Typecheck, lint, 31 unit tests, complete production browser suite (43 tests), workspace builds and original packed-package consumer all pass.
- 2026-11-05: GitHub Actions run 41994368802 passes real GitHub installation at 84742e5a210c991e5f82ad5bf9c842f096daabd9 in independent Vite/Next consumers. Retrieved and verified the original CI artifact; all 159 files match exactly. Docs pin this accepted SHA and the final production browser suite passes all 44 tests, including version selection. Mac CDN connectivity limitations are recorded separately from successful Linux acceptance.
