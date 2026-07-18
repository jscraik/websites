# brAInwav Portfolio Brand Guidelines

## Purpose

This portfolio is Jamie Scott Craik's single public front door and the canonical home of the shared brAInwav product-presentation system. It should feel like inspectable technical proof with an editorial human layer, not an AI dashboard, SaaS landing page, or speculative product shell.

The site exists to help a reader understand:

- what Jamie is making inspectable
- what the product or case study claims
- what proof exists for the exact current source
- what the proof does not establish
- what a developer should inspect next

The brand should make the work feel inspectable, human-owned, and quietly credible.

## Canonical System

The reusable visual foundation is version 1.1.0 of the brAInwav Design System. It projects the accepted `jamie-brain-brand-system/v1` decision dated 2026-07-15; the private decision record governs intent, while this repository governs the machine-readable web and product contract.

- `src/styles/brand-tokens.json` is the canonical machine-readable source.
- `src/styles/brand-tokens.css` is the web projection and keeps temporary compatibility aliases for the current portfolio.
- This document owns usage decisions and examples.
- Product repositories consume these values; they do not create their own fonts, spacing scales, icon grammar, or dominant colours.

The system is deliberately dual-surface within one portfolio front door. The light editorial surface carries Jamie's personal story and concise case studies; the dark technical surface carries evidence, product detail, and the neuron/wave motif. A product may use either surface or combine them, but both come from the same tokens.

### Consumer contract

Every product records the brAInwav Design System version it consumes. Web products map from the canonical JSON into CSS custom properties; native products map the same values into platform constants. Product-specific tokens may add semantic aliases and component decisions, but they may not replace or fork the primitive palette, font families, spacing scale, radius family, or icon grammar.

Until the system has a published package, copy the versioned JSON with its source commit and generate local adapters from it. Do not hand-copy values from this prose guide. A product adopts a later version deliberately and validates the changed values rather than silently tracking the portfolio checkout.

## Positioning

Primary name:

- Jamie Scott Craik

Role:

- AI-native DevRel builder

First association:

- Making AI-assisted developer work inspectable.

Ultimate benefit:

- Help developers adopt emerging AI tools with confidence.

Site roles:

- This portfolio is the single public front door for Jamie's personal and professional narrative, concise case studies, speaking, contact routes, and bounded technical proof.
- Technical depth routes to public repositories, READMEs, documentation, diagrams, tests, implementation excerpts, and bounded evidence receipts.

OpenAI and Tessl are relevant audiences and career bridges. They are not affiliations or the headline identity.

Primary audience:

- DevRel leaders
- AI tooling teams
- developer advocates
- engineers evaluating agentic workflows
- people assessing Jamie's transition into AI-native DevRel

## Brand Principles

### Calm Confidence

Use spare layouts, restrained accents, and clear language. The site should feel composed rather than loud. Avoid visual urgency, hype language, and decorative AI tropes.

### Visible Proof

Every proof item should show the claim, the evidence, the caveat, and the next state. Do not imply adoption, deployment, review approval, affiliation, or production use unless the evidence exists.

### Human-Owned Delivery

The site should make it clear that AI is part of the workflow, but Jamie owns the judgment, explanation, validation, and public claims.

### Public-Safe Specificity

Be specific about public work and public evidence. Keep private systems, raw source material, and sensitive personal context out of public copy.

### Restraint Over Spectacle

The visual language should support reading, trust, and inspection. Avoid dashboard panels, neon AI graphics, fake metrics, synthetic enterprise polish, and workflow diagrams above the fold.

## Visual Direction

The design direction is a Jose Ocando-inspired editorial portfolio adapted for Jamie's AI-native DevRel trajectory.

Use:

- warm off-white or paper-like backgrounds
- large editorial serif typography
- compact uppercase metadata
- centred pill navigation
- sparse two-column hero layouts
- small profile chips
- narrow, deliberate proof cards
- restrained blue and orange accents
- quiet linework and soft borders

Avoid:

- AI dashboard layouts
- dark neon hero sections
- fake command panels
- fake analytics cards
- marketing-heavy hero copy
- dense SaaS feature grids
- oversized decorative diagrams
- generic AI stock imagery

## Identity System

Write the brand as `brAInwav`, pronounce it “brain-wave”, and use `brainwav` only for technical identifiers. The canonical origin sentence is:

> brAInwav brings together three parts of my story: a brain injury that changed how I work, AI tools that helped me, and the technical wave I continue to explore and build with.

This origin requires target-output review. It is personal context, not trauma marketing, a treatment claim, or the default opening for a CV, application, product cover, or case study.

Set the wordmark as one continuous `brAInwav` in Geist Semibold. Keep `AI` on the same baseline, size, and weight, using orange in the primary colour version. Maintain a one-colour variant. Approved lockups are wordmark, neuron plus wordmark, standalone neuron, and a vertical origin-story lockup.

The neuron is a simplified, asymmetric, recognisably neuronal brand signature with one signal or wave path. Reserve it for the brainwav hero, About, Visual System, favicon/app signature, and brand campaigns. Do not use it as a routine interface action, a standard product-cover mark, a photorealistic brain, a brain outline, or a generic connected-node network.

One optional branch reveal or restrained signal pulse may appear on the brainwav hero. It must be infrequent, reduced-motion safe, and backed by a complete static fallback. Product covers and evidence remain static.

## Product Cover System

Every cover is a deterministic two-zone composition generated from a structured manifest with HTML, CSS, and SVG. Image generation may explore atmosphere or decorative direction; it must not generate final typography, product UI, product logos, evidence, provenance, or status.

Use a `1600 × 900` 16:9 master, 64px outer margins, a 32–48px gutter, and a 12-column grid split into 5 editorial columns and 7 technical columns. Required formats are 16:9, 1.91:1, 1:1, and 4:5. Square and portrait variants stack editorial above technical proof; they are deliberate reflows, not automatic crops.

Cover hierarchy:

1. product mark and product name in Geist Semibold
2. one consequential hook in Newsreader
3. one authentic proof object
4. compact provenance and status in Geist Mono
5. small `by brAInwav` endorsement footer

Required manifest fields are `product_name`, `product_mark`, `hook`, `proof_object`, `proof_source_identity`, `caption`, `provenance`, `status`, `endorsement`, `design_system_version`, and `design_system_source_commit`. `support` is optional and is omitted before it causes overflow. `proof_source_identity` binds the proof to an exact revision, candidate fingerprint, artifact digest, capture URL/date, or equivalent identity. `design_system_source_commit` records the exact source commit of the consumed canonical token contract.

Approved provenance labels:

- `LIVE PRODUCT CAPTURE`
- `IMPLEMENTATION EXCERPT`
- `SYSTEM DIAGRAM`
- `CONCEPT MOCKUP · NOT RUNTIME EVIDENCE`

Omitted provenance, missing proof source identity, missing design-system source commit, or a claim without proof is invalid input. Do not add feature lists, testimonials, CTA buttons, URLs, logo strips, badge clutter, or a competing brAInwav wordmark.

Product identity comes from the product name and custom functional mark, not a unique dominant colour. Build product marks on the 24px outline grid with round caps and joins and a clear monochrome 16px form. Use coherent library or platform-native icons for standard actions; an unmodified stock icon cannot become a product logo. The neuron remains exclusive to brAInwav identity.

## Colour System

Do not change these colour values or their roles without a separate system decision.

### Surfaces and text

| Role | Token | Value | Intended use |
| --- | --- | --- | --- |
| Editorial canvas | `portfolio_bg` | `#E6E6E1` | Personal portfolio and case-study background |
| Editorial surface | `portfolio_surface` | `#FBFAF5` | Cards, navigation, and inset reading surfaces |
| Editorial ink | `portfolio_ink` | `#000B00` | Primary text and deep contrast |
| Editorial text | `portfolio_text` | `#3D403C` | Body copy |
| Editorial muted | `portfolio_muted` | `#4F564D` | Secondary copy and metadata |
| Technical canvas | `brainwav_bg` | `#0B0F17` | brAInwav and technical proof background |
| Technical surface | `brainwav_surface` | `#141A23` | Product panels and proof cards |
| Technical elevated | `brainwav_surface_elevated` | `#1B2230` | Selected or raised technical surfaces |
| Technical text | `brainwav_text` | `#F8F8F6` | Primary text on dark surfaces |
| Technical secondary | `brainwav_text_secondary` | `#C5CAD3` | Body copy on dark surfaces |
| Technical muted | `brainwav_muted` | `#8B93A4` | Secondary labels on dark surfaces |

### Accent and state

| Meaning | Dark-surface value | Light-surface ink value | Rule |
| --- | --- | --- | --- |
| Current or verified technical evidence and navigation | `#2DA8FF` | `#006AA6` | Blue marks current/verified technical evidence and navigation |
| AI, inspection, attention, stale evidence, and required action | `#FF7A00` | `#A94700` | Orange marks `AI`, inspection, attention, stale evidence, or required action |
| Passed | `#35D07F` | `#0F6F3E` | Use with a check and a visible label |
| Review | `#F8C84E` | `#7A5B00` | Use with a review symbol and a visible label |
| Blocked or failed | `#F25B5B` | `#B02A2A` | Use with a blocked/error symbol and a visible label |

The bright blue and orange meet text contrast on the technical canvas. Their darker ink variants meet text contrast on the editorial canvas. Bright accents are not body text on light surfaces. Status colours never become a product's identity colour, and colour never communicates state on its own.

Blue is the normal accent for current or verified technical evidence and navigation. Orange is rarer: reserve it for the `AI` in brAInwav, inspection, attention, stale evidence, required action, or the single focal mark in a product cover. Do not add a new dominant product colour or turn blue and orange into the whole interface.

## Typography

The target family stack is **Newsreader + Geist + Geist Mono**. Newsreader and Geist are distributed under the SIL Open Font License 1.1. Each product must self-host the official variable font files and retain their licence; a local operating-system installation is not a delivery strategy. Until those assets and licences are admitted to a product, that product must retain its currently delivered face rather than naming an unavailable target font.

- Newsreader is the editorial display face for page identity, case-study titles, major statements, and the one consequential product-cover hook.
- Geist Semibold is the product-name and brAInwav-wordmark face; Geist Regular is the default for body copy, controls, navigation, product UI, and explanatory labels.
- Geist Mono is the evidence face for commands, statuses, dates, measurements, and compact metadata.

| Role | Family | Size | Line height | Weight | Tracking |
| --- | --- | --- | --- | --- | --- |
| Display XL | Newsreader | `clamp(4.5rem, 8vw, 5.5rem)` | `0.95` | `300` | `-0.03em` |
| Display LG | Newsreader | `3.5rem` | `1` | `300` | `-0.025em` |
| Heading 1 | Newsreader | `3rem` | `1.05` | `400` | `-0.02em` |
| Heading 2 | Newsreader | `2.25rem` | `1.1` | `400` | `-0.015em` |
| Heading 3 | Geist | `1.75rem` | `1.15` | `600` | `-0.01em` |
| Body LG | Geist | `1.25rem` | `1.5` | `400` | `0` |
| Body MD | Geist | `1.125rem` | `1.55` | `400` | `0` |
| Body SM | Geist | `0.9375rem` | `1.5` | `400` | `0` |
| Meta | Geist Mono | `0.75rem` | `1.25` | `600` | `0.08em` |
| Code | Geist Mono | `0.8125rem` | `1.45` | `500` | `0` |

Let Newsreader create one clear editorial anchor. Do not use it for controls or dense product UI. Set metadata in uppercase only when it stays short, and do not set display copy in all capitals. Do not introduce a fourth typeface.

The current global stylesheet still contains direct Stringer declarations from the earlier portfolio implementation. They are migration debt, not part of the reusable standard: do not copy them into new work, and replace them with role tokens when those surfaces are deliberately touched.

## Spacing

The system uses a **4px base unit** with a deliberately sparse primitive scale.

| Step | Value | Typical use |
| --- | --- | --- |
| `000` | `0px` | Reset only |
| `050` | `4px` | Optical correction and very tight grouping |
| `100` | `8px` | Icon-to-label gap |
| `150` | `12px` | Control gap |
| `200` | `16px` | Content gap |
| `300` | `24px` | Cluster gap and card padding |
| `400` | `32px` | Large component separation |
| `600` | `48px` | Section gap |
| `800` | `64px` | Wide page gutter |
| `1200` | `96px` | Section padding |
| `1600` | `128px` | Hero padding |

Use the semantic roles first: icon-text `8px`, controls `12px`, content `16px`, clusters and cards `24px`, sections `48px`, page gutter `clamp(24px, 5vw, 64px)`, section padding `96px`, and hero padding `128px`. Reach for a primitive only when no role fits. Optical exceptions must remain local and must not create a second scale.

Keep the existing geometry family: `8px` icon containers, `14px` buttons, `18px` cards, `20px` images, and fully rounded pills. Borders are `1px`; visible focus rings are `2px` and use the surface-appropriate blue.

## Iconography

Interface icons use a **24px reference grid**, an outline construction, round line caps and joins, and no default fill.

| Size | Use | Stroke |
| --- | --- | --- |
| `16px` | Dense metadata and compact controls | `1.5` |
| `20px` | Small controls and navigation | `1.75` |
| `24px` | Default interface icon | `1.75` |
| `32px` | Feature and empty-state icon | `2` |
| `48px` | Large explanatory icon | `2` |

Use one coherent outline family inside each product. Platform-native symbols are preferred inside native controls when they fit the meaning; custom icons must still match the same optical weight and rounded construction. Filled icons are reserved for selected or critical state and must retain a visible shape distinction without colour.

Product marks use no more than two brand colours, retain a recognisable monochrome silhouette at `16px`, and never bake a product name or tagline into the icon. Build app-store art on a `1024px` master and small marks on a `64px` master.

**The neuron is a brand motif, not a UI icon.** It carries the brAInwav origin story and may appear as restrained editorial linework or a wave fragment. Do not use it for routine actions, statuses, menus, or generic AI decoration.

## Layout System

### Navigation

The nav should remain a centred pill with a small home icon and compact text links.

Current navigation language:

- Work
- About
- Blog
- Contact

The nav should feel light, quiet, and stable. Avoid large headers, logo-heavy bars, or product-style navigation.

### Homepage

The brainwav.io homepage sequence is promise, developer benefit, flagship SkillsBar, Products and Lab, method, Why brAInwav origin, then writing and technical notes. The brAInwav Visual System page is public but secondary; link it from the footer, About, and relevant case studies rather than primary navigation.

The homepage is a technical proof front door, not Jamie's complete personal portfolio or CV.

### Article Pages

Article pages should read like editorial essays:

- title and date on the left
- article body on the right
- optional thread list only when it helps navigation
- generous vertical spacing
- no decorative sidebars

### Proof Index

The proof index should stay honest and small.

Each proof card should include:

- status
- title
- claim
- evidence
- caveat
- next state

Allowed statuses:

- Article
- Build
- Planned
- Published
- Archived

Avoid implying that planned work is already proof.

### Now Page

The now page should show current focus and direction. It should not become a backlog dump.

Use it for:

- current build focus
- proof lanes
- public-facing learning direction
- small career trajectory context

### Contact Page

The contact page should be direct and human:

- what Jamie is interested in
- approved public contact address
- public links
- profile image

Do not overload it with forms, qualification lists, or private background detail.

## Imagery

Use real images and real artifacts when possible.

Preferred assets:

- Jamie's profile image
- screenshots of public repos
- screenshots of public docs
- clean article thumbnails
- small proof artifacts
- workshop or talk material when public

Avoid:

- fake product screenshots
- fake customer dashboards
- fake metrics
- AI-generated dashboards
- generic AI circuitry or neuron artwork that is not the owned brAInwav motif
- unreviewed private source screenshots

If a proof artifact is not public yet, label it as planned or prototype rather than dressing it up as finished work.

## Voice

The voice should be:

- plainspoken
- British but not performative
- technically careful
- evidence-aware
- curious
- reflective without being sentimental
- confident without pretending the transition is already complete

Use first-person `I` for Jamie and neutral direct statements for products. Do not invent corporate `we`. Near the start of each AI-assisted case study, state the role boundary: Jamie frames the problem, directs the work, makes product and taste decisions, inspects the result, validates the evidence, and owns the claims; Codex implements within Jamie's direction, proposes options, generates bounded artifacts, and supports inspection and validation.

End every case study with one primary evidence-seeking call to action that helps the reader inspect evidence or provide public technical feedback. Attach public technical feedback to the artifact or evidence surface, and route private hiring or contact through an approved private contact surface. Keep public technical feedback separate from private hiring or contact routes.

For SkillsBar, lead with the Skill maintainer's trust decision, use the hook `When evidence goes stale.`, and make the core sentence visible: `A changed Skill candidate should not inherit proof that no longer belongs to it.` Reserve OpenAI and Tessl relevance for a short closing bridge.

Good phrases:

- visible proof
- trust surface
- public record
- evidence
- caveat
- next state
- developer education
- agent workflow
- evaluation
- verification

Avoid:

- revolutionary
- game-changing
- 10x
- magic
- fully autonomous
- thought leader
- guru
- ninja
- AI-powered everything

## Public-Safe Boundaries

Do not publish:

- Jamie Brain internals
- x-writer internals
- private source maps
- raw military reports
- private testimonials without explicit approval
- medical, legal, finance, family, or care-record detail
- raw email content, private inbox detail, or private message text
- unsupported affiliation claims

A public-facing contact method may be listed only when approved for the target surface. The accepted brAInwav origin sentence may appear only after target-output review; do not expand it with medical, legal, compensation, support, diagnosis, private inbox, or raw message detail.

## Proof Content Contract

Before publishing or promoting a proof item, check:

- What is the claim?
- What evidence supports it?
- What does the evidence not prove?
- Is the artifact public-safe?
- Is the current state labelled accurately?
- Is there a clear next state?
- Does the copy avoid unsupported role, affiliation, deployment, or adoption claims?

If the evidence is private, convert it into public-safe synthesis before publishing.

Products and Lab are separated by proof maturity, not whether code exists:

1. `behavior_proven` — current implementation or test evidence supports the bounded behavior.
2. `usability_tested` — a relevant user completed the target task and the observation is recorded.
3. `adoption_evidenced` — repeated or external use is evidenced within a named scope.

A case study may publish at Level 1 when clearly versioned and bounded. It cannot imply Level 2 or 3. Every technical companion records `claim`, `evidence`, `scope`, `limitation`, `status`, `last_verified`, and `reproduce`. Evidence is current only when bound to the exact source identity or a recent valid receipt; source mismatch makes it stale and unknown defaults to unverified. Keep behavior, usability, adoption, and developer confidence as separate evidence lanes. Traffic indicates interest only.

## Interaction Rules

Interactions should be quiet and useful.

Allowed:

- subtle hover states
- clear focus states
- small nav highlight movement
- restrained card motion
- reduced-motion fallbacks

Avoid:

- decorative animation that distracts from reading
- scroll effects without evidence-bearing purpose
- flashy AI transitions
- motion that hides state changes
- interactions that only work with a mouse

WCAG 2.2 AA is the baseline. Require predictable navigation, generous spacing, cognitive clarity, full keyboard operation, visible focus, reduced motion, high contrast, captions, alt text, static routes, narrow-mobile support, zoom, and increased-text support. Prohibit scroll hijacking, auto-advance, flashing, hover-only evidence, and continuous decorative motion.

## Deterministic Stress Test

Before a product presentation becomes a reusable template, test short and long names, hooks, and support copy; light/dark, dense/sparse, portrait/landscape proof; missing/stale/blocked/unverified/concept/current states; invalid metadata and missing assets; narrow mobile, zoom, increased text, font failure, one-colour, low-quality display, print, colour vision, technical overflow, reduced motion, no JavaScript, slow images, and a complete static fallback. Use rSearch and wSearch manifests as cross-product fixtures. Include misuse cases for decorative orange, a stock icon used as a logo, omitted provenance, and a claim without proof, plus visual regression across every required format.

Classify failures as `template_defect`, `invalid_input`, `unsupported`, or `intentional_constraint`. Acceptance requires automated contract checks, rendered inspection on real surfaces, independent QA, and Jamie taste approval.

## Social Profile Assets

Jamie's X and LinkedIn profiles reuse the product-cover and case-study grammar: a 12-column grid split into five warm editorial columns and seven dark technical columns. Jamie's identity stays in the editorial zone; `Making AI-assisted developer work inspectable.` stays in the technical zone with one blue neuron/wave, one orange inspection point, and a small brAInwav endorsement.

The platform supplies the profile avatar. Never bake Jamie's portrait into a banner export, and keep the lower-left overlap guard free of essential promise or endorsement copy. Preview composites are conservative inspection fixtures, not platform captures or guarantees of one fixed responsive overlap.

Required native uploads are `jamie-avatar-x-400x400.png`, `jamie-x-header-1500x500.png`, `jamie-avatar-linkedin-400x400.png`, and `jamie-linkedin-background-1584x396.png`. The deterministic source, 2x masters, preview fixtures, typography limitation, upload mapping, and regeneration commands are documented in [Jamie Social Profile Assets](docs/brand/social-profile-assets.md).

## Future Page Checklist

Before adding a new page or section:

- Does it strengthen Jamie's public AI-native DevRel trajectory?
- Does it have a real reader and reason to exist?
- Is the evidence public-safe?
- Is the page calmer than a dashboard?
- Is the claim bounded by what the artifact proves?
- Does the page reuse the current palette?
- Does it preserve the centred pill nav, editorial spacing, and serif-led hierarchy?
- Is there a clear route back to Work, About, Blog, or Contact?

## Current Brand Guardrails

Keep:

- Jamie Scott Craik as the personal identity
- AI-native DevRel builder as the accepted role
- `Making AI-assisted developer work inspectable.` as the first association
- one portfolio front door with brAInwav as its shared presentation system
- SkillsBar as the first complete vertical slice
- public-inspectable proof and provenance as the credibility mechanism
- editorial plus technical dual-surface composition as the visual reference

Do not drift into:

- brAInwav as the main personal name
- a separate technical-companion site or split portfolio front door
- an AI product company homepage
- a dashboard demo above the fold
- a generic developer portfolio
- an unsupported authority narrative
- private second-brain disclosure

This guide and the token contract encode the accepted direction. They do not prove that the wordmark, neuron assets, cover generator, SkillsBar slice, rendered accessibility, deployment, usability, adoption, or public publication exists.
