# Fieldcraft FDE Site Replication Specification

## Document status

- Status: executable implementation handoff
- Handoff readiness: `implementation_ready`
- Implementation authority: the written specification plus an inspectable live
  reference authorize construction; missing archival evidence limits the final
  parity claim but does not block implementation
- Prepared: 2026-08-13
- Source project: `appgprj_6a7cc26b99dc81918631aa2541049afd`
- Source title: Fieldcraft — Forward Deployed Engineering
- Original source URL: <https://learn.varickagents.com/fde-in-30-days>
- Production URL: <https://fieldcraft-fde-30-days.jscraik.chatgpt.site/>
- Observed rendered route: `/clone`
- Observed Sites version: 2
- Sites version ID:
  `appgprj_6a7cc26b99dc81918631aa2541049afd~appgver_dd16939823808191bd642bc55037788d`
- Source commit: `c6220eca648739a1f643f128fdb01907fa0fc902`
- Source archive SHA-256:
  `8c1971868fe6a6e3c37010980ab169cc006bf1fe8fc19d7d43c8eda2c3d3496e`
- Reference manifest:
  [`../reference/fieldcraft-fde/v2/manifest.json`](../reference/fieldcraft-fde/v2/manifest.json)
- Source viewport measurements:
  - Desktop: 1280 × 720 CSS pixels, device pixel ratio 2
  - Mobile: 390 × 844 CSS pixels, device pixel ratio 1

## Outcome

Reproduce the Fieldcraft FDE site as a self-contained, single-page presentation with the same content, composition, responsive states, navigation, modal disclosures, scripted deployment sequence, animations, and final calendar reveal as the production reference.

“100%” means behavioral and content identity plus pixel-level visual identity when the reference and candidate are rendered in the same browser, operating system, viewport, device pixel ratio, font environment, reduced-motion setting, and animation state. Browser font rasterization can vary across platforms; do not conceal that variance by changing layout values.

This outcome has three progressive states:

1. `implementation_ready`: this specification is readable and at least one
   usable implementation oracle is inspectable: the live original, the Sites
   copy, or a stored source document. This state currently passes.
2. `feature_complete`: all specified content, structure, responsive states,
   controls, interactions, motion, and accessibility semantics are implemented.
3. `parity_verified`: the candidate passes the deterministic proof protocol
   and acceptance matrix against the best available reference evidence.

Begin implementation when `implementation_ready` passes. Inspect the live
reference to resolve details omitted from the prose, extract exact assets when
permitted, and generate screenshots, measurements, and state records during
the build. Missing archival evidence must be recorded as a limitation on the
final claim; it is not a reason to return a blocked report instead of a site.

## Authority and fidelity order

When this document and an observable reference detail appear to disagree, use this order:

1. The original Varick URL is the visual and behavioral oracle while its
   inspected implementation fingerprints continue to match the reference
   manifest.
2. The Sites version-2 rendered copy is the fallback live implementation
   oracle while it matches the recorded version ID and fingerprints.
3. An immutable Sites version-2 source archive, when available and hash-verified,
   is the preferred source-material oracle.
4. Version-2 reference captures and the machine-readable reference manifest
   are the evidence oracle.
5. Exact copy, state mappings, tokens, breakpoints, and timings in this
   document are normative.
6. Screenshots are state evidence, not a substitute for interaction testing.
7. Do not redesign, simplify, modernize, or “fix” the reference during
   replication.

If the production site advances beyond version 2, record the drift before
comparing, declare whether the candidate targets version 2 or the current live
version, and continue against that declared target. Do not silently describe a
newer site as the version-2 oracle.

## Original-source comparison and reference status

A read-only comparison on 2026-08-13 found that the original Varick page and
the Sites copy are an exact implementation match for the inspected document.
The following all matched by SHA-256 or exact value:

- Page title and document language.
- Complete visible text.
- Both inline stylesheets.
- Both inline scripts.
- All 20 section IDs, visible-text payloads, and complete section HTML
  subtrees.
- Interactive-element count.
- Embedded Varick icon source.

The only site-level difference was origin resolution for `/favicon.png`.
One copied-page capture also contained a
`codex-browser-sidebar-comments-root`; that node was injected by the browser
tool and is not a replication requirement.

The exact fingerprints, all 20 section hashes, the Sites archive provenance,
and the claims boundary are recorded in the
[version-2 reference manifest](../reference/fieldcraft-fde/v2/manifest.json).
The inspected source contains 137 section class tokens and 471 CSS selectors.
This specification summarizes their behavior. A hash-verified immutable source,
when obtained, is authoritative for internal geometry or state styling not
transcribed here; until then, use measured live behavior.

The Sites connector exposed the archive metadata but no archive-download
operation. The reference directory therefore does not yet contain the archive
itself. It also does not yet contain the extracted brand-asset bundle or a
durable full screenshot matrix. These gaps do not block candidate construction.
They identify evidence to acquire from the live reference during implementation
and limit any claim of independently archived version-2 pixel identity until
the corresponding artifacts have been stored and verified.

## Implementation readiness and evidence inventory

Before implementation, confirm that this specification is readable and that at
least one live or stored reference can be inspected. Then inventory the
available evidence. Missing optional evidence creates acquisition and
validation work; it does not prevent the candidate from being built.

| Evidence artifact                  | Expected location                                      | Desired proof                                                                                        | Current status and effect                                                              |
| ---------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Immutable version-2 source archive | `../reference/fieldcraft-fde/v2/source/`               | Archive hash equals `8c1971868fe6a6e3c37010980ab169cc006bf1fe8fc19d7d43c8eda2c3d3496e`               | Optional accelerator absent; implement from the live oracle and record the archive gap |
| Machine-readable manifest          | `../reference/fieldcraft-fde/v2/manifest.json`         | Manifest parses and binds the Sites version, commit, archive hash, fingerprints, and claims boundary | Present; validate before using its fingerprints                                        |
| Exact brand assets                 | `../reference/fieldcraft-fde/v2/assets/`               | Icon source and decoded PNG hashes pass; wordmark SVG hash and `viewBox` pass                        | Acquire from the live document before finalizing the brand lockup                      |
| Desktop reference matrix           | `../reference/fieldcraft-fde/v2/screenshots/1280x720/` | All 14 required states exist with hashes and capture metadata                                        | Generate during desktop comparison                                                     |
| Mobile reference matrix            | `../reference/fieldcraft-fde/v2/screenshots/390x844/`  | All 14 required states exist with hashes and capture metadata                                        | Generate during mobile comparison                                                      |
| State geometry and timing evidence | `../reference/fieldcraft-fde/v2/states/`               | Stage, calendar, modal, and deployment-run state records bind DOM classes, transforms, and timings   | Measure from the live reference while implementing the affected states                 |

Readiness returns one of these outcomes:

- `implementation_ready`: this specification and at least one usable reference
  are inspectable. Begin construction and track evidence gaps.
- `implementation_ready_with_drift`: the live reference differs from the
  version-2 manifest but remains usable. Record the drift, declare which live
  version is being replicated, and continue unless the user requires version 2.
- `blocked_reference_unavailable`: neither live reference can be inspected and
  no usable stored source exists. This is the only evidence condition that
  blocks construction.
- `blocked_validation`: the specification or every available reference is
  internally invalid or unusable. Record the precise failure and the nearest
  recovery step.

Do not present missing optional artifacts as completion evidence. Acquire what
is feasible during implementation and state any remaining proof limitations in
the candidate-bound report.

### Target evidence-package layout

```text
docs/reference/fieldcraft-fde/v2/
├── README.md
├── manifest.json
├── source/
│   └── fieldcraft-fde-v2.tar
├── assets/
│   ├── varick-icon.data-uri.txt
│   ├── varick-icon.png
│   ├── varick-wordmark.svg
│   └── hashes.json
├── screenshots/
│   ├── 1280x720/
│   └── 390x844/
└── states/
    ├── geometry.json
    ├── timing.json
    └── capture-environment.json
```

## Scope

### In scope

- One page with 20 full-viewport sections.
- Fixed Varick brand HUD, six chapter controls, three-stage rail, and previous/next pager.
- Desktop, tablet, and mobile layouts.
- Keyboard, wheel, touch/native-scroll, and button navigation.
- The three persistent “same capability” scenes.
- The four-week calendar and final zoom-out state.
- Five workflow-step modal disclosures.
- The scripted end-to-end deployment run and approval gate.
- Reduced-motion behavior.
- Exact visible copy, punctuation, capitalization, symbols, and order.
- The embedded Varick icon and vector “Varick Agents” wordmark.

### Out of scope

- CMS, analytics, accounts, forms, data persistence, external APIs, or backend services.
- Search, conventional URL routing, footer links, or outbound links; none are present in the reference.
- Editorial changes or accessibility remediation that changes geometry or behavior.
- Replacing the brand with Fieldcraft branding. The source project is titled Fieldcraft, but the rendered site uses Varick branding.

### Content freeze

Only text present in the live or stored source may be visible. Section titles in this
document, explanatory labels such as “premise” or “answer,” implementation
notes, test controls, and acceptance language are documentation, not page copy.
Do not add eyebrows, captions, helper text, navigation labels, loading copy, or
status messages unless a usable reference contains the exact text in the same
state.

As soon as the complete document structure exists, generate a normalized
visible-text snapshot for the candidate and compare it with the manifest
fingerprint or live reference. Correct additional, missing, reordered, or
differently punctuated text before declaring content identity.

## Recommended implementation shape

The reference is a self-contained document with inline CSS and two inline JavaScript controllers. The smallest faithful implementation is therefore:

- A single `index.html` or equivalent single route.
- Semantic HTML for headings, paragraphs, buttons, diagrams, and modal content.
- One stylesheet or one inline style block.
- One navigation/scene controller and one modal controller.
- No framework dependency is required.
- No network-loaded font is required by the observed source.
- No runtime data fetch is required.

When the version-2 source document is available, materialize it directly and
preserve its HTML, CSS, JavaScript, asset bytes, DOM order, hidden controls, and
class/state model. When it is unavailable, reconstruct the same observable
contract from this specification and the live reference, measuring omitted
geometry and behavior rather than inventing a redesign.

Prefer a static document without a client framework, hydration, route
transitions, or component abstractions. A hosting adapter may wrap the document
only when it preserves the observable DOM, introduces no visible copy, and does
not change focus, navigation, or timing behavior. If the existing host starter
cannot preserve that contract, replace or bypass the starter with the smallest
static-serving adapter that can.

### Access and route contract

- The canonical user-facing route is `/fde-in-30-days` on the original origin
  and `/clone` on the recorded Sites version-2 reference.
- The replica must declare its intended canonical route before implementation
  and must not add a second content route implicitly.
- Production access must be public and unauthenticated, matching the original
  reference. A ChatGPT sign-in screen, workspace membership requirement,
  owner-only deployment, or other authentication interstitial is a parity
  failure.
- The root route may redirect to the canonical route only when that redirect is
  explicitly recorded in the candidate report and the reference route remains
  directly addressable.
- Access parity is part of runtime acceptance, not a hosting detail.

### Document metadata

Preserve the original head contract:

```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" type="image/png" href="/favicon.png" />
<link rel="apple-touch-icon" href="/favicon.png" />
<title>Varick — Forward Deployed Engineering</title>
```

The initial style contract also declares `color-scheme: light`, resets the
body, and constrains images with `max-width: 100%`. Each deployment resolves
the root-relative favicon against its own origin; that expected URL difference
does not represent a copy defect.

## Global visual system

### Tokens

Use these values exactly:

```css
:root {
  --paper: #fff;
  --ink: #171a22;
  --navy: #022b72;
  --blue: #022b72;
  --blue-b: #8aa6d8;
  --mut: #6b7280;
  --mut-d: #9fb2d4;
  --lite: #f3f6fb;
  --line: rgb(2 43 114 / 16%);
  --line-d: rgb(214 226 244 / 24%);
  --hud-ink: #171a22;
  --hud-mut: rgb(23 26 34 / 55%);
  --hud-line: rgb(2 43 114 / 20%);
  --fail: #b23a2e;
  --ease: cubic-bezier(0.22, 0.61, 0.21, 1);
  --sans:
    "Neue Haas Grotesk Display Pro", "Neue Haas Grotesk", "Suisse Int'l",
    "Suisse Intl", Graphik, "ABC Diatype", "Helvetica Neue", Helvetica, Arial,
    sans-serif;
}
```

### Global document rules

- `html` and `body`: zero margin and padding; white background.
- `body`: `font-family: var(--sans)`, `color: var(--ink)`, antialiased text, and `overflow: hidden`.
- All buttons inherit `var(--sans)`.
- The document is 100% viewport-height. The body itself must not scroll.
- The main deck is the scroll container: `height: 100dvh; overflow-y: auto`.
- Each section is `position: relative; height: 100dvh; overflow: hidden`.
- Every section uses `scroll-snap-align: start` and `scroll-snap-stop: always`.
- Section content sits in `.wrap`: relative, z-index 6, full height, border-box, flex column, `padding: 96px 7vw 64px`.
- At a viewport height of 720px or less, `.wrap` top padding is 78px. Sections `s10`, `s12`, and `s13` use 70px.
- At 960px wide or less, `.wrap` uses `padding: 84px 6vw 56px` and permits internal vertical overflow.

### Surface modes

- Light sections: white background and `#171a22` primary text.
- Dark sections: `#022b72` background and `#f3f6fb` primary text.
- Dark section indices are 4, 8, and 9, corresponding to `s05`, `srun`, and `s09`.
- The document body exposes the active ground through `data-ground="light|dark"`; fixed controls change color to stay legible.
- Dark ground overrides the HUD variables exactly:
  `--hud-ink: var(--lite)`, `--hud-mut: rgba(243,246,251,.6)`, and
  `--hud-line: rgba(243,246,251,.28)`.
- Panels are square-cornered unless specifically described otherwise. Do not introduce rounded cards.
- Borders are one pixel and use `--line` on light surfaces or `--line-d` on dark surfaces.
- Shadows are rare. The workflow modal is the principal elevated surface.

### Typography

- Default weight: 400.
- Display headings: weight 500.
- Hero: `clamp(56px, 10.5vw, 150px)`, line-height `.98`, letter-spacing `-.028em`, balanced wrapping.
- Extra-large heading: `clamp(44px, 7.4vw, 104px)`, line-height `1`, letter-spacing `-.04em`, balanced wrapping.
- Large heading: `clamp(30px, 4.4vw, 58px)`, line-height `1.04`, letter-spacing `-.032em`, balanced wrapping.
- Medium heading: `clamp(23px, 2.9vw, 36px)`, line-height `1.12`, letter-spacing `-.025em`, balanced wrapping.
- Supporting paragraph `.sub`: `clamp(15px, 1.35vw, 18.5px)`, line-height `1.55`, muted color, maximum width `34em`, zero margin.
- At 1280 × 720, the hero computes to 134.4px with a 131.712px line-height.
- At 390 × 844, the hero computes to 56px with a 54.88px line-height.
- At 1280 × 720, a large heading computes to 56.32px with a 58.5728px line-height.
- At 390 × 844, a large heading computes to 30px with a 31.2px line-height.
- Eyebrows and HUD labels are uppercase, widely tracked, and visually secondary.
- Preserve deliberate non-breaking spaces where they affect line wrapping, including “forward deployed engineer” in section `s05`.
- Global keyboard focus uses a two-pixel `--blue` outline, a three-pixel
  outline offset, and a two-pixel radius.

### Reveal motion

Content marked `.r` begins at opacity 0 and `translateY(26px)`.

```css
.r {
  opacity: 0;
  transform: translateY(26px);
  transition:
    opacity 0.7s ease,
    transform 0.95s var(--ease);
}

.sec.on .r {
  opacity: 1;
  transform: none;
}
```

Use the source delay classes for staggered elements. Do not replace the stagger with one section-wide fade.

Additional reveal primitives:

```css
.sr {
  opacity: 0;
  transition: opacity 0.75s;
}

.draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.5s;
}
```

Use these exact stagger delays:

| Class  |  Delay | Class   |  Delay |
| ------ | -----: | ------- | -----: |
| `.dl1` |  120ms | `.dl8`  | 1300ms |
| `.dl2` |  240ms | `.dl9`  | 1600ms |
| `.dl3` |  380ms | `.dl10` | 1900ms |
| `.dl4` |  520ms | `.dl11` | 2250ms |
| `.dl5` |  680ms | `.dl12` | 2600ms |
| `.dl6` |  850ms | `.dl13` | 3000ms |
| `.dl7` | 1050ms |         |        |

## Fixed shell

### Header HUD

- Fixed to `top: 0; left: 0; right: 0` at z-index 20.
- Flex row, centered vertically, space-between.
- Padding: `20px 28px`.
- The header wrapper has `pointer-events: none`; the chapter buttons must restore pointer events.

### Brand lockup

- Left aligned.
- Flex row with a 10px gap.
- Icon: embedded 64 × 64 source PNG displayed at 26 × 26, `object-fit: cover`, 6px radius, alt text `Varick`.
- Wordmark: inline SVG with `viewBox="0 0 204 34"`, current-color fill, role `img`, and accessible label `Varick Agents`.
- Load the exact icon data URI and wordmark SVG from the evidence bundle when
  present. Otherwise, extract both from the inspected live document, verify
  their intrinsic dimensions and source-string fingerprints, and add them to
  the evidence bundle before final parity validation. Do not redraw,
  approximate, typeset, or substitute either asset.

### Chapter navigation

The navigation has `aria-label="Chapters"`, a 4px gap, and these buttons:

| Label               | `data-go` section index |
| ------------------- | ----------------------: |
| Why the role exists |                       1 |
| What an FDE is      |                       5 |
| Audit               |                      10 |
| Evals               |                      12 |
| Deployment          |                      13 |
| 30 Days             |                      15 |

Desktop button rules:

- Transparent background.
- Only a transparent one-pixel bottom border is reserved.
- Font size 10.5px, weight 600, letter-spacing `.1em`, uppercase.
- Color `--hud-mut`.
- Padding `6px 9px 7px`.
- Color and border-color transition: 350ms.
- Current chapter uses the blue/dark-appropriate active color and visible underline.
- Hover color is `--hud-ink`.

Mobile, at 960px wide or less:

- Hide text with `font-size: 0`.
- Use `padding: 6px 5px`.
- Render one 5 × 5 circular dot in `::after`.
- Inactive dot uses `--hud-mut`; active dot uses `--blue`.
- Remove the active underline.
- At 390px, the six dots occupy a 110px-wide navigation region positioned on the right side of the HUD.

### Pager

- Fixed right 26px and bottom 24px, z-index 20.
- Two buttons separated by 8px.
- Previous button: `↑`, `id="prev"`, `aria-label="Previous section"`.
- Next button: `↓`, `id="next"`, `aria-label="Next section"`.
- Each button is exactly 38 × 38px, square, transparent, with a one-pixel `--hud-line` border.
- Font size 15px, line-height 1.
- Disabled opacity: `.28`.
- Hovering an enabled pager button changes its border to `--hud-ink`.
- Transition color and border-color over 350ms and opacity over 300ms.
- At 390 × 844, the pager begins at x 280, y 782.

### Audit/Evals/Deployment rail

- Fixed at the lower left, z-index 20.
- Labels: `Audit`, `Evals`, `Deployment`.
- Hidden by default and on all viewports at 960px wide or less.
- Visible only on section indices 10 through 13.
- Active label mapping:
  - Index 10: Audit
  - Index 11: Audit
  - Index 12: Evals
  - Index 13: Deployment
- At 1280 × 720 its visible baseline is approximately x 28, y 689.

## Deck navigation and state controller

### Active section model

- There are 20 sections, indexed 0 through 19.
- An `IntersectionObserver` uses the deck as its root and thresholds `[0, .6]`.
- A section becomes active at an intersection ratio of at least `.6`.
- A section loses `.on` only when it is no longer intersecting.
- Keep the current section index separately from the observer so rapid navigation can retarget an in-flight animation.

### Desktop animated navigation

- Desktop threshold: wider than 960px.
- A navigation step moves to the target section’s `offsetTop` over 450ms.
- Use an ease-in-out quadratic interpolation:

```js
const eased =
  progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
```

- Retarget the current animation rather than queuing independent animations.
- Previous/next buttons move one section at a time.
- A wheel gesture moves exactly one slide.
- Ignore wheel deltas smaller than 10.
- Lock after the first accepted wheel event and extend the unlock timer to 360ms after the latest momentum event.
- Prevent default wheel scrolling on desktop.
- Ignore wheel navigation while a workflow modal is open.

### Mobile and tablet scrolling

- At 960px wide or less, do not intercept wheel events.
- Set the deck to `scroll-snap-type: y mandatory` and `scroll-behavior: smooth`.
- Each section remains one `100dvh` snap point.
- At 390 × 844, the deck and every section measure exactly 390 × 844.

### Keyboard controls

- `ArrowDown`, `PageDown`, and Space move forward one slide.
- Space must not hijack activation when focus is on a button.
- `ArrowUp` and `PageUp` move backward one slide.
- `Home` moves to section 0.
- `End` moves to section 19.
- Do not intercept keys from inputs or textareas.
- Do not navigate the deck while a workflow modal is open.

### Final two-state section

Section 19 has two states:

1. The final-week view.
2. A manually triggered zoom-out to the complete month.

While already on section 19, one further manual forward action changes the calendar scene to `done`, marks all four weeks completed, adds `.closing` to the section, and disables Next. A backward action from this state restores the final-week view before moving to section 18 on a subsequent backward action.

### Required transition behavior

| Given                                    | Action                            | Required result                                                                                    |
| ---------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| A 450ms deck transition is active        | Another navigation input arrives  | Retarget the in-flight animation; do not queue a second independent animation.                     |
| Section 8 is running or waiting          | Navigate to any other section     | Clear run and auto-advance timers and reset all run visuals.                                       |
| Section 8 has been left                  | Return to section 8               | Start a new run from the initial state, or show the landed state immediately under reduced motion. |
| The run is waiting                       | Activate Approve once             | Enter the final sequence and hide Approve.                                                         |
| The run is no longer waiting             | Activate Approve                  | Do nothing.                                                                                        |
| Post-approval auto-advance is pending    | Leave section 8                   | Cancel the pending advance.                                                                        |
| A workflow modal is open                 | Use deck wheel or navigation keys | Keep the current section and leave the modal open.                                                 |
| A workflow modal is open                 | Press Escape                      | Close the modal and restore focus to its invoking card.                                            |
| Section 19 shows the final week          | Navigate forward                  | Reveal the complete-month state without changing section index.                                    |
| Section 19 shows the complete month      | Navigate backward                 | Restore the final-week state without changing section index.                                       |
| Section 19 shows the restored final week | Navigate backward again           | Move to section 18.                                                                                |
| Reduced motion is active                 | Enter section 8                   | Render the complete landed run with no timed wait.                                                 |

### Chapter mapping

Use this section-to-chapter map exactly:

```js
[-1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 5, 5];
```

## Persistent scene layer

The `#stage` layer is fixed to the viewport at z-index 2, is non-interactive, begins at opacity 0, and fades over 600ms. It is visible only on section indices 1, 2, and 3.

| Section index | `data-scene` | Purpose                                                                                 |
| ------------: | ------------ | --------------------------------------------------------------------------------------- |
|             1 | `spread`     | Show one foundational model distributing the same capability to five companies.         |
|             2 | `flatten`    | Flatten the capability advantage and foreground the loss of model-only differentiation. |
|             3 | `deploy`     | Shift attention to ROI and deployment as the differentiating layer.                     |

The persistent scene contains this exact copy:

- `THE SAME CAPABILITY, EVERYWHERE`
- `ROI`
- `A FOUNDATIONAL MODEL`
- `COMPANY 1`
- `COMPANY 2`
- `COMPANY 3`
- `COMPANY 4`
- `COMPANY 5`

Match the live geometry and line drawing from the reference at each state. Do not substitute stock imagery or illustrative icons.

Use the live reference, the source archive when available, and
`states/geometry.json` as complementary implementation evidence. Measure and
record the following for every stage element and scene while implementing it:

- DOM selector and source class tokens.
- Untransformed bounding box in CSS pixels.
- Transform origin and complete transform matrix.
- Opacity, color, stroke width, dash values, and stacking order.
- Transition property, duration, delay, and easing.
- The exact viewport, device pixel ratio, font state, and section activation
  used for the measurement.

If stored records are missing, inspect the live scene at the required viewport,
measure the rendered elements and computed styles, implement from those
measurements, and persist the resulting records for repeatable comparison. Do
not substitute generic circles, connectors, paths, or positions without first
attempting live measurement.

## Content and section inventory

Every section is exactly one viewport high. Preserve all line-break intent and punctuation.

### 0 — `s01`: Hero

- Eyebrow: `VARICK’S GUIDE TO`
- H1: `AI Forward Deployed` / `Engineering`
- Supporting copy: `The blueprint to breaking into FDE in 30 days.`
- Prompt: `SCROLL ↓`
- Light surface.
- At 1280 × 720, the H1 content box begins around x 89.6, y 158.8 and is 1100.8px wide.
- At 390 × 844, the H1 box begins around x 23.4, y 344.8 and is 343.2px wide.

### 1 — `s02`: Capability availability

- H2: `Every company can now buy intelligence.`
- Copy: `The same foundational capability is becoming available to anyone able to pay for it.`
- Light surface.
- Activate the `spread` persistent scene.

### 2 — `s03`: Moat question

- H2: `If everyone can access it, intelligence alone cannot be the moat.`
- Light surface.
- Activate the `flatten` persistent scene.

### 3 — `s04`: Deployment answer

- Lead: `So where does the advantage go?`
- H2: `Into deployment.`
- Copy: `The edge is no longer who has intelligence. It is where, how, and why they use it.`
- Light surface.
- Activate the `deploy` persistent scene.

### 4 — `s05`: The role

- Lead: `Someone has to decide where intelligence belongs.`
- H2: `That person is the forward deployed engineer.`
- Three-stage chain:
  - `BUSINESS REALITY` — `How the work actually happens today — tools, people, exceptions.`
  - `FDE JUDGMENT` — `Where intelligence belongs, and where it does not.`
  - `DEPLOYED AI SYSTEM` — `Working software carrying real responsibility inside the business.`
- Join the stages with right arrows.
- Closing copy: `FDEs are in demand because they control how intelligence enters the business.`
- Dark surface.

### 5 — `s06`: Two kinds of judgment

- H2: `The role requires two kinds of judgment that rarely exist in one person.`
- Left heading: `The commercial world`
- Left terms: `workflows`, `cost`, `incentives`, `risk`, `adoption`, `business value`
- Right heading: `The technical world`
- Right terms: `models`, `systems`, `APIs`, `data`, `code`, `reliability`
- Center node: `FDE`
- Closing copy: `The FDE turns business understanding into working software.`
- Light surface.

### 6 — `s07`: Current workflow

- H2: `First, understand how the work is really being done.`
- Copy: `The documented process is rarely the real process.`
- Five clickable step cards, joined by arrows on desktop:

| Step | Title                         | Detail             | Modal key |
| ---: | ----------------------------- | ------------------ | --------- |
|   01 | An email arrives              | the trigger        | `email`   |
|   02 | Copied into a spreadsheet     | re-keyed by hand   | `sheet`   |
|   03 | Checked in an internal system | tribal knowledge   | `system`  |
|   04 | Approved in Slack             | waits on a reply   | `slack`   |
|   05 | Entered into the ERP          | 40 required fields | `erp`     |

- Each card has a visible `+` affordance.
- Hover and keyboard focus change the border to `--navy`, add
  `0 8px 24px rgb(2 43 114 / 12%)`, and translate the card upward by 3px.
- Desktop card style: white, one-pixel `--line` border, square corners, `17px 15px 15px` padding, 9px internal gap, and minimum height 132px.
- At 820px or less, cards wrap. Cards 1–4 form a two-column grid and card 5 spans both columns.
- At 390px, cards 1–4 measure approximately 166.6px wide and card 5 approximately 343.2px wide.
- Label: `THE FDE TRACES EVERY STEP`
- Instruction: `Click any step — the “simple” version hides the real work.`

### 7 — `s08`: AI-native workflow

- H2: `Then decide how the work should operate when intelligence is built into it.`
- Build a diagram with these ordered stages:
  - `Deterministic software` — `intake · validation · routing`
  - `The agent acts` — `gathers · decides · drafts`
  - `A human approves` — `one clear decision`
  - `Record updated` — `the ERP, without re-keying`
- Exception label: `an exception escalates to a person`
- Bottom rail: `EVIDENCE LOG — EVERY STEP RECORDED`
- Accessible image label: `The same workflow rebuilt: deterministic software handles intake, an agent acts inside the flow, a human approves, evidence is logged, exceptions escalate`
- Closing copy: `An FDE understands the current workflow, designs the AI-native workflow, and builds the system that connects the two.`
- Light surface.

### 8 — `srun`: Watch one run

- Dark surface.
- Label: `ONE RUN · END TO END`
- Incoming document: `invoice_0417.pdf`
- Drop zone: `DROP TO INGEST`
- H2: `Finally, the agent can be deployed over the existing systems.`
- Four phase labels:
  - `INTAKE VALIDATED`
  - `AGENT DRAFTS`
  - `HUMAN APPROVES`
  - `RECORD POSTED`
- Run log, in this order:
  1. `document received · invoice_0417.pdf`
  2. `intake · fields parsed, no duplicates found`
  3. `agent · pulling the matching PO from the ERP`
  4. `agent · cross-checking contract terms`
  5. `agent · drafting the record`
  6. `paused — waiting for human approval`
  7. `approved · by you, just now`
  8. `posting to the ERP — no re-keying`
  9. `record posted · evidence log complete`
- Approval button: `APPROVE`.
- Final line: `✓ Record posted — every step of the run captured in the evidence log.`

Script the sequence exactly:

| Relative time | Action                                                                                            |
| ------------: | ------------------------------------------------------------------------------------------------- |
|        1500ms | Document begins flying into the drop zone.                                                        |
|        2850ms | Drop zone disappears; document is absorbed; H2 appears; first log line appears.                   |
|        3500ms | Phase 1 becomes current; second log line appears; progress bar animates to 58% over 3000ms.       |
|        4400ms | Phase 1 completes; phase 2 becomes current; third log line appears.                               |
|        5100ms | Fourth log line appears.                                                                          |
|        5800ms | Fifth log line appears.                                                                           |
|        6500ms | Phase 2 completes; phase 3 enters waiting state; sixth log line appears; Approve becomes visible. |

On Approve:

| Relative time | Action                                                                              |
| ------------: | ----------------------------------------------------------------------------------- |
|           0ms | Seventh log line appears; phase 3 completes; progress animates to 100% over 1500ms. |
|         450ms | Phase 4 becomes current; eighth log line appears.                                   |
|        1300ms | Phase 4 completes; ninth log line and final result appear.                          |
|        2900ms | Advance automatically to section 9 if the user is still on section 8.               |

The timing tables define event boundaries, but they do not define the visual
motion by themselves. Use the live reference, the source controller when
available, and generated `states/timing.json` and `states/geometry.json` records
to bind:

- Document start and destination boxes, translation, scale, rotation, opacity,
  transform origin, duration, and easing.
- Drop-zone enter, absorb, and hidden-state class changes.
- Progress-bar initial width, 58% and 100% transitions, and transition-reset
  behavior.
- Phase-label initial, current, waiting, complete, and reset classes.
- Log-line reveal properties and the ordering of DOM insertion or visibility.
- Every timer handle, cancellation point, re-entry reset, and post-approval
  auto-advance guard.

If the source controller or stored state records are unavailable, observe the
complete live sequence, measure the choreography, implement it, and record any
remaining uncertainty in the candidate report. Do not replace observable
choreography with arbitrary log timers or generic fades.

When reduced motion is active, skip the theater and show the complete landed state immediately.

### 9 — `s09`: Three parts

- H2: `The job has three parts.`
- Chain:
  - `Audit` — `identifies the right problem and maps reality.`
  - `Evals` — `prove the system behaves correctly.`
  - `Deployment` — `makes it work inside the business.`
- Join stages with right arrows.
- Closing copy: `Each stage earns the right to the next.`
- Dark surface.

### 10 — `s10`: Audit

- H2: `Audit: Find the workflow worth rebuilding.`
- Copy: `The audit determines what should be automated before anyone begins building.`
- Three-stage audit flow:
  1. `COLLECT CONTEXT`: interviews, emails, spreadsheets, SOPs, systems, approvals, exception paths.
  2. `TRACE FDE FINDINGS`: bottlenecks, repetitive work, judgment points, required systems, failure modes, automation worth doing.
  3. `PRODUCE THE OPERATING MAP`.
- Artifact label: `THE AUDIT ARTIFACT — ONE OPERATING MAP`
- Artifact rows:
  - `Current-state workflow` — `how the work actually happens today`
  - `Future-state workflow` — `the same work, rebuilt around AI`
  - `Selected use case` — `one workflow, chosen for value`
  - `Boundaries` — `what the system may and may not do`
  - `Expected business value` — `hours, cost, and errors — quantified`
- Light surface.

### 11 — `s11`: Automation decision

- H2: `Decide what should be automated — and what should not.`
- Root label: `a step in the audited workflow`
- Three outcomes:
  - `DETERMINISTIC SOFTWARE` — `When the rules and inputs are predictable.`
  - `AN AGENT` — `When the objective is clear but the inputs, path, or required actions vary.`
  - `A HUMAN IN CONTROL` — `When the decision carries material ambiguity, accountability, or irreversible consequences.`
- Accessible image label: `A decision diagram: each step routes to deterministic software, an agent, or a human in control`
- Closing copy: `Prioritize lengthy, high-volume workflows where the improvement is large enough to matter.`
- Light surface.

### 12 — `s12`: Evals

- H2: `Evals: Turn non-determinism into evidence.`
- Evaluation table label: `THE EVALUATION CASES`
- Columns: `RIGHT DATA`, `REQUIRED STEPS`, `MATCHES EXPERT`, `SAFE TO ACT`
- Rows:

| Case                   | Right data | Required steps | Matches expert | Safe to act |
| ---------------------- | ---------- | -------------- | -------------- | ----------- |
| The normal case        | ✓          | ✓              | ✓              | ✓           |
| The edge case          | ✓          | ✓              | ✗              | ✗           |
| Incomplete information | ✗          | —              | —              | → human     |
| An ambiguous request   | ✓          | ✗              | —              | → human     |
| A high-risk action     | ✓          | ✓              | ✓              | → human     |

- Legend: `✓ expected behavior · ✗ failure, with the evidence kept · → human escalated by rule`
- Report label: `THE EVALUATION REPORT`
- Pass rate: `41 / 50`, `graded runs passed — 82%`
- Failure categories: `missing data` = 5, `wrong record pulled` = 4.
- Operating rules:
  - `CONFIDENCE` — `below 0.80, the system must escalate`
  - `ESCALATION` — `high-risk actions always reach a person`
  - `READINESS` — `pilot — with human review on every action`
- Light surface.

### 13 — `s13`: Deployment

- H2: `Deployment: Make it work inside the business.`
- Diagram inputs: `existing data`, `internal APIs`, `identity & permissions`.
- Controlled environment: `SANDBOX`, `human review`, `logs`, `alerts`, `rollback`.
- Output: `production users`.
- Labels: `THE SYSTEM`, `PROTOTYPE`, `IN PRODUCTION`.
- Accessible image label: `A prototype system connecting to existing data, APIs, identity, a sandbox, human review, logs, alerts, rollback, and finally production users`.
- Three principles:
  1. `Integrate with what already exists` — `Build over the current data and systems rather than beginning with a large replacement project.`
  2. `Test inside a controlled environment` — `Use a sandbox within the company’s infrastructure to run, inspect, and debug safely.`
  3. `Increase autonomy gradually` — `Begin with the smallest useful action and grant more authority only after the system proves reliable.`
- Closing copy: `Deployment is where software begins carrying operational responsibility.`
- Light surface.

### 14 — `s14`: Continuous loop

- Loop: `Audit → Build → Evals → Deploy → Observe → Improve`
- Label: `THE LOOP RUNS AGAIN`
- H2: `An FDE owns the path from messy workflow to trusted production system.`
- Prompt: `THE 30-DAY PLAN ↓`
- Light surface.

### 15 — `s15`: Roadmap introduction

- Label: `THE 30-DAY ROADMAP`
- H2: `How to become an FDE in 30 days.`
- Copy: `Most successful FDE candidates come from consulting, product management, or software engineering.`
- Instruction: `COMPLETE THIS ROADMAP IN PARALLEL WITH APPLYING AND INTERVIEWING`
- Consultant/PM note: `CONSULTANTS AND PMS — CHOOSE TWO PROJECTS AND TAKE THEM DEEP`
- Project choices: `Production-ready AI agent`, `RAG pipeline`, `Eval framework`, `MCP integration`.
- Light surface.
- Activate the calendar in `month` state.

### 16 — `s16`: Week 1

- Label: `WEEK 1 · DAYS 1–7`
- H2: `Week 1: Build an agent that can complete a real loop.`
- Copy: `By Day 7, the agent should complete one useful workflow and expose every step it takes.`
- Calendar state: `w1`.

### 17 — `s17`: Week 2

- Label: `WEEK 2 · DAYS 8–14`
- H2: `Week 2: Turn the demo into a system that can recover.`
- Copy: `By Day 14, the agent should produce predictable outputs and resume after failure.`
- Calendar state: `w2`; Week 1 is marked completed.

### 18 — `s18`: Week 3

- Label: `WEEK 3 · DAYS 15–21`
- H2: `Week 3: Make the system measurable and economically viable.`
- Copy: `By Day 21, you should know how the system fails, how much it costs, and whether it is improving.`
- Calendar state: `w3`; Weeks 1 and 2 are marked completed.

### 19 — `s19`: Final week and close

- Label: `FINAL WEEK · DAYS 22–30`
- H2: `Final week: Defend the system like an FDE.`
- Copy: `By Day 30, you should be able to explain the system to both an engineer and a non-technical executive.`
- Closing statement: `Do the job before you have the title.`
- Closing copy: `On Day 30, you should not merely understand forward deployed engineering. You should have evidence that you can do it.`
- Milestones:
  - `DAY 7` — `Working agent`
  - `DAY 14` — `Recoverable system`
  - `DAY 21` — `Evaluated system`
  - `DAY 30` — `Complete FDE case study`
- Calendar state: `w4`; Weeks 1–3 are marked completed.
- A further manual forward action activates the `done` calendar state.

## Calendar layer

The calendar is a fixed, non-interactive layer at z-index 2. It begins at opacity 0 and fades over 600ms. Its desktop scale variable is `.26`, reduced to `.225` at 1340px, `.19` at 1080px, and hidden entirely at 960px or less.

The scale values are not sufficient implementation geometry. Measure the live
calendar and record the unscaled canvas dimensions, transform origin, base
inset or translation, clipping bounds, grid tracks, row heights, and complete
transform and visibility values for `month`, `w1`, `w2`, `w3`, `w4`, and
`done`. Every week-complete marker and complete-month element must bind to its
source selector and class state.

Do not reinterpret the calendar as a conventional responsive four-column grid
or replace the `done` state with an overlay card. When stored geometry is
unavailable, derive it by inspecting and measuring each live calendar state,
then validate the candidate against fresh captures.

### Week headers

1. `DAYS 1–7` — `Build the agent`
2. `DAYS 8–14` — `Make it production-ready`
3. `DAYS 15–21` — `Measure and optimize`
4. `DAYS 22–30` — `Communicate and defend`

### Day content

| Day | Title              | Description                                                                                 |
| --: | ------------------ | ------------------------------------------------------------------------------------------- |
|   1 | Agent loop         | prompt → model → response → next step, until the task completes or a max-step limit hits    |
|   2 | Tool use           | one API call + one web search — the agent decides when to call them                         |
|   3 | Guardrails         | input validation · max-step limit · output filtering                                        |
|   4 | Context & memory   | context window by default; external memory only when state must outlive the run             |
|   5 | Audit trail        | log every prompt, response, tool call, result, error, and timestamp                         |
|   6 | Real workflow      | run it on one process that used to be manual — tie it to a portfolio project                |
|   7 | Checkpoint         | a working agent with tools, guardrails, deliberate memory, and a full audit trail           |
|   8 | Structured outputs | a defined JSON schema, not free-form text                                                   |
|   9 | Schema validation  | validate every response; retry or escalate when the structure is invalid                    |
|  10 | Failure modes      | missing data · malformed responses · dead APIs · timeouts · duplicates · partial completion |
|  11 | Checkpointing      | save state every few steps: task, actions, tool results, pending work, errors               |
|  12 | Resume             | stop the agent deliberately; restart it from the last checkpoint                            |
|  13 | Failure handling   | explicit behavior for tool failure, bad output, incomplete state, unsafe continuation       |
|  14 | Checkpoint         | a resumable agent with structured outputs, state recovery, and explicit failure behavior    |
|  15 | Retry logic        | exponential backoff on every external call: 1s · 2s · 4s · 8s · cap at 16s                  |
|  16 | Failure categories | missing context · wrong tool · wrong record · invalid output · unsafe action · timeout      |
|  17 | Golden dataset     | 20 real queries with hand-labeled ideal outputs — normal, edge, ambiguous, high-risk        |
|  18 | Run evals          | correctness · format · tool selection · required steps · escalation behavior                |
|  19 | Optimize cost      | cheaper models for simple subtasks · caching · token limits · cost per query                |
|  20 | Multi-agent        | only when decomposition helps: one plans → several execute → one synthesizes                |
|  21 | Checkpoint         | an evaluated agent with known failure modes, measured cost, and a golden dataset            |
|  22 | The pain point     | who does the work, what takes time, where errors occur, what it costs                       |
|  23 | Why AI belongs     | why not just software · what stays human · where autonomy stops                             |
|  24 | Architecture       | stack, tools, models, data, memory, guardrails — and why each exists                        |
|  25 | Iterations         | what v1 got wrong, what failed, what changed, how it improved                               |
|  26 | The evals          | dataset, pass rate, failure categories, thresholds, open risks                              |
|  27 | Economics          | time saved, errors reduced, risk, revenue, cost per query                                   |
|  28 | Rehearse: engineer | architecture, decisions, failures, tradeoffs                                                |
|  29 | Rehearse: VP       | problem, outcome, evidence, risk — plain language                                           |
|  30 | Final checkpoint   | a complete FDE case study for engineers and executives alike                                |

### Complete-month close

- Milestone labels: `DAY 7`, `DAY 14`, `DAY 21`, `DAY 30`.
- Main result: `A COMPLETE FDE CASE STUDY`.
- Evidence line: `20 cases → agent runs → pass / fail evidence → failure categories → cost per run`.
- System heading: `THE SYSTEM — EVERY WEEK ADDS CAPABILITY TO THE SAME BUILD`.
- Portfolio heading: `THE PORTFOLIO — WHAT YOU LEAVE WITH`.
- Capability list:
  - agent loop
  - two tools
  - guardrails
  - deliberate memory
  - audit trail
  - structured outputs
  - schema validation
  - checkpointed state
  - resume after failure
  - explicit failure paths
  - retries + backoff
  - failure taxonomy
  - golden dataset
  - eval suite
  - cost per query
  - workflow audit
  - system architecture
  - evaluation report
  - deployment controls
  - business case

## Workflow-step modal

### Shell and behavior

- Overlay: fixed inset 0, z-index 200, flex-centered, 24px padding.
- Closed state: opacity 0 and no pointer events.
- Open transition: opacity over 280ms.
- Card: white, one-pixel `--line` border, max-width 640px, width 100%, max-height 86vh, internal vertical scroll, `38px 40px 34px` padding, and square corners.
- Shadow: `0 30px 80px rgb(2 43 114 / 28%)`.
- Initial card transform: `translateY(14px) scale(.985)`.
- Open card transform: none, transitioning over 320ms with `--ease`.
- Dialog attributes: `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing at the modal title.
- Close control: circular, one-pixel border, visible `×`, and `aria-label="Close"`.
- On open: populate content, reset modal scroll to the top, remember the active element, and focus Close.
- On close: hide the modal and restore focus to the invoking step card.
- Escape closes the modal.
- The observed source does not close when its backdrop is clicked and does not implement a complete Tab focus trap. Preserve this unless a separate accessibility-remediation task explicitly changes the fidelity contract.
- Modal H3: 26px, weight 600, line-height 1.1, letter-spacing `-.02em`.

### Modal content: Step 01

- Tag: `Step 01 · The trigger`
- Title: `“An email arrives”`
- Punch: `Sounds like a clean trigger. It’s a swamp.`
- Points:
  - `It arrives from 40+ senders and no two are formatted alike — data in the body, in a PDF, in a screenshot, or buried in a forwarded thread six replies deep.`
  - `Half of them are exceptions in disguise: “same as last time,” “ignore the second attachment,” “Sarah already signed off on this one.”`
  - `There’s no consistent subject line, so the routing logic — what’s urgent, what’s a duplicate, what to drop — lives entirely in one person’s head.`
- Why this is a person, not a script: `Before a line of code gets written, someone has to sit next to the person who reads these all day and learn the 30 unwritten rules for what actually counts. That discovery IS the job.`

### Modal content: Step 02

- Tag: `Step 02 · Re-keyed by hand`
- Title: `“Copied into a spreadsheet”`
- Punch: `Which spreadsheet? There are four.`
- Points:
  - `One is the “real” one, two are stale, and one is a personal copy on someone’s desktop that quietly disagrees with the rest.`
  - `Columns drift — a field someone added in March silently broke three downstream formulas that nobody owns anymore.`
  - `It’s re-keyed by hand, so a typo doesn’t throw an error — it just becomes the new source of truth.`
  - `“Data validation” is a shared belief, not a rule the file actually enforces.`
- Why this is a person, not a script: `The spreadsheet is a database, a workflow engine, and an audit log all wearing a grid costume. You have to reverse-engineer all three before you can safely replace any of them.`

### Modal content: Step 03

- Tag: `Step 03 · Tribal knowledge`
- Title: `“Checked in an internal system”`
- Punch: `The system that has no API.`
- Points:
  - `Login is behind a VPN, the UI hasn’t changed since 2009, and there is no export button.`
  - `The field labeled “Status” means five different things depending on who set it and when.`
  - `The real check is tribal: “you just have to know that region 4 always needs a second look.”`
  - `The one person who understands the edge cases is retiring in eight months.`
- Why this is a person, not a script: `The knowledge isn’t in the system — it’s in the operator. An FDE’s job is to capture it into something durable before it walks out the door for good.`

### Modal content: Step 04

- Tag: `Step 04 · Waits on a reply`
- Title: `“Approved in Slack”`
- Punch: `An approval with no paper trail.`
- Points:
  - `“Approval” might be a 👍 in a DM, an “lgtm” in a thread, or a verbal yes in a huddle — sometimes all three, sometimes none.`
  - `The approver is out half the time, and the escalation rule (“ping Dave if it’s over $50k”) is unwritten and inconsistently followed.`
  - `There’s no record of who approved what, when, or on what basis — until an auditor asks, and then it’s a very bad week.`
- Why this is a person, not a script: `Turning a thumbs-up into an auditable control — who, what, when, on what evidence — is most of what risk and compliance teams actually care about. That’s not a Slack bot; that’s design.`

### Modal content: Step 05

- Tag: `Step 05 · Where automation goes to die`
- Title: `“Entered into the ERP”`
- Punch: `Forty required fields and a prayer.`
- Points:
  - `The ERP demands ~40 fields. The email gave you six. The other 34 come from memory, lookup tables, and “just leave it blank, it usually works.”`
  - `The mapping rules are undocumented, and some values need transformation that nobody ever wrote down.`
  - `Errors don’t surface now — they show up days later in a reconciliation report someone reads on Fridays. Maybe.`
- Why this is a person, not a script: `The last step is where “simple automation” quietly falls apart. Getting it right means modeling every rule the ERP silently assumes — the ones no one can even tell you until it breaks.`

## Responsive contract

### Breakpoints

- 1340px: calendar scale changes to `.225`.
- 1080px: calendar scale changes to `.19`.
- 960px: mobile/tablet navigation and layout mode.
- 820px: current-workflow step cards wrap.
- Height 720px: compact vertical padding.

### At 960px and below

- Use mandatory vertical scroll snapping with smooth scrolling.
- Convert chapter labels to dots.
- Hide the calendar layer.
- Hide the Audit/Evals/Deployment rail.
- Collapse audit and evaluation grids to one column with 26px gaps.
- Collapse run rows and phase layouts to one column.
- Hide intermediate audit arrows.
- Allow `.wrap` to scroll internally where content is taller than the viewport.
- Stack the roadmap footer vertically.
- Reflow findings with wrapping gaps.
- Use one-column artifact/report rows.
- Maintain the fixed header and pager.

### At 820px and below

- Wrap the five current-workflow cards.
- Use a two-column arrangement for the first four cards and full width for the fifth.
- Hide connecting arrows.

### Mobile reference geometry at 390 × 844

- Header: 390 × 66 at x 0, y 0.
- Deck and section: 390 × 844.
- Main horizontal content padding: 23.4px per side, derived from 6vw.
- Hero: x 23.4, y 344.8, width 343.2, height approximately 164.6.
- Chapter dot group: x 252, y 24, width 110, height 18.
- Pager: x 280, y 782, width 84, height 38.
- The hero vertically centers its primary statement while keeping the brand above and scroll/pager cues near the bottom.

## Reduced-motion contract

Under `prefers-reduced-motion: reduce`:

- Force every transition duration and animation duration to `.01ms`.
- Force transition and animation delay to 0.
- Set deck `scroll-behavior: auto`.
- Remove cue animations.
- Render the deployment-run section in its complete landed state instead of playing timed cues.

Do not remove information or controls in reduced-motion mode.

## Accessibility and source quirks

The replica must preserve the reference unless an explicit remediation scope overrides this section.

- The two pager controls are 38 × 38px, below a 44 × 44 touch-target guideline.
- Mobile chapter-dot controls also have compact hit areas.
- The modal correctly uses dialog semantics, focuses Close, supports Escape, and restores focus.
- The modal does not implement a complete focus trap.
- The modal backdrop is not a close target.
- Three complex diagrams have accessible labels. The Varick wordmark is the
  fourth element with `role="img"`.
- The reference has one H1, twenty section H2 headings, and one modal H3.
- No outbound links or form fields are present.
- The source requests commercial font families but does not load a webfont. Use the same fallback stack; do not silently choose a visually different webfont.
- The body has a computed `transition: all` in the observed source through a broad inherited/default rule. Do not add new behavior that depends on it.

The source semantic inventory is part of the parity contract:

- 15 buttons: six chapter controls, two pager controls, five workflow cards,
  Approve, and Close.
- 10 inline SVG elements and four elements with `role="img"`.
- One dialog, zero anchors, and zero forms.

Measure this inventory immediately after the initial document has loaded and
before any user interaction. The modal shell, modal H3, Close button, Approve
button, and their semantic attributes exist in the initial DOM even when their
visual states are hidden. Conditional mounting that changes these baseline
counts is a structural mismatch.

### Fidelity modes

Build and prove the source-faithful replica first. Any accessibility or product
remediation must be a separately named derivative, with its intentional
differences recorded against the passing replica baseline. Do not silently
change compact hit areas, focus trapping, font loading, headings, controls, or
source quirks while claiming exact replication.

## Asset contract

Required assets:

1. `assets/varick-icon.data-uri.txt`: the exact source data URI.
2. `assets/varick-icon.png`: the decoded 64 × 64 PNG displayed at 26 × 26.
3. `assets/varick-wordmark.svg`: the exact inline Varick Agents wordmark with
   `viewBox="0 0 204 34"`.
4. `assets/hashes.json`: SHA-256, byte size, media type, dimensions or
   `viewBox`, and provenance for every asset representation.

The complete icon source string has SHA-256
`44fa88e9f611cf6ddf82ae3f06ec78e065d42ab6355c4b612da85728d31d6b83`.

All other visual systems are built from HTML, CSS borders, text, and transforms. Do not introduce stock photos, icon libraries, background textures, or decorative gradients.

Before finalizing the brand lockup, verify the packaged or freshly extracted
asset hashes and verify that the icon data URI decodes byte-for-byte to the PNG.
Public availability is not permission to reuse, store, or publish these assets.
Before extraction, record explicit owner authorization covering all three actions.
If that authorization is absent, the acquisition gate is blocked: use an approved
replacement with its own provenance and permission record. When authorization is
present, persist the acquired bytes, authorization reference, and provenance so
later agents do not have to extract them again.

## Implementation sequence for the receiving agent

1. Confirm `implementation_ready`: read this specification, inspect the live
   original or Sites copy, validate the manifest when present, and record the
   reference URL, observed version or fingerprint state, viewport, browser,
   and evidence gaps.
2. If an exact source archive is available and its hash passes, materialize it
   in an isolated candidate directory. Otherwise, reconstruct the document
   from this specification and the live reference. Do not wait for optional
   archival artifacts before beginning the site.
3. Extract the exact icon and wordmark from the source or live document, store
   their bytes and hashes, and use those assets in the candidate.
4. Select or build the smallest hosting adapter that serves the document
   without additional visible copy, asset substitution, authentication, or
   route drift. Prefer static HTML, CSS, and JavaScript.
5. Implement and verify global tokens, the internal scroll deck, section sizing,
   fixed HUD, rail, and pager.
6. Implement all 20 sections, exact copy, DOM order, hidden controls, and the
   declared semantic inventory.
7. Implement chapter, pager, keyboard, wheel, native scroll-snap, and final
   two-state navigation against the live behavior and controller evidence.
8. Implement the three persistent deployment scenes. Capture their live states,
   measure geometry and computed styles, and compare the candidate states.
9. Implement the four-week calendar, all 30 daily entries, and all six calendar
   states. Generate the missing state measurements and captures while doing so.
10. Implement the five workflow modals, initial hidden DOM, Escape behavior, and
    focus restoration.
11. Implement the timed deployment run, cancellation and re-entry behavior,
    and reduced-motion landed state. Observe and record live choreography when
    controller source or stored timing records are unavailable.
12. Match desktop geometry against fresh reference captures, then mobile
    geometry, then intermediate breakpoints. Iterate on material differences
    rather than stopping at the first comparison.
13. Run the deterministic proof protocol and acceptance matrix below before
    publishing. Publish only the exact candidate commit and build archive bound
    to the report. Complete the site even when some forensic evidence remains
    unavailable; label those lanes unverified and do not overstate parity.

## Deterministic proof protocol

Every parity run must record:

- Implementation-readiness outcome, evidence inventory, and timestamp.
- Hashes for every available source, asset, screenshot, geometry, and timing
  artifact used or generated by the run, with absent optional artifacts listed
  explicitly.
- Candidate commit SHA.
- Reference version ID, source commit, and archive hash.
- Browser product and exact version.
- Operating system.
- Viewport width and height.
- Device pixel ratio.
- Color scheme and reduced-motion preference.
- Requested font stack, available fonts, and resolved font.
- Page-load, font-ready, and reveal-settled conditions.
- State setup operation for each capture.
- Screenshot, candidate, and diff hashes.
- Pixel-diff count and ratio.
- Console errors, failed network requests, and horizontal-overflow result.
- Canonical route, redirect behavior, access mode, and an unauthenticated HTTP
  result proving that no sign-in interstitial replaces the page.
- Exact pass, fail, blocked, or unverified outcome for each acceptance lane and
  the resulting claims boundary.

The candidate should expose a test-only state controller capable of selecting:

- Section index 0 through 19.
- Persistent stage scene `spread`, `flatten`, or `deploy`.
- Calendar scene `month`, `w1`, `w2`, `w3`, `w4`, or `done`.
- Deployment-run phase `initial`, `waiting`, or `landed`.
- Workflow modal `email`, `sheet`, `system`, `slack`, or `erp`.

The controller must not replace user-facing interaction tests. It exists to
freeze otherwise time-sensitive visual states without racing timers.

Persist each run under a candidate-bound directory with a machine-readable
report, for example:

```text
artifacts/fieldcraft-replication/<candidate-sha>/
├── report.json
├── report.md
├── reference/
├── candidate/
└── diff/
```

At minimum, the report schema must include `reference`, `candidate`,
`environment`, `states`, `commands`, `outcomes`, `artifacts`, and
`claims_boundary`.

## Acceptance matrix

### Content identity

- [ ] All 20 sections exist in the specified order and use the specified IDs.
- [ ] All visible copy matches this document byte-for-byte after normalizing only line endings.
- [ ] All symbols match: arrows, checkmarks, crosses, middots, en dashes, em dashes, smart quotes, non-breaking spaces, and the thumbs-up emoji.
- [ ] All 30 calendar entries and five modal payloads match exactly.
- [ ] The page title is `Varick — Forward Deployed Engineering`.
- [ ] No specification headings, implementation labels, loading messages, host
      interstitial copy, or other candidate-authored visible text is present.

### Structural identity

- [ ] One body-fixed presentation with one internal `.deck` scroll container.
- [ ] Exactly 20 `100dvh` sections.
- [ ] Fixed HUD, pager, stage, calendar, rail, and modal layer have the specified stacking order.
- [ ] The page contains no unexpected links, forms, external imagery, or additional routes.
- [ ] The exact Varick icon and wordmark bytes match the source or live document
      and are persisted with hashes; no CSS, text, font, or substitute logo is used.
- [ ] The initial, pre-interaction DOM contains the hidden modal and approval
      controls and matches the declared semantic inventory.
- [ ] The hosting adapter introduces no client hydration, framework runtime,
      wrapper DOM, or additional visible state.

### Navigation identity

- [ ] Previous and Next move one section at a time.
- [ ] Previous is disabled on section 0.
- [ ] Next reveals the complete-month state from section 19 before becoming disabled.
- [ ] Backward navigation from the complete-month state first restores the final-week state.
- [ ] Every chapter control moves to the specified index.
- [ ] Active chapter mapping matches the supplied array.
- [ ] Desktop wheel momentum cannot skip multiple slides.
- [ ] Keyboard controls match the specified keys and exclusions.
- [ ] Mobile scrolling snaps to one full-height section.

### Interaction identity

- [ ] Each of the five workflow cards opens the correct modal payload.
- [ ] Modal Close and Escape work.
- [ ] Focus moves to Close on open and returns to the invoking card on close.
- [ ] Modal-open state blocks deck keyboard and wheel navigation.
- [ ] The deployment run pauses at human approval.
- [ ] Approve completes the remaining phases and advances automatically.
- [ ] Leaving the deployment-run section resets its timers and visual state.
- [ ] Reduced-motion mode lands immediately with all run evidence visible.

### Runtime health

- [ ] No uncaught page errors or site-authored console warnings occur during
      load, navigation, card/modal interaction, approval, or final-slide
      transitions.
- [ ] No required first-party asset or network request fails.
- [ ] No unexpected client hydration or framework runtime is introduced.
- [ ] There is no horizontal document overflow at any required viewport.
- [ ] Repeatedly entering and leaving section 8 creates no duplicate timer or
      observer activity and always returns to the documented initial state.
- [ ] The built semantic inventory matches the source: one H1, twenty H2s, one
      H3, 15 buttons, 10 SVGs, four `role="img"` elements, one dialog, zero
      anchors, and zero forms.
- [ ] Source CSS, JavaScript, complete visible text, embedded icon, and all 20
      section fingerprints match the reference manifest, or the candidate-bound
      report records an approved, intentional deviation for every mismatch.
- [ ] The production route is publicly reachable without ChatGPT sign-in,
      workspace membership, owner access, or another authentication interstitial.
- [ ] The deployed canonical route and any root redirect match the declared
      access and route contract.

### Responsive identity

- [ ] Desktop 1280 × 720 matches the measured reference.
- [ ] Mobile 390 × 844 matches the measured reference.
- [ ] Desktop 1440 × 900 matches a stored reference capture; until that
      capture exists, treat this as a responsive robustness lane rather than a
      pixel-parity lane.
- [ ] Tablet 820 × 1180 uses chapter dots and wrapped cards; until a stored
      reference capture exists, treat this as a responsive robustness lane.
- [ ] Mobile 360 × 800 has no horizontal overflow, clipped primary headings,
      or unreachable content; until a stored reference capture exists, treat this
      as a responsive robustness lane.
- [ ] The calendar is hidden at 960px and below.
- [ ] The audit rail is hidden at 960px and below.

### Visual identity

For each required viewport, capture and compare these states:

1. Section 0 hero.
2. Section 3 `deploy` persistent scene.
3. Section 4 dark role chain.
4. Section 6 workflow cards.
5. Step 1 modal open.
6. Section 7 AI-native workflow diagram.
7. Section 8 waiting for approval.
8. Section 8 final landed state.
9. Section 10 audit artifact.
10. Section 12 evaluation table/report.
11. Section 13 deployment diagram.
12. Section 15 full-month calendar.
13. Section 19 final-week view.
14. Section 19 complete-month closing state.

Pass criteria under the same rendering environment:

- No element edge differs by more than 1 CSS pixel.
- No text wraps onto a different line.
- No color channel differs by more than 1 in sRGB values, excluding browser antialiasing pixels.
- No animation milestone differs by more than one 60Hz frame, except timer scheduling jitter outside the page’s control.
- Pixel comparison has no unexplained region larger than 2 × 2 pixels.
- Any remaining differences are documented as font rasterization or browser compositing variance with side-by-side evidence.

## Stop condition

Candidate implementation starts as soon as this specification and at least one
usable live or stored reference are inspectable. Missing source archives,
pre-existing screenshot matrices, asset bundles, geometry records, or timing
records do not stop construction; acquire or generate them during the work when
possible and record any residue as a proof limitation.

The implementation outcome is complete when the full 20-section experience,
all specified interactions and states, responsive behavior, and exact visible
content are working and the candidate is publicly deployed without an
authentication interstitial. A successful build, lint result, deployment
status, single screenshot, or visually similar hero does not establish visual
parity.

The stronger `parity_verified` outcome additionally requires a validated,
candidate-bound proof report from the deterministic protocol. Checked Markdown
boxes without the report, artifact hashes, and exact command outcomes do not
establish that stronger claim. A complete site may be delivered with clearly
named unverified visual lanes when the relevant reference evidence cannot be
captured.

If the live reference is version-drifted, declare which version is being built
and preserve the manifest mismatch in the report. If a required state cannot be
rendered, report only that acceptance lane as unverified or blocked; continue
implementing every lane supported by available evidence.

Stop construction only when neither live reference is inspectable and no usable
stored source exists, or when the available references are internally invalid
enough that the requested page cannot be identified. Otherwise, inspect,
measure, implement, compare, and iterate until the full site is delivered. Do
not redraw brand assets, invent visible labels, or claim source or pixel parity
beyond the evidence actually obtained.
