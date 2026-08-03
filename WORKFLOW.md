# Portfolio workflow

This document is the repository-owned workflow for the `portfolio` checkout.
`brainwav.io` is the public site and deployment identity; it is not a separate
checkout or a substitute for Git branch and worktree state.

## 1. Establish a task worktree

Keep the primary checkout untouched when it has unclassified changes. Linear is
the task authority: use the issue's generated branch name, or create the same
lower-case identifier shape before making a worktree.

```sh
bash scripts/new-task.sh --prepare --branch-prefix jscraik jsc-123-task-slug
```

`--bootstrap` remains a compatible alias for existing automation. The helper
fetches the requested base, creates one branch/worktree pair, and runs the
repository bootstrap. If bootstrap fails, it removes only the worktree and
branch it just created.

Do not link a pull request to an unrelated or closed issue. Normal issue-linked
delivery branches and PRs must carry the Linear issue identifier for the work
actually being delivered. Standalone review-remediation PRs may use
`jscraik/<short-description>` when the body records a concrete Linear `n/a`
reason.

Before switching, merging, or fast-forwarding a checkout, inspect collisions:

```sh
bash scripts/preflight-branch-transition.sh --target origin/main --format json
```

`blocked` means an untracked path would be overwritten. Preserve it and resolve
its ownership explicitly; this preflight never deletes, stashes, or overwrites
files.

## 2. Prove the changed behaviour locally

Choose the narrowest repository-owned command that exercises the change, then
widen only when the changed surface requires it:

```sh
npm run validate:operator-contract
npm run validate:fast
npm run check
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm run test:smoke
```

Use focused validators for content, page surfaces, Jose claim wording,
worktree authority, release boundaries, and social assets. Browser-rendered
proof remains a separate lane: a build or smoke pass does not prove visual
parity, accessibility, hosted CI, review completion, or merge readiness.

## 3. Prepare a pull request

Before creating or updating a pull request, create a repository-relative scope
file and run the current-head readiness receipt required by the active Codex
instructions. The receipt separately checks remote ancestry, PR head, scope,
dirty worktree, required checks, reviews, and approval state.

For a solo-developer merge waiver, record the waiver as an explicit policy
exception. It does not become an independent review approval.

## 4. Close safely

Report each evidence lane independently using:

```text
Command: <exact command> -> pass|fail|blocked (<reason>)
```

Generated receipts and build outputs remain local runtime state unless a
repository contract explicitly promotes a stable schema or fixture. Do not use
cleanup, force-push, or broad staging to make a readiness report look clean.
