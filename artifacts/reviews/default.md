# QA review artifact

`schema_version: 1`

Status: completed

The QA lane designed a test-first proof plan for the approved directory-backtest
repairs. The plan uses deterministic accepted/rejected fixtures for option
parsing, operator documentation, generated receipt placement, and Git
transition collisions; it keeps product, runtime, hosted, and review evidence
separate. The primary worktree is dirty and behind its remote, so mutation-capable
fixtures must run in a disposable task worktree.

Full report: `/private/tmp/portfolio-directory-backtest-reports/qa.md`.

WROTE: artifacts/reviews/default.md

---

## Adversarial review accountability record — directory-backtest implementation

This task's full adversarial report is located at
`/private/tmp/portfolio-directory-backtest-reports/adversarial.md`. It records
the primary-checkout isolation requirement; CODESTYLE, WORKFLOW, and runtime
receipt ownership blockers; collision-preflight false-positive requirements;
and test-hygiene constraints. Repository source was not edited by this review
lane.
