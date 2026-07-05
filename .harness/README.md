# Harness Control Plane

## Table of Contents

- [Tracking Policy](#tracking-policy)
- [Authority Levels](#authority-levels)
- [Directory Map](#directory-map)
- [Codex-Native Baseline](#codex-native-baseline)
- [Admission Rule](#admission-rule)

## Tracking Policy

Track curated Markdown and JSON contract files under `.harness`. Ignore runtime,
backup, database, cache, and bulk snapshot output.

`.harness` is part of the repository control plane, but it is not a dumping
ground. Durable policy, decisions, execution inputs, and curated context should
move with the repository. Local run state should stay local.

## Authority Levels

| Level | Meaning |
| --- | --- |
| `policy` | Non-negotiable project invariants and operating rules. |
| `decision` | ADRs, tradeoffs, and accepted constraints. |
| `execution-input` | Approved work slices that may directly route implementation. |
| `secondary-context` | Useful evidence and intent, but not implementation authority by itself. |
| `generated-runtime` | Local command output, caches, snapshots, or mutable state. |
| `backup/scratch` | Recovery or temporary files that should not be reviewed as repo truth. |

## Directory Map

| Path | Level | Tracking |
| --- | --- | --- |
| `.harness/core/**.md` | `policy` | Track |
| `.harness/decisions/**.md` | `decision` | Track |
| `.harness/linear/**.md` | `execution-input` | Track |
| `.harness/refactors/**.md` | `execution-input` | Track |
| `.harness/features/**.md` | `secondary-context` | Track |
| `.harness/strategy/**.md` | `secondary-context` | Track |
| `.harness/triage/**.md` | `secondary-context` | Track |
| `.harness/review/**.md` | `secondary-context` | Track when curated |
| `.harness/ideate/**.md` | `secondary-context` | Track when produced by Harness Engineering |
| `.harness/brainstorm/**.md` | `secondary-context` | Track when produced by Harness Engineering |
| `.harness/specs/**.md` | `execution-input` | Track when produced by Harness Engineering |
| `.harness/plan/**.md` | `execution-input` | Track when produced by Harness Engineering |
| `.harness/memory/LEARNINGS.md` | `policy` | Track |
| `.harness/active-artifacts.md` | `execution-input` | Track |
| `.harness/artifacts/README.md` | `policy` | Track |
| `.harness/artifacts/brownfield-memory-inventory.md` | `execution-input` | Track when onboarding brownfield projects |
| `.harness/artifacts/sync-receipts.jsonl` | `secondary-context` | Track curated receipts |
| `.harness/knowledge/**.md` | `secondary-context` | Track |
| `.harness/quality/**` | `policy` | Track |
| `.harness/review-log.md` | `secondary-context` | Track |
| `.harness/ci-required-checks.json` | `policy` | Track |
| `.harness/ci-provider-transition-status.json` | `policy` | Track |
| `.harness/artifact-provenance.json` | `policy` | Track |
| `.harness/*-manifest.json` | `policy` | Track with care when validators consume it |
| `.harness/backups/**` | `backup/scratch` | Do not track |
| `.harness/*.db` | `generated-runtime` | Do not track unless promoted to a fixture |
| `.harness/ci-migrate-snapshots/**` | `generated-runtime` | Do not track unless a fixture or doc contract consumes it |
| `.harness/runs/**` | `generated-runtime` | Do not track |
| `.harness/memory/codex-learned/**` | `generated-runtime` | Do not track |
| `.harness/memory/codex-preflight-overrides.env` | `generated-runtime` | Do not track |

## Codex-Native Baseline

Greenfield and brownfield repositories need a small, source-owned memory and
artifact baseline so Codex can distinguish repo truth from optional runtime
signals. The baseline is:

- `.harness/memory/LEARNINGS.md` for repo-scoped durable fixes.
- `.harness/knowledge/**` and `.harness/decisions/**` for Project Brain facts,
  hypotheses, rules, and accepted decisions.
- `.harness/review-log.md` for periodic review evidence.
- `.harness/active-artifacts.md` for current execution-input pointers.
- `.harness/artifacts/README.md` for artifact and sync receipt rules.
- `.harness/artifacts/sync-receipts.jsonl` for Project Brain, vault, Local
  Memory CLI, Local Memory MCP, Chronicle, native citation, artifact state,
  source evidence, redaction, and reason fields.
- `docs/goals/README.md` for goal-board conventions. Runtime goal state stays
  in `docs/goals/<goal-slug>/state.yaml` and receipt evidence stays in
  `docs/goals/<goal-slug>/receipts.jsonl`.

Chronicle is observational evidence only. Promote Chronicle-derived claims only
after they are verified against repo files, runtime artifacts, PR or tracker
state, or explicit owner direction.

## Admission Rule

Secondary context is not execution authority on its own. Files under
`.harness/review`, `.harness/strategy`, `.harness/triage`, `.harness/features`,
`.harness/ideate`, and `.harness/brainstorm` can inform work, but they only
drive implementation after an admitted `.harness/linear`, `.harness/refactors`,
`.harness/specs`, or `.harness/plan` slice references them.
