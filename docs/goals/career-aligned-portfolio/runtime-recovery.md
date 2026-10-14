# Runtime recovery and focused CLI evidence

## September 6 approved media and design-skill pass

Jamie approved the exact historical SkillsBar native demo fixture. The public
copy preserves its PNG bytes; the content schema and figure declare its true
404×560 dimensions, alt text, and historical/demo qualification. The caption
distinguishes the registry baseline from candidate proof and the separate web
demo fixture.

The requested Emil design engineering, design foundations, and UI polish pass
retained static presentation, existing spacing/radius tokens, and a separate
readable caption. No animation or new styling system was introduced. Image
dimensions reserve the correct aspect ratio; this is not a measured CLS result.

- Command: `npm run validate:source` -> pass after the corrected dimensions and caption (fast checks, Astro check, build, 13-route smoke, HTML validation).
- Command: `node scripts/validate-js-budget.mjs` -> pass (four files, 3100 gzip bytes).
- Command: `bash scripts/refresh-diagram-context.sh --force` -> blocked (diagram CLI unavailable; command exited 1).
- Fresh built preview: `http://127.0.0.1:4326/work/skillsbar/` served HTTP 200 and the corrected `height="560"` and caption. The older development preview at port 4325 still exposed `height="594"` and stale copy; it was not used as proof of the correction.
- Ordinary in-app viewport samples at 320×800 and 1440×1000 showed the figure and caption portions without sampled horizontal overflow. At 320px, the image measured approximately 226×313px inside its section. These were partial viewport samples, not complete saved figure captures or all-route acceptance. Temporary viewport overrides were reset.

The new Playwright media contract has been collected but not executed. Saved
complete-figure mobile/desktop screenshots, a refreshed immutable preview
archive, and current-candidate rendered validation remain pending. Earlier
fixed-archive no-JS/Back checks do not cover this media-updated candidate.

Current-proof correction: older render-flow results below are historical. They
predate later copy and interaction changes and do not prove current responsive
layout, accessibility, or stability. C02, C03, and D03 remain partial.
The latest `node scripts/validate-js-budget.mjs` passed with four JavaScript
files totaling 3100 gzip bytes.

Observed on 2026-09-04. The revised task permission profile permits normal
managed command execution and `apply_patch`. Contact now consumes the shared
email, GitHub, and LinkedIn values from `src/lib/public-profile.ts`.

## CLI evidence

September 6 clean-revision update: archived the case study's pinned wSearch
revision `60c1389a3ee209997deb8cf534599be4a8d84e53` into an isolated temporary
directory. Archive SHA-256:
`3972b327c79a0b3e9a86b16bb15678b7d06142977600167baf69afe68beaed0c`.
Archive entries contained no traversal, absolute paths, or links. The existing
dirty wSearch checkout was not changed or used for execution.

Command: `npm ci --ignore-scripts --no-audit --no-fund --cache /private/tmp/portfolio-wsearch-proof.k5n3oP/npm-cache`
-> pass in `/private/tmp/portfolio-wsearch-proof.k5n3oP` (186 packages).
Command: `npm test -- tests/cli.test.ts -t 'returns JSON error envelope with E_POLICY when network is disabled|renders help command cleanly'`
-> pass in that isolated directory: two passed, 79 unrelated tests skipped.
This establishes clean-revision offline help/policy evidence, not live retrieval,
installed-release behavior, or rSearch execution. No install scripts ran.

The two checks were also run with `--reporter=json --outputFile=offline-results.json`
to retain machine-readable evidence: pass, two passed, zero failed, 79 skipped.
Preserved copy: `.playwright-tmp/portfolio-review.gjPr98/wsearch-offline-results.json`.

Command: `env -i PATH=/Users/jamiecraik/.local/share/mise/installs/node/latest/bin:/usr/bin:/bin XDG_CONFIG_HOME=/private/tmp/portfolio-wsearch-proof.k5n3oP/config node node_modules/tsx/dist/cli.mjs src/cli.ts --network --non-interactive --json --user-agent 'PortfolioProof/1.0 (https://github.com/jscraik/wSearch)' --timeout 10000 --retries 0 --output /private/tmp/portfolio-wsearch-proof.k5n3oP/q42-result.json entity get Q42`
-> pass in the isolated pinned-source directory: exit 0, schema
`wiki.entity.get.v1`, status `success`, data ID `Q42`, type `item`, and object
statements. The source default endpoint is Wikidata's public REST API; the
environment was cleared and no credentials or existing config were supplied.
This is one successful live source-CLI retrieval, not an installed release or
service-reliability claim. It supersedes the prior unverified retrieval limit
for this exact wSearch command only. Public case-study copy awaits consolidation.
Raw result: `.playwright-tmp/portfolio-review.gjPr98/wsearch-q42-result.json`,
SHA-256 `f7bb35b9d17c161b166f435430c255789f02dff7fb59b2baf0f6c3ffef52275d`.

In the wSearch checkout:

Command: `npm test -- tests/cli.test.ts -t 'returns JSON error envelope with E_POLICY when network is disabled|renders help command cleanly'` -> pass (2 tests passed, 89 unrelated tests skipped).

The inspected tests launch the real CLI with isolated temporary configuration.
They verify a `wiki.error.v1` envelope with `E_POLICY` when network access is
disabled, and successful help output. This proves help and policy rejection;
it does not prove successful Wikidata retrieval or the installed package.

In the rSearch checkout:

Command: `npm test -- tests/cli.test.ts -t 'outputs dry-run plan without downloading|returns warn status for dry-run with invalid ID'` -> blocked (mise rejected the resolved checkout's untrusted configuration before tests started).

The inspected fixtures use a data-URL test client. Neither selected test ran,
and no runtime trust setting was changed. B05 remains partial until useful
command input/output evidence is incorporated into the case study.

## Clean rSearch planning-output evidence

Isolated source revision `40449ebb0e9d439870e02aaccf6143a53e68215e` was
archived without modifying the original checkout or runtime trust. Archive
SHA-256: `a5206cce9edde07ad2ce41bd9fb8a14bfefa1f259bd10921eee26f8e8b44f66f`.
Archive inspection found no absolute/traversal paths or links before extraction.

Command: `npm ci --ignore-scripts --no-audit --no-fund --cache /private/tmp/portfolio-rsearch-proof.oWZECQ/npm-cache`
-> pass in `/private/tmp/portfolio-rsearch-proof.oWZECQ`, 246 packages installed.
Command: `npm test -- tests/cli.test.ts -t 'outputs dry-run plan without downloading|returns warn status for dry-run with invalid ID' --reporter=json --outputFile=offline-results.json`
-> pass: two passed, zero failed, 40 unrelated tests skipped.
The post-run lockfile, CLI source, and test blob hashes matched the pinned tree.
Structured report: `.playwright-tmp/portfolio-review.gjPr98/rsearch-offline-results.json`.

The tests launch the CLI with a test client and data-URL API fixture. Valid
`2101.00001` yields exit 0, `arxiv.download.dryrun.v1`, one matching ID, and
`would-download` or `would-skip`. Invalid `....` yields exit 4, `warn`,
`would-fail`, and `dry_run_failure`. These assertions prove planning output,
not absence of all filesystem/network effects, live arXiv retrieval, successful
downloads, or installed-release behavior. Independent DATA review parsed both
passing cases and inspected their assertions.

Public case-study copy now distinguishes these planning checks from wSearch's
live request. Command: `npm run validate:source` -> initially fail (the smoke
test required superseded copy); after updating the smoke assertions to require
both output schemas and the planning-output boundary, pass at 23:10 on September
6, including 13-route smoke and 13-file HTML validation. Fresh rendered proof
is pending; archive `622468cf…` still contains the prior public copy.

## Infrastructure evidence

In the Configs checkout:

Command: `bash .codex/skills/config-drift-guard/scripts/run_guard_checks.sh` -> pass (config, hooks, 26 projection checks, and runtime config path).

That baseline did not cover the sessions writable-root problem. The changed
task permission profile, followed by successful managed execution and patching,
is the direct evidence that the patching blocker is resolved. Browser operation
must be checked independently; old stale-server results are not current proof.

## Current candidate checks after Contact correction

- Command: `ASTRO_TELEMETRY_DISABLED=1 npm run check` -> pass (0 errors, 2 existing Zod deprecation hints).
- Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass (13 pages).
- Command: `node scripts/smoke-pages.mjs` -> pass (13 routes).
- Command: `git diff --check` -> pass.

After planned-study copy was incorporated into About and the crawler outputs
were added, `npm run validate:source` passed on the accumulated candidate at
21:39 on September 4: fast validators, Astro checking (0 errors, 2 existing
hints), production build, 13-route smoke, and 13-file HTML validation. This
includes the button lifecycle source changes but does not provide browser proof.
- Command: `npm run validate:render-flow:artifact` -> blocked (managed sandbox denied the localhost listener).
- Command: `npm run validate:render-flow:artifact` with additional managed network permission -> blocked (listener started, but Chromium exited during launch).

The final attempt separates the listener restriction from the remaining browser
launch restriction. It did not render a route. No host execution was used for
these candidate checks.

## CLI case study and preview indexing

The CLI case study now includes the observed help and policy-rejection inputs,
expected envelope fields verified by the passing tests, role boundaries, and
source links. Successful retrieval and rSearch runtime proof remain incomplete.

Use `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` for a preview
artifact with `noindex, nofollow` on every HTML route. A check of all 13 generated
HTML files passed. This is an indexing instruction, not access control or
authorization to publish. Development mode also emits the instruction.

This preview build is opt-in. `npm run preview` only serves the existing build;
it does not change its indexing metadata. Run the explicit preview build first.
Do not infer that every local server or preview deployment is protected.

A normal `ASTRO_TELEMETRY_DISABLED=1 npm run build` preserves production indexing:
all 13 generated HTML files were checked for absence of that preview directive.
The smoke and HTML validators then passed. The first CLI smoke run failed on
the existing required phrase "source and package contracts"; the evidence text
was corrected to retain that accurate description, and the rerun passed.

The original local wSearch revision link returned HTTP 404. The public link now
uses `60c1389a3ee209997deb8cf534599be4a8d84e53`, which returned HTTP 200;
both named test definitions were verified in that revision's raw source.
Execution occurred in a dirty local checkout. The public link identifies
definitions, not the exact executed tree. Clean-revision execution remains missing.

HTTP HEAD checks also returned 200 for Skills SDK, its pinned command-contract
page, SkillsBar, SkillsBar PR 6, and rSearch. Subsequent HEAD checks returned
200 for GitHub's profile, X, and the non-www LinkedIn URL. The www LinkedIn URL
returned 999; its profile content remains unverified by this automated check.
HTTP availability does not verify account ownership or the content behind a
login/interstitial. No profile was edited and the URL was not changed to evade
the response.

The polish expectations follow existing source contracts: the footer's
`.footer-profile-card.profile-row` rule in `src/styles/global.css` specifies
opaque `var(--soft-white)`, and the desktop and compact Blog rules in
`src/styles/route-rhythm.css` set the header to `background: var(--paper)`.
That shorthand removes the gradient. The corrected assertions retain exact
color/image expectations; stale-server measurements are not their authority.

## Button lifecycle correction

Source inspection found that changing from a fine pointer could leave a fill
inside the arrow, because mouseleave returned early after the capability change.
It also found that pagehide removed the reduced-motion listener permanently for
a page restored from the back-forward cache. The component now resets fills on
pointer-capability loss and pagehide, retains preference handling, and permits
mouseleave cleanup regardless of pointer capability.

- Command: `ASTRO_TELEMETRY_DISABLED=1 npm run check` -> pass (0 errors, 2 existing hints).
- Command: `npm run validate:astro-anti-patterns` -> pass (23 source files).
- Command: `git diff --check` -> pass.

Runtime pointer switching, back-forward restoration, and reduced-motion behavior
still require browser verification. This source correction does not close C05/C06.

`tests/a11y/button-lifecycle.spec.ts` now checks fill restoration when pointer
capability changes and when pagehide/pageshow events occur. It uses a controlled
media-query event and synthetic page lifecycle events, so even a future pass
will need a real back-navigation spot check for full browser-cache proof.
Command: `node node_modules/@playwright/test/cli.js test tests/a11y/button-lifecycle.spec.ts --list` -> pass (four discovered cases across desktop/mobile).
Listing proves test discovery only. No browser was launched and no runtime pass
is claimed for these tests.

## September 6 supported in-app browser recovery

Selecting the current portfolio tab succeeded after refreshing its tab identifier.
The earlier undefined-get failure is no longer the current access state. Both
accessibility and DOM snapshots returned the live homepage at localhost:4321.

Development-preview checks completed through the supported browser interface:

- Viewport override: 320 by 800 pixels. Homepage screenshot inspected; the
  career heading, introductory copy, portrait, navigation, and start links render.
- DOM measurements on `/`, `/now/`, `/blog/`, `/contact/`, `/proof/`,
  `/work/skillsbar/`, `/work/skills-sdk/`, `/work/cli-proof-series/`, and
  `/demos/skillsbar/`: `innerWidth` and document `scrollWidth` both equal 320.
  The eight non-home routes returned an H1 and zero completed images with zero
  natural width. This does not check images that have not finished loading.
- On `/demos/skillsbar/`, pressing Enter on the Security flagged button set its
  pressed state and displayed Security review is flagged with readiness 24/100.
  Pressing Space on Evidence current set `aria-pressed=true` and displayed
  Evidence chain is current.
- The temporary viewport override was reset after testing.

Additional development-preview checks on September 6:

- Homepage at 768 by 1024, About at 1440 by 1000, and both featured case
  studies at 1280 by 900: document width matched viewport width. First-viewport
  screenshots showed meaningful content without a framework error overlay.
  These are sampled surfaces, not an all-routes viewport matrix.
- Primary navigation About click, awaited with `expectNavigation` for `/now/`,
  returned the About URL and title. Browser Back, awaited with `waitForURL`,
  restored `/`. Clicking the homepage carousel Next button then enabled Back.
  An earlier immediate sample observed the old URL; it is not a passing
  navigation check. An immediate About heading visibility sample returned false;
  a later direct-navigation screenshot visibly rendered that heading. Complete
  transition-timing and focus verification remains open.
- Captured warning/error logs returned an empty list on the homepage and
  Skills SDK page. This covers captured logs only, not every route or session.
- All viewport overrides were reset after these checks.

The remaining four routes were then measured at 320 by 800:
`/articles/when-evidence-goes-stale/`, `/articles/why-ai-native-devrel/`,
`/work/ai-native-devrel/`, and `/work/brainwav-io/`. Each returned its expected
H1 and document width 320. Together with the earlier nine routes, this covers
all 13 generated HTML routes for page-level horizontal overflow at that width.
It does not prove absence of internal clipping, overlapping elements, or
offscreen content. The viewport override was reset.

Keyboard Enter on the homepage skip link set the URL fragment to
`#main-content` and `document.activeElement` to `MAIN#main-content`.
Keyboard Enter on the primary About link subsequently reached `/now/` with
the About H1 and no captured warnings/errors. The navigation-wait helper timed
out before that successful destination inspection; preserve that timeout as
an observation limitation, not a clean helper pass. Focus on the destination
was BODY; destination focus management is not claimed verified.

Capability discovery advertised browser visibility and viewport sizing, and
tab page-assets access only. No documented zoom, reduced-motion emulation,
touch emulation, or JavaScript-toggle capability was available through this
connection. Those tests need another approved supported testing route; viewport
resizing must not be substituted for 200% browser zoom.

A subsequent 1440 by 1000 development-preview measurement covered all 13 HTML
routes on September 6. Every route returned an H1, document width 1440, zero
completed images with zero natural width, and no own-element hidden horizontal
overflow among main paragraphs, H1/H2/H3 headings, preformatted text, and code.
The aggregate assertion passed for 13 routes and the viewport override was
reset. This extends desktop measurements beyond the earlier screenshots; it
does not provide full-page screenshot inspection, ancestor/vertical clipping
coverage, or production-artifact browser evidence.

These checks passed for the running development preview. They are not an
immutable-production-artifact receipt, full route coverage, a complete keyboard
or accessibility audit, motion verification, or visual-reference parity proof.
Full tablet/desktop coverage, 200% zoom, transition/focus behavior, reduced
motion, touch, no-JS, and final production-artifact capture remain incomplete.

## Sitemap and robots output (recorded build evidence)

### Approved fixed-artifact no-JavaScript test

Jamie approved the CDP session and previously identified project media on
September 6. The public-safe CV contents remain missing; approval does not
provide the draft or authorize publishing the private original.

Archive `cb801869b39c84e3897d27be7de94815c75df5f5a011f25bdf01ef5a5dba5406`
was checksum-verified and served by a managed loopback-only static server at
port 4323. Chrome 152.0.7977.82 ran through the approved host execution boundary
with a newly created empty temporary profile and CDP port 9223. No existing
profile or tab inventory was reused.

With JavaScript disabled and a 320 by 800 viewport, all 13 routes returned HTTP
200, a nonempty rendered H1, and the expected noindex/nofollow meta directive.
The primary About link navigated to the About heading. An initial Back check
timed out awaiting `load` despite reaching `/`; a bounded repeat awaited the
navigation commit and the visible Start with SkillsBar link and passed.
This verifies no-JavaScript content and native navigation for the fixed build,
not every interactive control or complete accessibility.

Both owned processes exited after the test. The disposable Chrome profile was
removed; the fixed archive and extracted static files remain local. Remaining
motion, touch, zoom, and full accessibility checks are not claimed complete.

### Mobile reading-target correction

On September 6, the homepage case-study and Keep reading links measured 42px
tall at 320px. More-specific feature and blog rules overrode the shared 44px
minimum. Removing those two redundant declarations restores the shared minimum.
The Home icon's smaller visual box has an existing negative-inset pseudo-element
hit-area extension; it was not changed. Demo controls already measured 44px.

The old preview at port 4321 continued serving the removed CSS rule even after
reload. A fresh managed development server was started at port 4324; the existing
server was preserved. On the fresh preview, all three reading links measured
44px tall at 320, 768, and 1440px, with widths exceeding 44px. The viewport was
reset. Earlier port-4321 measurements must not prove this corrected candidate.

- Command: `npm run validate:source` -> pass after the CSS/test patch, including
  fast checks, Astro checking, production build, 13-route smoke, and HTML checks.
- `tests/a11y/polish.spec.ts` now checks all three links at those three widths.
  Browser automation above exercised the same rendered size assertions. Full
  Playwright-suite execution remains unverified under the current browser policy.

The touch-and-accessibility skill's 44px target requirement guided this fix.

After the correction, a 320px audit on fresh port 4324 covered links and enabled
buttons within the site header, main, and footer on all 13 routes. No measured
target was below 44px (allowing 0.1px subpixel tolerance), including absolute
pseudo-element hit-area extensions. Hidden and zero-size controls were excluded.
The initial numeric helper used an unavailable `parseFloat` global; the corrected
read-only evaluation used `Number.parseFloat` and completed for every route.
This passes CSS target geometry, not touch-device input, hit interception,
overlap, keyboard order, or complete accessibility. The viewport was reset.

On fresh port 4324 at the browser's default 944 by 964 viewport, keyboard Enter
on Skip to main content focused the main landmark. The following Tab moved to
Start with SkillsBar. Fifteen further Tab presses traversed the other three
start links, both featured case-study links, five work cards, carousel Next,
three writing-preview links, and Keep reading. All 16 visited controls matched
`:focus-visible`, had a solid 2px neutral outline, and intersected the viewport.
Disabled carousel Back was skipped. This verifies homepage main-content forward
Tab traversal; header/footer, reverse traversal, other routes, screen readers,
full outline visibility, and transition focus management remain unverified.

### Mobile Contact visual inspection

At 390 by 844 on fresh port 4324, normal viewport captures at the top, after
PageDown, and after End showed the Contact heading, portrait, complete role
framing, email, profile links, and footer. No additional overlap or truncated
copy was found in these sampled views. The large editorial heading and generous
footer spacing were preserved. Browser recording/debug overlays are not site
content. The viewport override was reset.

The browser's full-page capture duplicated lower content and scaled it into part
of the image. It is not accepted as layout evidence: the live page measured 390px
wide by 1948px tall with one footer, and ordinary scrolled captures did not show
the duplication. Use viewport captures for further visual review until that
capture behavior is resolved. This inspection used the UI review skill but does
not establish all-route visual or accessibility acceptance.

September 6 refresh after profile cleanup:

- Command: `npm run validate:js-budget` -> pass (fresh production build of
  13 pages; four JavaScript files, 3100 gzip bytes). npm emitted warnings for
  unsupported project configuration keys; the command exited zero.
- Development preview at 320px: no sampled `main` paragraph, H1/H2/H3,
  preformatted, or code element on About, SkillsBar, Skills SDK, or CLI Tools
  had horizontal scroll width exceeding its client width by more than two
  pixels while its own horizontal overflow was hidden or clipped.
  This narrow diagnostic does not cover clipping by ancestors, vertical
  clipping, all elements, or all routes. The viewport override was reset.

`src/pages/sitemap.xml.ts` derives static Astro routes and published work routes.
`src/pages/robots.txt.ts` points production crawlers to that sitemap. A direct
comparison of generated sitemap locations with every generated HTML path passed:
13 unique canonical URLs, with no missing or extra HTML routes.

The explicit preview build emitted an empty sitemap, `Disallow: /` in robots,
and noindex/nofollow on all 13 HTML pages. These are crawler requests, not access
controls or proof that a previously indexed URL has been removed.

- Command: `ASTRO_TELEMETRY_DISABLED=1 npm run check` -> pass (0 errors, 2 hints).
- Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build -- --mode preview` -> pass.
- Generated preview checks: robots exact body, empty sitemap, and all-page noindex -> pass.
- Command: `ASTRO_TELEMETRY_DISABLED=1 npm run build` -> pass; normal production output restored.
- Command: `node scripts/smoke-pages.mjs` -> pass.
- Command: `node scripts/validate-html-output.mjs` -> pass.
- Command: `git diff --check` -> pass.
