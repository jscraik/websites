# Agent governance

## Scope and handoff

Agents work only on the approved task slice and preserve unrelated dirty state.
For portfolio operator work, keep task code in a dedicated worktree and retain
the primary checkout for its owner. A reviewer may identify findings, but the
coordinator owns scope reconciliation, validation evidence, and delivery.

## PR readiness

PR readiness is a separate hosted lane. Before creating or updating a pull
request, create a repository-relative scope file and run the configured
readiness phase for the current branch and HEAD. Local tests, a clean isolated
worktree, or a prior review do not prove current hosted checks, current-head
review, resolved conversations, or merge state.

For a solo-maintainer waiver, record an explicit policy exception. It does not
become an independent approval. Keep current local validation, hosted checks,
review artifacts, Linear linkage, and merge readiness as distinct evidence
lanes.

## Evidence format

Report command evidence with its scope and result:

```text
Command: <exact command> -> pass|fail|blocked (<reason>)
```

When a tool or permission prevents execution, state the blocker and nearest
meaningful fallback without describing the unavailable lane as proved.

Project-local skills and operator projections remain bounded governance inputs:
record their pinned source or contract when they enter a delivery scope, and do
not treat generated receipts as approval or hosted-state evidence.
