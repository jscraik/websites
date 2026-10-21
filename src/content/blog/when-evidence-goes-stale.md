---
title: "When Evidence Goes Stale"
date: "August 2026"
order: 1
publicationState: "published"
category: "Deployment note"
summary: "A changed AI Skill candidate should not inherit proof that belongs to an older package. SkillsProof turns that failure mode into an inspectable release decision."
href: "/articles/when-evidence-goes-stale/"
proofLink: "/work/skillsbar/"
featured: true
featureImage:
  src: "/editorial/when-evidence-goes-stale-v1.webp"
  alt: "Evidence belongs to Candidate A; an interrupted connection prevents it transferring to the changed Candidate B."
  width: 1672
  height: 941
proof:
  claim: "Release confidence should be bound to the exact candidate under review."
  evidence: "SkillsProof case study, public repository, safe-data demo, merged pull request 6, and its recorded Swift build and 80-test result."
  caveat: "The evidence proves a local implementation and bounded interaction model, not notarized distribution, production registry integration, or external adoption."
---
