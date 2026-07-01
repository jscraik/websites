export const caseStudies = [
  {
    slug: "ai-native-devrel",
    title: "AI-native DevRel",
    shortTitle: "AI DevRel",
    subtitle: "Building trust surfaces for agentic developer tools",
    date: "June 2026",
    isFeatured: true,
    overview: "This case study frames the first public article and proof log as one artifact: a position, a receipt, and a boundary.",
    organization: "brainwav.io is Jamie's public proof surface for AI-native DevRel writing, demos, CLI work, and validation notes.",
    work: "I am shaping the reader journey, writing the anchor article, and making evidence visible through proof cards, caveats, and command receipts.",
    role: "AI-native DevRel builder",
    tags: ["Article", "Proof log", "DevRel", "Trust"],
    tone: "paper",
    route: "/work/ai-native-devrel/",
    featured: {
      eyebrow: "From the position piece",
      quote: "The capability exists. The trust problem is what is left to solve.",
      cta: "Read case study",
      previewTitle: "Article plus public proof log",
      previewMeta: "Editorial article / trust loop / reader path",
      visual: "article"
    },
    frames: [
      ["Article", "Position piece", "Why AI-native DevRel?"],
      ["Receipt", "Command evidence", "Build output and screenshots"],
      ["Boundary", "Caveat", "What the proof does not prove"],
      ["Reader path", "Trust loop", "Claim -> evidence -> next action"]
    ]
  },
  {
    slug: "brainwav-io",
    title: "brainwav.io",
    shortTitle: "Proof Log",
    subtitle: "A personal site for proof-led AI work",
    date: "Current",
    isFeatured: true,
    overview: "The site turns private learning and local build evidence into a public reader journey without exposing private machinery.",
    organization: "The site exists to make Jamie's AI-native DevRel direction legible to developers, reviewers, and community contacts.",
    work: "I am building the Astro site, matching a high-taste editorial reference, and keeping proof boundaries visible while the work matures.",
    role: "Designer and developer",
    tags: ["Astro", "Portfolio", "Proof", "Writing"],
    tone: "dark",
    route: "/work/brainwav-io/",
    featured: {
      eyebrow: "From the site build",
      quote: "A public proof surface should make the claim, receipt, and boundary visible.",
      cta: "Read case study",
      previewTitle: "Prototype proof surface",
      previewMeta: "Personal site / portfolio / public notes",
      visual: "site"
    },
    frames: [
      ["Home", "Editorial entry", "Name, statement, profile chip"],
      ["About", "Personal archive", "Army standards to AI work"],
      ["Work", "Case study cards", "Proof-led public artifacts"],
      ["Footer", "Signature", "Small links and social proof"]
    ]
  },
  {
    slug: "cli-proof-series",
    title: "CLI proof series",
    shortTitle: "CLI Tools",
    subtitle: "Turning small tools into developer-facing artifacts",
    date: "Planned",
    isFeatured: false,
    overview: "rsearch and wsearch can become portfolio units when each tool has docs, command examples, validation receipts, and a useful tutorial.",
    organization: "The audience is developers evaluating whether agent-safe CLI workflows are understandable and inspectable.",
    work: "The next step is to validate current repo behavior, tighten docs, and publish one tutorial with exact command evidence.",
    role: "Technical writer and toolmaker",
    tags: ["CLI", "Docs", "Validation", "Tutorial"],
    tone: "peach",
    route: "/work/cli-proof-series/",
    featured: {
      eyebrow: "From the planned lane",
      quote: "Small developer tools become credible when the tutorial, command, and receipt travel together.",
      cta: "Read case study",
      previewTitle: "rsearch and wsearch",
      previewMeta: "CLI notes / tutorial / command examples",
      visual: "terminal"
    },
    frames: [
      ["CLI", "Command", "rsearch query"],
      ["Docs", "Guide", "Install and first useful run"],
      ["Validation", "Receipt", "Expected output and caveats"],
      ["Tutorial", "Reader path", "From problem to repeatable use"]
    ]
  }
];

export const featuredCaseStudies = caseStudies.filter((study) => study.isFeatured).map((study) => ({
  title: study.title,
  href: study.route,
  ...study.featured
}));

export const proofWorkCards = [
  ...caseStudies.map((study) => ({
    title: study.shortTitle,
    tags: study.tags.slice(0, 3),
    tone: study.tone,
    href: study.route
  })),
  { title: "Agent Skills", tags: ["Reusable", "Practice"], tone: "green", href: "/proof/" }
];

export const featuredCaseStudy = caseStudies.find((study) => study.isFeatured);
