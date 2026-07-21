---
schema_version: portfolio-stabilization-demo-presentation-plan/v2
status: active
created: 2026-07-17
updated: 2026-07-17
owner: Jamie Scott Craik
implementation_repo: /Users/jamiecraik/dev/portfolio
---

# Portfolio Stabilization And Cloud Release

## Objective

Publish one small, truthful portfolio from `/Users/jamiecraik/dev/portfolio` while establishing the reusable brand, publication, placement, product-cover, static-demo, optional ChatGPT Sites, repository-evidence, case-study, and presentation-template system that future projects consume without bespoke visual variants or repeated operator explanation.

The first public vertical slice is SkillsBar. Other work remains draft until its own documentation, proof, cover, privacy, rendered, and publication gates pass.

## Authority And Sources

This is the active repository execution input for the portfolio stabilization and release scope. It consumes:

- Jamie-approved private brand-system direction (maintained outside this repository)
- Jamie-approved private portfolio demonstration and presentation direction (maintained outside this repository)
- Jamie-approved private architecture and publication decisions (maintained outside this repository)
- `BRAND_GUIDELINES.md`
- `src/styles/brand-tokens.json`
- `AGENTS.md`
- `package.json`

Jamie owns product direction, taste, public claims, privacy decisions, and deployment authority. Codex may implement, validate, inspect, and prepare bounded artifacts within this plan. This plan does not authorize public deployment, DNS changes, publication, or external claims without a validated release candidate and Jamie's explicit instruction.

## Current Source Boundary

The plan was admitted while the primary checkout—renamed from `/Users/jamiecraik/dev/brainwav.io` to `/Users/jamiecraik/dev/portfolio`—was on `jscraik/feature/no-issue-install-design-skills`, divergent from its upstream, with existing staged brand/social changes, bulk staged artifact deletions, and an unstaged runtime file. Preserve that checkout exactly. Do not reset it, clean it, deploy it, or absorb unrelated paths into the portfolio release.

Implementation starts in a clean release worktree from the current reviewed upstream baseline. Selectively port accepted source changes. Exclude `.harness/runtime/**`, Playwright caches and reports, ad hoc visual artifacts, bulk artifact deletions without separate review, and unrelated skill-install work.

Record the release worktree path, branch, baseline SHA, accepted source paths, and excluded paths before editing production source.

## Non-Goals

- Building a second brAInwav technical-companion website.
- Treating a VPN session as ChatGPT Sites availability or as evidence that normal UK visitors can open a demonstration.
- Connecting a demonstration to live credentials, production endpoints, private implementation, or private data.
- Settling the final public domain, DNS, or repository rename beyond the recorded `/Users/jamiecraik/dev/portfolio` source path without Jamie's explicit release decision.
- Reskinning the entire SkillsBar native application.
- Migrating every rSearch or wSearch documentation surface before the first site release.
- Creating a CMS, database, remote feature-flag service, global state container, or runtime personalization layer.
- Rewriting the entire accumulated global stylesheet before the first bounded release.
- Publishing private Jamie Brain, x-writer, medical, legal, finance, family, care, message, credential, or local telemetry material.
- Claiming usability, adoption, endorsement, affiliation, developer confidence, hosted CI, or public reachability from local source checks.

## Architecture Decision

Use a static, build-time **publication and composition system**. Publication state determines whether content enters the production build. Placement determines where public content appears. Proof maturity, evidence freshness, privacy review, endorsement, and visual identity remain independent fields.

Use one portfolio website as the front door. Do not require a separate technical-companion website. Route technical depth to public repositories, READMEs, documentation, diagrams, tests, implementation excerpts, and bounded evidence receipts.

Use ChatGPT Sites as the preferred interactive demonstration provider only after legitimate account, region, plan, workspace, sharing, and public-visitor access are proved. Every project keeps a complete static walkthrough. A demonstration is a guided mock experience, not the operational product and not product-runtime evidence.

Treat presentations as a distribution format of the same brand and proof system. First create and approve one canonical BrainWAV `.pptx`, then package that exact file as a private personal template through Template Creator, then use the returned template identity with Presentations for future decks.

Do not create item-named flags such as `showRSearch`, `showTabTwo`, `hideFromHome`, or `enableGreenCard`. Do not hide draft content with CSS or ship it to the browser for client-side filtering.

### Publication states

| State | Production route | Discovery behavior |
|---|---|---|
| `draft` | absent | absent from HTML, metadata, navigation, counts, feeds, sitemap, search, related content, and generated production assets |
| `unlisted` | present | absent from normal discovery; public-by-link and never described as private |
| `public` | present | appears only in validated placements |
| `archived` | retained only when required | absent from featured placement and current promotion |

### Initial placement vocabulary

- `homepage.flagship`
- `homepage.work-carousel`
- `homepage.featured-writing`
- `homepage.latest-proof`
- `homepage.skills`
- `work.index`
- `products.index`
- `lab.index`
- `blog.featured`
- `blog.index`
- `proof.latest`
- `proof.index`
- `about.skills`
- `about.experience`
- `about.origin`
- `navigation.primary`
- `navigation.footer`

## Source Design

Use the smallest readable module set:

| Path | Responsibility |
|---|---|
| `src/content.config.ts` | Zod schemas for publication, placements, collection records, and content-specific evidence; exported types derive from schemas |
| `src/lib/publication.ts` | pure route-eligibility, discoverability, placement, sorting, and composition predicates |
| `src/config/site-surfaces.ts` | typed required/optional page, section, About, skills, and navigation registry |
| `src/content/**` demo metadata | provider, availability, URL, mock-data disclosure, and static fallback path validated with the owning project record |
| `src/surfaces/**` | optional page implementations outside Astro's file-based route directory; retaining a disabled implementation cannot create a route |
| `src/pages/[...surface].astro` | validated dynamic entrypoint that maps only enabled optional surface records to their implementations and emits no disabled route |
| `src/components/ProductCover.astro` | deterministic manifest-driven product cover; no arbitrary tone variants |
| `src/components/FeaturedWork.astro` | zero/one/multiple adaptive flagship composition |
| `src/components/WorkCarousel.astro` | filtered carousel with controls only when multiple items exist |
| `scripts/validate-publication-system.mjs` | source, schema, invariant, consumer-parity, and production-output validation |
| `scripts/test-publication-model.mjs` | table-driven predicate and composition tests |
| `docs/brand/presentations/**` | canonical presentation specification, approved reference-deck provenance, returned personal-template identity, and usage contract; no private skill contents |

Names may adjust to existing local conventions, but responsibility must remain separated. Do not combine schemas, route policy, environment checks, sorting, rendering, animation, and visual styling in one component.

### Type and schema rules

- A runtime schema owns every publication state, placement identifier, publishable record, source identity, and evidence status.
- Derive TypeScript types from the owning schema. Do not hand-copy unions or interfaces that can drift.
- Reject unknown fields at content boundaries.
- Keep route and placement predicates pure and deterministic.
- Keep environment inspection at one build boundary. Components do not read environment variables.
- Use typed server-side build variables only if an explicit preview build is later admitted. Do not prefix private build controls with `PUBLIC_`.
- Use semantic names from Jamie's vocabulary and avoid framework-shaped abstractions that obscure the publishing decision.

### Rendering rules

- Zero eligible items: omit the optional section and its spacing.
- One eligible item: render one static panel without tabs, next/previous controls, pagination, or inactive keyboard targets.
- Multiple eligible items: render the appropriate accessible controls and deterministic count/order.
- Disabled content is absent from the DOM and accessibility tree.
- Navigation, indexes, related content, RSS, sitemap, search, metadata, Open Graph maps, README assets, and social outputs consume the same publication predicates.
- Required identity, About summary, contact, and core navigation surfaces fail a production build if disabled.
- Required literal routes may remain in `src/pages/**`. Optional page implementations must not exist as literal Astro page files; the typed registry and dynamic route entrypoint are the only production route-emission path for them.

## Brand And Visual Integration

### Typography

- Self-host official Newsreader, Geist, and Geist Mono variable fonts and retain their OFL licences.
- Remove Stringer and every remote Jose/Webflow font URL.
- Apply fonts only through semantic role tokens: display, heading, body, meta, and code.
- Set the continuous `brAInwav` wordmark in Geist Semibold with `AI` orange at the same baseline, size, and weight.

### Product cards and covers

- Replace the work `tone` field and `work-thumbnail--*` discovery variants with a cover-manifest reference.
- Product identity comes from the product mark and name, not an arbitrary dominant colour.
- Use the 5/7 editorial/technical composition, shared typography, spacing, colour semantics, icon grammar, provenance, and evidence status.
- A cover manifest requires product name, owned mark, hook, authentic proof object, exact proof source identity, caption, provenance, status, endorsement, design-system version, and design-system source commit.
- Image generation may support decorative exploration only; final typography, product UI, logo, evidence, provenance, and status remain deterministic HTML/CSS/SVG or authentic source captures.

### SkillsBar first slice

- Add one SkillsBar content record as the only public `homepage.flagship` item.
- Include SkillsBar in `homepage.work-carousel` only if the one-item presentation omits carousel controls.
- Lead with `When evidence goes stale.` and `A changed Skill candidate should not inherit proof that no longer belongs to it.`
- Include the Jamie/Codex role boundary, claim/evidence ledger, limitations, last-verified source identity, reproduce route, complete static walkthrough, short walkthrough, stale-proof diagram, and implementation/test excerpt.
- Add ChatGPT Sites metadata with `availability: planned` and no URL until legitimate public access passes. The portfolio must omit the interactive control entirely while unavailable.
- Link technical depth to public repository or README evidence rather than a second website.
- Add a SkillsBar presentation only after the canonical BrainWAV reference deck has been approved and packaged through Template Creator.
- Keep existing AI-native DevRel, brainwav.io, CLI-series, rSearch, wSearch, and future hackathon entries as draft or explicitly unlisted until their individual gates pass.

## Implementation Slices

### Slice 0: Release isolation

1. Record primary-checkout status and baseline.
2. Create a clean release worktree and branch from the reviewed upstream baseline.
3. Record selectively ported and deliberately excluded paths.
4. Run the unchanged baseline's narrow build/source checks before implementation.

Stop if the baseline cannot build, instructions conflict, source selection would overwrite user work, or the release worktree cannot be isolated safely.

### Slice 1: Publication domain

1. Add the runtime schemas and derived types.
2. Add pure route, placement, sorting, and composition predicates.
3. Add table-driven fixtures for every publication state and zero/one/multiple eligible items.
4. Add production invariants: exactly one flagship, deterministic order, required surfaces, valid placement/state combinations, and no Product/Lab contradiction.

### Slice 2: Work and route migration

1. Migrate work content from `isFeatured` and `tone` to publication, placements, maturity, deterministic order, and cover manifest.
2. Filter work routes before static path generation.
3. Replace repeated homepage and case-page card markup with bounded shared components.
4. Remove obsolete tone selectors from the migrated surface; do not perform an unrelated stylesheet rewrite.
5. Add production-output tests proving draft route, title, summary, metadata, link, and asset absence.

### Slice 3: SkillsBar vertical slice

1. Add the SkillsBar manifest, mark, cover, page content, proof ledger, repository-evidence handoff, and evidence objects.
2. Make SkillsBar the only public flagship.
3. Implement a complete static walkthrough that works without ChatGPT Sites or JavaScript.
4. Add provider-neutral demo metadata and prove an unavailable or planned demo produces no empty tab, disabled control, inaccessible link, metadata entry, or generated asset.
5. Verify the homepage and case study at desktop, narrow mobile, increased text, zoom, reduced motion, no JavaScript, missing asset, and font failure.
6. Run independent QA against actual rendered output, followed by Jamie's taste and claims review.

### Slice 4: Site-wide consumers

1. Inventory current production consumers before migration. Classify routes, homepage writing/proof placements, navigation, indexes, related content, metadata, Open Graph, README, social output, RSS, sitemap, search, and generated assets as existing and applicable, absent, or newly required.
2. Migrate blog and proof collections, their static routes, and every existing applicable consumer through the shared predicates. Record absent consumers as `not applicable`; do not introduce RSS, search, sitemap, or another consumer only to satisfy parity proof.
3. Require every newly introduced publishable surface or consumer to declare and test how it consumes the shared publication decision.
4. Keep literal Astro routes when their admitted publication behavior can be enforced directly. Add a typed optional-surface registry, move implementations outside `src/pages/**`, and use a dynamic route entrypoint only when an admitted optional-page requirement cannot be enforced safely by the existing literal-route model.
5. Add consumer-parity fixtures for each applicable consumer. When optional-route machinery is admitted, retain a disabled implementation fixture and prove its route, HTML, metadata, navigation link, and every other applicable discovery or generated-output surface are absent.

### Slice 5: Interactive demonstration admission

1. Write the SkillsBar ChatGPT Sites story, mock-data fixture, disclosure, safe failure states, and return links.
2. Keep live credentials, production endpoints, private source, private Jamie Brain material, and unsupported product claims out of the package.
3. Publish only after Sites is legitimately available and Jamie grants external publication authority.
4. Test the resulting URL signed out and through a normal UK connection. A VPN-only success is insufficient.
5. If any gate is blocked, leave the demo unavailable and keep the static walkthrough as the public experience.

### Slice 6: Canonical presentation template

1. Use Presentations with explicit custom BrainWAV formatting to create one canonical 16:9 reference `.pptx` covering opening, origin, problem, trust decision, claim/evidence, workflow, walkthrough, role boundary, limitation, outcome, closing bridge, and sources layouts.
2. Render and inspect every reference slide at full size and as a contact sheet. Prove font resolution, contrast, safe zones, no unintended overlap or clipping, authentic assets, and no unresolved placeholders.
3. Stop for Jamie's visual approval.
4. Render a representative first-slide `preview.png` and use Template Creator with exactly one approved `.pptx` reference.
5. Verify the returned private personal skill contains `SKILL.md`, `artifact-template.json`, `agents/openai.yaml`, `assets/reference.pptx`, and `assets/preview.png`.
6. Record the returned skill identity, reference digest, brand-system version, font status, approval date, and owner in `docs/brand/presentations/**`. Do not guess the skill name or copy private skill contents into the repository.
7. Use the returned template with Presentations template-following mode to generate the SkillsBar deck; validate the frame map, starter deck, template fidelity, final PPTX placeholders, full-size slide renders, source traceability, independent QA, and Jamie taste approval.

### Slice 7: Release and Cloudflare handoff

1. Run the repository release gate from the clean worktree.
2. Record the candidate SHA and exact command outcomes.
3. Produce a local or Cloudflare preview and inspect the named routes.
4. Stop for Jamie's deployment authority.
5. After explicit authority, deploy the exact validated SHA, verify the deployment URL and custom domain, and write a release receipt separating local, hosted, live-route, and public-claim evidence.

## Mechanical Acceptance

The implementation rejects:

- zero or multiple public flagship records;
- placements on non-public records;
- public records missing required cover, proof, provenance, source identity, privacy, or metadata fields;
- draft material in routes, HTML, metadata, navigation, indexes, counts, feeds, sitemap, search, related content, or production assets;
- links to routes not generated by the build;
- duplicate order, empty slides, empty sections, inactive controls, or one-item carousel controls;
- disabled controls in the accessibility tree;
- item-specific feature booleans or CSS-hidden draft content;
- a required production surface being disabled;
- a disabled optional page retaining any production route or output even when its implementation remains in `src/surfaces/**`;
- an unlisted URL described as private;
- Stringer or remote Jose/Webflow font sources;
- hard-coded product tone variants on migrated cards; and
- proof source mismatch presented as current.
- a planned, private-preview, unavailable, missing-URL, or visitor-inaccessible demonstration rendered as an interactive public control;
- a demonstration without a static fallback, mock-data disclosure, and repository-evidence handoff;
- a ChatGPT Site described as the operational product or used as product-runtime proof;
- a presentation created from a separate visual theme after the BrainWAV template exists;
- a Template Creator package made from an unapproved reference deck or from more or fewer than one `.pptx`; and
- a generated deck with unresolved placeholders, unintended overlap, clipping, missing authentic assets, or failed template fidelity.

## Validation Contract

Run the narrowest checks first, then the release gate. Record exact outcomes in `Command: <exact command> -> pass|fail|blocked (<reason>)` form.

Expected focused commands after their scripts exist:

```bash
npm run test:publication-model
npm run validate:publication-system
npm run validate:portfolio-content
npm run validate:design-system
npm run validate:page-surfaces
npm run test:smoke
```

Presentation validation uses the current Template Creator and Presentations contracts. Record the Template Creator result and required-file inventory, then run the Presentations template audit, frame-map validation, starter-deck preparation, template-fidelity check, full-size slide inspection, and final PPTX placeholder inspection. Do not substitute a generic slide generator or a visual-only contact sheet for these gates.

Required repository gates:

```bash
npm run validate:fast
ASTRO_TELEMETRY_DISABLED=1 npm run validate:source
npm run validate:release
npm run validate:rendered
npm run validate:site
```

Required source assertions:

```bash
rg -n 'Stringer|cdn\.prod\.website-files\.com' src public
rg -n 'work-thumbnail--(paper|dark|blue|peach|green)|tone:|isFeatured:' src
```

After migration, relevant source matches must be absent or explicitly documented as non-production fixtures. The production build must also be scanned using known draft fixture slugs, titles, summaries, and asset names.

## Independent Inspection

The builder is not the sole grader. A fresh independent review must inspect:

- domain/schema clarity and duplicated-policy risk;
- actual production-output exclusion;
- zero/one/multiple behavior;
- keyboard and accessibility behavior;
- desktop/mobile visual hierarchy;
- proof and privacy boundaries;
- source-to-cover provenance; and
- deployment and claims boundaries.
- static fallback completeness and unavailable-demo absence;
- ChatGPT Sites disclosure, public visitor access, and operational-product separation; and
- reference-deck quality, Template Creator package identity, template fidelity, and final-slide placeholder state.

If independent inspection is unavailable, record that blocker and do not make release-like claims.

## Stop Conditions

Stop and return to Jamie when:

- source selection risks overwriting staged or uncommitted work;
- a public claim lacks current public-safe evidence;
- a private or sensitive source would need publication;
- the visual decision materially departs from the accepted brand contract;
- official font provenance or licence cannot be established;
- production-output exclusion cannot be proved;
- the release candidate differs from the validated SHA;
- ChatGPT Sites is unavailable, cannot publish to the intended audience, or only works through Jamie's VPN or workspace session;
- the canonical `.pptx` is missing, lacks authentic assets or fonts, or has not received Jamie's visual approval;
- Template Creator does not return a valid private personal template package;
- the Presentations template-following or fidelity gate cannot preserve the approved deck;
- credentials, DNS, Cloudflare project choice, or public deployment authority is required; or
- a change expands into a second technical website, product-native UI redesign, final-domain decision, or cross-repository migration beyond this plan.

## Evidence Boundary

This plan makes the accepted design, publishing, demo, repository-evidence, and presentation-template decisions discoverable and executable. Its presence does not prove any production code, fonts, covers, SkillsBar route, static walkthrough, ChatGPT Site, public URL, reference deck, Template Creator package, generated presentation, validators, build, preview, Cloudflare project, deployment, public reachability, usability, adoption, or developer confidence. Each claim requires current evidence from its owning lane.
