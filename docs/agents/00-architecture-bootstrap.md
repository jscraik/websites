# Architecture Bootstrap

## Purpose

This repository is an Astro portfolio site. Canonical implementation lives in `src/`, while `scripts/` provides the release, validation, and operator workflow contract. `package.json` is the source of truth for the supported command surface.

## Read Before Changing Shared Workflow

1. Read `AGENTS.md`, `package.json`, and the specific script you intend to change.
2. Preserve unrelated dirty work and generated runtime output. The primary checkout is not a cleanup target.
3. Treat `harness.contract.json`, `WORKFLOW.md`, hook scripts, and `scripts/new-task.sh` as one operator boundary; update their tests and documentation together when the contract changes.

## Diagram Freshness Boundary

`scripts/check-diagram-freshness.sh` applies only after the repository deliberately tracks `.diagram/manifest.json`. Until then, generated Mermaid files under `.diagram/` are local runtime output, and the freshness gate exits without generating or requiring them. The shared `AI/context/diagram-context.md` is not a substitute for that tracked manifest opt-in.

When the project adopts checked-in diagram projections, add the manifest and the resulting artifacts intentionally, then validate the exact changed-file path through `bash scripts/check-diagram-freshness.sh --changed-files <file>`.

## Validation Boundary

Use the narrowest deterministic test first. For operator-contract changes, run the relevant `test:*` script, `npm run validate:operator-contract`, and the hook path that the change affects. Local results establish only local behavior; hosted checks, reviews, and merge readiness remain separate lanes.

The checked-in `.diagram/manifest.json` and Mermaid projections are intentional
architecture evidence. From the repository root, refresh them with
`bash scripts/refresh-diagram-context.sh --force`, then write the changed-path
list to a temporary file and run
`bash scripts/check-diagram-freshness.sh --changed-files <path-list-file>`.
The expected result is `Diagram freshness check passed`. A cooldown skip is
not a refresh proof; rerun with `--force`. Any generation or freshness failure
belongs to the portfolio maintainer and blocks the architecture-sensitive
change until the projections and `AI/context/diagram-context.md` are aligned.
Generated runtime receipts remain evidence rather than canonical source.

Dependency and lockfile changes are architecture-sensitive. Refresh the
tracked diagram context, run the repository source-validation contract, and
report production and development-tool audits separately; an upstream-only
development advisory must not be represented as a production vulnerability.

CircleCI owns the repository's pull-request validation workflows, while the
`pages-production` workflow is the only production publication path. It runs
on `main` with the restricted `cloudflare-pages-production` context, validates
the static `dist/` artifact, and uploads it through the pinned Wrangler
contract. Keep those hosted checks and deployment-context claims separate from
local build proof and from Cloudflare custom-domain setup.

The Astro anti-pattern validator is part of the source-quality architecture:
`scripts/test-astro-anti-patterns.mjs` exercises the production validator with
fixture CSS, while `npm run validate:fast` keeps that focused regression test
adjacent to the full source-policy lane.

The tracked environment projection and code-quality debt validator are part of
the operator workflow architecture. When either changes, refresh the diagram
context after `npm run test:code-quality-debt`, `npm run quality:debt`, and an
inspected baseline update. The focused contract test remains the regression
boundary for the debt validator and its environment projection.

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
`src/styles/global.css` and page-local styles keep route canvases on the neutral
paper token instead of adding competing top-level gradients. The focused
`scripts/test-css-simplification.mjs` and `scripts/validate-page-surfaces.mjs`
contracts guard both boundaries and the removal of selector families with no
current producers. The José About measurements target the current
`.recognition-list a` markup; update that selector and its focused contract
together when the source structure changes.

Portfolio content is schema-driven. `src/content.config.ts` owns publication
states, proof links, and the optional case-study narrative consumed by
`src/pages/work/[slug].astro`; keep content fixtures and route-level coverage
aligned whenever those schemas change. Shared route inventories must include
new public article and work paths in smoke, accessibility, visual, and Jose CDP
surfaces before those routes are treated as covered.

Browser motion belongs to shared, testable helpers such as
`src/scripts/flip-motion.ts`. Production output and committed dependency
metadata must not require private development tooling or unauthenticated
registries.

Route-specific editorial rhythm belongs in `src/styles/route-rhythm.css` rather
than the shared shell. Keep its selectors limited to the route that owns the
spacing, and refresh the checked-in diagram projections when that stylesheet
changes.
