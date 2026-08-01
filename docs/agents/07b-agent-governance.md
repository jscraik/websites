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

When changing an operator projection or its validation gate, keep the action
contract and the debt baseline reviewable: add a focused regression test,
inspect newly discovered debt, and baseline only existing findings. This does
not replace hosted PR readiness, review, or merge evidence.

When a dependency change refreshes tracked architecture projections, update
the linked architecture and governance documentation before push. Generated
diagram evidence informs the change; it does not replace the documented
workflow contract or hosted review evidence.

When a source-quality validator or focused regression fixture adds a node to
the tracked architecture projections, keep `AGENTS.md` and the architecture
bootstrap guidance aligned with the validator entrypoint and its proof scope.
The CSS simplification fixture follows the same rule: its selector-removal
assertions and the shared shell gradient contract must remain named in both
surfaces when the stylesheet or route markup changes.

For Jose parity work, the stored bundle and its accepted decision record are
the design authority. Current-live comparisons remain advisory evidence, and
agents must not silently refresh the bundle, weaken mismatch budgets, or turn
identity-specific copy and imagery into the structural comparison oracle.
