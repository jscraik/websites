# portfolio

This repository contains the source configured with [jscraik.com](https://jscraik.com) as Jamie Scott Craik's intended canonical single public portfolio front door. brAInwav is the identity behind the work: it connects Jamie's human perspective, AI tools, and technical exploration as they become public products, writing, and proof. The site is intentionally small: it makes AI-assisted developer work inspectable, shows current proof artifacts, keeps caveats visible, and gives future agents a repeatable way to validate design and claim boundaries.

Jamie’s working career direction is customer-facing AI workflow delivery and developer experience. The promise is `Making AI-assisted developer work inspectable.` Role labels remain provisional, and the site is not permitted to claim employment, affiliation, external adoption, production readiness, or outcome evidence that source repositories do not establish. The existing AI-native DevRel article remains a historical position piece rather than a fixed job-title claim.

## Canonical Brand Contract

Version 1.1.0 of the brAInwav Design System projects the accepted `jamie-brain-brand-system/v1` decision dated 2026-07-15.

- `src/styles/brand-tokens.json` is the canonical machine-readable consumer contract.
- `BRAND_GUIDELINES.md` is the human usage and claims-boundary contract.
- `scripts/validate-design-system.mjs` rejects drift in positioning, identity, site roles, product covers, provenance, evidence maturity, accessibility, and stress-test acceptance.
- `jscraik.com` is the accepted single front door. brAInwav is Jamie's identity and shared presentation system, not a second website. Technical depth routes to public ChatGPT Sites, GitBooks, GitHub repositories, READMEs, documentation, diagrams, tests, implementation excerpts, and bounded evidence receipts when each project is ready to make its own public claims.
- The SkillsProof vertical slice is the first implementation target. The generator, covers, rendered acceptance, deployment, usability, and adoption are not proved by the contract alone.

## Quick Start

Use npm from the repository root.

    npm ci
    ASTRO_TELEMETRY_DISABLED=1 npm run dev -- --host 127.0.0.1

The site installs without the private Lapse development inspector or an
`@aiforui` registry credential. The Emil design skills are independent of this
optional inspector.

Useful local checks:

    ASTRO_TELEMETRY_DISABLED=1 npm run build
    npm run validate:portfolio-content
    npm run validate:content-source-boundary
    npm run validate:design-system
    npm run validate:fast
    npm run test:smoke
    npm run validate:page-surfaces
    npm run validate:jose-claim-boundary
    npm run validate:operator-contract

The portfolio content validator checks required metadata, proof fields, local links, and collection structure. The content-source validator protects the repo-file-backed storage boundary. The design-system validator checks the versioned brand contract and its projection into this README and the human guide. The fast gate composes the repository's static content and design checks. The smoke test builds the site and checks generated HTML for the main public routes. The page-surface validator protects repeated layout regressions in the shared stylesheet. The Jose claim-boundary validator prevents static reference capture from being reported as visual parity proof.

CircleCI's `pr-template` job validates the hosted PR body against the current checked-in template through `npm run validate:pr-template`; the repository template, validator fixtures, and hosted invocation form one versioned contract.

Linear is the issue authority for repository governance. `harness.contract.json`, `package.json` (`bugs.url`), and `.github/ISSUE_TEMPLATE/config.yml` point at the active Harness cockpit routing project. Standalone review-remediation PRs may use the `jscraik/` branch prefix without an issue key when their body records a concrete Linear `n/a` reason; issue-linked delivery branches continue to use `jscraik/<linear-key>-<short-description>`.

For agent/worktree operation, use `bash scripts/new-task.sh --prepare <task-slug>` and run `bash scripts/preflight-branch-transition.sh --target origin/main --format json` before branch movement. The preflight only reports local untracked-path collisions; it never cleans, stashes, or overwrites them.

## Site Map

The current site includes:

These routes describe the current implementation, not the accepted target architecture. The Visual System page and product-cover generator remain pending until their owning files and evidence exist.

| Route                               | Purpose                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| /                                   | Homepage with Jamie's identity, featured work, proof cards, and blog preview.  |
| /now/                               | About/current-focus page with background, skills, work history, and web links. |
| /blog/                              | Article index and current draft prompts.                                       |
| /articles/when-evidence-goes-stale/ | SkillsProof companion article on candidate-bound release evidence.               |
| /articles/why-ai-native-devrel/     | Historical URL for the broader `Capability Is Not Trust` thesis.               |
| /blog/rss.xml                       | RSS feed containing published articles only.                                   |
| /proof/                             | Proof index with claim, evidence, caveat, and next-state fields.               |
| /contact/                           | Contact page and external profile links.                                       |
| /work/skillsbar/                    | Flagship case study for candidate-bound AI Skill release evidence.             |
| /work/skills-sdk/                   | Skills SDK case study for inspectable, portable AI skill contracts.            |
| /work/ai-native-devrel/             | Case study for the AI-native DevRel proof surface.                             |
| /work/brainwav-io/                  | Case study for this site as a proof-led portfolio.                             |
| /work/cli-proof-series/             | CLI proof-series case-study route.                                             |

Routes are generated from Astro pages under src/pages/ and portfolio content collections under src/content/.

## Project Layout

| Path                                 | What lives there                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| src/pages/                           | Astro routes for the public site.                                                                   |
| src/components/                      | Shared UI pieces such as navigation, brand mark, start links, footer, and carousel controls.        |
| src/lib/                             | Small typed helpers for deriving route/page view models from content collections.                   |
| src/content.config.ts                | Astro Content Collections schema for work, blog, and proof content.                                 |
| src/content/work/                    | Featured work and case-study entries.                                                               |
| src/content/blog/                    | Blog/article metadata used by the blog index.                                                       |
| src/content/proof/                   | Proof index entries with claim, evidence, caveat, and next-state fields.                            |
| src/styles/global.css                | Shared visual system and page layout rules.                                                         |
| public/                              | Static images and public assets.                                                                    |
| scripts/                             | Repo-owned validators and reference-capture utilities.                                              |
| tests/                               | Playwright smoke, visual, accessibility, and Jose screenshot/parity checks.                         |
| docs/reference/jose-ocando/          | Stored Jose Ocando reference capture and rendered artifact index.                                   |
| docs/implementation-notes/           | Proof-boundary notes and repeated-regression guardrail rationale.                                   |
| AGENTS.md                            | Agent operating guidance for this repo.                                                             |
| BRAND_GUIDELINES.md                  | Brand, visual direction, and public-proof copy boundaries.                                          |
| src/styles/brand-tokens.json         | Versioned machine-readable positioning, identity, visual, cover, provenance, and evidence contract. |
| src/brand/social-profile-assets.json | Deterministic X and LinkedIn avatar/banner dimensions, copy, split, and overlap fixtures.           |

## Proof Boundaries

This repo separates local build proof, visual-reference proof, and public readiness.

- npm run build proves Astro can build the current source tree.
- npm run validate:portfolio-content proves collection entries include required portfolio metadata and local links.
- npm run validate:content-source-boundary proves the repo-file-backed content boundary is still documented and enforced.
- npm run test:smoke proves selected generated routes contain expected text after a local build.
- npm run validate:page-surfaces proves specific shared CSS regressions are absent.
- npm run validate:jose-claim-boundary proves the docs and scripts still preserve the "capture is not parity" claim boundary.
- npm run validate:design-system proves the required versioned contract fields, guide/README snippets, and token/CSS invariants are present; it does not prove rendered quality or product implementation.
- npm run validate:social-assets proves the generated social PNGs match the declared dimensions and keep avatar/banner responsibilities separate; it does not prove live platform cropping.
- npm run capture:jose-reference refreshes stored Jose reference artifacts, but capture output is not proof that Jamie's site matches Jose.
- npm run test:jose-parity is the visual parity guardrail. A visual-match claim needs this command against a current local candidate URL, or an explicit blocked result with the browser/runtime blocker.

The Astro config sets the canonical site URL to https://jscraik.com, but hosted deployment, production reach, external review, and PR readiness are separate evidence lanes.

## Jose Reference Workflow

The stored Jose reference bundle lives in docs/reference/jose-ocando/ and includes captured pages, CSS, screenshots, accessibility text, and computed-style artifacts. Use it when comparing structure, typography, spacing, and visual rhythm without repeating discovery.

To refresh the reference bundle:

    npm run capture:jose-reference

To test a candidate site against the reference, first start or preview the candidate on a local URL, then run:

    REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=http://127.0.0.1:4321 npm run test:jose-parity

If Playwright or Chromium cannot launch in the current sandbox, report the exact blocked command and use build, smoke, page-surface, or stored-reference evidence only for the narrower claim they actually prove.

## Common Commands

| Command                                  | Use                                                       |
| ---------------------------------------- | --------------------------------------------------------- |
| npm run dev                              | Start the Astro development server.                       |
| npm run build                            | Build the static site into dist/.                         |
| npm run preview                          | Preview the built site locally.                           |
| npm run check                            | Run Astro's type/content check.                           |
| npm run validate:portfolio-content       | Validate work, blog, and proof collection metadata.       |
| npm run validate:content-source-boundary | Validate the repo-file-backed content storage boundary.   |
| npm run test:smoke                       | Build and verify expected text on core generated routes.  |
| npm run test:e2e                         | Run Playwright end-to-end tests.                          |
| npm run test:visual                      | Run Playwright visual tests.                              |
| npm run test:a11y                        | Run Playwright accessibility smoke tests.                 |
| npm run test:jose-parity                 | Run the Jose/Jamie screenshot parity guardrail.           |
| npm run generate:social-assets           | Render Jamie's X and LinkedIn upload assets and previews. |
| npm run validate:social-assets           | Validate social asset dimensions and source boundaries.   |
| npm run lhci                             | Run Lighthouse CI using lighthouserc.json.                |

Playwright commands use .playwright-tmp/, .playwright-cache/, test-results/, and playwright-report/; these are runtime artifacts, not source.

## Working Notes

- Keep planned proof lanes visibly marked as planned until current repo validation exists.
- Keep private systems, raw source material, runtime cards, and ad hoc recordings out of public copy unless explicitly promoted.
- When visual changes touch page backgrounds, section surfaces, spacing bands, or Blog card layout, run npm run validate:page-surfaces before claiming the surface is ready for review.
- When copy references Jose, reference capture, screenshots, or parity, run npm run validate:jose-claim-boundary before closeout.
- Read AGENTS.md before agent-driven changes; it records repo-specific validation and evidence boundaries.
- CircleCI is the hosted validation authority; its main-only Cloudflare Pages Direct Upload job publishes only after the required checks pass.
