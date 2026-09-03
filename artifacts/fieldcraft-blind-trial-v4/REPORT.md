# Fieldcraft FDE blind-build candidate v4

## Delivery

- Candidate identifier: `sha256:82305033b2c1bd5880148afd6b556035d8bd8f199245f6467afeace67bd27993` for `dist/index.html`.
- Candidate route: `/` from the self-contained local static build in `dist/`; the candidate-local HTTP check serves this route on an ephemeral loopback port.
- Delivery mode: local static artifact. No deployment, preview publication, remote request, or repository-source modification was performed.
- Repository root recorded before implementation: `repository root`.
- Authorized write scope: `artifacts/fieldcraft-blind-trial-v4` only. Existing root work was inventoried and preserved.
- Candidate runtime: self-contained HTML, CSS, and browser JavaScript. Candidate-local package commands use npm and no package installation or network request.
- Manifest path: `artifacts/fieldcraft-blind-trial-v4/artifacts/agent-runs/default-019ffe57-3991-7e40-b272-e9f9dff33357/manifest.json`.

## Implemented scope

The candidate implements a 20-section fixed-body deck with a `100dvh` scroll owner, snapping responsive mode, fixed header and pager, conditional lower-left rail, persistent opening-stage layer, five-card shared modal, timed deployment run, final-month pager state that replaces the focused fourth week with a complete-month grid, reduced-motion handling, local placeholder favicon, and no external assets.

Every named scene and modal region from the supplied internal-region contract is exposed through stable `data-scene-region` wrappers. The five modal identifiers are `modal-backdrop`, `modal-panel`, `modal-tag`, `modal-title`, `modal-punch`, `modal-bullets`, `modal-closing-label`, `modal-closing`, and `modal-close`. Explicit parent containment is marked only for the stage internals, audit artifact, evaluation header, and modal shell.

`app.js` includes `window.__fieldcraftValidateScene`, a browser-side measurement hook that waits for fonts and records active scene, heading bounds and line boxes, declared collision-pair areas, horizontal overflow, hidden-layer hit-test state, and fixed shell bounds. It is supplied for a permitted renderer, not represented as executed evidence.

## Candidate-local validation

- Command: `npm run build` -> pass (`dist/` was regenerated with non-empty local candidate files).
- Command: `npm run validate:structure` -> pass (20 ordered scenes; exact semantic inventory; all declared region wrappers; four `role="img"` elements; local assets; no anchors/forms/remote URLs; browser validator present).
- Command: `npm run validate:syntax` -> pass (`node --check` for `app.js`, `build.mjs`, and `validation.mjs`).
- Command: `npm run validate:http` -> pass (the candidate-local loopback server returned HTTP 200 and non-empty bodies for `/`, `/styles.css`, `/app.js`, `/favicon.svg`, and `/favicon.ico`).
- Command: `browser-rendered candidate validation` -> blocked (the current managed Chromium route is not authorized for a direct launch against this mutable local artifact and no approved CDP endpoint was admitted. The browser-side hook remains unexecuted; no browser workaround, browser-tab inspection, or deployment was used).

The passing checks prove source/build integrity, local semantic inventory, region-marker completeness, JavaScript syntax, and local HTTP availability. They do not prove browser-rendered geometry, collision-free layout, focus operation, timer behaviour, responsive rendering, console/request cleanliness, or visual comparison.

## Acceptance state

Passed locally: candidate creation in the requested scope; all 20 ordered scenes; supplied static copy and semantics inventory; declared region and modal identifiers; local icon/favicons; candidate-local build, structure, syntax, and HTTP checks.

Remaining/blocked: browser-rendered measurement and state matrix; rendered collision, clipping, focus, reduced-motion, and responsive checks; protected-reference visual-difference evaluation. The last category is intentionally evaluator-owned and cannot be performed inside this clean-room task.

## Deliberate design choices where the brief left freedom

- Used thin inline SVG traces and square one-pixel diagram surfaces, avoiding image assets, gradients, stock photography, shadowed cards, and app chrome.
- Kept the fixed brand slot as a 26px navy/light local `V` SVG and used the same local artwork for the favicon route.
- Chose a single, dependency-free static candidate package so its output, HTTP probe, and source validators stay inside the requested artifact directory.
- Treated the supplied semantic inventory’s exact H2 count as controlling: the final section contains the final-week H2 plus the specified closing H2, while the hero remains the sole H1.

## Clean-room declaration and claims boundary

Only the four task-authorized Fieldcraft documents, the repository-local `CODESTYLE.md`, and generic local tooling were read for this delivery. No Fieldcraft reference bundle, evaluator script, replication/forensic specification, screenshot, hash, manifest, deployed/historical URL, browser tab, earlier candidate/evaluation artifact, review, or internet search was accessed. All writes are confined to this candidate artifact directory.

Implemented and locally verified from the blind-build brief; independent visual evaluation remains.
