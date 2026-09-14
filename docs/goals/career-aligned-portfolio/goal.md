# Career-aligned portfolio

## Objective

Create a locally reviewable, Portfolio-standard site that presents Jamie's move
into professional software development, established leadership and instruction
experience, and credible independent AI-assisted software work without implying
employment credentials that the evidence does not support.

## Scope

- Public portfolio routes, shared metadata, repeated public facts, project case
  studies, writing inventory, contact framing, and public-safe CV candidate.
- Source-backed project claims for SkillsBar, Skills SDK, wSearch, rSearch, and
  SynAIpse where current project sources support them.
- Responsive, accessible, progressively disclosed presentation and the tests,
  screenshots, and local preview needed to prove it.
- Current branch: `codex/career-aligned-portfolio`.
- Starting revision: `ad329f6b5202de84f748e4d2edf5efd9ebce0413`.

## Completion condition

The local site is coherent and reviewable, contains at least two source-backed
featured projects, has no known material defects, has a working preview, and
records honest evidence for every acceptance item below. Blocked evidence keeps
the corresponding item incomplete.

## Boundaries

- No deployment, publication, push, pull-request mutation, external-profile
  change, or private-memory change.
- Do not expose private source material, local machine paths, secrets, health
  detail, or unsupported education, employment, impact, or proficiency claims.
- The career-switch mantra is decision context only and must not appear as
  public copy.
- Jamie's visual acceptance and any publication decision remain separate.

## Acceptance checklist

Each item records current evidence and the next action where proof remains incomplete.

### A. Claims and career facts

- [x] **A01** — status: `pass`; evidence: `src/lib/public-profile.ts` and public-source stale-claim scan; 22 years of Army service and 7.5 years at Warrant Officer rank are stated without equating that period to WO1.
- [x] **A02** — status: `pass`; evidence: homepage, About, Contact, footer, Blog, RSS, metadata, and DevRel article now frame a move into professional software development; stale-copy scan returned no matches.
- [x] **A03** — status: `pass_source`; evidence: About now presents the confirmed UCNL HNC pathway and Google Project Management/Cybersecurity certificates as planned study only, with dates unconfirmed and no enrollment or completion claim. The source gate passes. Provenance: intended-study decisions relayed by the coordinating DATA task; no awarded qualification is inferred.
- [x] **A04** — status: `pass`; evidence: About distinguishes independent work since November 2024 from employment and education and adds no health disclosure.
- [x] **A05** — status: `pass`; evidence: repeated public facts and destinations are centralized in `src/lib/public-profile.ts`.

### B. Information architecture and case studies

- [x] **B01** — status: `pass_source`; evidence: homepage names software direction, prior leadership, independent work, and an exact primary SkillsBar CTA; source/build/smoke gates pass.
- [x] **B02** — status: `pass_source`; evidence: SkillsBar and Skills SDK are featured first, CLI Tools supports them, and SynAIpse is intentionally omitted because no source repository was found.
- [x] **B03** — status: `pass_source`; evidence: SkillsBar case study retains problem, behavior, constraints, decisions, evidence, caveat, contribution, and working internal routes.
- [x] **B04** — status: `pass`; evidence: Skills SDK case study is bound to inspected revision `d7eb05289d321c03ddd47b49c6b292b56e510463`; offline validate fixture returned typed pass and invalid-revision blocked outcomes with no mutation.
- [x] **B05** — status: `pass_bounded`; evidence: the CLI case study now includes two clean-revision wSearch offline checks, one live Q42 retrieval with bounded network settings, and two clean-revision rSearch fixture-backed planning checks. Retained reports, exact commands, source hashes, and limits are in `runtime-recovery.md`. Both pinned evidence links returned HTTP 200. Independent review accepted the claims and all 24 mobile/desktop CLI captures on `4f570752…`. Installed releases, service reliability, and live rSearch retrieval/downloads are explicitly not claimed.
- [x] **B06** — status: `pass`; evidence: `/proof/` now derives published project entries from the same content collection and preserves compatible work routes.
- [x] **B07** — status: `pass`; evidence: AI DevRel is no longer featured and its article remains under Writing with historical framing.
- [x] **B08** — status: `pass`; evidence: published articles lead the Blog and planned pieces are explicitly labeled “Writing next.”
- [x] **B09** — status: `pass_source`; evidence: About presents verified service, leadership, instruction, independent work, and current software learning without recovery-led branding or unsupported course claims.
- [x] **B10** — status: `pass_source`; evidence: Contact supports software roles and collaboration using centralized email, GitHub, and LinkedIn destinations.
- [ ] **B11** — status: `partial_review`; evidence: `Jamie-Scott-Craik-public-CV-review.docx` is a private, two-page review candidate derived only from the repository's public profile and source-backed case studies. It includes public email/GitHub/LinkedIn destinations, 22 years of Army service including 7.5 years at Warrant Officer rank, independent portfolio work since November 2024, and bounded SkillsBar, Skills SDK, and CLI evidence. Both rendered pages were inspected with no clipping or layout defect. The final 40,150-byte DOCX has SHA-256 `d683bd8ef4a695bfdb64c479b1cd37d151f0f959f106d133573e2ae80531b9f1`, zero `rsid*` attributes, empty creator/last-modified-by values, no custom properties, no phone-like data, and 13 explicit public hyperlinks. The document labels itself `NOT APPROVED FOR PUBLICATION`; Jamie's wording/selection approval and any public download remain pending. The original private CV is not copied into this repository or public output.

### C. Visual system and interaction

September 6 latest candidate: archive `9f9ec46e…` repairs mobile project titles
and attribution headings. The focused five-route/four-width heading test passes;
independent focused review and the 144-pass isolated aggregate are complete. Earlier bounded
repairs cover About, Contact, Blog, Proof endpoints, article gutters, and project
illustration labels. Both articles have complete 320/1440px visual acceptance on
`803409c7…`; all five project pages were fully inspected at those widths on
`5f2d11c5…`, with the newly repaired headings the outstanding findings. Measured
story and overview paragraph gaps are consistent, so no spacing repair was made.
These records preserve exact candidate scope rather than imply full acceptance.
See `browser-handoff.md` for exact hashes, commands, and remaining proof.

Reconciliation: the project-heading captures on `9f9ec46e…` have independent
acceptance. On `622468cf…`, all three demo scenarios' changed regions at
320/1440px and all 30 preserved frames across the three complete scenario pages
are independently accepted for layout, type, spacing, and clipping. This supersedes
the pending-heading/demo-region wording in historical item evidence below,
without closing C04. C02 and D07 were subsequently closed by the current
52-case all-route matrix. The current instrumented aggregate passed
148 tests with ten skips, separately from the preserved 147-pass/one-failure
aggregate. The intermittent animation-start failure remains unexplained and D06
remains incomplete. Native zoom and final static reconciliation are now complete;
dynamic-motion and physical-device review remain separate requirements.

Earlier archive `316956c6…` included fixes for
footer target overlap, carousel boundary focus loss, and clipped focused Proof
cards. All 13 routes passed unique forward/reverse keyboard cycles at mobile
and desktop (560 stops in each direction), five-point target obstruction checks,
render-flow at four viewports, no-JS rendering, Home/About/Back, and 26 axe scans.
Footer captures at 320/1024/1440px have independent DATA acceptance. Exact
commands and limits are in `browser-handoff.md`. Browser zoom, visual/motion
coverage, screen-reader proof, complete gates, CLI evidence, and the public-safe
CV were incomplete at that archive. The current matrix, native zoom, and CLI
records supersede those three historical gaps; dynamic motion, physical-device
operation, screen-reader proof, and the public-safe CV remain incomplete.

- [x] **C01** — status: `pass_source`; evidence: existing editorial tokens and stored-reference structure were preserved.
- [x] **C02** — status: `pass_current_matrix`; evidence: page-surface source policy passes. On current signed head `c50fbfa`, all 13 routes were captured and reviewed at 320×800, 375×812, 768×1024, and 1440×1000: 52/52 returned HTTP 200, retained their `h1`, navigation, main and footer landmarks, had no document-level horizontal overflow, loaded no broken image, and emitted no page error. Contact sheets and representative original-scale full pages were inspected; a suspected Writing navigation shift was rejected with a fresh viewport capture and exact live geometry. This reconciles the preserved article, project, demo, CLI, and bounded route-review records with the current build. Limits: this static matrix and the separate exact native 200% sweep do not claim every physical device, dynamic-motion review, screen-reader operation, or Jose-reference pixel parity.
- [x] **C03** — status: `pass_native_zoom`; evidence: bounded typography screenshot review is complete. DATA independently accepted all 20 current Home lower-work/Writing frames and all 16 current Proof intro/card frames at 320/1440px on `7fd6a76b…`, with no typography findings. Accepted About, Blog and Contact views are reconciled to current markup/CSS; article, project, CLI and demo typography inventories were already accepted. Focused rendered text-rectangle contracts also pass. On current build `8b95baf`, regular Chrome measured exact native 200% zoom through a 1080×1890 outer window, 540×945 CSS viewport and device pixel ratio 4. All 13 routes were nonblank, retained headings and landmarks, had no document overflow and reported no loaded broken images. The earlier bounded 250% Home observation remains supplementary rather than the qualifying proof.
- [ ] **C04** — status: `partial`; evidence: Jamie approved the exact SkillsBar native fixture, with byte/dimension/alt/caption checks and mobile/desktop figure acceptance. Four shared illustrations have 16-case containment/axe proof and accepted 320px visuals on `5f2d11c5…`. All three demo states have accepted 320/1440px visuals across 30 frames on `622468cf…`, plus four focused interaction/clipboard tests. Final preview-to-production artifact reconciliation is complete: images and visible markup are unchanged. Exact native 200% structural/reflow coverage passes across all 13 routes. Limits: sampled viewport acceptance is not exhaustive device coverage; assistive-technology operation remains unverified under C06/D02, not a missing artifact comparison.
- [x] **C05** — status: `pass_current_motion`; evidence: production `7fd6a76b…` passes the retained instrumented motion contracts covering button lifecycle, pointer-capability changes, reduced-motion nav/card behavior, carousel keyboard operation, demo states, pointer cancellation, and real viewport-resize resynchronization. A current eight-case perceptual review captured 56 sequenced frames across Home entry, navigation, CTA, and SkillsBar state changes at 375×812 and 1440×1000 in normal and reduced-motion modes. It found and repaired a specificity defect that left the SkillsBar readiness fill animating for 350ms under reduced motion. The accepted explicit selector reduces that transform transition to 0.01ms; the repeated immutable-build review has no page errors and shows the final 0.24 scale by 100ms at both widths. `review-animations` verdict after repair: Approve. Physical-device gestures and screen-reader operation remain separate C04/C06/D02 evidence lanes.
- [ ] **C06** — status: `partial`; evidence: earlier 13-route target geometry, forward/reverse keyboard cycles and sampled obstruction checks passed; current production aggregate covers reduced-motion controls and demo keyboard activation. The accepted Proof inset ring is retained unchanged. Production emulated touch at 320/393px passes Home/About/Back and CTA/SkillsBar navigation in both motion modes. On `8b95baf`, the in-app accessibility tree exposed all three SkillsBar scenarios as named controls, and activating Security flagged updated its checked state, readiness and next action coherently. Exact native 200% structural/reflow coverage now passes on all 13 routes. No inventoried dynamic-state check remains pending. Assistive-technology operation remains open; accessibility-tree inspection is not a screen-reader session and emulated touch is not physical-device proof.
- [x] **C07** — status: `pass_source`; evidence: project claims colocate evidence and limitations, with featured work before supporting inventory.
- [x] **C08** — status: `pass_bfcache`; evidence: production `7fd6a76b…` passed all 13 no-JS routes at 393/1440px (26 cases), including HTTP 200, meaningful headings/content and basic metadata. The current SkillsBar demo includes a semantic `<noscript>` summary of all three scenario outcomes; the 13-route source/build/HTML gate passes and independent review approved its structure and isolation from the JavaScript path. At desktop and an exact 375×812 content viewport, genuine script-disabled contexts completed Home → About → Back → primary demo and Home → SkillsBar case study → demo; expected headings and all three ordered fallback outcomes were exposed, and mobile Home had no horizontal overflow. On candidate `3dfec5c`, a top-level JavaScript-disabled Chrome/CDP run reported `BackForwardCacheRestore` for Home after Home → About → Back, with no `backForwardCacheNotUsed` event. This supersedes the earlier sandboxed-iframe uncertainty and completes C08.

### D. Verification and release boundary

Current aggregate update (September 8): `7fd6a76b…` passes 154 tests with 12
scoped skips and zero failures, including the added motion and no-script cases.
The no-script test explicitly waits for the finite ancestor entrance animation
after Back before retaining its normal click assertions; six repeated isolated
cases and the full aggregate pass. Earlier 150-pass and two-failure counts below
are historical where cited. Native zoom, assistive technology, CV approval and
performance-preset findings are not resolved by this test synchronization repair.

- [ ] **D01** — status: `partial`; evidence: retained production `7fd6a76b…` passes the instrumented interaction contracts and current motion review closes C05 after repairing the SkillsBar reduced-motion transition. Current signed head `c50fbfa` has a complete 52-case static visual matrix across all 13 routes at 320px, 375px, 768px, and 1440px, plus exact native 200% structural/reflow coverage across all routes. The current script-disabled Home → About → Back → primary demo and Home → SkillsBar case study → demo journeys pass at desktop and an exact 375×812 content viewport, with expected headings and fallback content. Top-level JavaScript-disabled Chrome reports a real `BackForwardCacheRestore` after Home → About → Back. A compression-capable current-head Lighthouse comparison clears the portrait, compression, latency, and bfcache findings and passes all explicit category thresholds, while retaining twelve honestly failed dependency-tree/unused-CSS preset assertions. Remaining gates are assistive-technology and physical-device operation, the recommended performance preset/deployed-header lane, and public-safe CV approval.
- [ ] **D02** — status: `partial_screen_reader`; evidence: all-route mobile/desktop unique keyboard cycles, independent reverse focus checks, 2px outlines and sampled target obstruction checks passed, including headers/footers. Default axe scans reported zero violations in 26 route/viewport combinations; current production aggregate also passes. The accepted Proof outline repair and inventoried dynamic-state contracts are covered, including reduced-motion controls, pointer cancellation and nav resize. Carousel unavailable directions intentionally remain focusable with aria-disabled. Exact native 200% structural/reflow coverage passes across all 13 routes with no overflow, missing landmarks or loaded broken images. Remaining execution gate: screen-reader operation. Limits: sampled outline geometry/visual checks are not every-pixel or exhaustive-device proof. See `browser-handoff.md`.
- [ ] **D03** — status: `partial_preset`; evidence: current source/build/HTML validation passes. The 640px q76 square reduces transfer bytes from 71,610 to 40,742. Signed candidate `e771682` adds a 25,436-byte 480px square and a 22,268-byte 360×480 centre crop from the same tracked master. A paired current-head six-route Lighthouse audit clears both image-delivery assertions. Serving the same immutable artifact with verified gzip clears all twelve local compression/latency findings and raises route performance to 0.92–0.94; accessibility, best practices, and SEO remain 1.00. An order-preserving `inlineStylesheets: "always"` trial retained those scores but left the same twelve required errors, moved unused CSS into the inline block, and moved the zero-savings critical chain to component JavaScript while expanding representative HTML to 216–225KB; it was rejected and fully reverted. The recommended preset still reports six zero-savings dependency-tree findings and six shared unused-CSS findings. Deployed Cloudflare headers and field performance remain unobserved.
- [x] **D04** — status: `pass_static`; evidence: canonical, Open Graph image/alt, Twitter card, RSS, and favicon exist. Production sitemap URLs exactly match all 13 HTML routes and robots.txt references the sitemap. The explicit preview build emits noindex/nofollow on all 13 pages, an empty sitemap, and Disallow: /; the normal build restores production output. The preview server alone does not add protection. See `runtime-recovery.md`.
- [ ] **D05** — status: `partial_cv_review`; evidence: public-source scans and internal smoke links pass. All six project evidence destinations returned HTTP 200 after the wSearch link repair; GitHub, X, and non-www LinkedIn profile URLs returned 200. The www LinkedIn URL returned 999 and content remains unverified. HTTP availability does not prove profile content. A metadata-scrubbed, visually inspected public-safe CV candidate now exists under B11, but it is intentionally outside `public/`, visibly marked unapproved, and not linked from the site. Jamie's approval and any public download implementation remain pending.
- [ ] **D06** — status: `partial_preset`; evidence: signed candidate `e771682` passes source validation with 13 routes and the focused six-capture portrait review. Policy-compliant six-route Lighthouse runs through a fresh external Chrome/CDP profile clear both portrait findings. A compression-capable immutable server additionally clears all twelve local compression/latency findings and raises performance to 0.92–0.94, with every explicit category threshold passing. A six-route immutable inline-stylesheet trial preserved those scores but failed the same twelve assertions and was reverted; blanket inlining is now a rejected path, not a pending optimization. Retained production candidate `7fd6a76b…` passed 150 instrumented aggregate cases with ten scoped skips and zero failures; separate pointer-cancellation and navigation-resize contracts passed on desktop. The earlier `622468cf…` animation-start failure remains preserved and unexplained. Deployed compression and remaining manual gates remain open.
- [x] **D07** — status: `pass_current_render`; evidence: preserved manifests index 40 accepted article frames, 97 project frames, subsequent heading repairs, 30 accepted demo frames and 24 accepted revised CLI frames, with original candidate attribution retained in the handoff. Current signed head `c50fbfa` is reconciled through a 52-case all-route matrix at 320×800, 375×812, 768×1024, and 1440×1000. Every capture returned HTTP 200 with required landmarks, no document overflow, no broken image, and no page error; contact sheets and representative original-scale full pages were visually inspected. Exact native 200% structural/reflow coverage separately passes all 13 routes. This closes the defined static current-build reconciliation, not screen-reader operation, dynamic-motion review, physical-device coverage, or Jose-reference pixel parity.
- [x] **D08** — status: `pass_record`; evidence: this board and receipt ledger record implemented changes, corrections, proof boundaries, and unresolved choices.

## Discovered issues

- The sandbox initialization failure was resolved by the revised task permission
  profile on September 4. Managed commands and supported patching now work;
  see `runtime-recovery.md` for current proof and remaining browser restrictions.
- Source, qualification, CV, project, and route inventories are reconciled above.
- The approved disposable external Chrome/CDP route now works against a fixed
  archive. Sessions are closed after each run; no persistent endpoint is implied.
- Study intentions are incorporated without enrollment/completion claims. A
  metadata-scrubbed public-safe CV derivative is ready for Jamie's review but is
  not approved, published, or linked. Clean-source
  wSearch help/rejection/live Q42 and rSearch fixture-backed planning results are
  verified and incorporated. Installed releases and live rSearch retrieval or
  downloads are not claimed. Current source, production-artifact browser, static
  visual, native-zoom, and explicit Lighthouse category evidence is complete.
  Remaining actionable gates are the recommended Lighthouse preset and deployed
  headers, manual assistive-technology and physical-device coverage, and
  public-safe CV approval/public-download selection.
