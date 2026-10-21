---
title: "CLI Tools"
shortTitle: "CLI Tools"
subtitle: "Turning small tools into developer-facing artifacts"
date: "Current"
order: 3
publicationState: "published"
isFeatured: false
overview: "wSearch queries Wikidata through explicit network and user-agent gates; rSearch searches and fetches arXiv material with structured output and documented limits."
organization: "The audience is developers evaluating whether agent-safe CLI workflows are understandable and inspectable."
work: "I defined the safety and operator experience, directed the TypeScript implementations, and used Codex to build, test, and document the command paths."
role: "Technical writer and toolmaker"
tags:
  - "CLI"
  - "Docs"
  - "Validation"
  - "TypeScript"
tone: "peach"
featured:
  eyebrow: "From the working CLI projects"
  quote: "A useful command should make its network boundary and failure mode obvious."
  cta: "Read case study"
  previewTitle: "rsearch and wsearch"
  previewMeta: "Wikidata and arXiv / typed output / explicit limits"
  visual: "terminal"
proof:
  claim: "Small TypeScript CLIs can expose useful research data with explicit safety and automation contracts."
  evidence: "Clean-revision CLI checks cover wSearch help, denied network access, and one live Wikidata retrieval, plus two fixture-backed rSearch dry-run outcomes."
  caveat: "One successful request is not a reliability benchmark. Installed releases, live rSearch retrieval or downloads, and adoption remain unverified here."
frames:
  - ["wSearch", "Wikidata", "Explicit network and user-agent gates"]
  - ["rSearch", "arXiv", "Search, fetch, and download commands"]
  - ["Boundary", "Source CLI checked", "Installed releases not verified"]
caseStudy:
  problem:
    title: "A research command needs a predictable failure path."
    body: "A script consuming research data needs to distinguish a successful result from denied network access or invalid arguments. A readable error alone is not enough for another program to act on."
  discovery:
    title: "The two tools expose different research sources."
    body: "wSearch queries Wikidata; rSearch provides arXiv search, fetch, and download commands. Their source contracts describe output envelopes and input limits, but those descriptions need executable checks before they become runtime claims."
  constraints:
    title: "Make the network boundary visible."
    items:
      - "wSearch requires explicit network permission and a user agent for remote requests."
      - "Offline checks must not be described as successful research retrieval."
      - "A source checkout test does not prove the behavior of an installed release."
  decisions:
    title: "Start with the operator's first two questions."
    items:
      - "Can I discover the command syntax without making a request?"
      - "Can my script identify a denied request from structured output?"
      - "Keep live wSearch retrieval separate from fixture-backed rSearch dry runs."
  delivery:
    title: "Check the failure boundary, then retrieve one entity."
    body: "From a clean wSearch revision, --json entity get Q42 without network permission returns wiki.error.v1 with E_POLICY; --json --plain help exits 0 without stderr. With explicit network permission and a user agent, entity get Q42 returned wiki.entity.get.v1, status success, and ID Q42 from Wikidata. The request used isolated configuration, a ten-second timeout, and no retries."
  correction:
    title: "Replace implied proof with the observed boundary."
    body: "This case study originally described expected output without an executed example. Clean-revision rSearch checks now also launch the CLI with a test client: download 2101.00001 --dry-run --json exits 0 with arxiv.download.dryrun.v1; an invalid ID exits 4 with status warn and a would-fail result. This is planning-output evidence, not proof of a downloaded paper or live arXiv retrieval."
  outcome:
    title: "Discovery, rejection, retrieval, and planning have distinct evidence."
    body: "Two wSearch offline checks, one live Wikidata request, and two rSearch dry-run checks passed from pinned source revisions. They show bounded operator paths, not installed-release verification, service reliability, or measured adoption. Live rSearch retrieval and download behavior remain separate work."
  roleBoundary:
    jamie: "Defined the tool direction, safety expectations, and operator experience, and owns the decision to publish the work."
    codex: "Assisted with implementation and documentation, inspected source contracts, and ran the clean-revision CLI checks and bounded Wikidata request."
  links:
    - label: "Inspect the wSearch test definitions"
      href: "https://github.com/jscraik/wSearch/blob/60c1389a3ee209997deb8cf534599be4a8d84e53/tests/cli.test.ts"
      primary: true
    - label: "Inspect the rSearch dry-run tests"
      href: "https://github.com/jscraik/rSearch/blob/40449ebb0e9d439870e02aaccf6143a53e68215e/tests/cli.test.ts"
      primary: false
---
