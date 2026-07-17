---
schema_version: 2
---

# Portfolio Agent Guidelines

## Scope
- This file applies to the whole `/Users/jamiecraik/dev/portfolio` checkout, renamed from the earlier `brainwav.io` directory.
- This repo is an Astro portfolio/proof site. Treat source, scripts, stored reference captures, generated screenshots, and package scripts as the local evidence surfaces.
- There was no repo-local AGENTS.md or CODESTYLE.md when this file was created. If a deeper AGENTS.md is later added, it overrides this file only inside its own subtree.

## Operating Posture
- Read current files before editing. This checkout often has active portfolio-parity work in progress; preserve unrelated dirty or untracked changes.
- Prefer repository scripts and stored artifacts over memory or visual impressions. Do not claim visual parity, CI state, hosted readiness, or PR state without checking that lane in the same closeout window.
- Keep generated/runtime outputs local unless the user explicitly wants them shipped. In particular, keep Playwright scratch under .playwright-tmp/ and .playwright-cache/, and treat ad hoc screenshots or recordings under artifacts/ as evidence artifacts rather than default source changes.
- For visual work, verify the affected route(s), not only the homepage hero. When a request compares against the Jose Ocando reference or site-wide presentation, inspect the relevant top-level surfaces such as /, /now, /blog, /contact, /proof, and affected work pages before closing the claim.

## Codestyle
- For technical work, use the global Codex codestyle front door at /Users/jamiecraik/dev/configs/codex/instructions/CODESTYLE.md unless this repo later adds a local CODESTYLE.md.
- If that global file cannot be read, report codestyle guidance as blocked and continue only from discovered AGENTS.md files, local code patterns, and explicit user instructions.

## Project Pointers
- package.json is the source of truth for npm scripts. Re-read it before choosing validation commands.
- docs/implementation-notes/jose-parity-guardrail.md defines the Jose parity proof boundary, repeated steering fixes, and what screenshot/parity commands do and do not prove.
- docs/reference/jose-ocando/README.md describes the stored Jose reference bundle. Static capture proves reference availability, not visual parity.
- scripts/validate-page-surfaces.mjs protects repeated page-surface regressions such as grey section bands, hidden full-bleed band patterns, and leaked Blog author-card layout rules.
- scripts/validate-astro-anti-patterns.mjs protects AI-prone Astro regressions: fake controls, missing image alt text, careless hydration, component-level global styles, transition-all, important/overflow masking, pixel breakpoints, and heading-outline jumps.
- scripts/validate-css-policy.mjs protects token usage, rem breakpoints, selector specificity, z-index scale, and type-scale discipline.
- scripts/validate-html-output.mjs validates built HTML semantics, duplicate IDs, landmarks, headings, links, buttons, images, and ARIA references.
- scripts/validate-js-budget.mjs protects Astro's static-first output with a strict JavaScript budget and no accidental hydration.
- scripts/validate-render-flow.mjs uses Playwright against built output to catch horizontal overflow, clipped text, tiny hit targets, blank routes, and zero-size images across common viewports.
- scripts/validate-no-prototype-slop.mjs blocks placeholder copy, empty links, local machine paths, debug logging, and patch-status comments from source/public files.
- scripts/validate-jose-claim-boundary.mjs protects claim wording around Jose reference capture versus parity proof.
- scripts/smoke-pages.mjs and tests/** cover route smoke, visual, screenshot, and accessibility lanes.

## Validation
- Run the narrowest proving check first, then widen when the change affects shared styling, route behavior, generated artifacts, or user-visible design.
- For docs or instruction-only edits, at minimum verify the touched paths and links with rg/test -f, then run the smallest relevant repo check when practical.
- For Astro source, layout, or CSS changes, prefer:
  - ASTRO_TELEMETRY_DISABLED=1 npm run build
  - npm run validate:astro-anti-patterns when component markup, hydration, scoped styles, responsive CSS, or animation rules are touched.
  - npm run validate:fast for ordinary Astro/source/CSS/content edits.
  - npm run validate:source when route output or built HTML semantics are affected.
  - npm run validate:rendered when layout, visual flow, accessibility, or viewport behavior is affected.
  - npm run validate:site before release or when a broad site-quality proof is needed.
  - npm run validate:page-surfaces when page backgrounds, section surfaces, spacing bands, or Blog card layout are touched.
  - npm run test:smoke when route output or page wiring changes.
  - npm run check when TypeScript/Astro typing is relevant and dependencies are available.
- For Jose-reference or parity-claim work, run:
  - npm run validate:jose-claim-boundary
  - REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity before claiming visual match.
- If Playwright or browser-rendered validation is blocked by sandbox/runtime permissions, report blocked with the exact command and blocker, run the nearest meaningful static/build fallback, and do not claim visual parity.
- Report validation as exact commands with pass, fail, or blocked, plus what the evidence proves and does not prove.

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
- Context pointers: package.json, docs/implementation-notes/jose-parity-guardrail.md, docs/reference/jose-ocando/README.md, scripts/validate-page-surfaces.mjs, scripts/validate-jose-claim-boundary.mjs, scripts/smoke-pages.mjs, and tests/**.
- Supplemental: generated screenshots, recordings, runtime cards, Playwright reports, and ad hoc artifacts unless the user explicitly asks to promote them.
