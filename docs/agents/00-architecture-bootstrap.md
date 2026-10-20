# Architecture Bootstrap

## Purpose

This repository is an Astro portfolio site. Canonical implementation lives in `src/`, while `scripts/` provides the release, validation, and operator workflow contract. `package.json` is the source of truth for the supported command surface.

## Read Before Changing Shared Workflow

1. Read `AGENTS.md`, `package.json`, and the specific script you intend to change.
2. Preserve unrelated dirty work and generated runtime output. The primary checkout is not a cleanup target.
3. Treat `harness.contract.json`, `WORKFLOW.md`, hook scripts, and `scripts/new-task.sh` as one operator boundary; update their tests and documentation together when the contract changes.

## Historical Diagram Boundary

Jamie retired the diagram dependency and mandatory refresh gate on 18 October
2026. `.diagram/` and `AI/context/diagram-context.md` remain historical reference
captures, not current-source or release evidence. Source changes do not require
installing or running the generator. The obsolete manual Make targets, refresh
scripts and generator-only normaliser were removed as well. A future capture
requires an explicitly selected, supported authoring workflow.

## Validation Boundary

The package override pins Vite to `8.1.6`, the patched `8.1` maintenance release
for GHSA-698v-4r3x-3vcv. Keep the override and lockfile aligned until the Astro
dependency chain resolves a patched version without it. The ordinary audit
job rejects moderate production advisories; `audit:strict` is the separate
high-severity dependency-scan lane. Neither threshold is waived by this pin.

`src/components/WorkCarousel.astro` owns the All work card markup, pointer
feedback and controls used by both the homepage and case studies. Both callers
pass the complete ordered project list; keep their rendered treatment shared.

Use the narrowest deterministic test first. For operator-contract changes, run the relevant `test:*` script, `npm run validate:operator-contract`, and the hook path that the change affects. Local results establish only local behavior; hosted checks, reviews, and merge readiness remain separate lanes.

The retained manifest's byte and line metadata can be checked without the
removed tool via `npm run test:diagram-freshness-opt-in`. That legacy-named
command checks historical artifact integrity and guards against restoring the
retired mandatory gate. It does not claim source-graph freshness.

For dependency and lockfile changes, update affected architecture documentation,
run source validation and report production and development-tool audits separately.
Generated runtime receipts remain evidence rather than canonical source.

The PR-readiness boundary reads the human approval quorum from active hosted
rulesets and branch protection instead of assuming a second maintainer exists.
Its strongest applicable count and fail-closed policy lookup are covered by
`npm run test:pr-readiness`; independent bot-review and CI lanes remain separate.
The local Codex artifact inventory also recognises an authenticated current-head
completion summary. Negative fixtures reject stale, incomplete, failed or
wrong-author summaries. Global update receipts retain final clearance authority.
Multiple current-head summaries are ambiguous even when one claims no findings;
artifact detection must not filter away a later findings or failure summary.
The SkillsBar demo's initial security states and symbols live in
`src/lib/skillsbar-demo-fixtures.ts` so server markup and client enhancement use
the same evidence. Browser contracts check that state with and without JavaScript.

CircleCI owns the repository's pull-request validation workflows, while the
`pages-production` workflow is the only production publication path. It runs
on `main` with the restricted `cloudflare-pages-production` context, validates
the static `dist/` artifact, and uploads it through the pinned Wrangler
contract. Keep those hosted checks and deployment-context claims separate from
local build proof and from Cloudflare custom-domain setup.

The `pr-template` job reads the hosted PR body and validates it with the
repository-owned `scripts/validate-pr-template.mjs` contract. Keep that body
schema, `.github/PULL_REQUEST_TEMPLATE.md`, its focused regression fixtures,
and the CircleCI invocation synchronized; do not substitute a packaged schema
that targets a different template version.

The Astro anti-pattern validator is part of the source-quality architecture:
`scripts/test-astro-anti-patterns.mjs` exercises the production validator with
fixture CSS, while `npm run validate:fast` keeps that focused regression test
adjacent to the full source-policy lane.

The tracked environment projection and code-quality debt validator are part of
the operator workflow architecture. When either changes, run
`npm run test:code-quality-debt` and `npm run quality:debt`, and inspect any
baseline update. The focused contract test remains their regression boundary.

The Jose parity workflow treats `docs/reference/jose-ocando/` as its frozen
structural authority. `scripts/jose-parity-cdp.mjs` owns browser capture and
comparison orchestration, while `scripts/jose-parity-measurements.mjs` owns the
deterministic color-resolution and identity-region masking primitives verified
by `npm run test:jose-parity-measurements`. Refreshing the stored reference is
an explicit design-contract change; a comparison with the current live site is
advisory evidence and does not replace that authority.

The shared portfolio shell and CSS simplification boundary are also executable
contracts. `src/styles/shell.css` owns the canonical header/footer gradients,
the navigation background layer, and the route-independent shell surface;
the navigation background remains static rather than moving between controls.
`src/styles/global.css` and page-local styles keep route canvases on the neutral
paper token instead of adding competing top-level gradients. The focused
`scripts/test-css-simplification.mjs` and `scripts/validate-page-surfaces.mjs`
contracts guard both boundaries and the removal of selector families with no
current producers. The José About measurements target the current
`.recognition-list a` markup; update that selector and its focused contract
together when the source structure changes.

The Blog divider hairline is a design-system source contract:
`scripts/lib/surface-hairline-contract.mjs` checks the shared normal and
high-density border widths and the Blog's use of that token.
`npm run test:design-system-contract` covers valid and invalid neighbors, while
`npm run validate:design-system` checks the current source.

Portfolio content is schema-driven. `src/content.config.ts` owns publication
states, proof links, and the optional case-study narrative consumed by
`src/pages/work/[slug].astro`; keep content fixtures and route-level coverage
aligned whenever those schemas change. Shared route inventories must include
new public article and work paths in smoke, accessibility, visual, and Jose CDP
surfaces before those routes are treated as covered.
The source gate runs `scripts/test-built-output-validators.mjs` against a
disposable copy of the built site so sitemap exclusions and About portrait
requirements fail through their actual validator entrypoints.

An optional work `capture` supplies a local product image, descriptive alt text,
intrinsic dimensions, and a required evidence caption. The work route renders
that figure instead of its decorative art; entries without a capture retain
their existing art. `tests/a11y/polish.spec.ts` covers the SkillsBar fixture and
the neighboring Skills SDK fallback.

Browser motion belongs to shared, testable helpers such as
`src/scripts/flip-motion.ts`. Production output and committed dependency
metadata must not require private development tooling or unauthenticated
registries.
The removed Lapse inspector has no remaining CI credential setup; operator
contracts reject its private token wiring. Portfolio artwork is keyed by work
entry identity with a fallback for new entries, independently of link overrides.
`BaseLayout.astro` normalises the route key consumed by editorial CSS so both
slashless and trailing-slash article requests select the same artwork.

Accessibility and visual suites share `tests/helpers/test.ts`. Without
`CHROME_CDP_URL` they retain Playwright's normal browser fixture; the approved
managed-browser recovery path connects to the runtime owner's disposable Chrome
profile with `noDefaults: true`, then uses isolated contexts for each test.
CDP runs use one worker so keyboard-focus checks do not compete for the browser.
The test fixture tears down its contexts and lets worker exit disconnect CDP;
it must not call `browser.close()` on the runtime owner's external Chrome.
The render-flow validator uses the same CDP connection option, creates its own
context, and closes only that context before disconnecting. Never supply an
authenticated browser profile. Visual baselines must be regenerated and checked
again after intentional theme changes; source validation alone cannot prove them.

Route-specific editorial rhythm belongs in `src/styles/route-rhythm.css` rather
than the shared shell. Keep its selectors limited to the owning route and run
rendered validation when that stylesheet changes.
