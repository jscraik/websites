---
title: "SkillsBar"
shortTitle: "SkillsBar"
subtitle: "Making stale evidence visible before release"
date: "Current"
order: 1
publicationState: "published"
isFeatured: true
overview: "SkillsBar turns candidate-bound release evidence into an interface a maintainer can inspect, challenge, and act on."
organization: "SkillsBar is a public SwiftUI prototype and interactive web explanation for maintainers deciding whether an AI Skill has enough current evidence to move toward release."
work: "I framed the stale-evidence problem, defined the candidate-bound release model, directed the product and interaction decisions, and used Codex to implement and test the native application and public-safe demo."
role: "Product direction, AI workflow design, and evaluation"
tags:
  - "Interactive demo"
  - "Evidence"
  - "AI skills"
  - "Developer experience"
tone: "blue"
capture:
  src: "/products/skillsbar/native-demo-fixture.png"
  alt: "Historical native demo fixture showing a missing candidate identity and held downstream evidence gates."
  width: 404
  height: 560
  caption: "Historical SkillsBar native demo fixture, version 0.2.0. The image retains its earlier SKILLS SDK heading. Candidate identity is missing; the Tessl score is a historical registry baseline, not proof for this candidate. The linked interactive web demo uses a separate fixture."
featured:
  eyebrow: "From the interactive demo"
  quote: "A changed candidate should not inherit proof that no longer belongs to it."
  cta: "Read case study"
  previewTitle: "Candidate held"
  previewMeta: "11 / 100 readiness · next required: candidate identity"
  visual: "skills"
proof:
  claim: "Release confidence should be inspectable, not inferred."
  evidence: "Interactive SkillsBar demo with three release scenarios, evidence gates, and explicit next actions."
  caveat: "The demo uses safe mock data and does not prove a production service or registry integration."
frames:
  - ["Candidate", "0.4.2", "Digest-bound local identity"]
  - ["Readiness", "11 / 100", "Downstream proof held"]
  - ["Next required", "Candidate identity", "Build the canonical receipt"]
caseStudy:
  problem:
    title: "The release decision could inherit stale evidence."
    body: "A changed Skill candidate could still appear safe because validation, evaluation, registry, and runtime observations belonged to an older package. The maintainer needed to know which evidence still counted before acting on a release."
  discovery:
    title: "A score was context, not candidate proof."
    body: "The product could not treat a registry score or a green local check as universal readiness. Every downstream receipt had to bind to one canonical package digest, while historical and external observations remained visible only as context."
  constraints:
    title: "The interface had to preserve the evidence boundary."
    items:
      - "Candidate identity had to be established before downstream evidence could count."
      - "Local validation, security, evaluation, registry, runtime, review, and release truth had to remain separate."
      - "Demo fixtures needed explicit labels so deterministic presentation could not be mistaken for live provider evidence."
      - "Provider-backed or publishing operations could not run automatically when the app opened."
  decisions:
    title: "Jamie made the release logic inspectable."
    items:
      - "Model the journey as a nine-gate evidence chain rather than one blended readiness score."
      - "Hold downstream gates when the canonical candidate identity is missing or stale."
      - "Expose one exact next command so the maintainer can repair the weakest gate first."
      - "Keep the public web demo on safe mock data and state its non-production boundary."
  delivery:
    title: "A native product and a public-safe explanation."
    body: "The public repository contains the SwiftUI menu-bar application, deterministic demo fixtures, package and launch routes, and a public walkthrough. The portfolio adds an interactive safe-data version that explains the same release decision without credentials or production endpoints."
  correction:
    title: "The first interface overstated a fixed gate."
    body: "An earlier presentation treated the focused gate too rigidly. The merged adaptive pipeline work derived the active section from receipt state, added light and dark coverage, moved scanning off the main actor, and constrained inherited shell configuration."
  outcome:
    title: "The next action is visible without inventing readiness."
    body: "A maintainer can inspect why a candidate is held, distinguish current proof from historical context, and copy the next corrective command. Merged pull request 6 records a passing Swift build and 80 executed tests; it does not prove notarized distribution, external adoption, or a production registry integration."
  roleBoundary:
    jamie: "Framed the trust problem, chose the nine-gate model, made product and taste decisions, inspected failures, required bounded claims, and owns the public explanation."
    codex: "Proposed implementation options, wrote Swift and web code within Jamie's direction, added fixtures and tests, and supported inspection and validation without approving release claims."
  links:
    - label: "Inspect the merged adaptive delivery"
      href: "https://github.com/jscraik/skillsbar/pull/6"
      primary: true
    - label: "Explore the SkillsBar source"
      href: "https://github.com/jscraik/skillsbar"
      primary: false
    - label: "Try the safe-data demo"
      href: "/demos/skillsbar/"
      primary: false
---
