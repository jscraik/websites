# Fieldcraft blind-build v4 evaluation

## Verdict

**Rejected by the frozen v3 acceptance policy.** The blind build preserves the
hero scene within the 1% pixel-difference ceiling, but 19 of 20 initial scenes
remain above that ceiling. The required browser-backed modal and state lane is
blocked in the available evaluator browser, so it cannot be counted as a pass.

This is still useful evidence: v4 is a modest visual improvement over v3 on
most non-hero scenes and it has implemented the named internal-region wrappers.
It is not evidence of a faithful site reproduction.

## Candidate and clean-room boundary

- Candidate: `artifacts/fieldcraft-blind-trial-v4/`
- Candidate build digest: `82305033b2c1bd5880148afd6b556035d8bd8f199245f6467afeace67bd27993`
- Builder input: the blind brief, build prompt, measured scene contract, and
  internal-region contract only.
- Builder exclusions: the live/reference site, stored captures, browser tabs,
  evaluator, prior candidates, capture manifest, hashes, and visual diffs.
- Placeholder icon: intentionally permitted and excluded from brand-asset
  fidelity.

The reference policy was sealed before v4 and remains unchanged:
`docs/reference/fieldcraft-fde/v3/policy.json`.

## Results at 1280 x 720

| Lane | Result | What it proves |
| --- | --- | --- |
| Candidate build, structure, syntax, and local HTTP | Pass | The candidate is locally buildable and its stated static contract is present. |
| Initial-scene pixel comparison | Fail: 1/20 | Only scene 00 is below the 1% mismatch ceiling. |
| Scene + internal-region geometry | Fail: 1/20 | Scene 00 passes. Scenes 01–19 have systematic vertical-position failures, including the named regions. |
| Collision contract | Not separately failed | The recorded failure set is positional; this does not establish visual parity. |
| Modal visual, focus, and restoration | Blocked | The managed evaluator's DOM lacks `HTMLDialogElement`, `IntersectionObserver`, and external-script execution. It cannot open a native dialog or validate its focus path. |
| Console errors | Inconclusive | The evaluator reported no console errors, but it also did not execute the candidate's `app.js`; this is not a runtime pass. |

The first-frame mismatch ratios were:

| Scenes | Mismatch ratio |
| --- | --- |
| 00 | 0.004982 — pass |
| 01–05 | 0.055150, 0.056216, 0.046701, 0.073083, 0.050980 |
| 06–10 | 0.063346, 0.081661, 0.045754, 0.042473, 0.079386 |
| 11–15 | 0.061111, 0.115788, 0.066913, 0.061377, 0.052918 |
| 16–19 | 0.070285, 0.075489, 0.087558, 0.084091 |

Every failing value is materially above the policy limit of `0.010000`.
Candidate images, diffs, raw metrics, and evaluator output are under
`artifacts/fieldcraft-scene-evaluation-v4/`.

## Interpretation

V4's hero is still an exact measured reconstruction: it is centered at the
specified width and vertical position and is the only image-difference pass.
Several later scenes improved compared with v3, notably the roadmap scenes,
but the result stays well outside the policy threshold.

The internal-region evaluator exposed a second issue before v5 should be
dispatched. Across scenes 01–19, region `y` values are consistently displaced
from the current contract. That can reflect either a blind-build placement
error or, more likely in part, an incorrectly calibrated reference origin in
the newly introduced region data. It must be resolved by measuring each region
directly against the sealed reference capture in the same coordinate system as
the screenshot—not by editing the policy or raising tolerances after seeing
the candidate.

The five modal captures are not evaluated as failures. They are blocked: this
evaluator provides visual snapshots but does not support the browser features
needed to run the candidate's native-dialog controller. A real, approved
Chromium/CDP session against the immutable candidate and sealed reference is
needed to exercise open, escape/close, focus transfer, focus restoration, and
the five modal screenshots.

## Required work before v5

1. Re-measure all failing initial scenes and modal internals from the sealed
   reference in screenshot coordinates, with explicit anchors and allowed
   tolerance per region.
2. Version and seal that corrected region contract with a stated derivation;
   retain the existing policy and mismatch limit.
3. Provide a trusted renderer that executes the candidate's JavaScript and
   supports native dialogs, then capture the five modal states and interaction
   assertions independently of the builder.
4. Only then give a new blind builder the brief plus the corrected contracts
   and judge it using the same frozen visual policy.

## Evidence

- `artifacts/fieldcraft-blind-trial-v4/REPORT.md`
- `artifacts/fieldcraft-blind-trial-v4/artifacts/agent-runs/default-019ffe57-3991-7e40-b272-e9f9dff33357/manifest.json`
- `artifacts/fieldcraft-scene-evaluation-v4/visual-results.json`
- `artifacts/fieldcraft-scene-evaluation-v4/geometry-internal-results.json`
- `docs/reference/fieldcraft-fde/v3/policy.json`

## Commands and outcomes

- `npm run build && npm run validate:structure && npm run validate:syntax && npm run validate:http` (in `artifacts/fieldcraft-blind-trial-v4`) -> **pass**.
- `node scripts/validate-fieldcraft-scene-contract.mjs` -> **pass**.
- `node scripts/validate-fieldcraft-internal-region-contract.mjs` -> **pass**.
- Browser visual capture and pixel comparison at 1280 x 720 -> **fail** (1/20 initial scenes within the frozen 1% limit).
- Browser modal/focus validation -> **blocked** (the managed evaluator did not expose the web-platform features required to execute the candidate controller).
