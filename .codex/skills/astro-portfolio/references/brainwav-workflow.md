# brainwav Workflow

Use this reference for repo-specific proof boundaries, validation routing, and portfolio conventions.

## Repo Surfaces

- `package.json` owns available npm scripts and must be reread before choosing validation.
- `AGENTS.md` owns dirty-worktree preservation, artifact hygiene, codestyle fallback, Jose parity claim boundaries, and validation routing.
- `README.md` describes route inventory, source layout, local validation, and evidence boundaries.
- `docs/implementation-notes/jose-parity-guardrail.md` defines what Jose parity checks prove and do not prove.
- `docs/reference/jose-ocando/README.md` describes the stored Jose reference bundle; capture availability is not visual parity proof.
- `docs/implementation-notes/content-source-boundary.md` and `scripts/validate-content-source-boundary.mjs` define the file-backed content policy when present.

## Validation Routing

- Docs or skill-only change: run skill validation or the smallest path/link check.
- Astro source, layout, component, or CSS change: run `ASTRO_TELEMETRY_DISABLED=1 npm run build`.
- Background, spacing, section surface, or Blog card layout change: add `npm run validate:page-surfaces`.
- Route output or page wiring change: add `npm run test:smoke`.
- Type-sensitive change: add `npm run check` when dependencies are available.
- Jose-reference or claim-boundary change: run `npm run validate:jose-claim-boundary`.
- Visual parity claim: only make the claim after `REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity` passes.
- Content-source policy change: run `npm run validate:content-source-boundary` when the script exists.

## Claim Boundaries

- A successful build proves local Astro compilation, not hosted deployment or CI.
- A generated screenshot proves rendering occurred, not design parity.
- A stored Jose capture proves reference availability, not candidate similarity.
- Passing a static validator proves that validator's rule set, not the whole site.
- Browser or Playwright blockers must be reported as blocked with the nearest meaningful static fallback.

## Design And Content Posture

- Preserve Jamie Scott Craik's personal DevRel portfolio identity.
- Use Jose Ocando as a structural and proportional reference, not a source of copied content.
- Keep proof notes, articles, case studies, and metadata repository-owned and diffable.
- Keep generated runtime artifacts out of source unless the user explicitly asks to promote them.
