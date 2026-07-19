# Portfolio operator contract

## Status

Accepted — 2026-07-19.

## Context

The portfolio checkout had operator-facing contracts that disagreed with the
application package and worktree scripts. `WORKFLOW.md` retained an
unconfigured Symphony template with destructive cleanup, instructions named
`new-task --prepare` while the script only accepted `--bootstrap`, a tracked
preflight receipt dirtied normal checkouts, and a malformed Makefile recipe
prevented the worktree bootstrap path from running.

## Decision

Treat the repository-owned npm scripts, worktree helpers, and validation
receipts as the canonical operator interface. Keep `--prepare` as the public
worktree-bootstrap spelling while accepting `--bootstrap` for compatibility.
Replace the foreign workflow template with a portfolio-specific sequence that
uses Linear as the issue authority and its supported single-segment branch
prefix. Do not require a private npm-auth precheck before using the public
`@brainwav/coding-harness` package fallback.
Write live preflight receipts under ignored runtime state. Require a
non-mutating branch-transition preflight before branch movement where target
files may collide with local untracked paths.

## Consequences

The workflow becomes executable from the current checkout while preserving
Linear-backed issue and branch linkage. Runtime receipts stop creating source diffs.
The branch-transition guard can block unsafe movement early, but it does not
clean or resolve collisions; explicit ownership remains required.

## Validation

- `npm run test:operator-workflow-contract`
- `npm run test:branch-transition-preflight`
- `npm run validate:operator-contract`
