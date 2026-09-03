# Fieldcraft FDE Blind-Build Candidate Report

## Candidate

- Artifact: `artifacts/fieldcraft-blind-trial/index.html`
- Artifact identifier: `sha256:f530032eb186b94e658f7d5189fd0312cad5a1305b245132020a4158ebe16a5c`
- Implemented route: `/` when `artifacts/fieldcraft-blind-trial` is served as the static root
- Delivery mode: local evaluation candidate
- Framework: dependency-free static HTML, CSS, and JavaScript
- Package manager / lockfile: none inside the isolated candidate
- Build output: `index.html` itself; there is no generated or transformed output
- Publication: not attempted or authorized

## Execution boundary

- Repository root: `repository root`
- Authorized candidate write scope: `artifacts/fieldcraft-blind-trial`
- Candidate files: `index.html`, `validate.mjs`, and this report
- Existing repository routes and user-owned work were not modified. The candidate is a new untracked directory.
- Only `docs/specifications/fieldcraft-fde-blind-build-agent-prompt.md` and `docs/specifications/fieldcraft-fde-blind-build-brief.md` were used as Fieldcraft implementation inputs. No reference bundle, forensic specification, screenshot, manifest, prior candidate, URL, browser tab, deployed page, historical implementation, or network asset was accessed.

## Implemented experience

The candidate implements the complete ordered 20-section presentation and its local shell:

- Fixed Varick Agents lockup with the declared 26 × 26 local placeholder `V` icon, six chapter controls, adaptive dark-state ink, two-button pager, and the conditional Audit/Evals/Deployment rail.
- Fixed-body, internally scrolling `100dvh` deck with full-height sections, mandatory snap behavior, desktop animated navigation, mobile native scrolling, keyboard controls, wheel locking, chapter destinations, and explicit current-section state.
- One H1, 20 section H2 elements, one modal H3, 15 buttons, 10 inline SVG elements, four `role="img"` elements, one dialog, and no anchors or forms.
- Persistent sections 1–3 stage that changes layout without remounting, commercial/technical judgment scene, five-card workflow investigation, shared focus-managed modal, AI-native workflow, timed deployment run with approval/reset/cancellation behavior, audit map, automation decision tree, eval report, deployment architecture, continuous loop, four-week calendar, and the final focused/complete-month two-state navigation.
- Responsive rules at 1340, 1080, 960, 820, 720, and 390px; reduced-motion overrides; square panels; declared tokens and local font fallback; no gradients, photography, icon library, texture, remote asset, or generic card rounding.

## Validation evidence

- Command: `node --check artifacts/fieldcraft-blind-trial/validate.mjs` -> pass (candidate validator parses)
- Command: `node artifacts/fieldcraft-blind-trial/validate.mjs` -> pass (22/22 structural contract checks: metadata, ordered sections, exact semantic counts, placeholder, local-only assets, tokens, breakpoints, reduced motion, chapter destinations, and unique IDs)
- Command: `node -e "const s=require('fs').readFileSync('artifacts/fieldcraft-blind-trial/index.html','utf8'); const js=s.match(/<script>([\\s\\S]*)<\\/script>/)[1]; new Function(js); console.log('PASS inline JavaScript parses')"` -> pass (`PASS inline JavaScript parses`)
- Command: `python3 -m http.server 8765 --directory artifacts/fieldcraft-blind-trial` -> pass (local static server started; stopped after the route check)
- Command: `node -e "fetch('http://127.0.0.1:8765/').then(async r=>{const t=await r.text(); if(!r.ok||!t.includes('Varick — Forward Deployed Engineering')) throw new Error('candidate route failed'); console.log('PASS GET /',r.status,t.length,'bytes')})"` -> pass (`PASS GET / 200 45264 bytes`)
- Command: `shasum -a 256 artifacts/fieldcraft-blind-trial/index.html` -> pass (`f530032eb186b94e658f7d5189fd0312cad5a1305b245132020a4158ebe16a5c`)
- Command: `git status --short -- artifacts/fieldcraft-blind-trial` -> pass (`?? artifacts/fieldcraft-blind-trial/`; confirms the delivery is isolated and untracked)

This evidence proves the candidate route is self-contained, serves successfully, has parseable JavaScript, and meets the encoded structural contract. It does not independently prove rendered geometry, interaction timing under a real browser event loop, focus restoration, console/request cleanliness, or viewport overflow at every declared size.

## Acceptance status

Passed by local structural/runtime evidence:

- The isolated candidate route responds successfully.
- Exactly 20 ordered sections and all required initial semantic counts are present.
- Fixed shell, stage, modal, run, artifact scenes, calendar data, navigation state, responsive branches, and reduced-motion branches are implemented.
- The icon is the declared local placeholder and has no remote dependency.
- The source contains no remote assets, anchors, forms, duplicate IDs, or JavaScript syntax errors.
- The candidate stayed within the clean-room Fieldcraft input boundary.

Implemented but not independently browser-rendered in this trial:

- Pixel geometry and horizontal-overflow behavior at 360 × 800, 390 × 844, 820 × 1180, 1280 × 720, and 1440 × 900.
- Pointer, keyboard, wheel momentum, rapid retargeting, modal focus return, deployment timing/reset/re-entry, and final-state backward behavior under a real browser.
- Uncaught runtime errors, authored console warnings, failed requests, observer cleanup, and duplicate timer behavior during extended interaction.
- Full exact-copy exhaustiveness against an automated extraction oracle. All supplied section, workflow modal, deployment log, and 30-day calendar content was implemented, but the validator does not line-by-line compare the brief.

Known compact-control accessibility deviations, explicitly retained for this exercise: the chapter dots and 38px pager controls remain below 44px.

## Open visual decisions

Where the brief deliberately left composition open, the candidate uses these smallest consistent choices:

- Technical diagrams use one-pixel inline SVG lines and simple square nodes, with no illustrative embellishment.
- The persistent capability stage is a right-side fixed field whose company nodes flatten and then recede as ROI becomes dominant.
- Audit, eval, and deployment sections use native document-like rows, tables, and architecture blocks instead of simulated application chrome.
- Roadmap detail lives in a fixed four-column calendar at desktop sizes and returns to section-contained copy below 960px.
- Entrance motion is limited to opacity/vertical translation; the deployment document uses one restrained vertical flight.
- The final complete-month state replaces the week-four foreground copy in place while retaining the calendar, rather than adding an overlay.

## Claim

Implemented and locally verified from the blind-build brief; independent visual evaluation remains.

Implemented and locally verified from the blind-build brief without access to the source or rendered reference; independent visual evaluation remains.
