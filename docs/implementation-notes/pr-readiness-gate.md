# Strict Pull Request Readiness Gate

## Decision

Pull request creation and merge preparation must use an explicit readiness gate. The gate is `scripts/validate-pr-readiness.mjs`, exposed as:

```sh
npm run validate:pr-readiness -- --phase pre-pr --base origin/main --scope-file <scope-file>
```

The default is strict: any blocker produces a non-zero exit code. `--report-only` is available for diagnostics, but it must not be used as creation or merge proof.

## Proof lanes

The gate keeps local and hosted evidence in one machine-readable receipt while retaining their boundaries:

- `pre-pr` verifies the current remote base and tracked-branch head ancestry, changed-file scope, and dirty-worktree boundary before a PR is created.
- `merge` verifies the hosted PR is open and non-draft, its base and head are available, its merge state is current, and its base is an ancestor of the current head.
- `merge` also resolves an active required-status-check configuration from repository rulesets or branch protection for the protected integration branch, then compares every required context with the current reported check result.
- `merge` reads the required human approval count from active GitHub rulesets and branch protection, taking the strongest applicable count. Zero permits the solo-maintainer workflow; a configured non-zero count still requires that many independent current-head human approvals. Missing or malformed policy evidence blocks readiness. Codex and CodeRabbit review evidence remain separate requirements. Reviews attached to an older head do not satisfy the gate.
- A PR whose base is another feature branch is treated as stacked. Its parent PR must be discoverable by base branch and be merged before the child is ready.
- Both phases require an explicit scope manifest (or equivalent `--allow-path` patterns) and reject unapproved dirty paths.

Passing local checks do not prove hosted review or CI state. Passing hosted checks do not prove that unrelated local dirty files were excluded. The gate reports each lane separately so a closeout can state exactly what remains blocked.

## Scope manifest

Use a short-lived, reviewable manifest for each PR boundary. The schema is `portfolio-pr-scope/v1`:

```json
{
  "schema_version": "portfolio-pr-scope/v1",
  "allowed_paths": [
    "scripts/validate-pr-readiness.mjs",
    "scripts/lib/pr-readiness-boundaries.mjs",
    "package.json",
    "docs/implementation-notes/pr-readiness-gate.md"
  ],
  "excluded_paths": [
    ".harness/runtime/",
    "artifacts/",
    "dist/",
    "node_modules/"
  ],
  "dirty_allowed_paths": [
    ".harness/runtime/codex-preflight-status.json"
  ],
  "max_files": 20
}
```

`allowed_paths` is checked against the PR's changed files. `excluded_paths` is an explicit stop condition, even when a path would otherwise match an allowed prefix. `dirty_allowed_paths` is checked against `git status --porcelain=v1 -z`; it is intentionally separate from PR scope so generated runtime receipts cannot silently become part of a PR.

Do not commit a manifest containing a broad wildcard merely to make the gate pass. Keep the manifest in a temporary path or add a narrowly scoped project artifact when the boundary itself needs review.

## Hosted command

For a current hosted PR, run:

```sh
npm run validate:pr-readiness -- \
  --phase merge \
  --pr <number> \
  --repo <owner/repo> \
  --scope-file <scope-file> \
  --json
```

The JSON output has schema `portfolio-pr-readiness/v1` and includes `ancestry`, `stack`, `reviews`, `checks`, `scope`, `dirty_worktree`, and a severity-neutral `blockers` array. A blocked result is evidence that creation or merge readiness is not established; it is not evidence that the source code itself fails its ordinary validation suite.

## Failure policy

The gate must fail closed when it cannot read a required surface. Examples include missing Git ancestry, an unreadable scope manifest, unavailable hosted PR metadata, unavailable reviews or checks, no configured required checks, stale-head review evidence, a missing stacked parent, or an unapproved dirty path. Use the exact command and blocker code in the closeout so the next iteration can repair the correct boundary rather than re-running unrelated tests.
