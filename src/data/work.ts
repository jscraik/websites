export const caseStudies = [
  {
    slug: "ai-native-devrel",
    title: "AI-native DevRel",
    shortTitle: "AI DevRel",
    subtitle: "Building trust surfaces for agentic developer tools",
    date: "June 2026",
    isFeatured: true,
    overview: "This case study frames the first public article and proof log as one artifact: a position, a receipt, and a boundary.",
    organization: "brAInwav is Jamie's public proof surface for AI-native DevRel writing, demos, CLI work, and validation notes.",
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
      ["Challenge", "Trust gap", "AI work needs inspectable receipts"],
      ["Approach", "Proof loop", "Claim -> command -> evidence"],
      ["Outcome", "Reader path", "Clearer DevRel positioning"],
      ["Reader path", "Trust loop", "Claim -> evidence -> next action"]
    ]
  },
  {
    slug: "brainwav-io",
    title: "brAInwav",
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
      ["Challenge", "Identity", "Make the AI-native practice legible"],
      ["Approach", "Portfolio", "Editorial story plus proof surfaces"],
      ["Outcome", "Ecosystem", "Bridge to brAInwav depth"],
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
      ["Challenge", "Adoption", "Small tools need credible examples"],
      ["Approach", "Tutorial", "Docs and commands travel together"],
      ["Outcome", "Proof", "Expected output and caveats"],
      ["Tutorial", "Reader path", "From problem to repeatable use"]
    ]
  }
];

export const featuredCaseStudies = caseStudies.filter((study) => study.isFeatured).map((study) => ({
  title: study.title,
  href: study.route,
  summary: study.subtitle,
  frames: study.frames.slice(0, 3),
  ...study.featured
}));

export const proofWorkCards = [
  ...caseStudies.map((study, index) => ({
    title: study.shortTitle,
    eyebrow: study.date,
    summary: study.subtitle,
    index: index + 1,
    tags: study.tags.slice(0, 3),
    tone: study.tone,
    href: study.route
  })),
  {
    title: "Agent Skills",
    eyebrow: "Current",
    summary: "Reusable workflow capture and skill-led proof loops",
    index: caseStudies.length + 1,
    tags: ["Reusable", "Practice"],
    tone: "green",
    href: "/proof/"
  }
];

export const featuredCaseStudy = caseStudies.find((study) => study.isFeatured);
