# Fieldcraft FDE Blind-Build Brief

## Governing rule

Build the site from this document alone. Do not open, fetch, screenshot, inspect,
or derive implementation details from either historical Fieldcraft or Varick
URL. Do not read any related forensic specification, reference bundle, source
archive, manifest, screenshot, hash record, or prior candidate implementation.
Those materials are reserved for independent evaluation after delivery.

If this brief omits a non-critical visual detail, make the smallest design
choice consistent with its stated system. Record that choice in the handoff;
never seek the answer from the hidden reference. If an omission prevents a
required interaction or content state from being identified, report that exact
blocker before inventing behavior.

## Outcome

Create an original implementation of a premium, editorial, single-page web
presentation titled **Varick — Forward Deployed Engineering**. It teaches the
logic of forward-deployed engineering through 20 full-viewport chapters,
diagrammatic scenes, a five-step workflow investigation, a timed deployment
demonstration, and a four-week roadmap.

The result must feel restrained, intelligent, precise, and deliberately paced:
white and deep-navy fields, oversized Swiss-style typography, thin technical
lines, square panels, generous space, sparse controls, and evidence-oriented
diagrams. Do not produce a conventional marketing landing page, dashboard,
documentation site, gradient-heavy AI aesthetic, glassmorphism interface, or
rounded-card component gallery.

This is an `observable_replica`, not a source clone. The implementation may use
different HTML, CSS, and JavaScript so long as the declared content, structure,
states, behavior, responsive rules, and visual character pass. The receiving
agent is not expected to reproduce hidden source bytes.

## Required repository execution contract

Before editing, identify and record:

- Repository root and authorized write scope.
- Existing routes and user-owned changes that must remain untouched.
- Framework, package manager, and lockfile.
- Canonical install, development, build, and focused-test commands.
- Required candidate route and build-artifact output.
- Delivery mode: local, preview, or production.

A standalone page created outside the named repository and canonical build path
does not satisfy the task. Do not publish unless publication is explicitly part
of the assigned delivery mode.

## Page architecture

- One presentation route containing exactly 20 ordered sections.
- The body is fixed and does not scroll.
- A `.deck`-equivalent internal container owns vertical scrolling and measures
  `100dvh` high.
- Every section measures `100dvh`, clips its own visual scene, and uses mandatory
  start-aligned scroll snapping on mobile/tablet.
- Section content is vertically composed inside a full-height wrapper with
  desktop padding `96px 7vw 64px`; at viewport heights up to 720px use 78px top
  padding, with the Audit, Evals, and Deployment sections using 70px.
- At widths up to 960px use `84px 6vw 56px`, allow tall section content to
  scroll internally, and preserve access to every control and line of copy.

Use semantic headings, paragraphs, buttons, diagrams, and one modal dialog.
The following inventory is a diagnostic completeness check, not visual proof:

- One H1.
- Twenty section H2 headings.
- One modal H3.
- Fifteen buttons: six chapters, two pager buttons, five workflow cards,
  Approve, and Close.
- Ten inline SVG elements.
- Four elements with `role="img"`: the wordmark and three diagrams.
- One dialog.
- No anchors and no forms.

## Visual system

### Color tokens

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
  --fail: #b23a2e;
  --ease: cubic-bezier(0.22, 0.61, 0.21, 1);
}
```

Light sections use white and `--ink`. Dark sections use `--navy` and `--lite`.
Sections 4, 8, and 9 are dark. Panels are square with one-pixel borders. Use no
decorative gradients, stock photography, textures, icon libraries, or generic
drop shadows. The workflow cards may gain `0 8px 24px rgb(2 43 114 / 12%)` on
hover/focus; the modal is the only principal elevated surface.

### Typography

Use this fallback stack without loading a network font:

```css
font-family:
  "Neue Haas Grotesk Display Pro", "Neue Haas Grotesk", "Suisse Int'l",
  "Suisse Intl", Graphik, "ABC Diatype", "Helvetica Neue", Helvetica, Arial,
  sans-serif;
```

- Default weight 400; display headings 500.
- Hero: `clamp(56px, 10.5vw, 150px)`, line-height `.98`, tracking `-.028em`.
- XL heading: `clamp(44px, 7.4vw, 104px)`, line-height `1`, tracking `-.04em`.
- Large heading: `clamp(30px, 4.4vw, 58px)`, line-height `1.04`, tracking `-.032em`.
- Medium heading: `clamp(23px, 2.9vw, 36px)`, line-height `1.12`, tracking `-.025em`.
- Supporting copy: `clamp(15px, 1.35vw, 18.5px)`, line-height `1.55`, max-width `34em`.
- Eyebrows and HUD labels are uppercase, compact, widely tracked, and secondary.
- Apply antialiased text. Buttons inherit the same font stack.

### Motion language

Elements marked for entrance begin at opacity zero and `translateY(26px)`, then
enter with opacity `.7s ease` and transform `.95s var(--ease)`. Stagger delays
are 120, 240, 380, 520, 680, 850, 1050, 1300, 1600, 1900, 2250, 2600, and
3000ms. Diagram strokes may draw over 1.5s using dash offset. Motion is calm,
linear in narrative sequence, and never springy or decorative.

Under reduced motion, set animation and transition durations to `.01ms`, delays
to zero, disable smooth deck scrolling, remove cue animations, and immediately
show the deployment demonstration in its complete landed state.

## Fixed shell

### Header

- Fixed across the top at z-index 20 with `20px 28px` padding.
- Left: a compact Varick brand lockup with a replaceable icon placeholder and
  the text wordmark `Varick Agents`.
- Placeholder icon contract: a local 26 × 26 square, 6px radius, navy fill on
  light sections, light fill on dark sections, and a centered one-color `V`.
  Give it an accessible name of `Varick placeholder icon` and store it as a
  simple local SVG or CSS shape. Do not search for, extract, redraw, or
  approximate the current production icon.
- Keep the icon slot exactly 26 × 26 with a 10px gap before the wordmark so a
  future asset replacement does not reflow or resize the header.
- Use the same placeholder as the document favicon through a local file or data
  URL, and ensure `/favicon.ico` does not produce a failed request when the
  canonical local route is loaded.
- Right: six chapter buttons labeled `Why the role exists`, `What an FDE is`,
  `Audit`, `Evals`, `Deployment`, and `30 Days`.
- Header background remains transparent. Its wrapper ignores pointer events;
  chapter controls restore them.
- When the active section is dark, fixed controls switch to light ink and
  translucent light borders.

At widths up to 960px, chapter labels become six 5px circular dots, using 5px
horizontal button padding. The active dot uses `--blue` on light sections and a
light equivalent on dark sections.

### Pager

- Fixed at right 26px, bottom 24px, z-index 20.
- Two square 38px buttons separated by 8px: `↑` and `↓`.
- One-pixel adaptive border, transparent background, 15px glyph.
- Previous is disabled on section 0.
- The next button handles the final section's extra completion state before it
  becomes disabled.

### Audit/Evals/Deployment rail

Show a compact lower-left rail only for section indices 10–13. Labels are
`Audit`, `Evals`, and `Deployment`. Indices 10–11 activate Audit, index 12 Evals,
and index 13 Deployment. Hide this rail at widths up to 960px.

## Navigation controller

- Maintain an explicit current-section index from 0 through 19.
- An intersection observer rooted in the deck uses thresholds `[0, .6]`; a
  section becomes active at ratio `.6` or above.
- Above 960px, move between section offsets over 450ms using quadratic
  ease-in-out. Retarget an active transition when a new input arrives; never
  queue independent scroll animations.
- A wheel gesture advances exactly one section. Ignore deltas below 10, prevent
  default scrolling, and keep the wheel locked until 360ms after the latest
  momentum event.
- At widths up to 960px, use native scrolling and mandatory snap points without
  wheel interception.
- `ArrowDown`, `PageDown`, and Space advance. Space does not hijack a focused
  button. `ArrowUp` and `PageUp` go backward. Home selects section 0; End selects
  section 19. Ignore input and textarea keystrokes.
- Modal-open state blocks deck wheel and keyboard navigation.

Chapter destinations are 1, 5, 10, 12, 13, and 15. The chapter map for sections
0–19 is:

```js
[-1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 5, 5];
```

## Exact section content and composition

The content below is subordinate to the measured scene contract in
`fieldcraft-fde-measured-scene-contract.md`. When a visual description in this
section conflicts with a measured scene, the measured scene wins. The builder
must implement the declared geometry, alignment, rendered line composition,
visibility, and forbidden alternatives; it may not substitute a composition
that merely contains the same copy.

`fieldcraft-fde-internal-region-contract.json` is equally authoritative for
scenes 1–19 and all five modals. It gives the local bounds for named internal
regions. Each named region must appear as a stable `data-scene-region` element;
all listed collision pairs must have zero intersection area in the declared
state. Do not replace those regions with a visually plausible alternate grid.

### 0 — Hero

- Eyebrow: `VARICK’S GUIDE TO`
- H1: `AI Forward Deployed` / `Engineering`
- Supporting copy: `The blueprint to breaking into FDE in 30 days.`
- Prompt: `SCROLL ↓`
- Light field; center the complete composition with extensive negative space.
- At 1280 × 720, render exactly three centered visual lines: `AI Forward`,
  `Deployed`, and `Engineering`. The H1 uses navy, not body ink. Do not use a
  horizontal transform or letterform distortion to force-fit the heading.
- At 1280 × 720, the H1 content box begins approximately at x 89.6, y 158.8,
  is 1100.8px wide and 395.1px high, and uses the computed 134.4px font size
  with 131.712px line height. Center the eyebrow and supporting copy on the
  same 640px axis.
- At 390 × 844, the hero content box begins approximately at x 23.4, y 344.8,
  is 343.2px wide, and may wrap naturally within that width at the 56px minimum
  hero size.

### 1 — Capability availability

- H2: `Every company can now buy intelligence.`
- Copy: `The same foundational capability is becoming available to anyone able to pay for it.`
- Show one foundational-model node distributing to five company nodes.

### 2 — Moat question

- H2: `If everyone can access it, intelligence alone cannot be the moat.`
- Flatten the previous diagram so the five companies appear equivalently enabled.

### 3 — Deployment answer

- Lead: `So where does the advantage go?`
- H2: `Into deployment.`
- Copy: `The edge is no longer who has intelligence. It is where, how, and why they use it.`
- Retarget the persistent diagram toward a strong `ROI` outcome.

The same fixed, non-interactive stage layer must persist across sections 1–3,
fade over 600ms, and visibly transform rather than remount between sections.

### 4 — The role

- Lead: `Someone has to decide where intelligence belongs.`
- H2: `That person is the forward deployed engineer.` Preserve the non-breaking space.
- Dark field.
- Three connected stages:
  - `BUSINESS REALITY` — `How the work actually happens today — tools, people, exceptions.`
  - `FDE JUDGMENT` — `Where intelligence belongs, and where it does not.`
  - `DEPLOYED AI SYSTEM` — `Working software carrying real responsibility inside the business.`
- Closing: `FDEs are in demand because they control how intelligence enters the business.`

### 5 — Two kinds of judgment

- H2: `The role requires two kinds of judgment that rarely exist in one person.`
- Left: `The commercial world` with `workflows`, `cost`, `incentives`, `risk`, `adoption`, `business value`.
- Right: `The technical world` with `models`, `systems`, `APIs`, `data`, `code`, `reliability`.
- Center node: `FDE`.
- Closing: `The FDE turns business understanding into working software.`

### 6 — Current workflow

- H2: `First, understand how the work is really being done.`
- Copy: `The documented process is rarely the real process.`
- Five square clickable cards linked left-to-right on desktop:
  1. `An email arrives` — `the trigger`
  2. `Copied into a spreadsheet` — `re-keyed by hand`
  3. `Checked in an internal system` — `tribal knowledge`
  4. `Approved in Slack` — `waits on a reply`
  5. `Entered into the ERP` — `40 required fields`
- Each card has its two-digit number and a visible `+` affordance.
- Label: `THE FDE TRACES EVERY STEP`
- Instruction: `Click any step — the “simple” version hides the real work.`

Cards use white, one-pixel borders, square corners, `17px 15px 15px` padding,
9px internal gaps, and 132px minimum height. Hover/focus moves the card up 3px,
darkens its border, and adds the permitted shadow. At 820px or less, cards 1–4
form two columns, card 5 spans both, and connectors disappear.

### 7 — AI-native workflow

- H2: `Then decide how the work should operate when intelligence is built into it.`
- Four ordered stages:
  - `Deterministic software` — `intake · validation · routing`
  - `The agent acts` — `gathers · decides · drafts`
  - `A human approves` — `one clear decision`
  - `Record updated` — `the ERP, without re-keying`
- Exception: `an exception escalates to a person`
- Bottom rail: `EVIDENCE LOG — EVERY STEP RECORDED`
- Closing: `An FDE understands the current workflow, designs the AI-native workflow, and builds the system that connects the two.`

### 8 — Watch one deployment run

- Dark field.
- Label: `ONE RUN · END TO END`
- Incoming document: `invoice_0417.pdf`
- Drop zone: `DROP TO INGEST`
- H2 after ingestion: `Finally, the agent can be deployed over the existing systems.`
- Phases: `INTAKE VALIDATED`, `AGENT DRAFTS`, `HUMAN APPROVES`, `RECORD POSTED`.
- Ordered log:
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
- Final result: `✓ Record posted — every step of the run captured in the evidence log.`

Sequence from section activation: document flies at 1500ms; ingestion lands at
2850ms; phase 1 and 58% progress begin at 3500ms; phase 2 begins at 4400ms;
subsequent agent logs appear at 5100 and 5800ms; phase 3 waits and Approve appears
at 6500ms. On approval, log 7 appears immediately; phase 4 begins at 450ms; final
state lands at 1300ms; advance to section 9 at 2900ms only if the user remains on
section 8. Leaving the section cancels every timer and resets the scene. Re-entry
starts again. Reduced motion shows the landed state immediately.

### 9 — Three parts

- Dark field.
- H2: `The job has three parts.`
- Chain: `Audit` → `Evals` → `Deployment`.
- Descriptions: `identifies the right problem and maps reality.`, `prove the system behaves correctly.`, `makes it work inside the business.`
- Closing: `Each stage earns the right to the next.`

### 10 — Audit

- H2: `Audit: Find the workflow worth rebuilding.`
- Copy: `The audit determines what should be automated before anyone begins building.`
- Flow:
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

### 11 — Automation decision

- H2: `Decide what should be automated — and what should not.`
- Root: `a step in the audited workflow`
- Outcomes:
  - `DETERMINISTIC SOFTWARE` — `When the rules and inputs are predictable.`
  - `AN AGENT` — `When the objective is clear but the inputs, path, or required actions vary.`
  - `A HUMAN IN CONTROL` — `When the decision carries material ambiguity, accountability, or irreversible consequences.`
- Closing: `Prioritize lengthy, high-volume workflows where the improvement is large enough to matter.`

### 12 — Evals

- H2: `Evals: Turn non-determinism into evidence.`
- Table label: `THE EVALUATION CASES`
- Columns: `RIGHT DATA`, `REQUIRED STEPS`, `MATCHES EXPERT`, `SAFE TO ACT`

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
- Failure categories: `missing data` = 5; `wrong record pulled` = 4.
- Rules:
  - `CONFIDENCE` — `below 0.80, the system must escalate`
  - `ESCALATION` — `high-risk actions always reach a person`
  - `READINESS` — `pilot — with human review on every action`

### 13 — Deployment

- H2: `Deployment: Make it work inside the business.`
- Inputs: `existing data`, `internal APIs`, `identity & permissions`.
- Controlled environment: `SANDBOX`, `human review`, `logs`, `alerts`, `rollback`.
- Output: `production users`.
- Labels: `THE SYSTEM`, `PROTOTYPE`, `IN PRODUCTION`.
- Principles:
  1. `Integrate with what already exists` — `Build over the current data and systems rather than beginning with a large replacement project.`
  2. `Test inside a controlled environment` — `Use a sandbox within the company’s infrastructure to run, inspect, and debug safely.`
  3. `Increase autonomy gradually` — `Begin with the smallest useful action and grant more authority only after the system proves reliable.`
- Closing: `Deployment is where software begins carrying operational responsibility.`

### 14 — Continuous loop

- Loop: `Audit → Build → Evals → Deploy → Observe → Improve`
- Label: `THE LOOP RUNS AGAIN`
- H2: `An FDE owns the path from messy workflow to trusted production system.`
- Prompt: `THE 30-DAY PLAN ↓`

Sections 10–14 must look like working artifacts rather than marketing cards:
thin-line workflow traces, decision branches, an evaluation report, deployment
architecture, and a feedback loop. Keep them square, diagrammatic, and
monochromatic blue/white; never invent app chrome.

### 15 — Roadmap introduction

- Label: `THE 30-DAY ROADMAP`
- H2: `How to become an FDE in 30 days.`
- Copy: `Most successful FDE candidates come from consulting, product management, or software engineering.`
- Instruction: `COMPLETE THIS ROADMAP IN PARALLEL WITH APPLYING AND INTERVIEWING`
- Note: `CONSULTANTS AND PMS — CHOOSE TWO PROJECTS AND TAKE THEM DEEP`
- Choices: `Production-ready AI agent`, `RAG pipeline`, `Eval framework`, `MCP integration`.

### 16 — Week 1

- Label: `WEEK 1 · DAYS 1–7`
- H2: `Week 1: Build an agent that can complete a real loop.`
- Copy: `By Day 7, the agent should complete one useful workflow and expose every step it takes.`
- Days 1–7:
  1. `Agent loop` — `prompt → model → response → next step, until the task completes or a max-step limit hits`
  2. `Tool use` — `one API call + one web search — the agent decides when to call them`
  3. `Guardrails` — `input validation · max-step limit · output filtering`
  4. `Context & memory` — `context window by default; external memory only when state must outlive the run`
  5. `Audit trail` — `log every prompt, response, tool call, result, error, and timestamp`
  6. `Human approval` — `pause before a consequential action; resume only after an explicit decision`
  7. `Checkpoint` — `a working agent with tools, guardrails, memory, approval, and a complete trace`

### 17 — Week 2

- Label: `WEEK 2 · DAYS 8–14`
- H2: `Week 2: Turn the demo into a system that can recover.`
- Copy: `By Day 14, the agent should produce predictable outputs and resume after failure.`

### 18 — Week 3

- Label: `WEEK 3 · DAYS 15–21`
- H2: `Week 3: Make the system measurable and economically viable.`
- Copy: `By Day 21, you should know how the system fails, how much it costs, and whether it is improving.`

### 19 — Week 4 and close

- Label: `FINAL WEEK · DAYS 22–30`
- H2: `Final week: Defend the system like an FDE.`
- Copy: `By Day 30, you should be able to explain the system to both an engineer and a non-technical executive.`
- Closing statement: `Do the job before you have the title.`
- Closing: `On Day 30, you should not merely understand forward deployed engineering. You should have evidence that you can do it.`
- Milestones: `DAY 7 — Working agent`, `DAY 14 — Recoverable system`, `DAY 21 — Evaluated system`, `DAY 30 — Complete FDE case study`.
- Initial state shows the fourth week in focus while weeks 1–3 are complete.
- A further forward action stays on section 19, zooms out to the complete month,
  marks all weeks complete, and disables Next.
- A backward action first restores the fourth-week focus; a second moves to
  section 18.

## Calendar behavior

At desktop widths, use one fixed, non-interactive calendar layer behind sections
15–19. It has four week columns titled:

1. `DAYS 1–7` — `Build the agent`
2. `DAYS 8–14` — `Make it production-ready`
3. `DAYS 15–21` — `Measure and optimize`
4. `DAYS 22–30` — `Communicate and defend`

The calendar appears as the full month on section 15, then transforms to focus
weeks 1, 2, 3, and 4 on sections 16–19. It scales at `.26`, `.225` below 1340px,
and `.19` below 1080px. Hide it at 960px or less and place required roadmap
content inside the sections instead. Do not replace the final complete-month
state with an overlay card.

Use this exact day content:

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

Complete-month content:

- Main result: `A COMPLETE FDE CASE STUDY`.
- Evidence: `20 cases → agent runs → pass / fail evidence → failure categories → cost per run`.
- System heading: `THE SYSTEM — EVERY WEEK ADDS CAPABILITY TO THE SAME BUILD`.
- Portfolio heading: `THE PORTFOLIO — WHAT YOU LEAVE WITH`.
- Capability list: agent loop; two tools; guardrails; deliberate memory; audit
  trail; structured outputs; schema validation; checkpointed state; resume after
  failure; explicit failure paths; retries + backoff; failure taxonomy; golden
  dataset; eval suite; cost per query; workflow audit; system architecture;
  evaluation report; deployment controls; business case.

## Workflow modal

Clicking any workflow card opens one shared centered modal with a dim backdrop,
square elevated panel, tag, title, punch line, bullet list, explanatory closing,
and Close button. Focus Close on open. Escape and Close dismiss it and restore
focus to the invoking card. The backdrop does not dismiss it. Prevent deck
navigation while open.

Use the exact modal content below.

### Modal 1

- Tag: `Step 01 · The trigger`
- Title: `“An email arrives”`
- Punch: `Sounds like a clean trigger. It’s a swamp.`
- Points:
  - `It arrives from 40+ senders and no two are formatted alike — data in the body, in a PDF, in a screenshot, or buried in a forwarded thread six replies deep.`
  - `Half of them are exceptions in disguise: “same as last time,” “ignore the second attachment,” “Sarah already signed off on this one.”`
  - `There’s no consistent subject line, so the routing logic — what’s urgent, what’s a duplicate, what to drop — lives entirely in one person’s head.`
- Why this is a person, not a script: `Before a line of code gets written, someone has to sit next to the person who reads these all day and learn the 30 unwritten rules for what actually counts. That discovery IS the job.`

### Modal 2

- Tag: `Step 02 · Re-keyed by hand`
- Title: `“Copied into a spreadsheet”`
- Punch: `Which spreadsheet? There are four.`
- Points:
  - `One is the “real” one, two are stale, and one is a personal copy on someone’s desktop that quietly disagrees with the rest.`
  - `Columns drift — a field someone added in March silently broke three downstream formulas that nobody owns anymore.`
  - `It’s re-keyed by hand, so a typo doesn’t throw an error — it just becomes the new source of truth.`
  - `“Data validation” is a shared belief, not a rule the file actually enforces.`
- Why this is a person, not a script: `The spreadsheet is a database, a workflow engine, and an audit log all wearing a grid costume. You have to reverse-engineer all three before you can safely replace any of them.`

### Modal 3

- Tag: `Step 03 · Tribal knowledge`
- Title: `“Checked in an internal system”`
- Punch: `The system that has no API.`
- Points:
  - `Login is behind a VPN, the UI hasn’t changed since 2009, and there is no export button.`
  - `The field labeled “Status” means five different things depending on who set it and when.`
  - `The real check is tribal: “you just have to know that region 4 always needs a second look.”`
  - `The one person who understands the edge cases is retiring in eight months.`
- Why this is a person, not a script: `The knowledge isn’t in the system — it’s in the operator. An FDE’s job is to capture it into something durable before it walks out the door for good.`

### Modal 4

- Tag: `Step 04 · Waits on a reply`
- Title: `“Approved in Slack”`
- Punch: `An approval with no paper trail.`
- Points:
  - `“Approval” might be a 👍 in a DM, an “lgtm” in a thread, or a verbal yes in a huddle — sometimes all three, sometimes none.`
  - `The approver is out half the time, and the escalation rule (“ping Dave if it’s over $50k”) is unwritten and inconsistently followed.`
  - `There’s no record of who approved what, when, or on what basis — until an auditor asks, and then it’s a very bad week.`
- Why this is a person, not a script: `Turning a thumbs-up into an auditable control — who, what, when, on what evidence — is most of what risk and compliance teams actually care about. That’s not a Slack bot; that’s design.`

### Modal 5

- Tag: `Step 05 · Where automation goes to die`
- Title: `“Entered into the ERP”`
- Punch: `Forty required fields and a prayer.`
- Points:
  - `The ERP demands ~40 fields. The email gave you six. The other 34 come from memory, lookup tables, and “just leave it blank, it usually works.”`
  - `The mapping rules are undocumented, and some values need transformation that nobody ever wrote down.`
  - `Errors don’t surface now — they show up days later in a reconciliation report someone reads on Fridays. Maybe.`
- Why this is a person, not a script: `The last step is where “simple automation” quietly falls apart. Getting it right means modeling every rule the ERP silently assumes — the ones no one can even tell you until it breaks.`

## Responsive contract

- Breakpoints: 1340, 1080, 960, and 820px; compact-height breakpoint 720px.
- At 960px or less: chapter dots, no calendar layer, no lower-left rail,
  one-column audit/eval/run layouts, wrapped artifact rows, stacked roadmap
  footer, native snap scrolling, fixed header, and fixed pager.
- At 820px or less: two-column workflow-card grid with fifth card full width;
  no connecting arrows.
- At 390 × 844: header is 66px high; horizontal padding is 23.4px; hero content
  width is 343.2px; chapter dots occupy an approximately 110px region at the
  upper right; pager remains reachable near the lower right.
- At 360 × 800, 390 × 844, 820 × 1180, 1280 × 720, and 1440 × 900: no document
  horizontal overflow, clipped primary heading, unreachable content, or hidden
  focus target.

## Accessibility and metadata

- `<html lang="en">`.
- UTF-8 charset and `width=device-width,initial-scale=1` viewport.
- Title: `Varick — Forward Deployed Engineering`.
- Local placeholder favicon loads successfully with no remote dependency or
  automatic `/favicon.ico` 404.
- Two-pixel `--blue` focus outline with 3px offset and 2px radius.
- Every diagram has a concise accessible label describing its information.
- Modal uses dialog semantics and an accessible name.
- Preserve the source-faithful compact pager and chapter targets for this blind
  exercise, but record them as known sub-44px accessibility deviations.

## Implementation and proof sequence

1. Verify the repository execution contract and preserve unrelated work.
2. Build the shell and first three sections through the canonical dev command.
3. Prove the intended route renders before completing the remaining content.
4. Implement all 20 sections and exact supplied copy.
5. Implement navigation, persistent stage, modal, deployment run, and calendar.
6. Validate responsive modes, reduced motion, focus, resets, rapid input, and
   final two-state navigation.
7. Build through the canonical repository command.
8. Produce a candidate-bound report with exact commands and outcomes.

The builder must not perform reference comparison. An independent evaluator may
compare the candidate with withheld reference evidence after delivery.

## Builder acceptance matrix

- [ ] The canonical repository route renders the candidate.
- [ ] Exactly 20 sections exist in the required order.
- [ ] Every supplied line of exact copy appears without extra placeholder,
      debug, documentation, loading, or host-interstitial text.
- [ ] Fixed header, chapter navigation, pager, conditional rail, persistent
      stage, modal, deployment run, and calendar states work.
- [ ] Pointer, keyboard, wheel, native-scroll, focus, reset, cancellation,
      re-entry, rapid-input, and reduced-motion behaviors pass.
- [ ] Final section preserves its two distinct states and backward behavior.
- [ ] Semantic inventory and metadata pass as completeness diagnostics.
- [ ] Every scene passes the measured geometry, computed typography, rendered
      line-box, clipping, and fixed-shell-clearance contract.
- [ ] Every declared collision pair has zero intersection area, and every
      hidden state layer is visually hidden, non-focusable, and non-hit-testable.
- [ ] Every required modal, deployment, roadmap, chapter, pager, reset,
      re-entry, and reduced-motion state has a candidate-bound state record.
- [ ] The evaluator-owned screenshot matrix produces candidate, diff, mismatch,
      and verdict artifacts for every admitted reference scene. Missing reference
      images block visual parity rather than passing it.
- [ ] No uncaught errors, site-authored console warnings, failed required
      requests, duplicate timers, leaked observers, or horizontal overflow occur.
- [ ] The declared viewports pass their responsive requirements.
- [ ] The candidate uses no hidden reference, historical URL, copied source,
      screenshot, or prior implementation.
- [ ] The brand icon is the declared placeholder, uses no remote asset, and can
      be replaced without changing header geometry.
- [ ] The report names every design choice made where this brief deliberately
      leaves visual detail open.

## Stop condition

Stop when the requested delivery mode is achieved, every builder acceptance
criterion passes, and the exact candidate artifact and commands are recorded.
Do not claim pixel identity or source identity: the blind builder cannot prove
those claims without seeing the withheld oracle. The correct builder claim is:

> Implemented and locally verified from the blind-build brief without access to
> the source or rendered reference; independent visual evaluation remains.
