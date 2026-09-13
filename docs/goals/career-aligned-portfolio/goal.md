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
- [ ] **B11** — status: `blocked`; evidence: Jamie's selected CV has been uploaded and identified by the coordinating task. Source selection is resolved; public wording and privacy review remain pending. Next: use the reviewed public-safe draft when provided. The original is not copied into this repository or public output.

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
without closing C02, C04, or D07. The current instrumented aggregate passed
148 tests with ten skips, separately from the preserved 147-pass/one-failure
aggregate. The intermittent animation-start failure remains unexplained and D06
remains incomplete. Actual zoom, motion, and final-candidate reconciliation
remain separate requirements.

Earlier archive `316956c6…` included fixes for
footer target overlap, carousel boundary focus loss, and clipped focused Proof
cards. All 13 routes passed unique forward/reverse keyboard cycles at mobile
and desktop (560 stops in each direction), five-point target obstruction checks,
render-flow at four viewports, no-JS rendering, Home/About/Back, and 26 axe scans.
Footer captures at 320/1024/1440px have independent DATA acceptance. Exact
commands and limits are in `browser-handoff.md`. Actual browser zoom, remaining
visual/motion coverage, screen-reader proof, complete gates, CLI evidence, and
the public-safe CV remain incomplete. Old archive results below are historical
where they have not been explicitly refreshed.

- [x] **C01** — status: `pass_source`; evidence: existing editorial tokens and stored-reference structure were preserved.
- [ ] **C02** — status: `partial`; evidence: page-surface source policy passes. Both articles, all five project pages, and subsequent project-heading repairs have independent 320/1440px visual acceptance. All 30 demo frames on `622468cf…` and all 24 revised CLI frames on `4f570752…` are accepted. On current signed head `8b95baf`, the supported in-app browser found all 13 routes nonblank with landmarks and no document overflow at 1440×1000; seven key routes passed the same checks at 375×812. Home, About, Contact, Blog, and Proof retain bounded repair-review records. Final current-build reconciliation is refreshed in D07. Limits: these sampled views and geometry checks do not establish exhaustive viewport review or Jose-reference parity; no new reference-parity measurement is claimed.
- [x] **C03** — status: `pass_native_zoom`; evidence: bounded typography screenshot review is complete. DATA independently accepted all 20 current Home lower-work/Writing frames and all 16 current Proof intro/card frames at 320/1440px on `7fd6a76b…`, with no typography findings. Accepted About, Blog and Contact views are reconciled to current markup/CSS; article, project, CLI and demo typography inventories were already accepted. Focused rendered text-rectangle contracts also pass. On current build `8b95baf`, regular Chrome measured exact native 200% zoom through a 1080×1890 outer window, 540×945 CSS viewport and device pixel ratio 4. All 13 routes were nonblank, retained headings and landmarks, had no document overflow and reported no loaded broken images. The earlier bounded 250% Home observation remains supplementary rather than the qualifying proof.
- [ ] **C04** — status: `partial`; evidence: Jamie approved the exact SkillsBar native fixture, with byte/dimension/alt/caption checks and mobile/desktop figure acceptance. Four shared illustrations have 16-case containment/axe proof and accepted 320px visuals on `5f2d11c5…`. All three demo states have accepted 320/1440px visuals across 30 frames on `622468cf…`, plus four focused interaction/clipboard tests. Final preview-to-production artifact reconciliation is complete: images and visible markup are unchanged. Exact native 200% structural/reflow coverage passes across all 13 routes. Limits: sampled viewport acceptance is not exhaustive device coverage; assistive-technology operation remains unverified under C06/D02, not a missing artifact comparison.
- [ ] **C05** — status: `partial`; evidence: production `7fd6a76b…` passes the 150-case instrumented aggregate covering button lifecycle, pointer-capability changes, reduced-motion nav/card behavior, carousel keyboard operation and demo states. Separate pointer-cancel cleanup and real viewport-resize nav resynchronization pass. The inventoried executable-state queue is covered; cancellation was dispatched synthetically, not generated by native hardware. This is not exhaustive perceptual review of every animation frame or device.
- [ ] **C06** — status: `partial`; evidence: earlier 13-route target geometry, forward/reverse keyboard cycles and sampled obstruction checks passed; current production aggregate covers reduced-motion controls and demo keyboard activation. The accepted Proof inset ring is retained unchanged. Production emulated touch at 320/393px passes Home/About/Back and CTA/SkillsBar navigation in both motion modes. On `8b95baf`, the in-app accessibility tree exposed all three SkillsBar scenarios as named controls, and activating Security flagged updated its checked state, readiness and next action coherently. Exact native 200% structural/reflow coverage now passes on all 13 routes. No inventoried dynamic-state check remains pending. Assistive-technology operation remains open; accessibility-tree inspection is not a screen-reader session and emulated touch is not physical-device proof.
- [x] **C07** — status: `pass_source`; evidence: project claims colocate evidence and limitations, with featured work before supporting inventory.
- [ ] **C08** — status: `partial_rendered_fallback`; evidence: production `7fd6a76b…` passed all 13 no-JS routes at 393/1440px (26 cases), including HTTP 200, meaningful headings/content and basic metadata. Home/About/Back and CTA/SkillsBar navigation passed in four touch/motion combinations. The current SkillsBar demo includes a semantic `<noscript>` summary of all three scenario outcomes; the 13-route source/build/HTML gate passes and independent review approved its structure and isolation from the JavaScript path. On the current build, a sandboxed iframe without `allow-scripts` provided a genuine script-disabled browsing context: the in-app browser accessibility tree exposed the visible fallback with all three ordered identities and descriptions, while direct Home and About loads exposed their primary content. The attempted in-frame link activation timed out and was rejected. A full current Playwright journey, mobile script-disabled coverage, link activation, and persisted back-forward-cache restoration remain unproven; real Back navigation is not bfcache proof.

### D. Verification and release boundary

Current aggregate update (September 8): `7fd6a76b…` passes 154 tests with 12
scoped skips and zero failures, including the added motion and no-script cases.
The no-script test explicitly waits for the finite ancestor entrance animation
after Back before retaining its normal click assertions; six repeated isolated
cases and the full aggregate pass. Earlier 150-pass and two-failure counts below
are historical where cited. Native zoom, assistive technology, CV approval and
performance-preset findings are not resolved by this test synchronization repair.

- [ ] **D01** — status: `partial`; evidence: retained production `7fd6a76b…` passes 150 instrumented aggregate cases, two additional motion contracts, four touch/motion combinations and 26 no-JS route/viewport cases. Current signed head `8b95baf` passes the full source gate and a fresh in-app browser sweep: all 13 routes at 1440×1000 and seven key routes at 375×812 were nonblank, retained landmarks and had no document overflow; the SkillsBar Security flagged interaction updated its accessible state correctly. Exact native 200% structural/reflow coverage passes for all 13 routes. The current SkillsBar fallback is now rendered and exposed through the accessibility tree in a genuine script-disabled iframe context, with the direct Home and About content also present. Six historical Lighthouse audits and paired font measurements are complete. Remaining gates are assistive-technology operation, current paired Lighthouse disposition, the full current no-script navigation journey, and public-safe CV approval.
- [ ] **D02** — status: `partial_screen_reader`; evidence: all-route mobile/desktop unique keyboard cycles, independent reverse focus checks, 2px outlines and sampled target obstruction checks passed, including headers/footers. Default axe scans reported zero violations in 26 route/viewport combinations; current production aggregate also passes. The accepted Proof outline repair and inventoried dynamic-state contracts are covered, including reduced-motion controls, pointer cancellation and nav resize. Carousel unavailable directions intentionally remain focusable with aria-disabled. Exact native 200% structural/reflow coverage passes across all 13 routes with no overflow, missing landmarks or loaded broken images. Remaining execution gate: screen-reader operation. Limits: sampled outline geometry/visual checks are not every-pixel or exhaustive-device proof. See `browser-handoff.md`.
- [ ] **D03** — status: `partial`; evidence: current source/build/HTML validation passes. The 640px portrait now has an independently accepted q76 derivative that reduces transfer bytes from 71,610 to 40,742; its exact recipe and digest are recorded in `performance-disposition.md`. Earlier JS budget evidence was four files/3100 gzip bytes, and paired font audits recorded essentially unchanged LCP and improved simulated FCP with all six category thresholds passing. The prior preset had 14 failures (six CSS coverage, six dependency-tree, two portrait-compression); the two image findings remain open until a paired audit proves the new artifact, and the other twelve remain dispositioned but unresolved. Loading-transient and field performance claims remain limited to measurements actually taken.
- [x] **D04** — status: `pass_static`; evidence: canonical, Open Graph image/alt, Twitter card, RSS, and favicon exist. Production sitemap URLs exactly match all 13 HTML routes and robots.txt references the sitemap. The explicit preview build emits noindex/nofollow on all 13 pages, an empty sitemap, and Disallow: /; the normal build restores production output. The preview server alone does not add protection. See `runtime-recovery.md`.
- [ ] **D05** — status: `partial`; evidence: public-source scans and internal smoke links pass. All six project evidence destinations returned HTTP 200 after the wSearch link repair; GitHub, X, and non-www LinkedIn profile URLs returned 200. The www LinkedIn URL returned 999 and content remains unverified. HTTP availability does not prove profile content. The public-safe CV/download review remains pending under B11.
- [ ] **D06** — status: `in_progress`; evidence: the current checkout passes source validation with 13 routes and includes the independently accepted 40,742-byte portrait derivative. Retained production candidate `7fd6a76b…` passed 150 instrumented aggregate cases with ten scoped skips and zero failures after synchronizing the exact three-font consumer contract; separate pointer-cancellation and navigation-resize contracts passed on desktop. The new portrait artifact has not received a paired Lighthouse or rendered-flow run because this managed runtime lacks Playwright Chromium. The earlier `622468cf…` animation-start failure remains preserved and unexplained. Remaining preset findings and manual gates remain open.
- [ ] **D07** — status: `partial_current_render`; evidence: preserved manifests index 40 accepted article frames, 97 project frames, subsequent heading repairs, 30 accepted demo frames and 24 accepted revised CLI frames, with original candidate attribution retained in the handoff. Current signed head `8b95baf` is now reconciled through the supported in-app browser: all 13 desktop routes and seven key mobile routes rendered nonblank without document overflow, the q76 portrait loaded at its expected intrinsic size, and the SkillsBar state transition was observable. Exact native 200% structural/reflow coverage also passes across all 13 routes. This closes the stale-current-build and zoom gaps but not screen-reader operation, exhaustive visual review or paired Lighthouse disposition.
- [x] **D08** — status: `pass_record`; evidence: this board and receipt ledger record implemented changes, corrections, proof boundaries, and unresolved choices.

## Discovered issues

- The sandbox initialization failure was resolved by the revised task permission
  profile on September 4. Managed commands and supported patching now work;
  see `runtime-recovery.md` for current proof and remaining browser restrictions.
- Source, qualification, CV, project, and route inventories are reconciled above.
- The approved disposable external Chrome/CDP route now works against a fixed
  archive. Sessions are closed after each run; no persistent endpoint is implied.
- Study intentions are incorporated without enrollment/completion claims. The CV
  source is selected, but its public-safe derivative awaits review. Clean-source
  wSearch help/rejection/live Q42 and rSearch fixture-backed planning results are
  verified and incorporated. Installed releases and live rSearch retrieval or
  downloads are not claimed. Remaining actionable gates are current aggregate,
  production-artifact browser proof, policy-compliant Lighthouse, manual
  accessibility capability/coverage, final reconciliation, and CV approval.
