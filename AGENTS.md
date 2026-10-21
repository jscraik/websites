---
schema_version: 2
---

# Portfolio Agent Guidelines

## Scope
- This file applies to the whole Git repository and any current checkout of it. The repository was renamed from the earlier `brainwav.io` directory.
- This repo is an Astro portfolio/proof site. Treat source, scripts, stored reference captures, generated screenshots, and package scripts as the local evidence surfaces.
- This checkout has root `AGENTS.md` and `CODESTYLE.md`; a deeper `AGENTS.md` overrides this guidance only inside its own subtree.

## Operating Posture
- Read current files before editing. This checkout often has active portfolio-parity work in progress; preserve unrelated dirty or untracked changes.
- Prefer repository scripts and stored artifacts over memory or visual impressions. Do not claim visual parity, CI state, hosted readiness, or PR state without checking that lane in the same closeout window.
- Keep generated/runtime outputs local unless the user explicitly wants them shipped. In particular, keep Playwright scratch under .playwright-tmp/ and .playwright-cache/, and treat ad hoc screenshots or recordings under artifacts/ as evidence artifacts rather than default source changes.
- For visual work, verify the affected route(s), not only the homepage hero. When a request compares against the Jose Ocando reference or site-wide presentation, inspect the relevant top-level surfaces such as /, /now, /blog, /contact, /proof, and affected work pages before closing the claim.

## Codestyle
- For technical work, read a repository-local `CODESTYLE.md` first when it exists, then use the global Codex codestyle front door at `/Users/jamiecraik/dev/configs/codex/instructions/CODESTYLE.md` only as the fallback when the local file is unavailable.
- After the front door, open only the codestyle module that matches the task surface and keep repository-specific overrides in the project override module.
- If neither codestyle front door can be read, report codestyle guidance as blocked and continue only from discovered AGENTS.md files, local code patterns, and explicit user instructions.

## Project Pointers
- `src/styles/editorial-theme.css` owns the approved charcoal portfolio theme;
  keep product demo interfaces isolated. Map artwork by content identity rather
  than overridable destination URLs, and normalise route keys used by CSS.
  `src/components/WorkCarousel.astro` owns the shared homepage and case-study
  carousel. The SkillsBar browser demo uses the portfolio shell while its
  inspector keeps native-style typography and explicitly labelled fixture data.
- Portfolio navigation uses native route links and a static background. Keep
  navigation validation aligned with that behaviour; do not restore the retired
  moving/reparented highlight when adjusting the shared shell.
- Optional private development inspectors must not enter the site install or
  CI credential contract. Keep their removal and focused operator tests aligned.
- package.json is the source of truth for npm scripts. Re-read it before choosing validation commands.
- Read `docs/agents/00-architecture-bootstrap.md` when changing schemas, route
  coverage, motion infrastructure, development tooling, dependencies, or tracked
  diagrams. Stored diagrams are historical references; automatic generation is retired.
- Read `docs/implementation-notes/jose-parity-guardrail.md`,
  `docs/decisions/2026-07-31-freeze-jose-reference-authority.md`, and
  `docs/reference/jose-ocando/README.md` only for Jose-reference, parity, or
  stored-capture work. Static capture proves availability, not visual parity.
- For source, CSS, HTML, JavaScript-budget, render-flow, smoke, visual, or
  accessibility changes, select the matching repository validator or test from
  `package.json`. Keep route-specific editorial spacing in
  `src/styles/route-rhythm.css`; no diagram generator is required.
- `.circleci/config.yml` owns pull-request validation and the main-only
  `pages-production` publication workflow; pair that contract with
  `docs/decisions/2026-08-02-circleci-cloudflare-pages-direct-upload.md` and
  keep CircleCI context, Cloudflare custom-domain, and local artifact claims
  separate.
- Linear is the repository issue authority. Keep the active project URL
  synchronized across `harness.contract.json`, `package.json` (`bugs.url`),
  and `.github/ISSUE_TEMPLATE/config.yml`; standalone review-remediation PRs
  may use the `jscraik/` prefix without an issue key only when their body
  records a concrete Linear `n/a` reason. The Harness contract keeps branch
  and PR issue-key enforcement enabled for normal delivery; `linear-gate`
  skips those linkage checks only after the PR body explicitly classifies the
  work as standalone/untracked with that concrete reason.
- `.codex/skills/` contains explicitly pinned workflow skills; review their source
  commit before treating a skill addition as project governance.
- Read `docs/agents/07b-agent-governance.md` when selecting delegation,
  persistent coordination, operator-projection changes, or PR delivery.

## Validation
- Run the narrowest proving check first, then widen when the change affects shared styling, route behavior, generated artifacts, or user-visible design.
- For docs or instruction-only edits, at minimum verify the touched paths and links with rg/test -f, then run the smallest relevant repo check when practical.
- Use `npm run validate:fast` for ordinary Astro, source, CSS, or content edits;
  `npm run validate:source` for built-output semantics;
  `npm run test:smoke` for route output or page wiring; and
  `npm run validate:rendered` for layout, visual flow,
  accessibility, or viewport behavior. Run `npm run validate:site` for release
  preparation or broad site-quality proof. Add focused validators named in
  `package.json` when the touched surface requires them.
- Run `npm run validate:page-surfaces` for page backgrounds, section surfaces,
  spacing bands, or Blog card layout. Run
  `npm run validate:astro-anti-patterns` for component markup, hydration,
  scoped or responsive CSS, and animation-rule changes.
- The Blog hairline contract runs through `npm run test:design-system-contract`
  and `npm run validate:design-system`: it checks the shared density-aware
  border token and its use by Blog dividers.
- Run `ASTRO_TELEMETRY_DISABLED=1 npm run build` when output generation matters,
  and `npm run check` when Astro or TypeScript diagnostics are relevant.
- For Jose-reference or parity-claim work, run:
  - npm run validate:jose-claim-boundary
  - npm run test:jose-parity-measurements
  - REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity before claiming visual match.
- If Playwright or browser-rendered validation is blocked by sandbox/runtime permissions, report blocked with the exact command and blocker, run the nearest meaningful static/build fallback, and do not claim visual parity.
- Keep managed and host browser evidence separate: source, build, static, and HTML checks stay in the managed sandbox; rendered proof may use only an existing approved external Chrome/CDP endpoint connected to an immutable trusted artifact. Do not host-execute a dirty/current checkout, add `--no-sandbox`, reinstall Playwright/Chromium, or widen filesystem roots. A browser extension or MCP connection proves neither CLI authentication nor provider credentials.
- For the approved macOS CDP recovery route, the runtime owner starts a fresh disposable profile outside the managed sandbox, verifies the listener once, then runs `CHROME_CDP_URL=http://127.0.0.1:9223 REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=http://127.0.0.1:4323 npm run test:jose-parity:cdp`. Use a unique `mktemp -d` user-data directory for each run and remove only that directory after Chrome exits; do not reuse an authenticated profile for a private claim. Do not point the client at the app port (`4323`) unless that process exposes a CDP websocket. Never enumerate browser tabs or reuse a profile across runs.
- Report validation as exact commands with pass, fail, or blocked, plus what the evidence proves and does not prove.
- For changes to the tracked environment projection or debt validator, add a
  focused contract test. Inspect newly visible debt before updating the
  baseline, and never use a baseline update to conceal debt introduced by the
  current delivery.
- For dependency or lockfile changes, run the package audit and update affected
  architecture and governance documentation before push. The removed diagram
  dependency is not a release requirement; stored projections are historical.

## Visual Reference Work
- Preserve Jamie's site identity while using Jose Ocando as a structural reference. Do not replace source content or brand direction with copied benchmark content.
- Use stored Jose artifacts in docs/reference/jose-ocando/ for repeatable inspection before re-capturing the live site.
- When the browser or preview looks stale, restart on a fresh local port and re-check the exact section before claiming the issue is fixed.
- A generated screenshot/contact sheet is evidence that rendering occurred; it is not by itself evidence that geometry, typography, spacing, backgrounds, or motion match the reference.

## Subagent Contract
- Use subagents only when the user explicitly asks for delegation or parallel agent work, or when repo instructions require a review swarm.
- Before delegating, verify path-dependent inputs and keep prompts narrow. The coordinator remains responsible for synthesis, validation evidence, and closeout.
- Artifact-producing delegated work must end with WROTE: /absolute/path/to/artifact.md; verify the artifact exists and is non-empty before treating the task as complete.
- Classify delegated validation failures before remediation as introduced by current patch, pre-existing, unrelated dirty worktree, environment/tooling failure, or user-owned config drift requiring explicit approval.

## Context Ledger
- Root: Astro portfolio purpose, dirty-worktree preservation, artifact hygiene, codestyle fallback, validation routing, Jose parity claim boundary, and compact subagent coordination rules.
- Context pointers: package.json, docs/decisions/2026-07-31-freeze-jose-reference-authority.md, docs/implementation-notes/jose-parity-guardrail.md, docs/reference/jose-ocando/README.md, scripts/jose-parity-measurements.mjs, scripts/validate-page-surfaces.mjs, scripts/validate-jose-claim-boundary.mjs, scripts/smoke-pages.mjs, and tests/**.
- Supplemental: generated screenshots, recordings, runtime cards, Playwright reports, and ad hoc artifacts unless the user explicitly asks to promote them.

- When explaining something to the user, use the `visualize` skill when a diagram materially improves the explanation.
