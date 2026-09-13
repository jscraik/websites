# Browser review handoff

## Remaining finite verification queue

Latest aggregate after explicit post-Back animation readiness: command
`node node_modules/@playwright/test/cli.js test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/e2e tests/a11y`
-> pass (154 passed, 12 scoped skips, zero failures, 1.3m). Retained result:
`portfolio-font-trial.4N9oEp/aggregate-animation-ready-results.json`.
This supersedes the failed aggregate as current test status without erasing it.
The accepted site artifact remains `7fd6a76b…`; only test synchronization changed.
The old CDP lifecycle timeout's internal cause is not proven, but explicit
observable animation readiness now passes both the repeated and full-suite paths.

Post-Back bounded comparison now completed: command
`node .playwright-tmp/compare-back-lifecycle.mjs` -> pass for execution. Both
script-enabled and disabled desktop contexts were complete, visible and focused;
the CTA moved from about y540 to y533 as finite entrance animations completed,
then normal clicks navigated to the demo. This does not reproduce the full-suite
timeout by itself. Raw samples: `portfolio-font-trial.4N9oEp/back-lifecycle-comparison.json`.

The no-script test now polls for running animations on the CTA's ancestors to
finish after Back, then retains normal click actionability and destination
assertions. No force click, CSS override, sleep or increased timeout is used.
Command: `node node_modules/@playwright/test/cli.js test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/e2e/no-script-navigation.spec.ts --repeat-each=3`
-> pass (six cases). Result: `portfolio-font-trial.4N9oEp/nojs-animation-ready-results.json`.
This proves repeated isolated behavior with the explicit readiness condition;
the full aggregate is a separate required check before claiming the discrepancy
resolved. No site source or artifact changed.

Post-Back diagnosis: the first scratch sample lost its execution context during
navigation; a second page-side timer/frame probe stalled and was interrupted
(exit 130), not counted as a valid measurement. A scratch-only `DOMContentLoaded`
wait after Back was tested in both projects: both failed at that wait after
30 seconds, with `networkidle` reported. Result preserved in
`portfolio-font-trial.4N9oEp/nojs-domcontentloaded-trial-results.json`. The trial
wait was removed; production source and normal click assertions are unchanged.
This rejects the proposed load-wait fix. It suggests a CDP/Back lifecycle issue
but does not prove browser scheduling, bfcache, or a site defect. The next useful
comparison must sample synchronous post-Back state with an externally bounded
timeout and distinguish script-enabled/disabled contexts; do not repeat these
unchanged waits or use page-side timer completion as evidence in the failing state.

Latest combined run (September 8): source validation passes and `diff -qr dist
.playwright-tmp/portfolio-font-trial.4N9oEp/site` reports identical output. All
11 adapted spec files match source except the fixture import. Command
`node node_modules/@playwright/test/cli.js test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/e2e tests/a11y`
-> fail: 152 passed, 12 scoped skips, two failures. Both failures are the new
no-script navigation case after About → Back: the CTA resolves and is visible,
but click waits for stability and reaches the 30-second test timeout. This
contradicts repeatable full-suite success, not the earlier isolated two-pass
record. Preserve both. Report:
`.playwright-tmp/portfolio-font-trial.4N9oEp/aggregate-september8-results.json`.
Next diagnosis: capture post-Back visibility, focus, animation and frame progress
in the failing sequence before considering either a product or test fix. Do not
force the click or increase timeouts as a substitute for that diagnosis.

September 8 native-zoom targeting check: `cua.getApp('com.google.Chrome')`
successfully returned native controls, but targeted the regular authenticated
Chrome instance rather than the disposable test profile. No UI action was taken
on that window and no personal contents are retained in this ledger. The former
app-control timeout is no longer the observed blocker; reliably selecting the
disposable native window is. Native 200% zoom remains unverified. Do not test it
in an authenticated profile or report CDP viewport scaling as equivalent.

September 8 restart: Jamie explicitly requested restarting the browser. A fresh
disposable Chrome profile `/private/tmp/portfolio-cdp.UVtC9s` now exposes approved
CDP port 9223 (version endpoint verified once). No authenticated profile or
`--no-sandbox` flag was used. The retained artifact server is restored at 4340;
archive SHA-256 remains `7fd6a76b71db097326e835e15df2706757ae5ec36cabc4b6b468a0b5ff7a1ee8`.

Previously blocked no-script navigation is now executed: command
`node node_modules/@playwright/test/cli.js test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/e2e/no-script-navigation.spec.ts`
-> pass (desktop and mobile, two cases). This proves Home/About/Back, primary
demo CTA, and the SkillsBar case-study/demo links work with JavaScript disabled.
Result: `.playwright-tmp/portfolio-font-trial.4N9oEp/no-script-navigation-results.json`.
It does not prove interactive demo scenario changes without scripts or bfcache
restoration. The historical runtime blocker below is superseded by this restart.

September 8 runtime recheck: approved CDP endpoint `127.0.0.1:9223` and artifact
server `127.0.0.1:4340` both refused connections (bounded curl checks, exit 7).
They are no longer live; earlier browser results remain historical, not a current
running preview. No new browser was launched or policy bypass attempted.

New focused source contract `tests/e2e/no-script-navigation.spec.ts` covers
Home → About → Back, the primary safe-data demo CTA, and the SkillsBar case-study
link to its demo with JavaScript disabled. It preserves the actual primary CTA
destination `/demos/skillsbar/`. Command:
`npm run test:e2e -- --list --grep 'navigation without JavaScript'` -> pass
(two tests collected, not executed). `git diff --check` -> pass.
Browser execution is blocked until the runtime owner restores the approved
disposable CDP and immutable-artifact endpoints. C08 is not promoted to pass.

### C03 typography evidence audit

Final verdict (2026-09-07): DATA actually inspected all 20 current Home frames
and all 16 current Proof frames indexed below, accepting the remaining bounded
text coverage with no findings. All five project cards and both proof-note cards
show readable labels, titles, descriptions, evidence, caveats and next-state
copy; partial neighboring rail cards are intentional, not active-card clipping.
Together with reconciled About/Blog/Contact and prior article/project/demo views,
this closes the finite typography screenshot audit. C03 remains partial solely
for actual native 200% zoom. The gap inventory below is historical and resolved;
do not recapture these regions without a relevant change.

Review progress: DATA has now independently accepted the retained About intro
320px frames 0–2 and desktop intro frames 0–1, and confirmed the relevant
body/CSS equivalence. DATA also accepted the four retained Blog list/author
views after independently verifying body/route-CSS equivalence and unrelated
global-rule additions. It then reviewed all four new production
`blog-author-320-{0,1,2,3}.png` frames, accepting the complete mobile author
continuation with no typography finding. Contact's earlier full review is
confirmed below. These three routes no longer need typography recapture.

Command: `node .playwright-tmp/capture-blog-continuation.mjs` -> pass (four
ordinary 320px author views). Command:
`node .playwright-tmp/capture-remaining-type.mjs` -> pass (36 ordinary 320/1440px
Home lower-work/Writing and Proof intro/card views). The latter inventory is
`.playwright-tmp/portfolio-font-trial.4N9oEp/type-review-manifest.json`;
independent review is now accepted as recorded above. Both captures use retained
production 4340, fonts ready and reduced motion; they do not prove native zoom.
The typography skill guided checking complete text rather than broad redesign.

The portfolio brief requires responsive, accessible presentation; it does not
require every possible viewport. The accepted 320/1440px article, project, CLI
and demo frame inventories already cover those routes' headings, body copy,
labels and continuation text. Project-heading and illustration repairs provide
the subsequent delta evidence. Do not repeat those complete route reviews.

The following are gaps in the recorded independent core-route review, not newly
observed defects. Resolve them with existing candidate-bound captures first;
only capture a missing ordinary viewport region when necessary:

- Home at 320/1440: lower supporting-work and Writing text; featured cards and
  accepted desktop/tablet first-fold views already have explicit review.
- About at 320/1440: only exact intro-view inventory reconciliation remains.
  DATA recovered prior acceptance of intro continuation at 768px and intro
  frames at 922px, all desktop Fun Facts/On the web frames at 1440px, mobile
  Fun Facts/On the web, and Skills/History. The later `BULtgi` hidden-description
  repair has accepted desktop 1440px and representative 320px frames. Do not
  repeat these regions; check whether the existing 320/1440 intro frames add
  an uncovered text state before requesting review.
- Blog at 320/1440: article-list and author-copy continuation not covered by the
  explicitly accepted 393px transition and 1440px masthead.
- Contact at 320/1440: resolved ledger omission, not missing review. DATA
  confirmed its prior independent acceptance of `f4f4626e…`, including
  `portfolio-review.fXFK4i/contact-320-{0,1,2}.png` and
  `contact-1440-{0,1}.png`, all with no findings. Its review also checked
  320/393/768/1440 geometry/axe results and actual Tab targets. Retain this
  attribution and do not recapture or refine Contact for this audit.
- Proof at 320/1440: text of rows outside the accepted endpoint/CLI-ring views;
  label contrast and outline geometry are already covered.

This is a finite review-ledger gap list requiring confirmation against the
reviewer's accepted records. It is not a demand for exhaustive viewport testing,
nor proof that every listed region was genuinely unseen. The list is now
reconciled. Native 200% zoom stays a separate unexecuted check.

Final artifact reconciliation (2026-09-07): comparison of retained preview
`portfolio-review.lg0dpt/site` (`ff4c0802…`) with production
`portfolio-font-trial.4N9oEp/site` (`7fd6a76b…`) proves all 13 HTML bodies
byte-identical and 57 non-HTML files byte-identical, including CSS, JS, fonts,
and images. Robots and sitemap differ for intentional preview indexing policy;
HTML head differences are the indexing directive and measured Mono preload.
The independently accepted settled views on the preview therefore carry forward
across this final delta, including the latest Proof outline repair. This is
artifact-equivalence evidence, not fresh screenshot review, loading-transient
equivalence, exhaustive viewport coverage, or Jose-reference parity.

Concrete execution queue: fourteen Lighthouse preset findings (six CSS coverage, six
dependency-tree, two portrait compression), native 200% zoom, assistive-technology
operation, and public-safe CV approval. No inventoried motion state, production
aggregate, no-JS refresh, basic-metadata refresh, or final-artifact visual delta
remains unexecuted. Earlier queue paragraphs below are historical and superseded
by the completed receipts above; they do not create new acceptance requirements.

Acceptance limits remain visible in the partial board entries: C02 does not
claim Jose parity or exhaustive viewport review; C03 has completed the bounded
typography review but retains unproven native 200% zoom; C04 does not claim
exhaustive device coverage; C08 does not claim
no-JS interactions or persisted bfcache restoration; D02 does not claim every
outline pixel. These are not completed checks. The concrete queue above is not
a declaration that all broader acceptance conditions are met or waived.

Current production no-JavaScript/metadata refresh also passed: command
`node .playwright-tmp/check-production-nojs.mjs` -> pass (all 13 routes at 393
and 1440 pixels). Each case asserts HTTP 200, one nonempty H1, one main landmark,
meaningful main content, nonempty title/description, HTTPS canonical with matching
route, and no horizontal document overflow. Results are candidate-bound in
`.playwright-tmp/portfolio-font-trial.4N9oEp/nojs-metadata-results.json`.
This does not check interactive behavior with scripts disabled or social-preview
rendering. `npm run validate:source` passed again after the new motion test file.
The repeated source build is byte-equivalent to retained production (`diff -qr`).

Update 2026-09-07: the production font consumer contract now requires exactly
Geist, Geist Mono, and Newsreader; the preceding two failures were obsolete
two-font expectations, not loading regressions. The focused editorial contract
passed both projects. The production aggregate then passed 150 tests with ten
scoped skips and zero failures, preserved in
`.playwright-tmp/portfolio-font-trial.4N9oEp/aggregate-after-font-contract-results.json`.
The separate new motion contracts passed both desktop cases (two mobile skips),
preserved alongside it as `motion-resync-results.json`. They exercise dispatched
pointer cancellation and real viewport resize against production; they do not
prove native hardware cancellation. The paragraph below is the preceding queue;
its two motion states and production aggregate are now covered.

Commands from repository root:

- `node node_modules/@playwright/test/cli.js test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/e2e/interface-contracts.spec.ts --grep 'editorial'` -> pass (2).
- `node node_modules/@playwright/test/cli.js test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/e2e tests/a11y` -> pass (150, 10 scoped skips).
- `node node_modules/@playwright/test/cli.js test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/e2e/motion-resync-contract.spec.ts` -> pass (2, 2 fine-pointer mobile skips).
- `npm run validate:source` -> pass (including 13 route smoke and HTML checks).

All browser runs above use the existing approved CDP endpoint and retained
production artifact `7fd6a76b…` at port 4340, with the previously disclosed
button instrumentation. The initial broad grep collected an unrelated screenshot
adapter with a missing import; the scoped retry without network permission was
blocked by EPERM. Neither reached product assertions. Network-enabled scoped
runs passed. These remain distinct from the preserved pre-fix aggregate.

Source event-handler inventory identifies two bounded motion states not explicitly
asserted by the current focused tests: work-thumbnail `pointercancel` cleanup,
and navigation highlight resynchronization on resize while a target is hovered.
Existing tests already cover pointer enter/move/leave, button pagehide and pointer
capability loss, reduced-motion changes, nav gaps/click/focus, demo scenarios and
clipboard denial, and pullquote copying. Do not repeat accepted visual frames
under a blanket “complete motion” label.

Feasible local checks remaining: verify those two states; run the final aggregate
against retained production `7fd6a76b…` (the 150-pass aggregate predates its
preload); reconcile current production no-JS and route/metadata coverage without
repeating unchanged visual review. Full Lighthouse preset remains non-green:
six CSS-coverage, six dependency-tree, and two portrait-compression assertions.
Each needs an evidence-backed disposition, not an unchanged retry.

Capability/user-dependent gates: actual 200% native zoom (app-control timeout),
screen-reader operation (no working assistive-technology route yet established),
and public-safe CV wording/privacy approval. Emulated touch in both motion modes
is now verified separately and does not remain a missing-state placeholder.

## Portrait source inspection

The two image-delivery findings concern one 640×640 WebP, 71610 bytes, shared by
About and Blog. The audit requests stronger compression, not different rendered
dimensions. Its source is `src/brand/source/jamie-profile.png` (1254×1254), SHA-256
`daf30bfa63cab49c77f109da04089ccd74c0f4c574cccea67fd2d27579f250bc`, matching
the social-source receipt. The current WebP hash is
`9b8c36c96d62435d5a4da1adb5d0efc8c70f229d7b2dad209925f612a5477d26`.

The existing social generator emits PNG screenshots; it does not own the
website WebP derivatives or document an encoder quality setting. Git history
shows the WebP was introduced in `f088a654…` at the same 71610-byte size, before
this portfolio task. No portrait mutation or unrelated social regeneration was
performed. A smaller file is not automatically a quality-preserving replacement:
any future deterministic re-encoding candidate must preserve identity, framing,
dimensions, and source provenance, then undergo visual comparison before use.
The current evidence does not justify blind recompression or image redesign;
the two preset findings remain explicitly open.

The subsequent same-command touch run covers both `reduce` and `no-preference`
at 320/393px: pass, four combinations. It additionally requires the visible
SkillsBar case-study heading after CTA arrival. Each combination records two
touch pointer events, successful destinations/Back/home-heading checks, no
active pointer-state button, and contained document width. The new report is
`portfolio-font-trial.4N9oEp/touch-motion-results.json`; the reduced-only report
is preserved separately. This extends bounded emulated-touch coverage to normal
motion, without claiming all dynamic states, physical devices, or bfcache.

## Current production emulated-touch navigation

Command: `node .playwright-tmp/check-production-touch.mjs` -> pass on retained
production `7fd6a76b…` at 4340, 320/393px. Each mobile/touch context dispatched
two pointer events whose type was `touch`, tapped About and the SkillsBar CTA,
then used history Back. Both returns verified the visible Jamie homepage heading;
the first return was followed by successful CTA activation. Fine-pointer media
was false, active animated-button count was zero, and document width matched
the viewport. Raw report: `portfolio-font-trial.4N9oEp/touch-results.json`.

Two earlier observer attempts failed: first `goBack` waited for `load` despite
reporting homepage navigation; then `goBack(commit)` returned but `waitForURL`
still waited for its default load state. The final check uses commit waits plus
visible heading/working interaction assertions. These failures are retained here
as lifecycle-observer limitations, not suppressed product failures. No
`pageshow.persisted` evidence was collected, so bfcache is not claimed. Scope is
browser-emulated touch with reduced motion, not physical-device or normal-motion
touch proof.

The ten aggregate skips have passed counterparts in the other project: mobile
article stacking skips desktop; three animated-button hover/reduced-motion tests,
four nav-highlight pointer tests, and two work-card pointer tests skip mobile
because they require a fine pointer. They are not ten wholly untested behaviors.

## Measured Geist Mono preload comparison

One additional preload was compared against a matching production baseline
including the accepted Proof-outline fix. Baseline archive
`.playwright-tmp/portfolio-font-baseline.dh9aPe/site.tar.gz` has SHA-256
`fe758f3ec59e75773217eba50ee9586fa6b78c11786d91d777dbd06e4398e458`;
trial `.playwright-tmp/portfolio-font-trial.4N9oEp/site.tar.gz` has SHA-256
`7fd6a76b71db097326e835e15df2706757ae5ec36cabc4b6b468a0b5ff7a1ee8`.
Byte comparison verified only the added preload tag differs across the 13 HTML
pages; assets and other files match. Both use config-free compressed Vite preview,
ports 4341 and 4340 respectively.

Command: `node .playwright-tmp/compare-font-lighthouse.mjs` -> pass for completing
12 reports, not for the preset: both variants retain 14 error-level assertions.
The six routes ran baseline then trial with fresh isolated contexts, default
Lighthouse settings, and unchanged assertions. Trial simulated FCP improved
about 380–452ms across all six; LCP differences ranged from -3.19 to +0.66ms.
Homepage observed mono-font request start changed from 45.44ms to 5.594ms and
completion from 46.499ms to 7.706ms with identical 71916-byte transfer size.
The one-line preload is retained for measured discovery/FCP benefit, with no
typography or font-byte change. This single paired run is not a reliability
benchmark or proof that the remaining dependency-tree assertions pass.
All six trial reports show the mono request starting alongside the other two
preloaded fonts instead of waiting for CSS discovery. Absolute request timings
vary: Blog/Proof's other fonts finished about 7–12ms later in the trial, while
their simulated LCP remained essentially unchanged. No field-level or universal
no-regression claim is made from one pair. Command: `npm run validate:source`
-> pass after retaining the preload (23:41 September 6), including 13-route
smoke and HTML checks.
Raw `lighthouse-0.json` through `lighthouse-5.json` and assertion arrays remain
in each artifact directory. The performance skill guided critical-font discovery
measurement rather than deletion based on unused-CSS coverage.

## Bounded performance investigation

`BaseLayout.astro` imports global, shell, and route-rhythm CSS and preloads Geist
and Newsreader only. Geist Mono has `font-display: swap` but is discovered through
the stylesheet. The compressed homepage report records HTML → shared CSS →
Geist Mono, ending at 42ms. A read-only browser inspection at 393×852 found
visible Geist Mono navigation text on all six configured Lighthouse routes.
The smallest justified experiment is one additional preload, comparing request
timing and LCP before retaining it; no preload or typography change has yet been
made. Unused-per-page CSS is not evidence of global unreachability, so a broad
deletion is not justified by the current report.

Remaining browser-capable work: bounded font comparison, other preset findings,
current production-artifact checks, and final evidence reconciliation. Actual
200% native zoom remains blocked by native app-control timeout; do not substitute
CSS zoom or viewport resizing. Screen-reader operation needs a usable assistive
technology route; AX snapshots and axe scans do not prove it. The public-safe CV
requires wording/privacy approval. These capability/approval limits do not
prevent independent local browser work.

## Current candidate aggregate

Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y tests/e2e`
-> pass: 150 passed, ten existing device-conditional skips, zero failures on
`ff4c0802…` at port 4339. All nine copied test files matched their source except
the fixture import, and the archive hash was unchanged. The scratch adapter's
native animation observation remains enabled, so this is an instrumented
CDP-adapted aggregate, not the standard browser-launch command. The raw report
is `lg0dpt/aggregate-instrumented-results.json`. Earlier uninstrumented failure
and instrumented passes remain separately preserved; the earlier animation-start
failure is not retrospectively explained by this pass.

## Latest candidate: Proof focus-outline repair

Preview archive `.playwright-tmp/portfolio-review.lg0dpt/site.tar.gz`, SHA-256
`ff4c08022b729d2edd1f74d642f26eb2301eb5168ad81d6850f7be86157b1cf0`,
is read-only and served on port 4339. A Proof-scoped `outline-offset: -4px`
keeps the existing 2px focus outline inside the card, preserving card geometry,
row spacing, color, and keyboard order. The touch-and-accessibility skill's
visible-focus requirement guided this bounded repair.

The new test requires nonempty rows/cards, visible focus, at least 2px outline,
and full computed outline bounds inside the scrolling region for first/last
linked cards at 320/393/768/1440px. It reproduced the old defect in both
projects; `iQ5QJV/proof-outline-before.json` preserves those failures.
Command: `npm run validate:source` -> pass (23:26 September 6).
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass (production restored).
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y/polish.spec.ts --grep 'Proof endpoint focus outlines|Proof cards fit|interactive focus rings'`
-> pass, six cases. `proof-outline-results.json` preserves the result.
Command: `node .playwright-tmp/check-proof-cli.mjs` -> pass, real Tab navigation
to the CLI card at 320/1440px, retained focus and text containment. The fresh
captures show the complete inset ring; independent DATA review verified the
archive and six-pass report and viewed both captures, accepting the complete
top/side/bottom ring with unchanged typography and layout. This closes the
identified Proof-card clipping defect only.
Programmatic endpoint focusing in the regression is not full keyboard traversal
proof. Prior Lighthouse and full aggregates remain bound to earlier artifacts.

## Compressed production transport comparison

The installed Astro preview uses Vite's preview server, which includes response
compression. A config-free Vite preview now serves the same read-only production
artifact `a6db44a7…` on port 4338. No source build or global config is executed
by this server. A compressed GET returned HTTP 200 and `Content-Encoding: gzip`;
the decoded HTML matched the immutable homepage byte-for-byte.

Command: `node .playwright-tmp/serve-production-vite.mjs` -> running on 4338.
Command: `node .playwright-tmp/audit-production-lighthouse.mjs` -> fail: six
completed reports, 14 original-preset errors. The runner's port/output directory
were changed for this comparison; no assertion, default Lighthouse setting,
route, or source artifact changed. Results are retained under
`.playwright-tmp/portfolio-production.KFPftI/vite-lighthouse/` separately from
the uncompressed reports. Performance scores: 0.93, 0.90, 0.91, 0.93, 0.93,
0.93; all other category scores remain 1.00. All 12 compression/document-latency
failures disappeared. Remaining errors: six dependency-tree, six unused-CSS,
and two image-delivery findings. This proves a local transport effect, not
Cloudflare deployment behavior or a passing complete preset.

## Proof card copy and focus boundary

Command: `node .playwright-tmp/check-proof-cli.mjs` -> pass: keyboard Tab reaches
the updated CLI card at 320/1440px, focus remains on the card, card bounds fit
the row, and text ranges fit the card. `proof-cli-results.json` and both captures
are retained with preview `4f570752…`. Independent review accepts copy/layout
containment but identifies a separate top focus-outline clipping concern:
card top equals row top, while the outward outline needs 6px clearance and the
scroll row has no top padding. This remains an actionable D02 finding; card-box
containment is not proof that the whole outline is visible.

## Production Lighthouse: executed, preset not passing

Production archive `.playwright-tmp/portfolio-production.KFPftI/site.tar.gz`,
SHA-256 `a6db44a718703280e199dacaf42ae9ad0e7e6b50f255cf1c9ccb10848272682f`,
is read-only and served locally on port 4337. It is distinct from preview
`4f570752…` and was copied from the restored normal build.

Command: `node .playwright-tmp/audit-production-lighthouse.mjs` -> fail:
six reports completed without runtime errors; 26 recommended-preset assertions
failed. The runner connects to the existing approved CDP browser, creates an
isolated context/page per route, and supplies that page to Lighthouse's public
API. It does not launch Chrome or use the forbidden launch flags. The six
configured routes, one run each, default Lighthouse settings, and unmodified
`ci.assert` recommended preset/category thresholds were retained.

Performance scores in configured route order: 0.82, 0.80, 0.82, 0.85, 0.85,
0.83. Accessibility, best practices, and SEO are 1.00 on all six. These category
passes do not make the full preset pass. `lighthouse-0.json` through
`lighthouse-5.json` and `lighthouse-assertions.json` preserve the evidence.

Initial classification: document-latency details show fast response (homepage
1ms), no redirects, but absent compression. The Python static server provides
uncompressed responses, so compression/document-latency findings are not proof
of production hosting behavior. Unused shared CSS, CSS-to-font dependency chains,
and About/Blog image-delivery findings require separate source evaluation.
The homepage report estimates 106278 unused bytes of 195819 uncompressed CSS;
About identifies `jamie-profile-640.webp` compression savings. No assertions or
source were changed to suppress these findings.

## Latest candidate: verified CLI evidence copy

Archive `.playwright-tmp/portfolio-review.iQ5QJV/site.tar.gz`, SHA-256
`4f57075241fbb161675a829a623388e3feacbfaf27d6468bc0fe0278a57f7f54`.
The read-only extracted preview is served on port 4336. CLI case-study copy now
distinguishes clean wSearch offline checks/live Q42 retrieval from fixture-backed
rSearch planning output. Source claims have independent review acceptance.
Command: `npm run validate:source` -> pass (23:10 September 6).
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass (production restored).

Command: `node .playwright-tmp/capture-cli-evidence.mjs` -> fail for the generic
all-main text-boundary assertion only: the 320px horizontal project carousel
contains offscreen labels. Both page-width checks and axe scans passed. The
preserved `cli-captures.json` indexes 14 mobile and ten desktop ordinary frames.
A focused text-range check excluding `.case-all-work` then returned no overflow
at 320/1440px. This is scoped case-study text evidence, not carousel acceptance.
Independent DATA review inspected all 24 frames and accepted the updated CLI
page's layout, type, spacing, clipping, evidence buttons, and footer with no
findings. The reviewer also classified the flagged labels as intentional
offscreen carousel content. Earlier aggregate
results belong to `622468cf…`, not this new copy candidate.

Both pinned test-definition GitHub URLs returned HTTP 200 using bounded
`curl --head --location --max-time 20 --silent --show-error` requests with
network permission. No authentication, publication, or remote mutation occurred.

## Latest candidate: demo state styling and behavior

Archive `.playwright-tmp/portfolio-review.gjPr98/site.tar.gz`, SHA-256
`622468cfd7b4ec402523368f8e8e889101fa658b4f529d11b795188a5cad41ec`.
Dedicated demo tests initially passed state text, but post-selection captures
exposed concatenated unstyled gate labels. Recreated rows lacked Astro's scoped
attributes. The repair updates the nine server-rendered rows in place, retaining
their structure and styling while changing state classes, markers, and labels.
No dynamic selector broadening or command execution was added.

Command: `npm run validate:source` -> pass (September 6, 22:50).
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass (production restored).
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/e2e/skillsbar-demo.spec.ts`
-> pass: four cases at explicit 320/1440px. All three scenarios are activated by
pointer, Enter, and Space. Independent expected fixtures check title, summary,
score/accessible label, one pressed button, next action, event, and all nine gate
names/states. Post-selection rows must remain grids with separate block labels.
Nine copied commands per viewport are intercepted and compared exactly; a
clipboard-denial fixture verifies feedback and retained scenario state. Neither
the system clipboard nor command execution is used. This proves mocked clipboard
integration and demo behavior, not OS clipboard access or current SDK support.
`demo-state-results.json` preserves the focused receipt. Six-state captures
cover all three scenarios at 320/1440px, with zero axe violations in each record.
Independent review accepted the repaired state regions and the complete
candidate-scenario page; unchanged security/ready lower frames are not claimed
as independently reviewed in that initial return. A subsequent independent
review inspected all remaining 12 security/ready lower frames with no findings,
completing visual inspection of all 30 preserved frames across all three states
at 320/1440px. This proves scoped layout/type/spacing/clipping review, not actual
zoom, screen-reader, touch, motion, or all-viewport acceptance. The adapter uses
port 4335.

Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y tests/e2e`
-> fail: 147 passed, ten existing device-conditional skips, one failure.
The desktop reduced-motion cancellation test timed out before cancellation:
the initial fill animation count stayed zero where the assertion expected a
positive count. Classification remains open; this is not a demo-state failure.
`aggregate-results.json` preserves the report. The archive hash was rechecked
unchanged. An initial sandbox-only attempt was interrupted after CDP connection
errors (`EPERM`); the completed run used network permission for the existing
approved endpoint. No host browser was launched by this run.

Command: `node .playwright-tmp/diagnose-button-start.mjs` -> pass (eight
completed diagnostic probes, not a replacement aggregate). Each new isolated
context reported fine-pointer support, document focus, a ready button, a valid
44px target after scrolling, active hover, and a running 400ms fill animation
at approximately 16ms. Each reduced-motion snapshot reported no active fill
animation. The probe observes native animation creation without changing its
duration or cancellation. `button-start-diagnostic.json` preserves geometry,
media state, focus, timing, and observations. This does not reproduce or explain
the aggregate precondition failure; source and test assertions remain unchanged.

The same aggregate command subsequently completed with diagnostic recording in
the scratch CDP fixture: pass, 148 passed, ten existing skips, zero failures.
`aggregate-instrumented-results.json` preserves this separate report, including
per-test timeline attachments. All nine copied test files matched source with
only their fixture imports changed. In the previously failing test, native
animation creation occurred at 102ms with duration 400ms, running state, document
focus, and fine-pointer support; both original assertions passed. Instrumentation
changes observation overhead, so this passing run does not explain or erase the
original failure. No shipped source or test assertion changed.

## Latest candidate: project heading fit

Archive `.playwright-tmp/portfolio-review.kegIBb/site.tar.gz`, SHA-256
`9f9ec46ed836de78dbb0b7d7a225fa012b960c22393a62b684185d4cbbf1640a`.
Scoped rules below 767px use existing 56px project-title and 28px attribution
heading tokens, preserving spelling, complete wording, and semantic hierarchy.
Before: the 320px brAInwav title exceeded the viewport, SkillsBar/393px SDK lacked
their gutter, and all three detailed case-study attribution headings escaped
the dark card at 320px. No spacing changes were made: all measured story gaps
are 24px, and both overview heading-to-body gaps are 26px on every project.

Command: `npm run validate:source` -> pass (September 6, 22:41).
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass (production restored).
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y/polish.spec.ts --grep 'project headings fit'`
-> pass: both device projects test all five work routes at 320/393/768/1440px.
Title text stays within 16px viewport gutters; attribution heading text stays
within 16px card gutters. `project-heading-regression-results.json` preserves
the result. `project-heading-results.json` and `heading-*`/`role-*` ordinary
captures provide focused geometry and visual evidence.
Independent review accepts the complete scoped heading repair, retaining the
previous five-project long-body review at 320/1440px. No presentation findings
remain in those reviewed views. This is not all-viewport, zoom, screen-reader,
or interaction acceptance. Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y tests/e2e`
-> pass in isolation: 144 passed, ten existing device-conditional skips, zero
failures. `aggregate-results.json` preserves the current result; archive hash
was rechecked unchanged. The adapter uses port 4334. Dedicated demo-state proof
is next.

## Latest candidate: project illustration text containment

Archive `.playwright-tmp/portfolio-review.zIOpWQ/site.tar.gz`, SHA-256
`5f2d11c5c21a06812e0e05216b91f369f9c3a69671f9f3d358d03695d19e1595`.
The shared illustrated hero overflowed at 320px on Skills SDK, CLI Proof Series,
brAInwav, and AI DevRel. The scoped mobile repair uses full available figure
width, 16px figure/card padding, and the existing 28px heading token. Wording is
preserved with normal wrapping; no overflow hiding or truncation was added.
The initial near-768px breakpoint also matched at 768px in Chrome. It was
corrected to 47.9375rem (767px with the tested default font), keeping the repair
below the tablet boundary.

Command: `npm run validate:source` -> pass (September 6, 22:31).
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass (production restored).
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y/polish.spec.ts --grep 'project illustration labels'`
-> pass: both device projects, each covering four routes at 320/393/768/1440px.
Command: `node .playwright-tmp/check-project-art.mjs` -> pass: all 16 cases retain
text inside the card with 16px inset. Strict before/after comparison of all
eight 768px/1440px card and figure geometry records also passed unchanged.
`project-art-results.json`, `project-art-regression-results.json`, and ordinary
`art-{slug}-{width}.png` captures preserve the evidence. Independent visual
review accepts the illustration text-fit repair on all four 320px captures.
An additional scoped axe scan passed all 16 route/width cases with zero
violations. The adapter uses port 4333.

The first aggregate on this candidate ran alongside capture work on the shared
browser: 139 passed, ten existing skips, three motion failures. These concerned
an animated-button reduced-motion count, missing nav animation timing, and a
nonzero reduced-motion card-cursor offset. `aggregate-results.json` preserves
the failure; shared-browser interference is a hypothesis, not an established
cause. The isolated full run completed without other browser operations:
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y tests/e2e`
-> pass: 142 passed, ten existing device-conditional skips, zero failures.
`aggregate-isolated-results.json` preserves this result separately. No test or
runtime source changed between the failed and isolated passing runs. Future
browser validation will be serialized to remove that avoidable confound;
the passing run does not retrospectively establish the original failure cause.
The original 140-pass aggregate belongs to the pre-illustration candidate.

Current project capture manifest `remaining-route-captures.json` indexes 97
ordinary frames across all five project routes at 320/1440px. Independent review
accepts complete SDK and CLI desktop presentation, but mobile acceptance remains
open: the shared attribution heading overflows on both. Heading measurements
also identify insufficient viewport gutter for SkillsBar at 320px and Skills
SDK at 393px, and actual brAInwav title clipping at 320px. A possible SDK
delivery/correction heading-to-prose spacing issue still requires measurement;
do not change shared spacing from that visual impression alone.

## Latest candidate: mobile article grid and gutters

Archive `.playwright-tmp/portfolio-review.tUm3pe/site.tar.gz`, SHA-256
`803409c75e0f574832a52b7a12c37894f324469e7567960b36d2aa7920bd27e9`.
At 320px the prior article grid's intrinsic sizing expanded the reading column:
When Evidence Goes Stale began at x=6.49; Capability Is Not Trust began at
x=-8.75. The mobile-only shared rules now use a shrinkable grid track, zero
minimum child width, 16px shell gutters, and the existing 56px display-heading
token. The typography skill guided wrapping and reuse of the existing scale.
Copy, desktop styling, and unrelated routes are unchanged.

Command: `npm run validate:source` -> pass (September 6, 22:19).
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass (production restored).
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y/polish.spec.ts --grep 'article text retains'`
-> pass: both articles at 320/393/768px in both device projects; all tested text
rectangles stay within 16px viewport gutters. `article-gutter-results.json`
preserves results in the archive directory.
Command: `node .playwright-tmp/check-article-gutters.mjs` -> pass; before/after
1440px article and body geometry records were also compared with strict deep
equality and are unchanged for both articles.
Command: `node .playwright-tmp/capture-remaining-routes.mjs` -> pass: 40 ordinary
frames across both articles at 320/393/768/1440px with in-view images decoded.
`remaining-route-captures.json` indexes these files. Initial mobile heading/body
inspection shows restored gutters. Independent review and full regression
remain separate. Independent review accepts all 320px frames of both articles.
The adapter targets port 4331.

Command: `node .playwright-tmp/diagnose-carousel-settling.mjs` -> pass: ten
instrumented runs recorded passive scroll frames and scrollBy calls before/after
unavailable Enter/Space activation. All reached 868px and retained three calls;
the original one-pixel drift was not reproduced. The test now waits for five
identical animation-frame positions before recording its baseline. Exact
Enter/Space/pointer no-movement assertions remain unchanged; no runtime change
or positional tolerance was introduced. Independent review accepts this bounded
readiness clarification, not a claim that the original cause was reproduced.
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y tests/e2e`
-> pass: 140 passed, ten existing device-conditional skips, zero failures.
`aggregate-results.json` preserves this current-candidate result; the previous
candidate's failed aggregate is retained separately. Archive hash rechecked.
Command: `node scripts/validate-js-budget.mjs` -> pass: four files, 3100 gzip
bytes in the restored production output. Overall visual/manual acceptance
remains incomplete; the Skills SDK illustration's narrow-screen label is the
next visual finding to verify on this candidate.

## Latest candidate: Proof endpoint clipping repair

Archive `.playwright-tmp/portfolio-review.8WLrVE/site.tar.gz`, SHA-256
`53dc9dd0c0c490e0a1d9710f21af6b4f0fea2d4fce1b79ebfeb7f5bc521eaeb0`.
At 320px, the previous candidate had 286px cards in a 256px scroll region.
Native keyboard scrolling to the last project exposed a clipped left edge
(card x=2.5, row x=32). The scoped Proof card rule now limits width to its
container and permits intrinsic shrinking. No text, card ordering, or scrolling
behavior was changed.

Command: `npm run validate:source` -> pass (September 6, 22:11).
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass (production restored).
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y/polish.spec.ts --grep 'Proof cards'`
-> pass: new endpoint geometry test passes both device projects at four widths;
the grep also selects an existing article test, for three passes and one
existing device-conditional skip. `proof-card-regression-results.json` preserves
the report in the archive directory.
Command: `node .playwright-tmp/verify-proof-endpoints.mjs` -> pass: 12 checks,
both rows and both endpoints at 320/768/1440px reached using native arrow keys.
End cards fit their scroll regions and sampled text stays within each card.
`proof-endpoints-results.json` and ordinary endpoint captures preserve evidence.
This proves keyboard endpoints and geometry, not touch gestures or screen-reader
operation. Independent review accepts the bounded repair across reviewed phone,
tablet, and desktop endpoint frames. The adapter targets port 4330.

Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y tests/e2e`
-> fail: 137 passed, ten existing skips, one mobile carousel boundary failure.
The exact scroll-position assertion expected 866.5 and received 867.5 after
unavailable-control activation. `aggregate-results.json` preserves this failure;
the current candidate does not have a passing full aggregate.
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y/polish.spec.ts --grep 'carousel boundary state' --project chromium-mobile --repeat-each 5`
-> pass: five isolated repetitions. `carousel-repeat-results.json` preserves
these results. They do not erase the aggregate failure; settling versus actual
control movement still requires diagnosis before changing source or assertions.
Command: `node .playwright-tmp/capture-remaining-routes.mjs` -> pass: 116 ordinary
viewport captures for both articles and all five project routes at 320/1440px,
with in-view images decoded. `remaining-route-captures.json` indexes these files.
Rendering alone is not visual acceptance. Initial article review found very
narrow phone gutters, now under measurement; the remaining frames need review.

## Latest candidate: Blog duplicate-spacing repair

Archive `.playwright-tmp/portfolio-review.phBZpX/site.tar.gz`, SHA-256
`ca3fab0dc2978900e79818b27f5c699c99e060966915969d342ae7e69d8556bc`.
The route's scoped styles now remove inherited list/author block margins and
mobile list bottom padding; mobile masthead bottom padding uses the existing
96px spacing token. Copy, editorial columns, and desktop article height remain
unchanged. This follows the UI-polish review's existing-styling-system approach.
Measured phone gaps before the list/author section are now 96px/72px, formerly
258px/162px plus 132px of list padding. Desktop gaps are 96px/128px, formerly
154px/256px. Tablet masthead spacing is measured below both columns, not only
the shorter article column.

Command: `npm run validate:source` -> pass (September 6, 22:03).
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass (production restored).
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y/polish.spec.ts --grep 'Blog sections'`
-> pass: both device projects at 320/393/768/1024/1440px. The initial test failed
at 768px because its measurement ignored the taller title column; corrected
geometry includes both masthead columns without changing the gap bounds.
`blog-spacing-results.json` preserves the passing result in the archive directory.
Command: `node .playwright-tmp/check-blog-layout.mjs` -> pass using the approved
CDP connection to this immutable candidate; all five axe scans have zero
violations. `blog-layout-results.json` and ordinary route-section captures are
in the same directory. Both portraits decode successfully after scrolling into
view; the earlier dark footer full-page capture does not justify an asset or
production loading change. The adapter uses port 4329.

Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y tests/e2e`
-> pass: 136 passed, 10 existing device-conditional skips, zero failures.
`aggregate-results.json` in this candidate directory preserves the report.
All eight adapted spec files were checked against source: only their Playwright
fixture import differs. The archive hash was rechecked after execution.
Independent review accepts the 393px article-list transition and 1440px masthead;
the retained desktop article height supports the two-column alignment and does
not require another change. Remaining visual surfaces and overall A01-D08
acceptance are still separate, incomplete evidence lanes.

## Latest candidate: Contact hierarchy and readable body text

Archive `.playwright-tmp/portfolio-review.fXFK4i/site.tar.gz`, SHA-256
`f4f4626e06dc68f2fef9bf255913b95b574451c588bf51220062fa76c4f87c13`.
The previous candidate exposed a desktop contrast failure after reducing body
type size: 3.91:1. Its translucent paragraph color was replaced by the existing
opaque `--bds-color-portfolio-muted` token; wording and geometry were unchanged.
Command: `npm run validate:source` -> pass at 21:56 on September 6.
Preview and restored production builds passed.
Command: `node .playwright-tmp/verify-contact-repair.mjs` -> pass at
320/393/768/1440px: text remains within gutters, email does not overlap heading
or portrait, and all four axe scans have zero violations. Ordinary viewport
captures are saved as `contact-{width}-{part}.png` in the archive directory.
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y/polish.spec.ts --grep 'Contact email'`
-> pass in both device projects at all four widths: actual Tab navigation
reaches the email with focus-visible, without activating the mail client.
`contact-first-view-results.json` preserves the result. The adapter now uses
port 4328. Independent visual acceptance and wider regression remain pending.

## Latest candidate: Contact primary-action hierarchy

Archive `.playwright-tmp/portfolio-review.S1Eevo/site.tar.gz`, SHA-256
`1bcc728cd0c8e9f4dbce2e50000b46cce93637d06bb6e86b7f2843a6689f6b18`.
Contact wording is unchanged. Email now follows the h1 before the portrait;
heading sizes use existing 48px/36px heading tokens and the supporting paragraph
uses 20px/18px body tokens. The email has a minimum 44px target in normal flow.
Command: `npm run validate:source` -> pass at 21:53 on September 6.
Preview build and restored production build passed.
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y/polish.spec.ts --grep 'Contact email'`
-> pass: both device projects, each testing 320/393/768/1440px with an 800px
viewport height. The email is visible in the initial viewport, within horizontal
gutters, at least 44px tall, and focusable. The adapter now targets port 4327.
`contact-first-view-results.json` preserves this focused result. Fresh visual
review, text-containment checks, and wider regression refresh remain pending;
the earlier full aggregate applies to the previous candidate only.

## Latest candidate: proof-label contrast repair

### Adapted polish suite execution

### Unchanged-baseline visual comparison

Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/visual --update-snapshots=none`
-> fail: 26 cases, comprising 18 changed existing snapshots and eight missing
baselines. Missing baselines are both device views of When Evidence Goes Stale,
SkillsBar, Skills SDK, and CLI Proof Series. Existing comparison failures cover
both device views of Home, About, Blog, Contact, SkillsBar demo, the AI DevRel
article, Proof, AI DevRel work, and brAInwav work. All require review; failure
does not itself distinguish intended content change from a visual defect.
`visual-results.json` preserves results; the ignored adapter's `results/`
contains expected/actual/diff images where baselines exist. The visual test's
only adaptation was its fixture import. `diff -qr` confirmed baseline copies
remain identical to tracked originals after execution, and tracked visual
files are unchanged. No new baseline was generated or accepted.

Contact comparison triage: inspected full desktop expected/actual and full mobile
actual. Current headline and body intentionally describe software-development
roles and independent project work. The longer copy increases height; the
square portrait preserves its source ratio. Both captures show readable text,
visible email/profile links, and separated footer content without clipping.
This is scoped current-presentation evidence, not baseline approval. The stored
expected screenshot says “AI-native DevRel,” while the starting source says
“deploying trustworthy AI workflows”; the baseline therefore predates more
than the current task's edits and is not an exact before-patch receipt.
Independent review found a Contact usability issue despite the absence of
clipping: the very large headline and long lead postpone the primary email
action below the initial desktop/mobile viewport. The scoped initial visual
inspection is not acceptance. Proposed repair, not yet applied: retain wording,
use a compact route-heading scale, and place the existing email immediately
after the heading before the portrait and supporting story. Blog's mobile
capture also needs separate investigation of large empty gaps and a black
footer thumbnail (possible lazy-image capture readiness, not yet classified).

Final adapted accessibility/e2e aggregate:
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y tests/e2e`
-> pass: 132 passed, ten existing device-conditional skips, zero failures.
All eight copied source files passed import-only equivalence checks immediately
before execution. The archive SHA-256 remained `1abe3b969a4051decdacd6e4a7c0c7acf7dff9b1cf8c5c2c27b5a0a22883dbd1`.
`aggregate-results.json` preserves the final report; earlier failure and focused
receipts remain separate. This does not include visual snapshots, Lighthouse,
real browser zoom, or screen-reader operation. Standard launch-based execution
remains separate from this explicitly adapted run.

The inspected `lighthouserc.json` launch configuration includes `--no-sandbox`,
which the current repository browser policy forbids. It was not executed.
A policy-compliant existing-browser audit remains a separate evidence task;
the automated passes above do not satisfy the Lighthouse gate.

Remaining adapted accessibility/interaction run:
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y/button-lifecycle.spec.ts tests/a11y/smoke.spec.ts tests/e2e`
-> fail: 77 passed, nine existing conditional skips, ten failures, all in
`interface-contracts.spec.ts`. Import-only equivalence to current source was
asserted for all eight accessibility/e2e test files. The fixture additionally
re-exports the Locator type; test bodies were unchanged for this run.
`interaction-initial-results.json` preserves the result. Failures require
classification, not blanket assertion relaxation:

- Two projects expect seven entry elements; current Home has five.
- Two reduced-motion checks expect seven `none` entries; all five current
  entries report `none`.
- Two metadata checks expect `summary`; output uses `summary_large_image`.
- Desktop hero y is 294.30 versus the old 212–220 bound in both projects;
  mobile-project tablet y is 198.74 versus the old 175–185 bound.
- Mobile reduced-motion hover expects active nav highlighting, but its coarse
  pointer context leaves the decorative highlight inactive.

Six failures are now classified and repaired as stale contracts. Entry tests
assert the intended hero, two featured cards, work section, and writing section
individually, plus five total entry regions. Reduced-motion assertions retain
the requirement that every region has animation `none`. Metadata tests now
require the intentional large-image card plus its exact portrait URL and alt.
Parser-based inspection confirmed both production and immutable preview have
the same card/image metadata; only preview includes `noindex, nofollow`.
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/e2e/interface-contracts.spec.ts --grep 'first-visit|entry motion is disabled|share-text'`
-> pass: six tests, both device projects. `entry-metadata-results.json` records
the rerun. No runtime code changed. The three geometry failures and one mobile
hover failure remain open; the original full-run failure receipt is preserved.

The hover failure is now classified as a capability-blind test expectation.
`SiteNav.astro` explicitly enables pointer highlighting only when
`(hover: hover) and (pointer: fine)` matches. Live diagnostic
`node .playwright-tmp/check-nav-capability.mjs` observed desktop fine=true,
active=true, and Pixel 5 fine=false/coarse=true, active absent. Both had zero
animations and transform none under reduced motion. The test now asserts both
branches without a skip: active target on fine pointers, inactive highlight
retained in the nav shell otherwise, and zero motion in either case.
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/e2e/interface-contracts.spec.ts --grep 'highlight remains still'`
-> pass: two tests. `nav-reduced-results.json` records this rerun. Three fixed
hero-geometry failures required further classification; full aggregate rerun
is still needed.

Geometry classification is now complete. Settled captures at 805/1292px in
both device contexts show identical geometry per width. The tablet title is
180.74px, inside the unchanged 175–185px bound; its failed 198.74px measurement
included the entry animation's 18px offset. Geometry tests now request reduced
motion before navigation, while separate motion tests remain unchanged.
DATA independently accepted the exact desktop and tablet first-fold captures
and confirmed the career-content layout should not revert to the old desktop
title position. The desktop test replaces only that obsolete absolute title-y
bound with navigation clearance and complete intro/start-link separation from
featured work. Existing width, typography, surface, and featured-y bounds remain.
Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/e2e/interface-contracts.spec.ts --grep 'desktop surface|tablet geometry'`
-> pass: four tests; `geometry-results.json` preserves the result. No runtime
code changed. The complete adapted accessibility/e2e aggregate must run next.

Command: `./node_modules/.bin/playwright test --config .playwright-tmp/cdp-suite.xPNWgp/playwright.config.ts tests/a11y/polish.spec.ts`
-> pass: 45 passed, one existing desktop skip for the mobile-only article test.
This is CDP-adapted execution, not the standard launch-based suite. The local
fixture overrides only browser acquisition to connect to approved port 9223;
the local config uses one worker, no retries, fixed artifact port 4326, and the
same Desktop Chrome/Pixel 5 device options and viewports. No browser is launched.
The copied test file differs from source only in its test/expect fixture import;
`diff -u` confirmed this. Source test SHA-256:
`1368707a6a39a28bec3c791207255847c3f011b120ef8e934d6e74f3b512a403`.
Copied test SHA-256:
`e661629a18f2812b5d0ebfd905f87540b903bdc6c71e9272bc0ceaf6e536b28b`.

Initial execution had 43 passes and two failures from the same obsolete
768px two-track assertion. The source contract now requires the independently
accepted single-column layout at 768/857/921px and the sidebar below the complete
copy; desktop three-track and typography assertions remain. No new skips or
weakened runtime assertions were added. The served artifact remained unchanged.
Other suite files and the standard launch-based route remain unexecuted in this
adapter; full-suite acceptance is not claimed.

Additional current-candidate proof:
Command: `node .playwright-tmp/verify-fixed-boundaries.mjs` -> pass: footer
targets do not overlap at 320/1024/1440px; carousel unavailable directions do
not move on pointer/Enter/Space, retain focus, and preserve the opposite action.
Command: `CHROME_CDP_URL=http://127.0.0.1:9223 node /Users/jamiecraik/dev/websites/scripts/validate-render-flow.mjs`
-> pass: 13 routes across four viewports. Working directory was the isolated
`.playwright-tmp/render-check.4iCstN`, whose `dist` points to the immutable
candidate's `site` directory. The repository validator was unchanged.
Command: `node scripts/validate-js-budget.mjs` -> pass against the restored
production build: four files, 3100 gzip bytes.
Command: `node .playwright-tmp/verify-fixed-keyboard.mjs` -> pass: four key-route
forward/reverse keyboard checks, header About activation, demo Enter/Space
exclusive state changes, cancellation of active CTA motion when reduced motion
is enabled, and immediate reduced-motion CTA/cursor behavior.

Archive `.playwright-tmp/portfolio-review.ycqKCC/site.tar.gz`, SHA-256
`1abe3b969a4051decdacd6e4a7c0c7acf7dff9b1cf8c5c2c27b5a0a22883dbd1`.
The proof-label rule now uses `var(--bds-color-portfolio-ink)` after the shared
muted-text rule. The earlier legacy declaration was `rgba(0, 11, 0, 0.46)`;
the effective failing value was the shared muted token, `#4f564d`. No global
palette change was made. Intermediate archive `75786c75…` still failed because
equal specificity let the later shared rule win; it is not repair proof.
Command: `npm run validate:source` -> pass at 21:26 on September 6.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass after archiving.
Command: `node .playwright-tmp/verify-label-contrast.mjs` -> pass at
320/768/1440px: both labels compute to opaque `rgb(0, 11, 0)` and the proof
panels have zero axe color-contrast violations. `label-results.json` records
the observations. Command: `node .playwright-tmp/verify-fixed-accessibility.mjs`
-> pass against port 4326: all 26 axe route/viewport scans report zero violations,
all 13 no-JS routes pass, and the Home/About/Back sequence passes.
`accessibility-results.json` binds those results to this candidate. Screen-reader
and actual browser-zoom verification remain outside these automated claims.

## New candidate: desktop fact descriptions restored

Command: `node .playwright-tmp/verify-about-repair.mjs` -> pass at eight widths
(320/360/720/768/820/922/1024/1440), now including all four descriptions visible
within their cards and clear of the next section. DATA reviewed desktop
Fun Facts frames 0/1 and representative mobile frames 0/2 and accepted this
scoped repair. Command: `node .playwright-tmp/verify-fixed-keyboard-all.mjs`
-> pass on all 13 routes at 320px and 1440px, including forward/reverse cycles,
visible focus outlines, and sampled obstruction checks. Results are in
`keyboard-all-results.json`. Command:
`node .playwright-tmp/verify-fixed-accessibility.mjs` -> fail: 25 of 26 axe
route/viewport scans have no violations; Home at 1440px reports the small
“From the work” label at 3.96:1 contrast (expected 4.5:1). Target:
`div[aria-label="Candidate held"] > .eyebrow`; foreground `#4f564d`, background
`#babcb8`. All 13 no-JS route checks and the Home/About/Back sequence passed.
`accessibility-results.json` records this current-candidate failure. Repair the
label contrast before acceptance; the successful keyboard lane does not waive it.

Archive `.playwright-tmp/portfolio-review.BULtgi/site.tar.gz`, SHA-256
`4e7fd85338d8f6ad61a848c6eb227c62909c4f8e26af162352bc1c51de78dede`.
Removed the desktop-only `display:none` override; existing description styling
now applies without new controls or changes to facts, labels, or artwork.
Command: `npm run validate:source` -> pass at 21:17 on September 6.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass after archiving preview.
Command: `./node_modules/.bin/playwright test tests/a11y/polish.spec.ts --list`
-> pass (44 tests collected, not executed).
Command: `node .playwright-tmp/check-fact-disclosure.mjs` -> pass as a diagnostic;
all four descriptions are visible before and after hover/tap in 1440px mouse
and touch contexts. `fact-disclosure-results.json` records eight observations.
The immutable preview uses port 4324. Focused geometry and independent scoped
review are recorded above. Full visual and accessibility acceptance remain open.

## Latest candidate: combined About flow repair, focused rendered proof passed

Archive `.playwright-tmp/portfolio-review.t8EPpw/site.tar.gz`, SHA-256
`2296dd549842bc830084c25181adf600291bb80d214e77175baa02ba82a8a76b`.
This supersedes the blocked candidate below. The owning About stylesheet now
sets the tablet intro to one column and lets content determine section height.

Command: `node .playwright-tmp/verify-about-repair.mjs` -> pass at
320/360/720/768/820/922/1024/1440px, including a fresh repeat after recovery.
The default network-restricted attempt was blocked by `connect EPERM`; the
bounded network-enabled retry passed against the approved disposable browser
and immutable preview. Results are in the archive directory's
`about-results.json`. Assertions cover text gutters, metadata separation,
intro/sidebar flow, subsequent-heading clearance, and fact-label separation.
Command: `npx playwright test tests/a11y/polish.spec.ts --list` -> pass
(42 tests collected; not full-suite execution).

DATA reviewed all four 320px Fun Facts frames and both On the web frames and
accepted this scoped mobile repair: complete paragraphs, separated labels,
wrapped destinations, and visible footer. Wider frames and intro continuation
remain pending independent review. Keep this candidate stable during review.
Earlier featured-section, keyboard, and all-route evidence still needs a
current-candidate refresh; these focused assertions do not establish full
portfolio acceptance. Actual zoom, clean CLI evidence, and a reviewed
public-safe CV remain separate unresolved items.

Subsequent current-candidate checks:
Command: `node .playwright-tmp/verify-featured-repair.mjs` -> pass at
320/720/768/820/1440px; `featured-results.json` now records this candidate.
Command: `node .playwright-tmp/check-fact-disclosure.mjs` -> pass as a diagnostic,
with a failing product result: all four desktop fact descriptions remain
`display:none` before and after hover or touch tap at 1440px. The cards have
no keyboard disclosure control. `fact-disclosure-results.json` records both
input modes. This blocks content-access acceptance despite the static layout
passes. Repair the hidden-description rules and reverify the resulting build.

## Historical combined About candidate: rendered proof blocked

Archive `.playwright-tmp/portfolio-review.PGCY4P/site.tar.gz`, SHA-256
`7c337ea08069e6010a250af6c0ba988254978fccf61cb6d07f90fbc21bc32946`.
This candidate adds mobile Fun Facts and On the web gutters, separates the
decorative fact labels, permits long display URLs to wrap, removes fixed desktop
intro heights, and gives the 768–921px intro a single text column. Facts and
destinations are unchanged. Earlier accepted section evidence is historical
until the relevant regressions are refreshed on this candidate.

Command: `npm run validate:source` -> pass at 20:59 after these runtime changes.
Command: `git diff --check` -> pass.
Command: `./node_modules/.bin/playwright test tests/a11y/polish.spec.ts --list`
-> pass (42 tests collected; not execution).
Command: `node .playwright-tmp/verify-about-repair.mjs` -> blocked twice:
`browserType.connectOverCDP: Timeout 30000ms exceeded`, after the WebSocket
connected but before a controllable browser session was established. The old
preview server was absent after session recovery; restoring that server did
not resolve the browser handshake. No candidate screenshots or passing browser
results were produced by these attempts.

The owned disposable Chrome process was identified by its exact temporary
profile and sent TERM; the restored preview server exited. Do not reuse the
failed profile or treat its responding version endpoint as rendered proof.
Next: obtain a functioning approved disposable connection, run the combined
About assertions and accepted-section regressions, then finish remaining route,
motion, accessibility, and final-gate evidence. Actual zoom, clean CLI evidence,
and reviewed public-safe CV remain separate unresolved items.

## Current About repair candidate

Archive `.playwright-tmp/portfolio-review.VCukHo/site.tar.gz`, SHA-256
`b8d748ec9e46257e17ae47596d6ed2e6941c28ac6019a8240e9154704b608e56`.
Mobile Skills and Work History now have content gutters, shrinkable text, and
separate metadata groups. Public facts and desktop layout are unchanged.
Command: `npm run validate:source` -> pass at 20:49 on September 6.
Command: `node .playwright-tmp/verify-about-repair.mjs` -> pass on this archive
at 320/360/768/1440px. `about-results.json` records text-range gutter checks and
metadata separation. The initial verifier failed by requiring a new 4px gap
between existing desktop rows; the corrected check allows separate vertical
rows while still requiring horizontal spacing. No desktop source change was
made to satisfy that arbitrary threshold.

DATA independently verified the hash, inspected the verifier/results, and
reviewed all 20 Skills/History ordinary viewport frames. It accepted this
scoped repair, including the planned-study caveats and continuation text.
Command: `./node_modules/.bin/playwright test tests/a11y/polish.spec.ts --list`
-> pass (40 collected tests, not full-suite execution).

Remaining About review found missing gutters in the On the web section, including a long
LinkedIn display URL. Fun Facts also needs review of its mobile gutters and
overlapping decorative labels. These remain open; the accepted Skills/History
and featured-section repairs do not establish whole-page acceptance.

## Accepted focused featured-section repair

Current archive: `.playwright-tmp/portfolio-review.J6LcQI/site.tar.gz`, SHA-256
`79d3605bf9466c639beb40491b594c6d5de79c9a73ef3a08c23ae15fde667fe1`.
Command: `node .playwright-tmp/verify-featured-repair.mjs` -> pass at
320/720/768/820/1440px. Checks include header/card separation, absence of legacy
illustration styling on SkillsBar, and visible text ranges within their own
frames and all clipping ancestors. `featured-results.json` records the exact
candidate and measured colors. Card copy is opaque RGB 213/214/208, giving a
conservative 5.18:1 against the lightest RGB 79/86/77 gradient stop.

DATA independently verified the archive hash and inspected nine ordinary
viewport screenshots: SkillsBar and SDK at 320/768/1440px, and header flow at
720/768/820px. It accepted this scoped visual repair, including fully readable
notes and removal of the legacy artwork overlay. The narrow decorative 01 badge
is an optional nit, not a reason to repeat this repair. Whole Home/About and
all-route acceptance remain open. Intermediate `a97033bc…` and `5b2098e1…`
candidates were rejected after visual inspection exposed nested-grid overflow;
they do not establish acceptance.

Command: `npm run validate:source` -> pass at 20:42 after the final grid fix.
Preview and restored production builds passed. The expanded repository test
collects successfully; the browser proof above is a focused CDP verifier, not
execution of the full Playwright suite.

### Before evidence and initial repair

The repair separates the SkillsBar demo from legacy illustration
selectors, gives mobile proof notes normal-flow space, lets the featured label
row size itself, and uses opaque paper-colored card copy. These changes are
newer than the historical archives below; the current candidate is identified above.
Command: `npm run validate:source` -> pass at 20:36 on September 6.
Command: `git diff --check` -> pass.
The focused regression definition now checks the clipping artwork ancestor,
label/card separation, and absence of legacy pseudo-element/span positioning
on the SkillsBar demo. Its runtime execution remains pending.

Ordinary viewport captures on the previous candidate confirmed the mobile panel
extended 30px below the clipping artwork, the label overlapped the next card,
and legacy light illustration layers obscured the SkillsBar demo. The skip
link stayed above the viewport and unfocused in normal captures; its appearance
in tall locator captures is not accepted as a site defect.

## Mobile Home repair candidate

Archive `.playwright-tmp/portfolio-review.sH4N3m/site.tar.gz`, SHA-256
`b182cb69bac16438b811b09b525f7d459b5c855a1c4f5a2bc1434ddd45ffbe55`,
supersedes the candidate below for Home layout. The prior candidate's mobile
proof notes were positioned against the page, covering reading links even with
coarse input and no hover. The artwork now establishes the containing block.
The narrow heading minimum is 60px rather than 64px, preserving its right gutter.

Command: `npm run validate:source` -> pass after these changes.
Command: `git diff --check` -> pass.
Command: `./node_modules/.bin/playwright test tests/a11y/polish.spec.ts --list` -> pass (collection only).
Command: `node .playwright-tmp/inspect-home-mobile.mjs` -> pass against this
read-only archive at 320/360/768/1440px with both mouse and coarse/touch input.
Both proof panels fit inside their respective artwork bounds. At 320px the name
text range ends at x298.46 with a 15px left gutter; previously it ended at x319.03.
Screenshots are `home-{width}-{mouse|touch}.png` beside the archive. These are
entry captures, not complete-section or whole-site approval. Existing rendered
results below belong to the older archive until explicitly refreshed.

Preview and normal production builds both passed; normal output was restored.

Command: `node .playwright-tmp/capture-home-about-sections.mjs` -> pass for
capture generation only: eight Home/About sections at 320/768/1440px, 24 PNGs
named `section-{section}-{width}.png` beside the archive. Inspection leaves the
featured-work section open: tablet right-label collision, competing SkillsBar
illustration layers, and possible mobile panel clipping require ordinary
viewport confirmation and repair where reproduced. Tall locator captures show
a skip-link overlay, so they are provisional and not whole-section acceptance.
About mobile history also shows adjacent metadata without separation; verify
in ordinary viewport captures before classifying the layout. No blanket visual
pass follows from screenshot generation.

## Fixed candidate

- Branch: `codex/career-aligned-portfolio`, uncommitted local implementation.
- Archive: `.playwright-tmp/portfolio-review.V1GvCc/site.tar.gz` (read-only).
- SHA-256: `316956c6ee117133c4e3f7b46ac2324412939f86603838cb4a15adadd3e2fb59`.
- Preview build: September 6, 19:58 Europe/London; normal production output restored.
- Includes approved SkillsBar media plus footer nonoverlap/wrapping, focus-safe
  carousel boundaries, and immediate keyboard reveal of Proof cards.

Command: `npm run validate:source` -> pass after final runtime changes.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass (normal output restored).
Command: `./node_modules/.bin/playwright test tests/a11y/polish.spec.ts --list` -> pass (test collection only, not execution).

The wider keyboard/obstruction check on the previous media archive exposed
overlap between desktop footer Contact and X links, mobile focus loss while
native carousel controls became disabled, and a focused Proof card clipped by
its horizontal container. Source repairs use wrapping footer layout, focusable
`aria-disabled` carousel controls with guarded activation, and immediate focused
Proof-card reveal. With JavaScript active, unavailable carousel controls now
remain in Tab order; older evidence that native-disabled Back was skipped is
historical and does not describe this candidate.

The intermediate `078a0a5f…` archive passed 26 keyboard route/viewport checks
but its mobile footer was visually rejected: inherited column direction made
the navigation stretch. The final scoped row direction fixes that regression.
Its navigation height is now 104px at 320px and about 44.8px at 1024/1440px.

Command: `node .playwright-tmp/verify-fixed-boundaries.mjs` -> pass for the final
archive. Footer targets do not overlap at 320/1024/1440px and navigation does not
stretch beyond its content-derived height bound. At 320px with reduced motion,
both unavailable carousel directions remain focused and do not move on pointer,
Enter, or Space; reaching a boundary preserves focus and the enabled opposite
direction works. The first intermediate boundary run raced the scroll event's
ARIA update; waiting for state/geometry agreement corrected that test timing.

Final evidence lives in `.playwright-tmp/portfolio-review.V1GvCc/`:
`boundary-results.json`, `footer-320.png`, `footer-1024.png`, `footer-1440.png`.
All three ordinary viewport screenshots were visually inspected. Full final
keyboard rerun and remaining current-candidate gates are recorded separately;
older archive results below must not be promoted to this candidate.

DATA independently verified checksum `316956c6…` and inspected all three final
footer captures. It accepted the scoped correction: cohesive mobile navigation,
legible badge text, separated social targets, and no desktop/tablet Contact/X
overlap. This is footer-only visual acceptance, not whole-site approval.

Command: `node .playwright-tmp/verify-fixed-keyboard-all.mjs` -> pass on the
final archive: all 13 routes at 320×800 and 1440×1000, 26 combinations, 560 unique
forward stops and 560 reverse stops. Each direction checks focus-visible,
non-none outlines of at least 2px, viewport intersection, and five hit-test
points inside the visible target rectangle (the target or its descendants must
receive each point). Unique DOM paths verify reverse order; forward and reverse
cycles must complete within explicit bounded loops. Results:
`.playwright-tmp/portfolio-review.V1GvCc/keyboard-all-results.json`.

This supersedes the four-route label-only baseline. It still does not prove
every focus-outline pixel, full target visibility when a target exceeds the
viewport, screen-reader behavior, browser zoom, or every dynamic state.

Additional final-archive refresh:

- Command: `node .playwright-tmp/verify-fixed-accessibility.mjs` -> pass (13 no-JS routes, Home/About/Back, 26 zero-violation default axe scans). Results: `.playwright-tmp/portfolio-review.V1GvCc/accessibility-results.json`.
- Command: `CHROME_CDP_URL=http://127.0.0.1:9223 node /Users/jamiecraik/dev/websites/scripts/validate-render-flow.mjs` -> pass (13 routes × four viewports; cwd `.playwright-tmp/portfolio-review.V1GvCc/runner`, whose `dist` links only to extracted `../site`).
- Command: `node .playwright-tmp/verify-fixed-keyboard.mjs` -> pass (current-archive CTA/reduced-motion and demo activation refresh; its label-only traversal is weaker than the all-route verifier and is not the full keyboard proof).
- Command: `node .playwright-tmp/verify-media-archive.mjs` -> pass (13 preview noindex pages, robots exclusion, 404×560 media markup, PNG byte identity).
- Command: `node scripts/validate-js-budget.mjs` -> pass (four JS files, 3100 gzip bytes; this file-budget result does not measure every inline script).
- Command: `git diff --check` -> pass.

The complete Playwright suite and full-site visual/motion audit have not been
run. These focused runs do not waive the outstanding diagram CLI or CV input.
The final browser and static server exited cleanly; only the owned disposable
profile was removed. Archives and evidence screenshots remain local.

## Earlier media candidate (superseded)

- Branch: `codex/career-aligned-portfolio`, with uncommitted implementation.
- Build: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview`.
- Local ignored archive: `.playwright-tmp/portfolio-review.HBecmx/site.tar.gz`.
- SHA-256: `57cf783f1c5c980224e46e5f73ec9a5e5ec59717318012a78f7006c8a4e853ee`.
- Archive made read-only after creation. Verify the checksum before use.
- Contents: generated static site only; no source checkout or CV attachment.
- Local build time: 2026-09-06 19:10 Europe/London.

The build, 13-route smoke, 13-file HTML validation, and JavaScript budget
(four files, 3100 gzip bytes) passed. All 13 pages contain preview noindex.
This establishes a fixed candidate to review, not browser or release approval.

This candidate includes the approved SkillsBar native fixture, corrected
404×560 image dimensions, historical caption, and mobile reading-target correction.
The earlier September 6 archive (`cb801869…`) remains local but is superseded
for current-candidate review. Its bounded no-JS/Back proof does not cover this
media-updated archive; the new archive has not yet been browser-verified.
Normal production output was rebuilt after packaging; the archive retains the
explicit preview metadata. Parser-based checks verified one noindex/nofollow
robots meta element on each page and the disallow-all robots.txt body.

- Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
- Command: `node scripts/smoke-pages.mjs && node scripts/validate-html-output.mjs && node scripts/validate-js-budget.mjs` -> pass (13 routes, 13 HTML files, four JS files/3100 gzip bytes).
- Command: `node .playwright-tmp/verify-media-archive.mjs` -> pass (13 parsed noindex pages, robots exclusion, 404×560 markup, and PNG byte identity in extracted archive).
- Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass (normal production output restored).

The initial inline verifier invocation was blocked by the execution hook; the
same read-only verification was saved as an inspectable local script and passed.
Saved mobile/desktop ordinary viewport captures bind to this new checksum.

## Current-archive media proof

Command: `node .playwright-tmp/verify-fixed-media.mjs` -> pass using the approved
disposable Chrome 152 CDP session and loopback static archive server. At 320×800
and 1440×1000, page identity, meaningful H1, absent framework overlay, PNG natural
and declared dimensions, caption caveat, horizontal containment, and the link to
the safe-data demo passed. No page or console errors were captured. Reduced
motion was requested; this is not a full motion audit.

The initial capture-position assertion failed at a fractional viewport boundary.
Explicitly centring the figure retained the strict containment assertion and
passed. No source CSS was changed or overflow hidden to obtain the result.

Evidence under `.playwright-tmp/portfolio-review.HBecmx/`:

- `skillsbar-320-entry.png` and `skillsbar-1440-entry.png`: initial viewports.
- `skillsbar-320-figure.png` and `skillsbar-1440-figure.png`: ordinary viewport
  screenshots containing the complete image and caption; visually inspected.
- `media-results.json`: checksum-bound results and measured figure rectangles.

The browser and artifact server exited cleanly; only this run's disposable
profile was removed. Screenshots, extracted artifact, and archive remain local.
This proves the sampled media flow, not the full rendered suite, no-JS/Back
behavior of this archive, zoom, assistive technology, or visual parity.

Independent review: on September 6, DATA inspected both complete-figure
screenshots, `media-results.json`, and the capture schema/template/metadata diff
for checksum `57cf783f…`. DATA reported no blocking visual finding in those two
views: the figure and caption fit, desktop does not upscale the image, and the
mobile caption carries the essential meaning that the small illustrative raster
text cannot. This accepts only the two static media views, not full C04/D07,
all-input accessibility, or the whole portfolio.

## Current-archive render-flow proof

Command: `CHROME_CDP_URL=http://127.0.0.1:9223 node /Users/jamiecraik/dev/websites/scripts/validate-render-flow.mjs` -> pass (13 routes across 375×812, 390×844, 768×1024, and 1440×1000).

Working directory was `.playwright-tmp/portfolio-review.HBecmx/runner`, whose
`dist` link resolves to the extracted fixed archive at `../site`. The repository
validator was unchanged and served those static bytes from its managed server.
It checked non-carousel horizontal overflow, meaningful body text, main/header/
footer geometry, buttons below its 24px threshold, and completed images with
zero dimensions. This is not a 44px touch-target, internal text-clipping,
keyboard, zoom, screen-reader, or full accessibility proof. The validator closed
its server; the disposable Chrome process exited and its owned profile was
removed. The extracted artifact and screenshots remain available.

## Current-archive no-JS and automated accessibility

Command: `node .playwright-tmp/verify-fixed-accessibility.mjs` -> pass against
archive `57cf783f…`, using a fresh approved disposable Chrome/CDP session.
All 13 routes returned HTTP 200 with meaningful H1 content and preview noindex
metadata with JavaScript disabled at 320×800. Home → About via the header link →
browser Back returned to Home with the Start with SkillsBar link visible.
This proves real history navigation, not back-forward-cache restoration.

The existing `@axe-core/playwright` dependency reported zero violations across
all 13 routes at both 320×800 and 1440×1000, using its default rules as in the
repository smoke test. Results are saved in
`.playwright-tmp/portfolio-review.HBecmx/accessibility-results.json` with the
archive checksum. No browser dependencies were added.

The initial navigation locator incorrectly required uppercase `ABOUT`; source
labels use `About` with CSS presentation. That run stopped before clicking.
The corrected case-insensitive accessible-name locator passed. This was test
setup, not a site defect. Browser and static server exited cleanly; the owned
disposable profile was removed. Manual keyboard/screen-reader coverage, actual
browser zoom, and dynamic-state accessibility remain unproven by these scans.

Independent evidence inspection: DATA parsed `accessibility-results.json` and
inspected the passing command output for this exact archive, confirming 13
no-JS routes, the no-JS Home/About/Back result, and 26 zero-violation axe scans.
DATA did not independently rerun the browser. This review does not expand the
scan coverage into manual accessibility acceptance.

## Current-archive keyboard and reduced motion

Command: `node .playwright-tmp/verify-fixed-keyboard.mjs` -> pass on archive
`57cf783f…` at 1440×1000 in an approved disposable Chrome/CDP session.
Actual Tab traversal reached 31 homepage controls, 24 SkillsBar case-study
controls, 23 Skills SDK controls, and 14 demo controls, including header and
footer regions. Every forward stop had focus-visible, a non-none outline of at
least 2px, and viewport intersection after scrolling settled. Shift+Tab matched
the reverse label order. Header About activated with Enter; demo Security
activated with Enter and Ready with Space, updating exclusive pressed states.

Fine-pointer CTA hover started an animation; changing reduced-motion preference
cancelled it. Subsequent reduced-motion hover had no fill animation. Work-card
pointer feedback remained active but centred, with no arrow transition. These
assertions follow the existing CTA/pointer test contracts; this was not a run of
the full Playwright suite. Results are in `keyboard-results.json` beside the
archive.

The initial immediate viewport check ran before focus scrolling settled;
bounded polling confirmed visibility. A second failure exposed CSS string
serialization: `0.000px` is equivalent to the expected `0px`. The repository
pointer test and local verifier now accept only zero-valued pixel strings
(`^0(?:\.0+)?px$`), preserving rejection of nonzero offsets and other units.
No runtime source or archive bytes changed. Browser/server exited cleanly and
the owned disposable profile was removed.

Limitations: desktop four-route keyboard sample, not all-route/mobile keyboard
coverage or screen-reader testing; viewport intersection does not prove an
unobscured focus indicator. No actual 200% browser zoom, coarse-pointer behavior,
or comprehensive motion audit is claimed.

DATA independently inspected the verifier, parsed results, and final passing
command outputs. Reverse traversal compares labels only; duplicate labels mean
it does not prove unique element identity or reverse focus visibility. Forward
traversal's 100-step ceiling is not asserted as a failure if exhausted. Widened
keyboard proof must use unique element identities, independently validate
reverse focus, and fail explicitly on bounded-loop exhaustion.

## Runtime prerequisite

Supported in-app tab access now works. Development-preview checks run at port
4324 after port 4321 was observed serving stale CSS. Those results are documented
in `runtime-recovery.md`; they are not evidence that this archive was rendered.

The connection exposes viewport sizing but no documented browser zoom,
reduced-motion, touch-emulation, or JavaScript-toggle control. Full-page capture
also produced a stitched-image artifact; use ordinary viewport captures until
that issue is resolved. Complete the remaining tests through the approved
external CDP route bound to this fixed candidate. Do not retry sandbox Chromium
or execute the dirty checkout on the host.

The runtime owner must approve serving this archive through the existing local
artifact route. A checksum does not itself grant runtime trust. No upload,
deployment, profile mutation, or publication is authorized.

## Required review

Review every route at 320px, tablet, 1280/1440px and 200% zoom. Check keyboard
focus, touch targets, overflow, image/diagram meaning, backgrounds, no-JS
navigation, real back navigation, reduced motion, and pointer changes. Run
prepared lifecycle regressions where the approved test runtime supports them.

## September 13 current-head in-app browser refresh

The signed reconciled checkout at `8b95baf` was built with
`npm run validate:source` and served locally with
`npm run preview -- --host 127.0.0.1 --port 4323`. The supported in-app browser
inspected the current output rather than a historical archive.

At 1440×1000, all 13 HTML routes were nonblank, exposed an `h1`, retained
navigation, main and footer landmarks, and reported no document-level horizontal
overflow. At 375×812, Home, About, Writing, Contact, Proof, both featured case
studies, and the SkillsBar demo reported the same structural and overflow
results. The Home portrait resolved to its expected 96×96 intrinsic derivative
after page load. The sampled mobile action inventory contained no visible target
below 24px in either dimension.

The SkillsBar demo accessibility tree exposed the three scenario controls as
named checkboxes. Activating `Security flagged` changed the selected state from
`Candidate held` to `Security flagged`, readiness from 11/100 to 24/100, and the
next action to `Security review`. This proves current-build semantic exposure and
one real interaction path; it is not a screen-reader session, no-JavaScript run,
or exhaustive keyboard audit.

The in-app browser exposes viewport sizing but no documented browser-zoom
control. Repeated platform zoom shortcuts left the measured 1280×720 CSS
viewport unchanged, so native 200% zoom remains unproven. This is a capability
limit, not a site failure. Lighthouse and public-safe CV review also remain
separate open lanes.
Keep synthetic lifecycle tests separate from real back-forward-cache proof.
Record screenshots and results against this archive checksum, not a later build.
