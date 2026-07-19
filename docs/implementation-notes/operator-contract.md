# Portfolio operator-contract repair

## Problem

The active worktree path was internally inconsistent. Repository instructions
named `scripts/new-task.sh --prepare`, while the script accepted only
`--bootstrap`. The Makefile could not be parsed, so its declared
`worktree-ready` target never ran. Once that parser defect was removed, the
hook installer could not run because it contained TypeScript annotations in a
plain JavaScript file. The active workflow document also retained an
unconfigured external template, including a destructive cleanup hook.

The primary checkout additionally had a legitimate untracked `.codex/skills/`
collision with tracked paths from `origin/main`. Git correctly refused the
fast-forward, but the workflow had no deterministic read-only preflight to
classify the collision before checkout or merge activity.

## Implementation

- `--prepare` now aliases the retained `--bootstrap` branch/worktree bootstrap
  behaviour.
- `scripts/preflight-branch-transition.sh` reports untracked paths that overlap
  a locally available target tree and returns a machine-readable `pass` or
  `blocked` result without changing repository state.
- The live preflight receipt remains at `.harness/runtime/` but is ignored and
  no longer tracked. `CODEX_PREFLIGHT_RECEIPT_PATH` provides an explicit
  external-path seam for deterministic receipt tests.
- The worktree-local Prek cache at `.cache/prek/` is ignored so a successful
  hook bootstrap does not create unrelated Git noise.
- `WORKFLOW.md` now names the actual portfolio/npm/worktree/PR evidence flow;
  it contains no active external tracker configuration or destructive cleanup
  hook.
- The Makefile recipe and JavaScript hook installer are executable by their
  declared runtimes.

## Behaviour proof

The focused tests create disposable Git repositories and receipt directories
outside the checkout. They prove both a clean transition and a blocked
untracked-overwrite transition, pass and fail receipt emission, the two
bootstrap flags, Makefile parsing/help output, and the hook installer’s Node
syntax.

The collision preflight intentionally does not resolve ownership, fetch,
checkout, merge, stash, clean, or delete paths. A `blocked` result is an
authority boundary requiring a separate preservation decision.

## Limits

These checks prove local operator contracts. They do not prove hosted PR
reviews, CI, deployment, browser-rendered parity, or that a user-owned
untracked path may safely be removed.
