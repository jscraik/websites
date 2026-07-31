# Jose Parity Guardrail

## Feedback Signal

Human review caught that the topbar still did not match the Jose Ocando reference after the screenshot workflow passed. The same pass also exposed broader parity misses on blog, about, and fun-facts surfaces that were not protected by the original screenshot-only workflow.

## Operational Failure

The screenshot workflow produced contact sheets and pixel diffs, but it did not assert reference-critical geometry, typography, icon sizing, spacing, scrolled-header behavior, section backgrounds, or first-viewport structure. A passing command therefore proved that screenshots existed, not that the benchmark navigation and page structure matched.

## Failure Category

- weak validation
- lack of verification
- hidden assumptions
- stale-state risk

## Durable Improvement

The Jose/Jamie screenshot spec now measures reference and candidate pages for the `home-top`, `blog-top`, `about-top`, and `about-fun-facts` captures. It writes metrics artifacts under `SCREENSHOT_OUTPUT_DIR/metrics/` and fails when candidate values drift outside explicit tolerances for:

- nav x/y/width/height
- nav horizontal padding
- item x/y/width/height
- item font size
- item font weight
- item letter spacing
- blog lead-article heading position, width, font size, and font weight
- about sidebar and portrait position/size
- fun-facts heading geometry
- fun-facts media-card column geometry
- deep-link header scroll behavior
- sampled page/background color

Transparent hit targets are resolved through their ancestor background layers before color metrics are recorded, so an unpainted element cannot become a false black sample. Page-surface colors remain part of Jose palette parity. Jamie's `var(--paper)` token must map to the stored neutral-03 value `#D5D6D0`, enforced by `npm run validate:page-surfaces`.

The second parity hardening pass extends the same guardrail to downstream sections and effects:

- about skills section heading and repeated block geometry
- about work-history section heading and full-width row geometry
- about on-the-web section heading and table-row geometry
- per-capture pixel mismatch ratios for the benchmark/candidate diff output
- topbar and link/button transition duration and easing class
- viewport-specific Playwright project routing so desktop and mobile workers do not race while writing the same artifact names
- downstream hash-section top-band contamination, so previous-section text cannot remain visible above the target section
- about on-the-web bottom-band contamination, so the footer cannot intrude into the comparable section viewport

For `about-fun-facts`, identity-content regions are masked before pixel comparison because the people, titles, labels, and imagery are expected to differ. Their region count and x/y/width/height geometry remain independently measured, and the existing mismatch-ratio budgets are unchanged.

The downstream block detector is scoped to the target heading's containing section/root. That prevents a shorter candidate section from leaking visible blocks from the previous section into the metric comparison.

The named command is:

```sh
REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity
```

## Future Behavior Change

Agents cannot treat `screenshots:site` or `test:jose-parity` as visual parity proof when the topbar, blog first viewport, about sidebar/portrait, fun-facts card grid, downstream about-section geometry, direct deep-link scroll state, hash-section top band, on-the-web footer boundary, sampled background color, calibrated pixel-diff ratio, or topbar/link transition timing is materially different. The test now fails with assertion-shaped deltas that identify the exact measurement drift to repair.

## Repeated Steering Recovery - Page Surfaces

Human review repeatedly caught grey section bands and oversized gaps after build-only closeouts. The root operational failure was weak validation plus stale rendered-state assumptions: npm run build proved compilation, while the Playwright/CDP parity lane was blocked by local Chromium launch permissions and no deterministic fallback checked the CSS surface invariant.

The durable correction is npm run validate:page-surfaces. It fails when the shared stylesheet reintroduces the Jose grey surface token, the hidden 100vmax full-bleed band pattern, or removes required var(--paper) background rules for Jamie page surfaces. This is intentionally narrower than visual parity: it protects the specific repeated regression that human steering had to catch.

Future page-layout work must run this gate before claiming page background or section-surface changes are ready for visual review.

The same gate also blocks the collapsed blog author-card max-width rule that disfigured the Blog page card after global About portrait rules leaked into the Blog layout. Blog author cards must keep an explicit desktop two-column contract and a separate mobile stacked contract.

## Repeated Steering Recovery - Measured Layout Rules

Human review repeatedly caught homepage sections that looked locally plausible but missed the Jose spacing system: the topbar, name section, work carousel, and blog preview each drifted because they were tuned with one-off clamp grids instead of the measured reference row model.

When a Jose capture includes concrete container, row, column, gutter, typography, or section-height measurements, do not treat those numbers as a local exception for the reported selector. Treat them as a systemic layout signal. First ask whether the affected section should use the shared Jose-parity primitives, including the measured container width, row gutter, half-gutter padding, desktop column fractions, shared type variables, neutral tokens, and page-surface invariants.

New Jose-parity CSS should avoid private per-section escape hatches unless the deviation is intentional, documented, and scoped to Jamie's content identity. Prefer a shared measured primitive or token-backed rule over a local clamp override. If a local rule remains necessary, record the reason and the searched sibling scope before closeout.

Future corrective passes should report:

- whether the issue was isolated or systemic
- which sibling sections or patterns were searched
- which shared measured primitive or token was used
- which local deviations remain and why
- which validation command proves the affected lane, and what it does not prove

## Evidence Boundary

This guardrail covers the benchmark topbar plus high-signal blog, about, fun-facts, skills, work-history, and on-the-web structure on desktop and mobile. Pixel parity is enforced through calibrated mismatch-ratio budgets rather than exact equality because Jamie's copy and image assets intentionally differ from Jose's. The stored bundle under `docs/reference/jose-ocando/` is the canonical structural authority; current-live comparisons are advisory and cannot update that authority without an approved reference refresh. Motion parity is enforced for the topbar/link/button transition duration and easing class, not every possible Webflow interaction timeline.

## Claim Boundary - Capture Is Not Parity

The Jose capture/reference pipeline is not visual parity proof. Static reference capture, rendered artifact wiring, package-script wiring, syntax checks, and generated reference indexes only prove that evidence collection is available or partially working.

Do not claim the Jamie prototype matches the stored Jose contract unless the canonical artifacts and structural assertions support that claim. A parity run against the current live site proves only an advisory current-live comparison; when it is blocked, name the browser/runtime blocker rather than reducing the claim.

The proof command for a visual-match claim is: REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity.

The npm run test:jose-parity command now routes through scripts/jose-parity-runner.mjs. If CHROME_CDP_URL is present, it uses the CDP attach lane. If CHROME_CDP_URL is absent, it first checks whether managed Chromium can launch; when the managed sandbox blocks Chromium during bootstrap, it exits before the full parity run and prints the CDP command instead of reporting an opaque Playwright failure.

For raw Playwright Chromium launch, bootstrap_check_in ... Permission denied (1100) is a managed macOS process/Mach bootstrap restriction. workspace-net and filesystem grants can provide network access, local binding, cache access, and profile-directory writes, but they cannot grant Chromium the host process entitlement it needs when launched inside the managed Codex sandbox.

When Playwright cannot launch managed Chromium in the current environment, use the CDP attach lane instead of reducing the claim. Start a separate Chrome process with remote debugging, then run: CHROME_CDP_URL=http://127.0.0.1:9222 REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity.

The explicit CDP-only command is also available as: CHROME_CDP_URL=http://127.0.0.1:9222 REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity:cdp.

The CDP attach lane writes rendered artifacts under artifacts/screenshots-cdp/, including compare.html, per-capture screenshots, diffs, metrics, and run-summary.json. It proves rendered browser parity only when that command passes for the current candidate URL. A missing CDP endpoint is a browser-bridge blocker, not visual parity evidence.

If browser-rendered capture is blocked, the strongest supported claim is pipeline readiness or partial reference validation, not visual match.

When the managed sandbox cannot run the browser-rendered Playwright lane, report the proof gap with the exact attempted or required command. Example: Command: cd /Users/jamiecraik/dev/brainwav.io && REFERENCE_BASE_URL=https://www.joseocando.com npm run test:jose-parity -> blocked (browser-rendered Playwright lane was previously blocked or hung in the managed sandbox).
