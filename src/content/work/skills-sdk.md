---
title: "Skills SDK"
shortTitle: "Skills SDK"
subtitle: "Portable contracts for inspectable AI skill packages"
date: "2026"
order: 2
publicationState: "published"
isFeatured: true
overview: "Skills SDK turns package identity, validation, manifests, and receipts into explicit Python contracts that another tool can inspect without inheriting claims from a different candidate."
organization: "An independent open-source Python project for maintainers building and checking Agent Skills packages. This case study inspects the committed version 0.1.0 contract."
work: "I defined the product boundary and acceptance standard, directed the contract design, inspected failure cases, and used Codex to implement the typed models, CLI, schemas, fixtures, and tests."
role: "Product direction, contract design, and AI-assisted software delivery"
tags:
  - "Python"
  - "Pydantic"
  - "CLI"
  - "Testing"
tone: "green"
featured:
  eyebrow: "From the Python contract layer"
  quote: "Check an AI skill package before sharing it, with clear results and explicit limits."
  cta: "Read case study"
  previewTitle: "Two implemented commands"
  previewMeta: "validate / build · typed pass and blocked outcomes"
  visual: "terminal"
proof:
  claim: "A standalone skill package can be checked and described by deterministic, candidate-bound contracts."
  evidence: "Committed Python source, Pydantic models, JSON schemas, synthetic fixtures, CLI tests, and explicit pass/blocked examples at the inspected revision."
  caveat: "The SDK does not run providers, install packages, mutate runtimes, publish to registries, or prove installed behavior."
frames:
  - ["Runtime", "Python 3.12", "Typed contract layer"]
  - ["Commands", "validate · build", "Implemented local CLI paths"]
  - ["Boundary", "Read-only", "No install or publication"]
caseStudy:
  problem:
    title: "Package evidence could lose the candidate it belonged to."
    body: "AI skill workflows produce many observations, but a green result is unsafe to reuse when the source revision or package content has changed. Maintainers needed portable data structures that preserve identity and blocked states."
  discovery:
    title: "The core needed to stay independent of every host."
    body: "Provider accounts, registries, installation, and runtime discovery have different authorities. The reusable layer could model their evidence without pretending to perform or verify those external operations."
  constraints:
    title: "Useful contracts without inflated capability."
    items:
      - "Package identity must bind a package ID, 40-character source revision, and SHA-256 content digest."
      - "Validation and build must be prompt-free, read-only, and explicit about blocked outcomes."
      - "Schemas must remain versioned and serializable for tools outside the repository."
      - "Discovery-only command names must not be presented as implemented execution paths."
  decisions:
    title: "Keep the surface small and the boundary precise."
    items:
      - "Ship validate and build as the implemented CLI paths in the 0.x contract-building series."
      - "Use Pydantic models and checked JSON schemas for portable wire contracts."
      - "Return typed findings and blockers instead of flattening failure into prose."
      - "Model runtime planning as a mutation-free intention, leaving host actions to future adapters."
  delivery:
    title: "A runnable contract layer with success and failure examples."
    body: "The repository includes a synthetic skill fixture, stable JSON output, schemas, and tests spanning package safety, receipts, evaluation, lifecycle, registry, risk, security, and runtime-evidence contracts."
  correction:
    title: "The public boundary now names what does not execute."
    body: "Earlier lifecycle language could be read as broader capability. The current source makes clear that only validate and build execute local package work; other command names expose help and discovery boundaries."
  outcome:
    title: "Maintainers can inspect a package result without guessing."
    body: "A valid fixture can produce a versioned pass or built receipt, while malformed identity produces a typed blocked result. This is local contract evidence, not provider, installation, registry, or adoption proof."
  roleBoundary:
    jamie: "Set the outcome and boundaries, selected the contract shape, challenged overclaims, inspected evidence, and owns the product and release decisions."
    codex: "Implemented Python models, CLI routes, schemas, fixtures, tests, and documentation under Jamie's direction and review."
  links:
    - label: "Explore the Skills SDK source"
      href: "https://github.com/jscraik/skills-sdk"
      primary: true
    - label: "Inspect the command contract"
      href: "https://github.com/jscraik/skills-sdk/blob/d7eb05289d321c03ddd47b49c6b292b56e510463/docs/cli.md"
      primary: false
---
