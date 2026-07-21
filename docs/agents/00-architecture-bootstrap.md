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
architecture evidence. Refresh them with the repository diagram workflow and
keep `AI/context/diagram-context.md` aligned; generated runtime receipts remain
evidence rather than canonical source.
