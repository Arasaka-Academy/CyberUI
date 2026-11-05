---
status: complete
priority: p1
issue_id: "002"
tags: [frontend, scenes, accessibility]
dependencies: []
---

# Three independent Web application scenes

## Problem Statement
Add the approved ORBIT project dashboard, PULSE AI product homepage, and NOVA Agent chat demo to the scene gallery, with embedded and standalone previews.

## Findings
The existing 27 scenes share a reader canvas and reference-image controls. New scenes need a Web renderer and independent persistent state while retaining all reader reference mappings.

## Proposed Solutions
Implement the approved plan using public CyberUI components, CSS Modules, deterministic local models, and the existing theme/locale providers.

## Recommended Action
Deliver three complete interactive scenes, dynamic scene discovery/counts, separate storage/reset behavior, responsive and accessible previews, and current validation evidence.

## Acceptance Criteria
- [x] Scene registry distinguishes reader/Web renderers; all 30 scenes remain reachable.
- [x] ORBIT CRUD, filters, board/list, derived metrics, persistence and reset work.
- [x] PULSE previews, billing, navigation, validated trial flow and mobile menu work.
- [x] NOVA sessions, drafts, streaming, tools, artifacts, cancellation and retry work.
- [x] Embedded/standalone layouts, both locales, all palettes, keyboard and accessibility checks pass.
- [x] Typecheck, lint, unit/browser tests, build and packaged consumer pass; docs and screenshots updated.

## Work Log
### 2026-11-05
- Approved implementation plan supplied by the user. Clean main checkout; work isolated on codex/web-application-scenes.
- UI guidance: preserve the existing CyberUI master tokens; use project/task hierarchy, local action feedback, effect cleanup, container-based layouts and reduced motion.
- Added three independent Web scenes, both preview routes, registry-based counts and search entries. Reader references and 65 public component exports remain available.
- Added separate Web demo persistence, scoped resets, deterministic samples, storage recovery, cancellable generation and safe text rendering.
- Verified typecheck, lint, 28 unit tests, 39 production browser tests, production builds and an independent packaged React consumer with all 65 examples.
- Reviewed desktop/mobile screenshots. Fixed screenshot readiness checks and regenerated the complete gallery and product captures.
- Confirmed 329 automated accessibility scans with zero violations and 99 narrow-page layout checks without horizontal overflow. Documented automated-test boundaries in docs/validation.md.
- Updated README, design guidance, scene documentation and validation evidence. No public deployment performed.
- User requested committing the completed feature, merging it into main and pushing to origin.
