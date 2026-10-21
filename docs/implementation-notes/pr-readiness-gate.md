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

Formal bot artifacts require the exact provider login, Bot account type,
positive actor/review IDs, current commit, exact PR review URL and an APPROVED
or COMMENTED state. Human accounts with provider-like names, stale reviews,
pending/dismissed reviews and requests for changes cannot fill either bot lane.
Artifact inventory remains separate from the global verdict and concern checks.
The local `merge` phase now executes the projected global validator with
`--phase update --check-receipt`, bound to the exact repository, PR, head and
base. That consumption rechecks hosted reviews, later concerns, threads and
CI. Missing, stale, failed or mismatched receipts block local merge readiness;
a successful artifact inventory cannot replace this clearance lane.
The consumer's `--expected-head` argument names the PR source branch; the
receipt's `repo.head_sha` separately binds the immutable commit. The local
adapter checks both identities, along with the base branch and checkout root.
The merge phase requires Python 3 and a readable
`~/.codex/scripts/pr-readiness.py` supplied by the operator's managed Codex
configuration (the Configs repository's canonical `codex/scripts` projection).
This website repository does not provision that global file. The global script
must support `--phase update --check-receipt` with the exact repository, PR,
head and base arguments and emit the validated `pr-readiness/v1` receipt.
The ordinary PR CI workflow does not run this operator merge phase. Any CI
environment that runs it must provision the same trusted validator and create
the matching update receipt first. A missing/invalid script or receipt produces
`global_review_clearance_missing` and blocks merge; no override skips the check.
Before the local merge command, produce the global receipt from the clean,
published candidate. Its scope input is a newline list of exact changed paths,
separate from this repository's JSON scope manifest:

```sh
git diff --name-only --output=.playwright-tmp/pr-scope.txt origin/main...HEAD
python3 ~/.codex/scripts/pr-readiness.py --phase update --scope-file .playwright-tmp/pr-scope.txt --write-receipt
```

Run the local merge validator with its JSON manifest only after that update
phase passes. The consumer rechecks the live hosted state rather than trusting
the recorded receipt alone.

Codex can publish a no-findings review as its authenticated PR completion
summary instead of a formal PR review submission. The local artifact inventory
accepts only the exact Codex bot, PR URL and current head with a completed code
review and explicit false finding flags. A security-only, stale, failed,
incomplete, malformed or ambiguous summary does not count. This is artifact
detection, not independent clearance: the global current-head update receipt
still verifies reviewer verdicts, reaction provenance, later concerns and all
other merge requirements before merge.

CodeRabbit can also publish its result as a chat reply. The local inventory
recognises the supported complete reply layout with the exact bot identity,
PR comment URL and full current-head no-findings statement. Versioned headers
and the known read-only comment-fetch trace are decoration; quoted verdicts,
unknown analysis, appended findings and incomplete replies do not count.
Only the latest authenticated bot event can supply that artifact. A later
concern, incomplete response, unknown layout, invalid timestamp or tied latest
events blocks the local inventory, including when an older comment is edited.
The selected reply must also be newest by creation time. An edit to an older
clean reply cannot displace a newer substantive response, while edits adding
concerns to older comments still block the inventory.
This inventory does not clear later concerns: the global update receipt remains
mandatory and independently evaluates the full review history.

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
