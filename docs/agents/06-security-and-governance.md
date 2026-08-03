# Security and delivery governance

## Worktree and source boundaries

Treat an existing dirty checkout as user-owned until its paths and ownership
are classified. Inventory does not authorize cleanup. Create a dedicated
worktree for task changes and run the read-only branch-transition preflight
before any checkout, merge, or fast-forward that could overwrite untracked
paths.

Do not use reset, force-push, broad staging, or generated-output deletion to
make an evidence report appear clean. A blocked local path collision is an
ownership decision, not a cleanup command.

## Linear authority

Linear is the portfolio issue tracker. Issue-linked agent-created delivery
branches use `jscraik/<lower-case-linear-key>-<short-description>`, for example
`jscraik/jsc-469-harden-portfolio-operator-workflow`. Use the issue's generated
branch name where Linear provides one. Standalone review-remediation PRs may
use the `jscraik/` prefix without an issue key only when the PR body records a
concrete Linear `n/a` reason. Do not attach work to an unrelated or closed
issue.

The Harness contract stores the single-segment `jscraik` prefix because its
schema rejects multi-segment values such as `jscraik/feature`.

## External authority

Creating tracker items, changing pull-request state, pushing refs, and merging
are separate external mutations. Perform them only with explicit user
authority and report their results independently from local validation.

Environment projections, pinned skills, and diagram artifacts are committed
only within an explicit delivery scope. Review their source commit or digest
before staging, and preserve unrelated dirty paths and runtime receipts.

The code-quality debt baseline records accepted existing debt only. When the
validator expands a source surface, inspect newly visible findings first, then
update the baseline only for pre-existing findings rather than using it to hide
debt introduced by the delivery.

## Hosted CI and Pages boundary

CircleCI is the hosted authority for required checks. Cloudflare Pages Direct
Upload is restricted to the main branch and the `cloudflare-pages-production`
context; a local build, preview URL, or passing pull-request check does not by
itself prove a production publication. Record the Pages deployment result
separately from local and review evidence.
