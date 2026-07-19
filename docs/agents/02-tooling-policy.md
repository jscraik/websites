# Tooling policy

## Package and runtime authority

`package.json` and `package-lock.json` are the source of truth for the
portfolio package. Run repository commands with npm from the repository root;
do not substitute a parent pnpm or harness command contract.

`.mise.toml` defines the managed runtime selection. A trust or cache failure is
an environment result: record it separately from source validation and do not
silently replace the configured runtime.

## Harness fallback

The repository may use the public `@brainwav/coding-harness` package through
`scripts/harness-cli.sh`. The registry fallback is opt-in with
`HARNESS_CLI_ALLOW_NPM_EXEC=1` so normal checks do not unexpectedly download
tooling. Public package resolution must not require an npm authentication
precheck; private registry failures remain explicit command failures.

## Validation routing

Use the narrowest npm script that proves the change, then widen by risk:

- `npm run validate:operator-contract` for task-entry, worktree, receipt, and
  operator workflow changes.
- `npm run validate:fast` for ordinary source, content, and policy changes.
- `npm run check` for Astro type and integration diagnostics.
- `npm run validate:source` or rendered validation only when affected output
  or browser behavior requires that proof.

The pre-push hook is deliberately limited to the portfolio contract: operator
validation, Git worktree authority, `validate:fast`, `check`, and `build`.
It must not demand the copied full-Harness tooling inventory, a private
environment template, or generic scanners that this npm/Astro project does
not configure. PR readiness remains a separate fail-closed receipt before PR
creation and before merge, where remote ancestry, current-head review state,
review threads, required checks, declared scope, and dirty paths are checked.

Generated receipts, build output, npm caches, and temporary fixtures remain
runtime state unless a repository contract explicitly promotes them to source.
