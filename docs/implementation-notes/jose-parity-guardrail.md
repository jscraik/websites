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

The second parity hardening pass extends the same guardrail to downstream sections and effects:

- about skills section heading and repeated block geometry
- about work-history section heading and full-width row geometry
- about on-the-web section heading and table-row geometry
- per-capture pixel mismatch ratios for the benchmark/candidate diff output
- topbar and link/button transition duration and easing class
- viewport-specific Playwright project routing so desktop and mobile workers do not race while writing the same artifact names
- downstream hash-section top-band contamination, so previous-section text cannot remain visible above the target section
- about on-the-web bottom-band contamination, so the footer cannot intrude into the comparable section viewport

The downstream block detector is scoped to the target heading's containing section/root. That prevents a shorter candidate section from leaking visible blocks from the previous section into the metric comparison.

The named command is:

```sh
REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity
```

## Future Behavior Change

Agents cannot treat `screenshots:site` or `test:jose-parity` as visual parity proof when the topbar, blog first viewport, about sidebar/portrait, fun-facts card grid, downstream about-section geometry, direct deep-link scroll state, hash-section top band, on-the-web footer boundary, sampled background color, calibrated pixel-diff ratio, or topbar/link transition timing is materially different. The test now fails with assertion-shaped deltas that identify the exact measurement drift to repair.

## Evidence Boundary

This guardrail covers the benchmark topbar plus high-signal blog, about, fun-facts, skills, work-history, and on-the-web structure on desktop and mobile. Pixel parity is enforced through calibrated mismatch-ratio budgets rather than exact equality because Jamie's copy and image assets intentionally differ from Jose's. Motion parity is enforced for the topbar/link/button transition duration and easing class, not every possible Webflow interaction timeline.
