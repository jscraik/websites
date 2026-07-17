# Operational telemetry and steering guardrail

Repeated steering is workflow telemetry. It means the environment made the
operator reconstruct state, retry a command, clarify an authority boundary, or
repair a recovery path that should have been deterministic.

The machine-readable contract lives in
[`operational-telemetry.json`](operational-telemetry.json) and is enforced by
`npm run validate:operational-telemetry`. The fast repository gate runs this
validator before source checks so a missing lesson cannot silently regress into
conversation-only guidance.

The repository maintainer owns the JSON contract and validator. A blocked
direct-runtime-wrapper follow-up escalates to the Portfolio Officer Commanding,
then to the CO Thread only when repository evidence cannot resolve the runtime
or authority boundary.

## Current signals

| Signal | Failure category | Durable response | Status |
| --- | --- | --- | --- |
| `steering-continuation-001` | stale state, poor workflow design, lack of observability | Require a continuation checkpoint with lane, worktree, branch, SHA, dirty state, dependency gate, blockers, and exact validation evidence. | implemented |
| `validation-concurrency-002` | weak validation, poor workflow design, runtime ambiguity | Declare validation serial unless generated output is isolated per command. | implemented |
| `runtime-shim-003` | runtime ambiguity, insufficient deterministic enforcement, lack of observability | Classify untrusted-shim failures as `blocked_runtime` and add a direct-runtime recovery wrapper. | proposed; follow-up required |

## Continuation checkpoint contract

Before resuming a paused or recovered lane, record the active lane, worktree,
branch, head SHA, allowed dirty state, next action, dependency gate, blockers,
and exact validation evidence. The next action must be derived from the
repository-local plan and the dependency gate must be explicit. A summary or
conversation acknowledgement is not a substitute for the checkpoint.

## Validation and runtime rules

Portfolio checks run serially because Astro check, build, and smoke share
generated state under `.astro/`, `dist/`, and related ignored directories. A
parallel run is valid only when each command is given an isolated output root.

An untrusted mise shim is a runtime/tooling blocker, not a source-validation
failure. Until the direct-runtime recovery wrapper exists, record the exact
resolved executable, classify the command as `blocked_runtime`, and run the
nearest meaningful direct-binary fallback without claiming the repository
wrapper passed.

This document is an implementation note and operating rule. The JSON contract
and validator are the enforcement surface; this prose must not weaken their
claims or dependency boundaries.
