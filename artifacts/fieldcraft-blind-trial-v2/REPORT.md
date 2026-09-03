# Fieldcraft FDE Blind-Build Trial v2 Report

## Outcome

Implemented the complete local evaluation candidate at
`artifacts/fieldcraft-blind-trial-v2` from the
two authorized blind-build specification documents. The candidate contains 20
ordered full-viewport chapters, fixed navigation, a persistent sections 1–3
stage, five-card shared modal, timed deployment run, Audit/Evals/Deployment
artifacts, and the transforming four-week roadmap with a distinct final
complete-month state. It was not deployed.

Candidate artifact identifier: `fieldcraft-blind-trial-v2-local-2026-08-13`.

## Execution contract

- Repository root: `repository root`.
- Authorized candidate write scope: `artifacts/fieldcraft-blind-trial-v2`.
- Existing repository routes and user-owned changes: not inspected or modified; the task's isolation boundary made the candidate a self-contained static route.
- Framework: dependency-free HTML, CSS, and JavaScript static presentation.
- Package manager: npm command runner; no dependency installation and no lockfile required.
- Development command: `npm run dev` (Python static server on port 4173).
- Build command: `npm run build`.
- Focused test command: `npm test`.
- Candidate route: `http://127.0.0.1:4173/` when served from `dist/`.
- Build artifact: `artifacts/fieldcraft-blind-trial-v2/dist`.
- Delivery mode: local evaluation candidate only; no deployment.

## Validation evidence

- Command: `npm test` -> pass (22 structural assertions: exactly 20 sections, required headings/buttons/SVG/role/dialog counts, no anchors/forms, desktop hero fit/wrap guard, compact-height hero placement guard, mobile wrap reset, local favicon/icon, navigation controller, reduced motion, language, and title).
- Command: `npm run build` -> pass (static artifact created in `dist/`).
- Command: `node --check script.js && node --check scripts/browser-validate.mjs && node --check scripts/validate.mjs && node --check scripts/build.mjs` -> pass (all candidate JavaScript parsed successfully).
- Command: `python3 -m http.server 4173 --directory dist` -> pass (local candidate server started).
- Command: `node -e "Promise.all(['/','/favicon.ico','/placeholder-icon.svg'].map(async p=>{const r=await fetch('http://127.0.0.1:4173'+p);console.log(p,r.status,r.headers.get('content-type'));if(!r.ok)process.exitCode=1}))"` -> pass (`/` 200 `text/html`; `/favicon.ico` 200 `image/x-icon`; `/placeholder-icon.svg` 200 `image/svg+xml`).
- Command: `node scripts/browser-validate.mjs` -> blocked (managed Chromium could not create a page: `MachPortRendezvousServer... Permission denied (1100)`).
- Command: `node scripts/browser-validate.mjs` with host escalation -> blocked (approval policy rejected an unapproved no-sandbox browser route). The browser validator remains in the candidate for an approved runtime owner to execute.

The static and HTTP evidence proves the candidate structure, build output,
required local asset availability, favicon response, and controller contract.
It does not prove rendered geometry or live interaction behavior across the five
declared viewports because browser launch was blocked before page creation.

## Acceptance status

Passed by structural/build/HTTP evidence:

- Exactly 20 ordered sections, one H1, 20 H2s, one modal H3, 15 buttons, 10 inline SVGs, four `role="img"` elements, one dialog, no anchors, and no forms.
- Complete supplied chapter, workflow, modal, evaluation, deployment, roadmap, and calendar copy is encoded in the candidate.
- Fixed shell, explicit section controller, chapter targets, pager, conditional rail, persistent stage, modal focus logic, deployment timers/reset, reduced-motion landed state, calendar transformations, and final two-state navigation are implemented.
- The 1280px hero uses an intentional break after `AI Forward Deployed`, a non-wrapping first-line span above 480px, and the specified 10.5vw computed desktop sizing rule. Following independent 1280 × 720 measurement, the first line is optically condensed to 89% of its fallback-font width so the measured 1235.77px run fits the 1100.81px H1 box without wrapping or clipping. At desktop widths with heights up to 720px, the hero starts from the section's 78px top padding and uses a measured 65.4px H1 margin after the eyebrow, targeting an H1 box y-position of approximately 158.8px. At 480px and below the transform resets so the brief's natural mobile wrapping remains available.
- The placeholder icon is local, uses the fixed 26 × 26 header slot, and is also served locally as `/favicon.ico` without a 404.
- The candidate contains no remote assets or network dependencies.

Remaining unproved because the managed browser could not launch:

- Live pointer/keyboard/wheel/native-scroll interaction execution.
- Computed 1280 × 720 hero geometry and screenshot inspection.
- Console/request cleanliness after JavaScript execution.
- Runtime overflow and focus-target reachability at all five declared viewports.

## Deliberate design decisions

- Used a dependency-free static implementation because the brief requires only one presentation route and supplies a complete visual/behavioral system; this avoids unrelated framework surface and remote dependencies.
- Used one-pixel open diagram fields and typographic rails instead of card-gallery or dashboard chrome.
- Constructed all narrative diagrams with HTML borders and the ten permitted inline SVG traces; no decorative imagery was introduced.
- Used the specified navy/white palette without gradients, textures, stock photography, icon libraries, or generic shadows.
- Represented the sections 1–3 persistent stage as a foundational-intelligence node, five company nodes, and an ROI target that transforms in place.
- Kept the desktop calendar behind roadmap copy and rendered the same exact day data inline below 960px.
- Kept source QA artifacts local to the candidate; no reference-comparison artifact was created.

## Measured hero regression repair

An independent in-app browser run at 1280 × 720 found that the structural
`nowrap` guard preserved two DOM lines but did not ensure that the first line
was visible. The H1 box measured 1100.81px wide while the fallback-font first
line measured 1235.77px and was clipped at the section edge. The H1 box also
landed at y=228.37 rather than near the brief's y=158.8 target.

The repair keeps the required computed `134.4px` font size and `131.712px` line
height, makes the first-line span an inline block, and applies
`scaleX(.89)` from its left edge. This makes the expected visible first-line
width approximately 1099.83px, within the 1100.81px H1 box. The compact-height
desktop hero now uses start alignment plus a 65.4px H1 top margin, derived from
the 78px section padding and eyebrow line box, to target y≈158.8. The browser
validator now explicitly fails if the first-line visible width exceeds the H1
width or if the H1 y-position differs from 158.8 by more than 2px.

This repair was validated structurally, built, and syntax-checked in the
candidate. A fresh independent in-app browser measurement remains the authority
for the post-repair rendered geometry because managed Chromium launch remains
blocked in this builder runtime.

## Clean-room declaration

Only the assigned blind-build agent prompt and blind-build brief were used as
Fieldcraft/Varick authority. No historical URL, deployed page, browser tab,
reference bundle, forensic artifact, screenshot, manifest, hash, archived
source, or prior candidate was accessed. The production icon was not sought or
approximated; the required local placeholder is used.

Implemented and locally verified from the blind-build brief; independent visual evaluation remains.
