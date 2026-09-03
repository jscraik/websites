# Adversarial Review: Fieldcraft Replication Specification as a Reusable Template

## Verdict

The Fieldcraft document is a strong instance dossier and a poor direct template.
It contains unusually good target-specific evidence, but copying its shape would
teach future agents that every replication is a public, static, single-route,
single-document, source-identity exercise. The reusable mechanism should be a
short process contract plus a separate per-site evidence package.

Recommended disposition: preserve the Fieldcraft specification as an example;
use `docs/templates/site-replication-spec-template.md` for future sites.

## Fundamental decomposition

A reliable replication task has five irreducible parts:

1. An authorized, declared target whose version cannot drift silently.
2. A complete inventory of observable routes, states, content, assets, and access.
3. An implementation contract that distinguishes known facts from measurements,
   inferences, choices, and unknowns.
4. A candidate-bound proof protocol for the exact claim being made.
5. A stop condition matching the user-authorized outcome.

Fieldcraft’s 20 sections, inline controllers, hashes, modal payloads, calendar,
and deployment timers are instance data. They are not template fundamentals.

## Severity-ranked findings

### P0 — A mutable live page outranks the immutable version

The authority list places the original live URL first and the hash-verified
archive third. Fingerprints reduce drift risk but do not make a mutable origin
the strongest long-term authority. A future live page can change in dimensions
that the sampled fingerprints do not cover, and a failed agent can blend live
and archived evidence while claiming one target.

Remediation: freeze one target version before construction. Rank its immutable
source and bound captures above any live oracle. A live mismatch requires an
explicit target decision, never automatic continuation.

### P0 — The specimen conflates build authority with publication authority

The stop condition requires a publicly deployed page without an authentication
interstitial. That was suitable for this delivery, but using it as a template
would cause future agents to deploy merely because they were asked to build or
replicate. Deployment is an external mutation and a separate outcome.

Remediation: select `local reconstruction`, `deployable build`, or `published
replica` during intake. Stop at the requested outcome.

### P0 — “Any usable reference” is too weak for implementation admission

The document allows construction when one live or stored reference is
inspectable. A homepage can be visible while authenticated routes, hover states,
mobile behavior, error states, or data-dependent interactions remain unknown.
An agent can therefore pass readiness while the defining behavior is unavailable.

Remediation: classify evidence by the claims it supports. Missing essential
routes, states, rights, or behavior is `BLOCKS_IMPLEMENTATION`; missing visual
proof may instead `BLOCKS_PARITY`.

### P0 — The handoff does not bind the repository execution path

The document recommends an implementation shape but does not name the target
repository, authorized write scope, existing routes to preserve, package
manager, canonical install/dev/build/test commands, or artifact output. A model
can produce an excellent standalone `index.html` in the wrong directory while
the requested project remains unchanged—the reported failure mode.

Remediation: require a repository execution contract and an early smoke proof
that the named route renders through the repository's canonical command.

### P1 — The reusable abstraction is buried under instance data

The 1,389-line document contains exact copy, 30 calendar entries, modal prose,
CSS tokens, timers, selectors, and geometry. Replacing proper nouns would retain
Fieldcraft’s architecture and consume the agent’s attention before it learns
the new site’s actual shape.

Remediation: keep the reusable template compact. Put literal content, hashes,
assets, state measurements, and captures in versioned manifests referenced by
the instance specification.

### P1 — It over-specifies internals where observable parity may suffice

Exact DOM order, hidden initial controls, no hydration, class tokens, and source
hash identity are appropriate when source equivalence is requested. They are
not universal replication requirements. Applied blindly, they can reject an
accessible, behaviorally exact candidate or force an unsuitable static stack.

Remediation: specify observable contracts by default. Require source or DOM
identity only when the requested claim explicitly includes it.

### P1 — Rights and provenance are incomplete for future reuse

The specimen treats extraction of live brand assets as an ordinary
implementation step. A public URL proves availability, not authorization to
store, modify, redistribute, or republish logos, media, fonts, or personal data.

Remediation: add a mandatory rights-and-handling gate before asset acquisition
or publication, including third-party licenses and prohibited evidence storage.

### P1 — The template has no branches for dynamic or protected sites

Fieldcraft correctly excludes APIs, accounts, forms, persistence, and backend
services. A generic template copied from it would omit fixtures, auth roles,
loading/error states, idempotency, secrets, privacy, offline behavior, and safe
test isolation.

Remediation: add conditional data/API and authentication modules. Delete them
only after establishing that the target is static and public.

### P1 — Visual tolerances appear universal but are environment-specific

One-pixel geometry, one-channel color, one-frame timing, and 2-by-2 unexplained
pixel regions are defensible only for a tightly controlled rendering stack.
They can be impossible across browsers or too permissive for a differently
scaled design. The rule also invites unsupported “font variance” exceptions.

Remediation: declare comparison type, environment, masks, settling rules, and
tolerances per project before capture. Require evidence for every exception.

### P2 — A test-only state controller can become a production backdoor

The deterministic controller is valuable for timed states, but the specimen
does not require it to be stripped or non-production gated. A future dynamic
site could accidentally expose privileged, destructive, or impossible states.

Remediation: exclude the controller from production or enforce an explicit
non-production gate; continue to test real user paths.

### P2 — Accessibility fidelity is a policy choice, not a universal rule

Preserving undersized controls and incomplete focus trapping supports forensic
source fidelity, but conflicts with a remediated or standards-compliant outcome.
The later fidelity-mode section helps, yet the choice should occur before the
implementation contract is written.

Remediation: select source-faithful or remediated mode during intake and apply
one acceptance target consistently.

### P2 — Performance, SEO, security, and browser support are implicit

The document checks runtime errors and network failures but does not establish
budgets, supported browsers, metadata breadth, security boundaries, or privacy
requirements. These are important for many future sites even when Fieldcraft
does not need them.

Remediation: make these explicit instance constraints with `not_applicable`
allowed only for a recorded reason.

### P2 — Candidate and reference equality can become circular

Generating missing reference captures “during implementation” is practical,
but a careless agent can capture its own candidate or mix environments, then
compare the candidate against itself. File hashes only prove artifact identity;
they do not prove correct provenance.

Remediation: store reference and candidate acquisition operations separately,
record final URLs and environment metadata, and bind every artifact to its
origin and target version.

### P2 — Parity and deviation outcomes are not fully fail-closed

The specimen permits unavailable lanes and approved intentional deviations, but
does not name an approver, durable approval record, mandatory claim downgrade,
or formula preventing `parity_verified` when a required lane is unverified.

Remediation: make parity require all declared lanes to pass. Give deviations
identifiers, independent approvers, durable evidence, and an explicit downgrade
of the affected claim.

## Constraint classification

| Constraint | Classification | Adversarial conclusion |
| --- | --- | --- |
| A replica needs an identifiable target | Hard | Without it, correctness has no referent. |
| Exact source and DOM identity | Soft | Require only for source-equivalence claims. |
| Public deployment | Soft | Requires explicit user authority. |
| Static HTML and no framework | Soft | Fieldcraft-specific smallest mechanism. |
| Matching observable content and behavior | Hard for parity | The exact scope must be declared. |
| Pixel equality everywhere | Assumption | Valid only in defined, controlled environments. |
| Missing archive never blocks construction | Assumption | Hidden or protected behavior may make it essential. |
| Live assets may be extracted and stored | Assumption | Rights must be established first. |
| Test-state controls are harmless | Assumption | They can alter production behavior or security. |

## Steelman

**Best version:** A forensic specification prevents agents from substituting a
convincing redesign for the actual site.

1. Exact content inventories stop plausible prose substitutions that visual reviews routinely miss.
2. Version identifiers and hashes expose drift instead of trusting mutable URLs indefinitely.
3. State tables preserve transitions that screenshots cannot communicate to implementation agents.
4. Candidate-bound reports prevent evidence from one build validating another untested artifact.
5. Explicit quirks prevent well-intentioned remediation from corrupting source-faithful comparison results.
6. Separate readiness and parity states keep missing archival evidence from halting useful construction.
7. Runtime, access, interaction, and visual lanes prevent homepage screenshots becoming completion proof.
8. The dossier makes hidden implementation assumptions inspectable, challengeable, and independently testable.

Validity assessment: the Fieldcraft document is an unusually strong evidence-led
instance contract and should remain the worked example.

## Red-team verdict

**Position attacked:** The Fieldcraft specification can serve directly as the
template for future site replications.

1. Its dominant content describes Fieldcraft’s implementation, not a reusable replication decision process.
2. Copying it would silently impose static, public, single-route architecture on unrelated sites.
3. A mutable live oracle outranking immutable evidence makes future target drift structurally likely.
4. Weak admission permits implementation before defining protected, dynamic, or otherwise hidden states.
5. Mandatory public deployment expands authority beyond ordinary build and local-validation requests.
6. Asset extraction without a rights gate can turn fidelity work into unauthorized redistribution.
7. Universal pixel thresholds and internal-structure rules confuse one project’s evidence with general truth.
8. Therefore direct templating increases confident failure; separate process contract from instance evidence.

Assessment: fundamentally sound as a Fieldcraft dossier, fundamentally unsafe as
a direct generic template until its process is extracted from its instance data.

## Recommended reusable architecture

Use three artifacts:

1. `site-replication-spec-template.md`: the reusable intake, decision, build,
   proof, and stop process.
2. `<site>-replication-spec.md`: the filled, concise contract for one target.
3. `reference/<site>/<version>/`: content, assets, captures, fixtures, state
   measurements, hashes, provenance, and candidate-bound reports.

This preserves Fieldcraft’s rigor without turning its page architecture into a
false universal.
