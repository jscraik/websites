---
name: astro-portfolio
description: "Use when building or validating brainwav Astro routes, layouts, content collections, or portfolio pages"
metadata:
  lifecycle_state: active
  maturity: experimental
  owner: "Jamie Scott Craik"
  review_cadence: "quarterly"
  last_reviewed: "2026-07-03"
  metadata_source: frontmatter
  sdk_stage: astro-portfolio
  command_visibility: orchestrator
---

# Astro Portfolio

## Purpose
Use this skill for project-local Astro work in this `brainwav.io` checkout: routes, layouts, components, content collections, portfolio proof pages, build checks, and docs-backed Astro decisions.

## Source Basis
- Start from current repo evidence: `package.json`, `AGENTS.md`, `README.md`, `src/**`, `scripts/**`, and the affected docs.
- Use Context7 for current Astro framework behavior before changing version-sensitive patterns. The resolved docs source is `/withastro/docs`.
- Load [Astro docs notes](./references/astro-docs-notes.md) when the task touches project structure, pages, layouts, build output, or content collections.
- Load [brainwav workflow](./references/brainwav-workflow.md) when the task touches portfolio proof boundaries, Jose parity, content-source policy, or validation choice.

## Workflow
1. Confirm the requested route, layout, content model, script, or docs surface.
2. Read the nearest repo instructions and the target files before editing.
3. Query Context7 for Astro docs when the behavior depends on current Astro APIs, collection loaders, routing, layouts, or build semantics.
4. Keep content file-backed and reviewable. Prefer Astro Content Collections for durable blog, work, and proof content once the content model stabilizes.
5. Preserve Jamie's site identity and proof boundaries. Do not replace repo content with copied reference-site text or claim Jose visual parity from static captures alone.
6. Make the smallest source or docs change that satisfies the request.
7. Run the narrowest repo-native validation that proves the changed surface.

## Validation
Choose the smallest proving check first:

- Skill-only edits: `~/.venvs/pyyaml/bin/python ~/dev/agent-skills/skills-system/skill-creator/scripts/quick_validate.py .codex/skills/astro-portfolio`.
- Astro source, route, layout, or CSS edits: `ASTRO_TELEMETRY_DISABLED=1 npm run build`.
- Page surface, spacing, background, or section-band edits: `npm run validate:page-surfaces`.
- Route output or page wiring edits: `npm run test:smoke`.
- Type-sensitive Astro or TypeScript edits: `npm run check`.
- Jose-reference or parity-claim edits: `npm run validate:jose-claim-boundary`; only claim visual match after `REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity` passes.
- Content-source policy edits: `npm run validate:content-source-boundary` when available.

Report every command as pass, fail, or blocked, and state what the evidence proves and does not prove.

## Boundaries
- Do not claim hosted deployment, CI, external review, PR readiness, or visual parity unless that lane was checked in the same closeout window.
- Keep Playwright scratch under `.playwright-tmp/` and `.playwright-cache/`; treat ad hoc screenshots under `artifacts/` as evidence, not default source.
- Preserve unrelated dirty worktree changes.
- If browser-rendered validation is blocked, run the nearest static/build fallback and say visual proof is blocked.

## References
- [Astro docs notes](./references/astro-docs-notes.md)
- [brainwav workflow](./references/brainwav-workflow.md)
- [contract](./references/contract.yaml)
- [evals](./references/evals.yaml)
