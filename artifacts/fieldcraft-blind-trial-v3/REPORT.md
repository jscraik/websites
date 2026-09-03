# Fieldcraft FDE blind-build candidate v3

## Candidate

- Candidate artifact: `artifacts/fieldcraft-blind-trial-v3/dist/index.html`
- Candidate root: `artifacts/fieldcraft-blind-trial-v3`
- Candidate identifier: `sha256:449d04ddde46c5502d17db093be2a0696a7a6f829fac6c8898404e27f4693504`
- Runtime report: `artifacts/fieldcraft-blind-trial-v3/test-results/runtime-report.json`
- Implemented route: `/`
- Delivery mode: local artifact only
- Deployment: not performed and not authorized

The candidate is a self-contained static web presentation inside the assigned repository artifact scope. Its candidate-local Node build copies `src/` to `dist/`; its local server exposes the canonical candidate route at `/`. It does not load network fonts, remote images, icon packages, application data, or other remote assets.

## Repository execution contract

- Repository root: `repository root`
- Authorized implementation write scope: `artifacts/fieldcraft-blind-trial-v3`
- Repository framework and package manager: Astro 7.2.1, npm, `package-lock.json`
- Repository canonical commands discovered before implementation: `npm run dev`, `npm run build`, `npm run check`, `npm run test:smoke`
- Candidate-local canonical commands: `npm run dev`, `npm run build`, `npm run test:structure`, `npm run test:http`, `npm run test:runtime`
- Candidate build output: `artifacts/fieldcraft-blind-trial-v3/dist`

The pre-existing dirty repository state was preserved. I did not edit, stage, reset, clean, stash, move, or inspect unrelated modified/untracked source, previous blind-trial candidates, Fieldcraft reference material, evaluator code, or reviews.

## Implemented scope

The local candidate includes:

- Exactly 20 ordered `100dvh` scenes in a fixed-body, internally scrolling deck.
- The measured 1280 × 720 heading anchors, sizes, line heights, alignments, field colors, and explicit line compositions declared by the measured scene contract.
- A fixed adaptive header with six chapter targets, a replaceable 26 × 26 local placeholder icon, a local SVG favicon, and a successful `/favicon.ico` fallback.
- A fixed square pager, final-section complete-month state, backward-from-complete behavior, and conditional Audit/Evals/Deployment rail.
- A persistent non-interactive opening-stage diagram that transforms across scenes 1–3.
- Five connected workflow-card buttons and one shared modal with exact supplied content, Close/Escape handling, initial Close focus, focus restoration, and deck-navigation blocking.
- The timed deployment sequence, approval pause, approval/posting/posted states, cancellation on exit, reset and re-entry, and immediate reduced-motion landed state.
- One persistent four-week roadmap calendar layer, introduction/week-focus/complete-month states, exact day content, milestone and project-choice content, and responsive inline roadmap summaries.
- Desktop animated section navigation, wheel lock/retarget behavior, keyboard navigation, native mobile/tablet snap scrolling, responsive chapter dots, and reduced-motion overrides.
- Stable `data-scene-region` markers for collision-participating regions.
- Truthful runtime-maintained `data-state-hidden` markers whose hidden CSS sets visibility hidden, opacity zero, pointer events none, and removes hidden buttons from the focus order.
- One H1, 20 H2s, one H3, 15 buttons, 10 inline SVGs, four `role="img"` surfaces, one dialog, no anchors, and no forms.
- A candidate-local rendered validator that is designed to record all initial scenes and interaction states, measure actual heading bounds and line rectangles after fonts are ready, test clipping/overflow/collision/fixed-shell clearance, verify hidden-state behavior, and capture console/request/page errors.

## Design decisions made within the brief’s open areas

- Used monochromatic CSS and inline-SVG line diagrams rather than adding illustrative assets; this is the smallest choice consistent with the stated editorial/technical system.
- Used a single fixed opening SVG with stateful opacity/translation/ROI retargeting so scenes 1–3 visibly transform without remounting.
- Modeled the audit as three open columns with the operating-map artifact embedded in the right column, rather than enclosing each process in a card.
- Modeled automation as one root with three visible branches, deployment as inputs → sandbox → production architecture, and the ownership scene as a single loop.
- Implemented the desktop calendar as one oversized four-column layer scaled and translated through week focus states. At 960px and below the fixed layer is removed and required roadmap content remains within the sections.
- Kept the deployment demonstration diagrammatic and log-led, with no invented application chrome.
- Used the authorized navy/light `V` placeholder for both header and favicon. No attempt was made to recover or approximate a production icon.
- Retained the brief’s 38px pager controls and 5px chapter dots; these are known sub-44px accessibility deviations explicitly required for this blind exercise.

## Validation evidence

- Command: `npm run build` (cwd: `artifacts/fieldcraft-blind-trial-v3`) -> pass (rebuilt the self-contained candidate into `dist/`).
- Command: `node --check src/app.js` (cwd: `artifacts/fieldcraft-blind-trial-v3`) -> pass (candidate interaction controller parses successfully).
- Command: `node --check scripts/test-runtime.mjs` (cwd: `artifacts/fieldcraft-blind-trial-v3`) -> pass (candidate-local rendered validator parses successfully).
- Command: `npm run test:structure` (cwd: `artifacts/fieldcraft-blind-trial-v3`) -> pass (20 scenes and the required semantic/SVG/button/dialog/marker inventory passed against the final build).
- Command: `npm run test:http` (cwd: `artifacts/fieldcraft-blind-trial-v3`) -> pass (`/`, `/style.css`, `/app.js`, and `/favicon.ico` returned the expected local HTTP responses).
- Command: `shasum -a 256 dist/index.html dist/style.css dist/app.js dist/favicon.svg dist/favicon.ico` (cwd: `artifacts/fieldcraft-blind-trial-v3`) -> pass (recorded final bundle component hashes; the core-bundle candidate identifier is recorded above).
- Command: `npm run test:runtime` (cwd: `artifacts/fieldcraft-blind-trial-v3`) -> blocked (managed Chromium could not start: `Check failed: kr == KERN_SUCCESS. bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer.35273: Permission denied (1100)`). The complete blocker is preserved in `test-results/runtime-report.json`. No browser sandbox bypass, host execution, external browser profile, or prohibited open tab was used.
- Command: `npm test` (cwd: `artifacts/fieldcraft-blind-trial-v3`) -> fail (build and structural checks passed, then the earlier rendered run stopped on a heading-clipping assertion; the validator’s clipping predicate was corrected to distinguish visible overflow from actual clipping, but a current post-correction browser run is blocked by the Mach-port denial above).

## Acceptance and remaining failures

Passed locally:

- The final build exists and the candidate route, CSS, JavaScript, and favicon fallback serve successfully.
- The complete 20-section source/content/semantic inventory and marker contract pass candidate-local structural validation.
- The interaction and state controllers parse successfully and are included in the final build.
- The candidate contains no remote runtime dependency and was not deployed.

Remaining/blocked:

- Current candidate-bound browser proof for heading geometry, rendered line boxes, clipping, scene/region collisions, shell clearance, focus/state transitions, timed deployment behavior, all responsive viewports, and runtime console/request cleanliness is blocked by managed Chromium startup. These must not be treated as passed from source-level or HTTP checks.
- The evaluator-owned reference screenshot/diff matrix was intentionally not run and remains the responsibility of the independent evaluator.
- No claim of pixel parity, source identity, hosted readiness, CI state, review state, or deployment state is made.

## Clean-room declaration

I used only the following Fieldcraft authority documents:

1. `docs/specifications/fieldcraft-fde-blind-build-agent-prompt.md`
2. `docs/specifications/fieldcraft-fde-blind-build-brief.md`
3. `docs/specifications/fieldcraft-fde-measured-scene-contract.md`

I also read discovered repository instructions, `CODESTYLE.md`, the directly relevant generic codestyle modules, `package.json`, and repository status for tooling and preservation boundaries. I did not open, fetch, inspect, search for, or derive details from any Fieldcraft reference bundle, forensic/replication specification, protected screenshot, manifest, hash, deployed/historical URL, browser tab, evaluator script, prior candidate, prior-candidate review, Fieldcraft production implementation, or Varick production implementation. I did not use the internet to identify Fieldcraft or Varick.

## Claims boundary

Implemented and locally verified from the blind-build brief; independent visual evaluation remains.

The stronger claim remains intentionally unavailable: browser-rendered behavior and visual correspondence have not been proven for this final artifact because the rendered validation lane is blocked, and the blind builder has not accessed the withheld visual oracle.
