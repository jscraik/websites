# Agent Prompt: Fieldcraft FDE Blind Build

Implement the site described in
`fieldcraft-fde-blind-build-brief.md` in the repository and write scope supplied
with this task.

This is a clean-room evaluation. You must not search for, open, fetch, inspect,
or ask for the existing Fieldcraft or Varick implementation. Do not read any
Fieldcraft reference bundle, forensic replication specification, screenshots,
manifests, hashes, archived source, previous candidate, browser tab, or deployed
page. Do not use internet search to identify the reference. Network access to
ordinary package registries is permitted only when the repository's canonical
install process requires it.

Use only:

1. The blind-build brief.
2. `fieldcraft-fde-measured-scene-contract.md`.
3. `fieldcraft-fde-internal-region-contract.json`.
4. The target repository's existing source and discovered instructions.
5. The repository's canonical local development, build, and test tools.

Before implementation, report the repository root, authorized write scope,
framework, package manager, required route, canonical development/build/test
commands, and existing changes you will preserve. Then implement the complete
20-section experience, run focused validation, and deliver the exact candidate
artifact requested by the assigned delivery mode.

Add stable `data-scene-region` identifiers to unrelated visible regions that
participate in collision checks. Mark intentionally hidden state layers with
`data-state-hidden="true"` while hidden, remove them from focus order, and set
their pointer events to none. Use `data-contains-region` only for an explicitly
declared containment relationship; do not use it to waive accidental overlap.

The measured scene and internal-region contracts override conflicting
qualitative visual prose in the brief. Implement their per-section geometry,
typography, alignment, composition, internal region bounds, visibility, and
forbidden alternatives. Do not treat semantic
counts, CSS-token searches, or source-level line breaks as visual proof. Add a
browser-rendered validator that measures line boxes, clipping, declared
collision pairs, visible state layers, and fixed-shell clearance.

The brand icon must be the placeholder defined in the brief. Do not attempt to
recover the production icon. When the brief leaves a visual composition open,
make the smallest decision consistent with its visual system and record that
decision; do not look for the hidden answer.

Your final report must include:

- Candidate commit or artifact identifier.
- Exact commands with `pass`, `fail`, or `blocked` outcomes.
- Implemented route and delivery mode.
- Acceptance criteria passed and remaining failures.
- Design decisions made where the brief intentionally left freedom.
- Confirmation that no hidden reference or prior implementation was accessed.
- The precise claim: `Implemented and locally verified from the blind-build
  brief; independent visual evaluation remains.`

Do not claim source identity or pixel parity. Do not deploy unless production
delivery is explicitly authorized in the task.
