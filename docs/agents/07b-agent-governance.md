# Agent governance

Read this document when a task selects delegation, persistent coordination,
operator-projection changes, or PR delivery. Ordinary local implementation does
not require loading this governance detail unless one of those boundaries is
reached.

## Scope and handoff

The approved editorial theme is a portfolio presentation change. Preserve
product-demo styling and public content; any later Ask assistant needs its own
source, privacy, abuse-control and release acceptance evidence. Coordination
or a prototype does not authorise publishing an AI feature.

When removing optional private development tooling, remove unused CI credential
handling and update its focused operator contract tests in the same release.

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

The Linear project URL is synchronized across the Harness contract, package
metadata, and GitHub issue intake. A standalone review-remediation PR may keep
the `jscraik/` branch prefix without an issue key when its body records a
concrete Linear `n/a` reason; issue-linked delivery still uses the generated
`jscraik/<linear-key>-<short-description>` branch.

For the solo-maintainer workflow, use the hosted human approval quorum; zero
does not require a second human. A waiver of other requirements needs an explicit
policy exception and does not become an independent approval. Keep current local validation, hosted checks,
review artifacts, Linear linkage, and merge readiness as distinct evidence
lanes.

Codex's authenticated current-head completion summary is a supported review
artifact even when no formal review submission is created. Artifact presence
does not replace the global update receipt's verdict, reaction and concern checks.
CodeRabbit's authenticated current-head chat reply is also a supported local
artifact when its complete recognised layout contains an explicit no-findings
statement. Global update receipts still own clearance and later-concern checks.
Formal artifacts require exact bot logins/types, positive actor and review IDs,
the current head, the exact PR review URL and an allowed review state; a human
account with provider-like words in its name cannot satisfy either bot lane.
The local merge gate consumes and live-revalidates the global update receipt.
Artifact presence alone cannot produce a passing merge-readiness result.

CodeRabbit review includes the npm lockfile, authored image assets and committed
visual snapshots through exact default-ignore overrides in `.coderabbit.yaml`.
Keep those overrides distinct from ordinary include patterns: a broad include
does not override the provider defaults. Build output, dependency directories
and scratch artifacts remain excluded. Review eligibility does not prove the
provider inspected a binary; verify its published coverage and limitations.

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

The diagram dependency and mandatory refresh gate were retired at Jamie's
request on 18 October 2026. Preserve stored projections as historical references;
do not install the tool or require generation for source changes. Keep affected
architecture and governance documentation aligned before push. Historical
diagrams do not prove the current source graph or replace hosted review evidence.

When a source-quality validator or focused regression fixture adds a node to
the tracked architecture projections, keep `AGENTS.md` and the architecture
bootstrap guidance aligned with the validator entrypoint and its proof scope.
The CSS simplification fixture follows the same rule: its selector-removal
assertions and the shared shell gradient contract must remain named in both
surfaces when the stylesheet or route markup changes.
The architecture bootstrap is the durable owner for portfolio schema,
public-route inventory, shared motion, development-only tooling, and diagram
projection boundaries. When any of those mechanisms change, agents must update
that bootstrap with the implementation and keep this governance surface and
root `AGENTS.md` aligned before push.

Route-specific editorial rhythm belongs in `src/styles/route-rhythm.css`, not
the shared shell. Keep its selectors scoped to the owning route and run the
rendered validation contract when that stylesheet changes.

Portfolio navigation uses native route links with a static background. Its
source and browser contracts check stable geometry and consistent destinations;
the retired moving/reparented highlight is not a required parity mechanism.

For Jose parity work, the stored bundle and its accepted decision record are
the design authority. Current-live comparisons remain advisory evidence, and
agents must not silently refresh the bundle, weaken mismatch budgets, or turn
identity-specific copy and imagery into the structural comparison oracle.

Dependency remediation must preserve the existing audit thresholds. Vite's
`8.1.6` override addresses GHSA-698v-4r3x-3vcv without a framework upgrade;
remove that compatibility pin only when the dependency chain resolves a
patched version and the normal production audit passes.

The shared portfolio shell is a route-independent governance boundary:
`src/styles/shell.css` owns the header, navigation background, and footer
surfaces, while route-local styles keep each page canvas on the neutral paper
token. Rendered proof may attach through the approved disposable external
Chrome/CDP route only after the exact candidate artifact is served; the app HTTP
port and the CDP endpoint are separate evidence lanes.

The homepage and case-study routes use `src/components/WorkCarousel.astro` for
the same centred work-card interaction. The SkillsBar demo uses the portfolio
shell around an isolated native-style inspector. Its stage selections and
example refreshes must preserve fixture evidence, and copying a command must
never execute it. Native captures and browser fixtures retain their explicit
synthetic-data and integration limitations.

CircleCI validation and Cloudflare Pages publication are separate hosted
evidence lanes. The `pr-pipeline` workflow validates pull requests, including
the `security-scan` job and the report-only `snyk-dependency-scan` job. Its
main-only `publish-pages` job validates and uploads the checked-out `dist/`
artifact through the restricted `cloudflare-pages-production` context after
the required source, audit, security, and dependency jobs succeed. A local
build or a passing PR check does not prove that the Pages context, custom
domain, or hosted deployment is ready.
