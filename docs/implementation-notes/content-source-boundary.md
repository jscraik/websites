# Portfolio Content Source Boundary

This note records the content-storage decision for the Jamie Scott Craik portfolio site.

## Decision

The portfolio content source of truth is the repository. Blog posts, featured work, case studies, proof notes, and page metadata should be stored as file-backed content that can be reviewed, diffed, validated, and shipped with the Astro site.

Do not add a database, hosted CMS, or remote content API for portfolio content unless the editing workflow has outgrown file-backed content and the change has a written architecture decision.

## Preferred Model

Astro Content Collections are the preferred next storage model for durable portfolio content:

- src/content/blog/ for blog posts and article metadata.
- src/content/work/ for featured work and case studies.
- src/content/proof/ for proof logs, receipts, and project notes.
- frontmatter for title, summary, date, featured state, ordering, tags, hero image, and proof boundary fields.
- generated Astro routes for /blog/[slug], /work/[slug], and /proof/[slug].

Legacy exception: src/data/work.ts and inline article arrays were allowed as transitional file-backed content while the prototype settled. The current owned model is Astro Content Collections. Do not reintroduce central data arrays for durable portfolio content unless a validator-backed migration note explains the temporary route.

## Why

File-backed content fits the proof-led portfolio because:

- Git history becomes the editorial and proof record.
- Content changes can be reviewed in pull requests.
- Static rendering keeps the site portable and simple.
- Validation can catch missing metadata before publication.
- Local proof, public wording, and private source boundaries stay inspectable.

## Database Boundary

A database requires an architecture decision record before implementation. The ADR must explain:

- the editing workflow that file-backed content cannot support;
- the specific content types that need runtime storage;
- the chosen provider or database;
- privacy and public-safe boundaries;
- export and backup strategy;
- validation commands that prove the site still renders without hidden runtime state.

Valid future reasons might include authenticated editing, comments, subscribers, private user state, or a non-Git publishing workflow. They do not include ordinary blog posts, case studies, proof logs, tags, or homepage curation.

## Guardrail

Run this validator after content architecture, package dependency, or page-routing changes:

    npm run validate:content-source-boundary

Run the content contract validator after adding or changing portfolio entries:

    npm run validate:portfolio-content

The validator checks that the documented source boundary exists, the package script remains wired, known database/CMS dependencies are not added accidentally, and portfolio source files do not introduce database or hosted-CMS environment contracts.
