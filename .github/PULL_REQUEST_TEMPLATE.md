# Pull request checklist

Write for human maintainers first. Use `n.a.` with a concrete reason when a
field does not apply. Do not paste secrets, raw transcripts, bulky telemetry,
or local absolute paths.

## What Problem This Solves

- Motivation:
- Reasoning:
- Chosen approach:

## Release Boundary

Choose the release standard before listing proof. Use `n.a.` with a concrete
reason only when the change has no release-stage meaning.

- Release mode:
- Done line:
- Explicit non-goals:
- Allowed polish:
- Deferred polish / follow-up work:
- Promotion rule:

<!--
Prototype: prove the idea has value. Core path works; known gaps are listed; no unsafe behavior.
Portfolio: credible, coherent, navigable, and explainable. Demo, screenshots, and trade-offs matter more than infrastructure hardening.
Product: reusable and maintained. Tests, docs, release path, versioning, and supportable architecture are expected.
Harness: trust boundary or repeatable proof. Deterministic checks, receipts, failure behavior, and evidence boundaries are expected.

Promotion rule should name what would force this PR into a more serious mode.
If a new improvement does not fit the selected release mode or done line, defer
it to follow-up work instead of absorbing it into this PR.
-->

## Why This Change Was Made

- Problem:
- Why now:
- Intended outcome:
- Out of scope:
- Reviewer focus:
- Risk and rollback:

## Behavior Proof

Complete this section when the PR changes runtime behavior, CLI behavior,
generated artifacts, validation behavior, agent workflow behavior, user-facing
docs, or any observable operator experience. Use `n.a.` with a concrete reason
for docs-only, metadata-only, or evidence-only changes where no behavior path
exists.

- Behavior before fix:
- Behavior or issue addressed:
- Real environment tested:
- Exact steps or command run after this patch:
- Evidence after fix:
- Observed result after fix:
- What was not tested:
- Proof limitations or environment constraints:

Behavior proof guidance: Behavior proof is separate from unit tests, lint,
typecheck, and CI. Use it to show the actual production path or nearest
meaningful operator path after the patch. If the exact path could not run,
state the blocker and the nearest fallback. Do not paste secrets, raw
transcripts, bulky telemetry, or local absolute paths.

## Work performed

- Plan IDs:
- Linear reference:
- Linked issue relationship:
- Phase / slice:
- Session IDs:
- Trace IDs:
- AI session / traceability:
<!-- Cite durable session/run/runtime-card references when available. Do not paste raw transcripts, prompts, secrets, or bulky telemetry. -->
- Completed work:
- Affected surfaces:
- Documentation impact:
- Documentation lifecycle impact:
- SemVer impact:
- Expected outcome alignment:
- Pattern scope inventory:
- Meta-behavior proof:
- Repeated-error research:
- Acceptance trace:
- Validation evidence:
- Review artifacts:
- Durable evidence map:
- Runtime impact:
- CodeRabbit mode coverage:
- Closeout state:
- Learning / reinforcement:
- Deferred work:
<!-- Closeout state must classify PR state, merge or auto-merge state, branch/worktree state, Linear state, next-lane routing, and any remaining blocker or waiting owner. -->

## Checklist

- [ ] I did not push directly to `main`; this PR is from a dedicated branch.
- [ ] Branch name follows policy (`jscraik/<linear-key>-<short-description>` for issue-linked delivery; standalone review-remediation PRs may use `jscraik/<short-description>` when the body records a concrete Linear `n/a` reason).
- [ ] Required local gates run: `bash scripts/validate-codestyle.sh`, `npm run check`, `test -f memory.json && jq -e '.meta.version == "1.0" and (.preamble.bootstrap | type == "boolean") and (.preamble.search | type == "boolean") and (.entries | type == "array")' memory.json >/dev/null`.
- [ ] **(Pending)** CodeRabbit review completed and findings handled (or explicitly waived).
- [ ] **(Pending)** CodeRabbit review was performed by an independent reviewer (not the coding agent).
- [ ] **(Pending)** Codex review completed and findings handled (or explicitly waived).
- [ ] Any CodeRabbit Semgrep findings were either fixed or explicitly justified when warning-level-only.
- [ ] This change is user-facing and I added a changelog entry.
- [ ] This change is not user-facing.
- [ ] Merge is blocked until all required checks pass.
- [ ] I will delete branch/worktree after merge.

## Testing

- regression_test_plan:
- verification_commands:
- verification_outcomes:
- blocked_steps_reason:
<!-- Add one or more evidence lines such as:
- Command: `bash scripts/validate-codestyle.sh` -> pass
- Command: `npm run check` -> blocked (reason)
- Command: `test -f memory.json && jq -e '.meta.version == "1.0" and (.preamble.bootstrap | type == "boolean") and (.preamble.search | type == "boolean") and (.entries | type == "array")' memory.json >/dev/null` -> n.a. (reason)
-->
- Any other command(s):

## Review artifacts

- CodeRabbit:
- Independent reviewer evidence:
- Codex:
- CodeRabbit Semgrep:
- Additional evidence (if any):

## Notes

<!-- Add one-paragraph merge rationale before requesting review. -->
