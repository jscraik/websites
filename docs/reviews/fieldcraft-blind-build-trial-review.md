# Fieldcraft Blind-Build Trial Review

## Verdict

The written brief is executable without exposing the existing site. Two fresh
agents with no inherited conversation produced complete, dependency-free local
candidates using only the blind-build prompt and brief. The first trial exposed
an underspecified desktop hero and favicon contract. After those requirements
were made explicit, the second trial passed its structural, build, HTTP, and
independent browser-rendered checks for the evaluated desktop and mobile paths.
This proves that the corrected packet can produce a runnable candidate from the
specification alone. It does not prove pixel parity with an unseen reference.

## Clean-room boundary

The builder was permitted to read only:

- `docs/specifications/fieldcraft-fde-blind-build-agent-prompt.md`
- `docs/specifications/fieldcraft-fde-blind-build-brief.md`

It was forbidden from reading the forensic specification, reference manifest,
screenshots, source, prior candidate, browser tab, URL, or deployed page. Its
writes were limited to `artifacts/fieldcraft-blind-trial/`. The icon is the
declared local placeholder and makes no remote request.

## Candidate

- Candidate: `artifacts/fieldcraft-blind-trial/index.html`
- SHA-256: `f530032eb186b94e658f7d5189fd0312cad5a1305b245132020a4158ebe16a5c`
- Delivery: local static evaluation candidate; not deployed.
- Report: `artifacts/fieldcraft-blind-trial/REPORT.md`

The candidate contains all 20 sections, the 30-day roadmap, five modal payloads,
timed deployment sequence, persistent capability stage, fixed navigation shell,
conditional rail, responsive rules, reduced motion, and final two-state close.

## Evaluator evidence

- Candidate validator: 22 of 22 structural checks passed.
- Local route: loaded successfully at 1280 × 720 with 20 sections and no
  horizontal document overflow.
- Modal: workflow card opened the expected modal, Close received focus, Close
  dismissed it, and focus returned to the invoking workflow card.
- Console: no warning or error entries were captured during the evaluated path.
- Placeholder: rendered as a local 26 × 26 `V` mark with stable header geometry.

The local server recorded one browser request failure: `/favicon.ico` returned
404. The brief specified the visible placeholder but did not require a matching
placeholder favicon. The brief now requires a local or data-URL favicon and a
successful `/favicon.ico` path. The trial therefore does not pass the complete
no-failed-request runtime criterion.

The browser viewport override did not change the controlled tab's effective
1280 × 720 viewport during this run, so the additional responsive sizes remain
unverified rather than passed.

## Finding: desktop hero wraps incorrectly

At 1280 × 720, the blind candidate rendered:

```text
AI Forward
Deployed
Engineering
```

The target contract requires:

```text
AI Forward Deployed
Engineering
```

The candidate H1 began at approximately x 89.6, y 111 and measured about
822 × 395px. The target evidence expects approximately x 89.6, y 158.8 and a
1100.8px-wide content box. The brief had supplied the intended slash-separated
line break but had not prohibited a narrow max-width from wrapping the first
line again.

The brief now requires one forced break after `Deployed`, prohibits first-line
wrapping at 1280 × 720, and supplies the desktop and mobile hero boxes.

## Claims boundary

This trial proves that a blind agent can turn the specs-only packet into a
complete, runnable candidate in the correct isolated path. It does not prove
pixel parity, all responsive viewports, extended timer cleanup, cross-browser
behavior, or a clean network lane because the placeholder favicon request
failed. A fresh second trial is needed to test whether the corrected hero and
favicon instructions change the output; the existing candidate is retained as
the before artifact and was not retroactively edited.

## Trial v2: corrected specification

The second builder was given the same clean-room restrictions, the corrected
blind-build prompt and brief, and an isolated write scope at
`artifacts/fieldcraft-blind-trial-v2/`. It was not permitted to read the first
candidate or this review. The icon remained the declared replaceable local
placeholder.

- Candidate: `artifacts/fieldcraft-blind-trial-v2/dist/index.html`
- SHA-256: `786ca5f26a07df235be672fd443f2d23f136ee8b6400885b5508506eaccf9f9e`
- Delivery: local static evaluation candidate; not deployed.
- Report: `artifacts/fieldcraft-blind-trial-v2/REPORT.md`

The builder's first v2 output passed a token-level hero guard but still clipped
the desktop first line. Independent browser measurement found that the line was
about 1235.77px wide inside a 1100.81px heading box. This was returned to the
same blind builder as a measured defect, without exposing any reference site or
image. The repaired candidate then passed a second independent render.

At 1280 × 720, the repaired candidate measured:

- H1 box: x 89.59, y 158.80, width 1100.81, height 263.41px.
- First line: x 89.59, y 158.80, width 1099.83, height 131.70px.
- Text: exactly `AI Forward Deployed` followed by `Engineering` on the second
  line.
- Document width: 1280px scroll width and 1280px client width, with no
  horizontal overflow.

The independent browser screenshot showed the complete first line without
clipping. At 390 × 844, the candidate retained all 20 sections, reset the
desktop first-line transform, and measured equal 390px document scroll and
client widths. The mobile hero remained readable, with no horizontal overflow.

## Trial v2 evidence

- Candidate validator: 22 of 22 structural checks passed, including exactly one
  modal H3, the explicit desktop hero fit mechanism, its mobile reset, and local
  favicon/icon paths.
- Build: the static `dist/` artifact was regenerated successfully.
- HTTP: `/`, `/favicon.ico`, and `/placeholder-icon.svg` returned 200. The
  favicon response was `image/x-icon`.
- Modal: a workflow card opened the native dialog, Close received focus, Close
  dismissed the dialog, and focus returned to the invoking card.
- Console: no warning or error entries were captured on the evaluated desktop
  path.
- Responsive evaluation: 1280 × 720 and 390 × 844 were independently rendered.
  The remaining declared viewports were not evaluated in this trial.
- Keyboard limitation: Close-button behavior was proved. The in-app browser's
  synthetic Escape input did not dismiss the native dialog, so Escape behavior
  remains unproved rather than failed; the implementation registers a native
  dialog `cancel` handler.

## Final claims boundary

The two-trial sequence proves that another agent can implement the complete
experience without seeing the existing site and that concrete failures can be
closed using requirement-derived measurements. It also demonstrates why static
checks alone are insufficient: v2 initially passed its structural hero guard
while visibly clipping the text.

The evidence does not establish 100% visual parity, because the builder never
saw the reference and the independent evaluator did not perform a live or
archived side-by-side comparison in this clean-room lane. The remaining proof
is an evaluator-owned visual-diff matrix across every declared viewport and
state, kept separate from the builder packet. That separation is the point of
the exercise: the specification is the builder's only design authority, while
reference access belongs exclusively to an independent evaluator.
