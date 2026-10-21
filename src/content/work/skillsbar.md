---
title: "SkillsBar"
shortTitle: "SkillsBar"
subtitle: "A macOS menu-bar app for inspecting AI skill evidence"
date: "Current"
order: 1
publicationState: "published"
isFeatured: true
overview: "SkillsBar shows which checks belong to the selected skill package, which stages still need proof, and the next command to inspect or copy. A Tessl registry result stays separate from the local package evidence."
organization: "SkillsBar is a native SwiftUI menu-bar app for macOS 14 and later. It is currently a local prototype with scripts for packaging the app. The current local build discovers installed Codex and Agents skills and versioned plugin skills, alongside a configured agent-skills source checkout. Live Tessl observations additionally require an available, authenticated Tessl CLI."
work: "I defined the problem: checks from an older skill package could still appear to support a release. I designed the release model and interactions, then used Codex to implement and test the native app and the demo built with mock data."
role: "Product direction, AI workflow design, and evaluation"
tags:
  - "Interactive demo"
  - "Evidence"
  - "AI skills"
  - "Developer experience"
tone: "blue"
capture:
  src: "/products/skillsbar/focus-navigator-20261020.png"
  alt: "SkillsBar nine-stage focus navigator with Identity and Validation passed and Security selected as the next required stage in a deterministic fixture."
  width: 460
  height: 586
  caption: "App-rendered dark fixture captured on 20 October 2026. Security is the next required stage; the critical and high findings are synthetic examples, not findings about a live skill. Copy command does not run the command. This is a deterministic snapshot, not proof of live menu interaction."
featured:
  eyebrow: "From the interactive demo"
  quote: "See which release checks are current, which are missing, and what needs attention next."
  cta: "Read case study"
  previewTitle: "Nine-stage evidence inspector"
  previewMeta: "Native app fixture · synthetic security findings · not a live integration"
  visual: "skills"
proof:
  claim: "Release confidence should be inspectable, not inferred."
  evidence: "The native source implements a nine-stage navigator, selected-stage details, expandable command text, command copying and separate Tessl registry observations. The portfolio's interactive web demo uses three fixed examples: security review, missing identity and an installed copy with unproven evidence."
  caveat: "Source inspection and fixture images do not prove a live integration, installed runtime behaviour or notarised distribution. The web demo uses mock data and does not run SDK commands."
frames:
  - ["Platform", "macOS 14+", "Native SwiftUI menu-bar app"]
  - ["Navigator", "9 stages", "Inspect a stage without changing its status"]
  - ["Action", "Copy command", "Copying does not execute it"]
caseStudy:
  problem:
    title: "The release decision could inherit stale evidence."
    body: "A changed Skill candidate could still appear safe because validation, evaluation, registry, and runtime observations belonged to an older package. The maintainer needed to know which evidence still counted before acting on a release."
  discovery:
    title: "A score was context, not candidate proof."
    body: "A registry score describes a registry observation; it does not establish that the local package has passed its checks. SkillsBar keeps those observations separate and checks downstream receipts against the current package digest, the identifier for that exact package. Missing, malformed or mismatched evidence must not become a passed stage."
  constraints:
    title: "Each check had to stay tied to the right package."
    items:
      - "Candidate identity had to be established before downstream evidence could count."
      - "Local validation, security, evaluation, registry, runtime, review, and release truth had to remain separate."
      - "Demo fixtures needed explicit labels so deterministic presentation could not be mistaken for live provider evidence."
      - "Provider-backed or publishing operations could not run automatically when the app opened."
  decisions:
    title: "I made each release stage easier to inspect."
    items:
      - "Model the journey as a nine-gate evidence chain rather than one blended readiness score."
      - "Hold downstream gates when the canonical candidate identity is missing or stale."
      - "Show the next required stage while allowing the maintainer to inspect any of the nine stages."
      - "Expand Show command to inspect the full command; Copy command copies it without running it."
      - "Keep the public web demo on safe mock data and state its non-production boundary."
      - "Discover installed skills without borrowing source-checkout receipts: an installed copy remains Unproven until its checked-source evidence is linked."
  delivery:
    title: "Nine stages, one selected detail panel."
    body: "The native app presents Identity, Validation, Security, Eval prep, Local eval, Cloud eval, Staging, Publication and Runtime in a three-column navigator. Selecting a stage changes the detail panel without changing the next required stage or the evidence status. The app can inspect local SDK checks and read saved evaluation, publication and runtime receipts; it does not automatically start provider-backed evaluations, publish a package or install a runtime when opened. These stages describe the intended lifecycle; several still need implementation or live integration proof. The separate web demo explains the release decision with fixed data and no credentials."
  correction:
    title: "Inspection must not look like a release decision."
    body: "The current interface distinguishes the next required stage from a stage selected for inspection. Selection is preserved during refresh for the same candidate and reset for a new candidate. Command details can be expanded before copying, and registry observations have their own disclosure. Selecting, copying or refreshing a stage does not supply its missing evidence."
  outcome:
    title: "A working local prototype with explicit limits."
    body: "The repository provides native source, deterministic fixtures, tests and build, launch and packaging scripts. The local build inspected on 20 October 2026 also discovers installed skills through the ellipsis menu → Select skill, with origins and plugin versions identified. Those discovery changes are local development work, not a published release. Installed copies remain Unproven until checked-source evidence is linked. A notarised public release still requires a Developer ID identity and Apple notarisation credentials. External adoption and successful live SDK, Tessl or installed-runtime sessions have not been established by this case study."
  roleBoundary:
    jamie: "I framed the trust problem, chose the nine-gate model, directed the interface and inspected failures. I checked the public explanation and remain responsible for its accuracy."
    codex: "Proposed implementation options, wrote Swift and web code within Jamie's direction, added fixtures and tests, and supported inspection and validation without approving release claims."
  links:
    - label: "Read the current native app documentation"
      href: "https://github.com/jscraik/skillsbar#readme"
      primary: false
    - label: "Explore the SkillsBar source"
      href: "https://github.com/jscraik/skillsbar"
      primary: false
    - label: "Read the native demo and its evidence limits"
      href: "https://github.com/jscraik/skillsbar/blob/main/DEMO.md"
      primary: false
    - label: "Try the safe-data demo"
      href: "/demos/skillsbar/"
      primary: true
---
