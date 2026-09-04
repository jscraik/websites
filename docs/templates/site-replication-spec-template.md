# Site Replication Specification Template

Use this document to create a candidate-bound implementation contract for one
site. Do not replace placeholders mechanically. Delete every conditional module
that does not apply, and move large content inventories, hashes, screenshots,
and geometry records into a separate evidence package.

The completed specification should tell an implementation agent what to build,
which observations are authoritative, which unknowns block work, and what proof
terminates the task. It should not become a prose dump of the source HTML.

## 1. Outcome and claim boundary

- Target site: `[name]`
- Requested outcome: `[local reconstruction | deployable build | published replica]`
- Declared target version: `[immutable version, commit, capture timestamp, or URL]`
- Canonical candidate route or route set: `[routes]`
- Replication mode: `[source_clone | observable_replica]`
- Fidelity mode: `[source-faithful replica | remediated derivative]`
- Required environments: `[browser, OS, viewport, DPR, preferences]`
- Explicitly excluded claims: `[HTTP parity, cross-browser parity, backend parity, and so on]`

Define “100%” using observable boundaries. Never use the term alone.

`source_clone` requires the declared source artifacts to remain byte-identical
except for listed host-adapter changes. `observable_replica` permits different
source and architecture but requires the declared content, state, behavior,
visual, runtime, and access contracts to pass. Never require candidate CSS or
JavaScript hashes to equal the reference in `observable_replica` mode.

> For this project, parity means `[content, structure, behavior, visual states,
> runtime, and access properties]` match the declared target in `[named
> environments]`. It does not claim `[excluded lanes]`.

## 2. Authority and rights

### 2.1 Target authority

Choose one immutable target before implementation. Rank evidence in this order
unless the project records a justified exception:

1. Hash-verified source archive or versioned repository snapshot.
2. Stored reference captures and machine-readable state records bound to that
   version.
3. A live reference whose fingerprints still match the declared target.
4. This specification for requirements not observable in the reference.

If authorities disagree, stop only the affected lane, record the conflict, and
resolve which target is intended. Never let a mutable live page silently change
an immutable target.

### 2.2 Rights and handling

- Replication authorization: `[owner and basis]`
- Asset/content reuse authorization: `[scope]`
- Sensitive or personal data present: `[yes/no and handling]`
- Third-party fonts, media, analytics, or SDKs: `[inventory and license status]`
- Prohibited storage or publication: `[items]`

Do not extract, store, redistribute, or publish assets until this section
authorizes that action. Visual availability is not reuse permission.

## 3. Reference admission

### 3.1 Required evidence

| Artifact | Identifier or path | Integrity check | Required for | Status |
| --- | --- | --- | --- | --- |
| Source/version snapshot | `[value]` | `[hash/version]` | implementation | `[present/missing]` |
| Route inventory | `[path]` | `[count/schema]` | implementation | `[status]` |
| Content manifest | `[path]` | `[hash/schema]` | content proof | `[status]` |
| Asset manifest | `[path]` | `[hash/license]` | visual proof | `[status]` |
| State inventory | `[path]` | `[schema]` | behavior proof | `[status]` |
| Reference captures | `[path]` | `[capture metadata]` | visual proof | `[status]` |
| API/data fixtures | `[path]` | `[schema/hash]` | dynamic behavior | `[status/N.A.]` |

Classify missing evidence by consequence:

- `BLOCKS_IMPLEMENTATION`: the requested experience cannot be identified or
  legally constructed.
- `BLOCKS_PARITY`: construction can proceed, but the affected parity claim
  cannot pass.
- `LIMITATION`: a non-required evidence lane remains unavailable.

“At least one URL loads” is insufficient admission when required routes, hidden
states, authenticated states, or data-dependent states remain unidentified.

### 3.2 Drift check

Before using a live reference:

1. Record capture time, final URL, status code, browser, viewport, DPR, color
   scheme, reduced-motion setting, locale, timezone, and resolved fonts.
2. Compare stable fingerprints with the declared target.
3. If they differ, choose either the immutable target or the new live version.
4. Record that decision; never blend evidence from both versions.

### 3.3 Reference freeze

Freeze reference evidence before candidate writes begin. Reference acquisition
and candidate implementation may be performed by the same agent only when an
independent receipt binds every reference artifact to its origin, final URL,
target fingerprint, capture environment, capture operation, and timestamp.
Make the accepted reference directory read-only during candidate comparison.
Never populate `reference/` from candidate output.

## 4. Site inventory

### 4.1 Routes and access

| Route | Purpose | Entry state | Auth/role | Redirects | Required |
| --- | --- | --- | --- | --- | --- |
| `[route]` | `[purpose]` | `[state]` | `[access]` | `[behavior]` | `[yes/no]` |

Record 404, error, loading, empty, signed-out, and permission-denied states when
they exist. Declare whether publication is authorized; a build request alone
does not authorize deployment.

### 4.2 Content and semantics

Keep large literal copy in a versioned content manifest. In this specification,
record only:

- Content source and normalization rules.
- Required document language, title, metadata, and structured data.
- Landmark and heading outline.
- Interactive-element inventory.
- Image alt-text and accessible-name requirements.
- Text or markup that must preserve non-breaking spaces or line-break intent.
- Content excluded from the candidate, including browser/tool-injected nodes.

### 4.3 Assets and fonts

For each required asset, record source, authorization, bytes or source-string
hash, media type, intrinsic dimensions, and candidate path. Record requested,
available, loaded, and resolved fonts separately; a CSS font-family declaration
does not prove that font rendered.

## 5. Observable implementation contract

Specify observable requirements first. Require internal DOM, framework, class,
or source identity only when the user explicitly needs source equivalence or
when those internals materially affect behavior.

### 5.1 Layout and visual system

- Page/container geometry: `[rules]`
- Tokens: `[reference or table]`
- Typography: `[families, sizes, weights, line heights, tracking]`
- Surfaces, borders, shadows, and radii: `[rules]`
- Layering and fixed/sticky elements: `[rules]`
- Overflow and scrolling ownership: `[rules]`
- Responsive modes and breakpoints: `[rules]`

For every numeric value, state whether it is source-derived, measured,
inferred, or intentionally chosen. Unknown geometry must be measured or marked
unverified; “match the reference” is not an executable instruction by itself.

### 5.2 State and interaction inventory

| State ID | Entry operation | Observable result | Exit/reset | Reduced motion | Evidence |
| --- | --- | --- | --- | --- | --- |
| `[id]` | `[operation]` | `[result]` | `[behavior]` | `[behavior]` | `[ref]` |

For each control, include:

- Accessible name and role.
- Pointer, keyboard, and touch behavior.
- Disabled, hover, focus, active, loading, error, and completed states.
- Focus movement and restoration.
- Cancellation, re-entry, repeated activation, and rapid-input behavior.
- Timer, observer, subscription, or request cleanup.
- History, URL, storage, or server-side effects.

### 5.3 Motion

If motion is present, record triggers, start and end properties, durations,
delays, easing, interruption behavior, settled condition, and reduced-motion
equivalent. A screenshot proves a state, not the transition into it.

### 5.4 Conditional module: data and APIs

Delete this subsection for fully static sites.

- API/schema contract: `[reference]`
- Deterministic fixtures: `[reference]`
- Loading, empty, partial, error, retry, stale, and offline states: `[rules]`
- Mutation idempotency and optimistic behavior: `[rules]`
- Secrets and personal-data handling: `[rules]`
- External side effects allowed during tests: `[none or exact list]`

Never validate a replica by mutating the production source system.

### 5.5 Conditional module: authentication and roles

Delete this subsection when access is fully public.

Record signed-out, signed-in, expired-session, insufficient-role, and callback
states. Use authorized test identities and redact tokens, cookies, and personal
data from evidence.

## 6. Implementation constraints

### 6.1 Repository execution contract

| Field | Required value |
| --- | --- |
| Repository root | `[absolute or workspace-relative path]` |
| Write scope | `[authorized paths]` |
| Existing routes to preserve | `[routes]` |
| Framework/runtime | `[detected stack]` |
| Package manager | `[manager and lockfile]` |
| Install command | `[canonical command]` |
| Development command | `[canonical command and expected URL]` |
| Build command | `[canonical command]` |
| Focused test commands | `[commands]` |
| Build artifact output | `[path]` |
| Delivery mode | `[local | preview | production]` |
| Deployment target | `[project/account/hostname or N.A.]` |
| Rollback operation | `[operation or N.A.]` |

Inventory and verify these values before implementation. A working scratch file
outside the named repository and artifact output does not satisfy the task.

- Required repository/runtime/host: `[constraints]`
- Allowed dependencies: `[policy]`
- Prohibited substitutions: `[assets, frameworks, services, content]`
- Performance budgets: `[JS, CSS, image, request, LCP/CLS/INP targets]`
- Browser support: `[matrix]`
- Accessibility target: `[source-faithful or named standard]`
- SEO/metadata requirements: `[requirements]`
- Security/privacy requirements: `[requirements]`

Choose the smallest mechanism that can satisfy the observable contract. Do not
mandate static HTML, a particular framework, exact DOM order, or zero hydration
unless that property is part of the requested outcome and has proving evidence.

## 7. Implementation sequence

1. Admit and freeze the target version, rights, routes, states, and evidence.
2. Create the candidate in the authorized repository and route scope.
3. Implement the shell, access behavior, content source, and asset pipeline.
4. Implement every route and state in the inventory.
5. Add deterministic fixtures or state controls for otherwise unstable states.
6. Run focused content, structural, interaction, and runtime checks.
7. Capture the reference and candidate in the same declared environment.
8. Compare, remediate material differences, and repeat affected checks.
9. Produce a candidate-bound report before any parity or publication claim.
10. Publish only when publication is explicitly in scope and the exact tested
    artifact is the artifact being published.

A test-only state controller must add no visible DOM, persistence, analytics,
or externally reachable privileged action. Define its API and `ready` signal.
Exclude it from production or protect it with an explicit non-production gate,
and assert the intended presence or absence in the delivered artifact. Its use
does not replace user-path tests.

## 8. Deterministic proof protocol

Bind every proof run to:

- Target version and artifact hashes.
- Candidate commit and build-artifact hash.
- Exact commands and outcomes.
- Browser, browser version, OS, viewport, DPR, locale, timezone, color scheme,
  reduced-motion setting, and resolved fonts.
- Route, state setup, data fixture, auth role, and settled condition.
- Reference, candidate, diff, console, network, accessibility, and performance
  artifacts required by the claim.

Store results under a candidate-bound directory containing `report.json` and a
human-readable summary. The report must separate `pass`, `fail`, `blocked`,
`unverified`, and `not_applicable`; checked Markdown boxes are not evidence.

An intentional deviation requires a deviation ID, affected requirement, reason,
named approver, durable approval reference, and resulting claim downgrade. The
candidate author cannot self-approve a deviation. An unapproved deviation is a
failure.

### Visual comparison policy

Define before capture:

- Required route/state/viewport matrix.
- Screenshot normalization and masking rules.
- Pixel, geometry, text-wrap, color, and timing tolerances.
- Treatment of font antialiasing, browser chrome, dynamic content, and cursors.
- Whether comparisons are exact-source, perceptual, or geometry-based.

Never invent universal tolerances. Derive them from the claim and environment.
Do not label a mismatch “font variance” without resolved-font and side-by-side
evidence.

## 9. Acceptance matrix

### Target and rights

- [ ] The target version is immutable or has a recorded drift decision.
- [ ] Reuse, storage, and publication rights cover every shipped asset.
- [ ] The tested artifact is the delivered artifact.

### Content and routes

- [ ] Every required route and state exists with exact approved content.
- [ ] Redirects, errors, access gates, metadata, and canonical URLs match scope.
- [ ] No documentation, placeholder, tool, debug, or host-interstitial copy leaks.

### Interaction and accessibility

- [ ] Every control passes pointer, keyboard, touch, focus, reset, and rapid-input tests that apply.
- [ ] Loading, error, empty, reduced-motion, and role-specific states pass when applicable.
- [ ] The declared accessibility target passes with intentional source quirks or remediations recorded.

### Runtime, security, and performance

- [ ] No uncaught errors, required-request failures, leaks, or unexpected side effects occur.
- [ ] Secrets and personal data are absent from source, logs, reports, and captures.
- [ ] Declared browser support and performance budgets pass.

### Responsive and visual

- [ ] Every required route/state/viewport/environment cell has evidence.
- [ ] Geometry, wrapping, assets, colors, motion milestones, and overflow satisfy the declared tolerances.
- [ ] Every unexplained difference is a failure, not an informal exception.

## 10. Outcomes and stop conditions

Use these outcomes without collapsing one into another:

- `implementation_ready`: rights, target, routes, critical states, and at least
  one adequate implementation oracle are known.
- `feature_complete`: the candidate implements the full declared experience.
- `locally_verified`: local checks pass for the exact candidate.
- `parity_verified`: the candidate-bound parity report passes every required lane.
- `published_verified`: the exact verified artifact is publicly reachable and
  post-deployment checks pass.
- `blocked`: a named missing authority, right, target, or essential oracle
  prevents meaningful progress.

Passing a lower outcome never proves a higher one. Stop when the requested
outcome passes. Do not deploy, remediate, broaden browser support, or pursue
forensic evidence beyond the requested outcome without new authority.

`parity_verified` is fail-closed: no required lane may be failed, blocked, or
unverified. If evidence is unavailable, either obtain it, narrow the declared
claim with user approval, or report the lower outcome actually achieved.

## 11. Candidate report summary

- Requested outcome: `[value]`
- Achieved outcome: `[value]`
- Target: `[value]`
- Candidate: `[commit and artifact hash]`
- Commands: `[exact command -> pass/fail/blocked]`
- Required lanes passed: `[list]`
- Failed lanes: `[list]`
- Blocked or unverified lanes: `[list and reason]`
- Intentional deviations: `[list and approval]`
- Claims supported: `[exact claims]`
- Claims not supported: `[exact claims]`
