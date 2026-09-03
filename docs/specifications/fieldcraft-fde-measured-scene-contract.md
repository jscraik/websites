# Fieldcraft FDE Measured Scene Contract

## Authority and boundary

This document is the visual authority for the blind builder. It contains
requirement-derived measurements, but no URL, screenshot, source fragment,
reference path, manifest, or implementation hash. The builder may read it. The
protected reference images and visual-difference outputs remain evaluator-only.

If this contract conflicts with a qualitative phrase in the blind-build brief,
this contract wins. Copy and interaction payloads remain authoritative in the
brief. All coordinates use CSS pixels in a 1280 × 720 viewport, with the page at
100% zoom and fonts ready. Bounds are `x, y, width, height`.

## Shared desktop frame

| Property | Required value |
| --- | --- |
| Viewport | 1280 × 720 |
| Section box | 0, 0, 1280, 720 relative to its snapped scene |
| Header | 0, 0, 1280, 67 |
| Main horizontal inset | 89.6px |
| Main content width | 1100.8px |
| Paper | `#ffffff` |
| Ink | `#171a22` |
| Navy | `#022b72` |
| Reverse ink | `#f3f6fb` |
| Pager buttons | 38 × 38px at x 1170 and 1216, y 658 |
| Navigation | Uppercase visual text with wide tracking |
| Section overflow | No document overflow; intentional scene clipping only |

Geometry tolerances are ±2px for major anchors, ±3px for text boxes, and ±4px
for diagram nodes and rules. Text line counts, alignment, visibility, color
tokens, and composition types have no tolerance.

## Per-section measured scenes

The heading bounds use document y coordinates to make the 720px scene cadence
executable. A validator may subtract `(section index × 720)` to obtain local y.

| # | Scene | Field | Heading bounds | Type | Align | Composition |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | Hero | paper | 89.6, 158.8, 1100.8, 395.1 | 134.4/131.712 | center | centered three-line statement |
| 1 | Capability availability | paper | 89.6, 839.6, 619.5, 117.1 | 56.32/58.573 | left | left copy, persistent stage right |
| 2 | Moat question | paper | 217.6, 1545.2, 844.8, 175.7 | 56.32/58.573 | center | centered statement over persistent stage |
| 3 | Deployment answer | paper | 301.0, 2345.3, 678.0, 94.7 | 94.72/94.72 | center | centered answer, stage retargets to ROI |
| 4 | The role | navy | 89.6, 3100.9, 788.5, 117.1 | 56.32/58.573 | left | three connected stages, reverse ink |
| 5 | Two judgments | paper | 208.0, 3718.5, 864.0, 80.6 | 36/40.32 | center | symmetric two-world bridge with center FDE |
| 6 | Current workflow | paper | 89.6, 4418.0, 1100.8, 117.1 | 56.32/58.573 | left | five linked workflow cards |
| 7 | AI-native workflow | paper | 89.6, 5138.0, 901.1, 175.7 | 56.32/58.573 | left | four-stage horizontal workflow and evidence rail |
| 8 | Deployment run | navy | 240.0, 5923.9, 800.0, 95.8 | 42/47.88 | center | centered timed run, reverse ink |
| 9 | Three parts | navy | 353.8, 6725.0, 572.4, 58.6 | 56.32/58.573 | center | centered Audit → Evals → Deployment chain |
| 10 | Audit | paper | 89.6, 7296.0, 1100.8, 58.6 | 56.32/58.573 | left | three open process columns; artifact table at right |
| 11 | Automation decision | paper | 189.4, 8018.0, 901.1, 117.1 | 56.32/58.573 | center | centered decision tree |
| 12 | Evals | paper | 89.6, 8736.0, 1100.8, 58.6 | 56.32/58.573 | left | evaluation cases and report artifact |
| 13 | Deployment | paper | 89.6, 9456.0, 1100.8, 117.1 | 56.32/58.573 | left | controlled-environment architecture |
| 14 | Continuous loop | paper | 161.3, 10493.5, 957.4, 117.1 | 56.32/58.573 | center | centered six-stage feedback loop |
| 15 | Roadmap introduction | paper | 89.6, 10907.5, 1100.8, 58.6 | 56.32/58.573 | left | sparse roadmap introduction over latent calendar |
| 16 | Week 1 | paper | 89.6, 11621.9, 1100.8, 46.1 | 43.52/46.131 | left | week-one detail with calendar transformation |
| 17 | Week 2 | paper | 89.6, 12341.9, 1100.8, 46.1 | 43.52/46.131 | left | week-two detail with calendar transformation |
| 18 | Week 3 | paper | 89.6, 13061.9, 1100.8, 92.3 | 43.52/46.131 | left | week-three detail with calendar transformation |
| 19 | Final week | paper | 89.6, 13781.9, 1100.8, 46.1 | 43.52/46.131 | left | week-four detail, then complete-month state |

## Scene-specific composition rules

### Hero

- Eyebrow is centered above the H1.
- H1 color is navy and has exactly three rendered line boxes: `AI Forward`,
  `Deployed`, `Engineering`.
- Subtitle is centered below the H1 at approximately y 587.9, with a 17.28px
  computed size.
- Scroll cue is centered along the bottom, not left-aligned.
- Forbidden: left alignment, ink-colored H1, two-line rendering, `scaleX`, a
  narrow text column, or clipped glyphs.

### Sections 1–5

- Section 1 uses a 56.32px heading; it must not inherit the 94.72px XL token.
- Section 2 is centered and occupies approximately three rendered lines.
- Section 3 is the only 94.72px heading in this opening sequence.
- Section 4 uses three connected visual stages and three inline traces.
- Section 5 uses a 36px centered heading and a symmetric bridge; it must not be
  rendered as a left-aligned oversized statement.

### Current and AI-native workflows

- Section 6 cards are approximately 180 × 132px at 1280 × 720 and connected
  across the scene; they are not generic equal-width dashboard cards.
- Section 7 uses one primary directional trace. Its evidence rail is visually
  subordinate to the four workflow stages.

### Audit

- Use three open columns separated by space and rules.
- Column one contains individual outlined context labels.
- Column two contains an open vertical findings list.
- Column three contains the operating-map artifact with a navy header and five
  bordered rows.
- Forbidden: three equal enclosing cards or moving the artifact into a
  full-width table below the process.

### Automation, Evals, Deployment, and loop

- Section 11 is a centered decision tree, not three unrelated cards.
- Section 12 preserves the table/report hierarchy and the 56.32px heading.
- Section 13 presents inputs, controlled environment, and production output as
  architecture rather than a card row.
- Section 14 centers the ownership statement and retains the visible loop.

### Roadmap states

Section 15 initial state shows only the introduction, sparse four-week
timeline, milestone markers, final case-study outcome, and project-choice tags.
Detailed day descriptions must not be visible in this state.

Sections 16–19 reveal the relevant week detail without allowing it to collide
with the section heading, supporting copy, instruction, project choices, fixed
header, rail, or pager. The final next action on section 19 transforms to the
complete-month state. Hidden calendar layers must be both visually hidden and
removed from hit testing.

Forbidden in every roadmap state:

- Detailed calendar text behind or through the introduction.
- Any overlap between the main heading and calendar cells.
- Project tags intersecting week labels or daily descriptions.
- More than one full-detail week visible unless the complete-month state
  explicitly requires it.

## Rendered geometry and collision contract

The browser validator must operate after `document.fonts.ready`, animations are
disabled, and the active scene has settled. It must inspect actual layout—not
CSS source tokens.

For each scene it must assert:

1. The section is the active 1280 × 720 scene.
2. Heading bounds are inside the declared tolerances.
3. Computed font size, line height, alignment, and color match the scene row.
4. Rendered line rectangles match the declared line count where specified.
5. `scrollWidth === clientWidth` for the document and scene.
6. Important text has no internal clipping unless explicitly declared.
7. No unrelated visible regions overlap.
8. Fixed header, pager, and lower-left rail do not intersect scene content.
9. Hidden state layers are not visible, focusable, or hit-testable.
10. No failed required request, uncaught error, or site-authored console warning
    occurs.

Minimum collision pairs are heading/body, heading/diagram, body/diagram,
heading/calendar, body/calendar, project choices/calendar, content/header,
content/pager, content/rail, and modal title/modal body. Intersection area must
be zero. Related text intentionally contained inside a card or table cell is
excluded only by an explicit containment relationship.

## State contract

The evaluator must exercise and record:

- All 20 initial section states.
- Five workflow modal states, including open focus, Close, Escape, and focus
  restoration.
- Deployment initial, waiting-for-approval, approved, posted, reset, re-entry,
  and reduced-motion states.
- Roadmap introduction, weeks 1–4, complete-month, backward-from-complete, and
  final-disabled states.
- Every chapter active state and both pager disabled states.

Every state record contains active section, visible state keys, focused element,
heading bounds, collision results, console results, request failures, and the
candidate artifact identifier.

## Evaluator-only visual-difference contract

The builder does not receive the reference images. The independent evaluator
captures reference and candidate using the same browser family, viewport,
font-ready condition, reduced-motion setting, state seed, and animation policy.

Required desktop matrix: all 20 initial scenes at 1280 × 720, all five modals,
four deployment checkpoints, six roadmap states, and active shell states.
Tablet and mobile matrices are admitted only after their reference viewport is
confirmed to have actually changed; an evaluator must not label a 1280px render
as mobile evidence.

For each pair, generate reference, candidate, diff image, mismatch ratio, and a
machine-readable result. Pixel difference is necessary but not sufficient:
geometry, collision, visibility, interaction, console, and request lanes must
all pass independently. Thresholds are project-owned and frozen before judging
a candidate; they may not be relaxed by the builder or by the same run that
produces the candidate.

## Acceptance

A scene passes only when its geometry, typography, line boxes, collision set,
visibility state, interaction checks, runtime cleanliness, and protected visual
difference result all pass. Counts and token searches are diagnostic only and
cannot establish visual fidelity.

The machine-readable contract is
`fieldcraft-fde-scene-contract.json`. Validate its internal completeness with:

```sh
node scripts/validate-fieldcraft-scene-contract.mjs
```

The interior layout authority for the 19 scenes that previously failed visual
difference and for all five modals is
`fieldcraft-fde-internal-region-contract.json`. Validate it with:

```sh
node scripts/validate-fieldcraft-internal-region-contract.mjs
```

The builder must expose every declared region using `data-scene-region`; the
evaluator uses those identifiers to verify their local bounds and collision
pairs. This replaces vague composition labels such as “three columns” or
“centered tree” with executable placement requirements.

## Internal-region implementation rules

For scenes 1–19, use one `data-scene-region` wrapper for every region key in
the internal contract. Its CSS border box must match the declared bounds in the
active desktop scene. Do not put unrelated text or graphics into that wrapper;
the evaluator treats it as the region's complete visible extent.

The modal uses these stable region keys while open:

| Region | Required role |
| --- | --- |
| `modal-backdrop` | Full viewport dim layer; no click-to-dismiss behavior |
| `modal-panel` | White panel bounded by the modal-shell contract |
| `modal-tag` | Step label |
| `modal-title` | H3 title |
| `modal-punch` | Short introductory sentence |
| `modal-bullets` | Complete bullet-list region |
| `modal-closing-label` | “Why this is a person, not a script” label |
| `modal-closing` | Complete explanatory closing region |
| `modal-close` | Circular Close control |

All five modal variants preserve the same shell and region anchors. Their
different text length is handled only inside the declared bullet and closing
regions; it must never push another region, the close control, or the panel
outside its contract bounds.

An independent evaluator runs the rendered candidate with:

```sh
CANDIDATE_BASE_URL=<candidate-url> \
FIELDCRAFT_REFERENCE_SCREENSHOTS=<protected-reference-directory> \
node scripts/evaluate-fieldcraft-scenes.mjs
```

If the managed browser cannot launch, report the rendered lane as blocked and
run it through the approved in-app browser or approved CDP runtime. Never add a
browser sandbox bypass. The evaluator must still emit the same report fields;
the standalone script is the canonical executable contract, not authority to
weaken the runtime boundary.
