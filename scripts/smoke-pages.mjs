import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const pages = [
  {
    route: "/",
    file: "index.html",
    includes: ["Jamie Scott Craik", "Career-switching into professional software development", "SkillsBar", "Skills SDK", "/work/skillsbar/", "/work/skills-sdk/", "/editorial/when-evidence-goes-stale-v1.webp", "Evidence belongs to Candidate A"]
  },
  {
    route: "/404",
    file: "404.html",
    includes: ["Page not found", "Return to the homepage", "Browse the proof index", "noindex, nofollow"]
  },
  {
    route: "/blog/",
    file: "blog/index.html",
    includes: ["Blog", "When Evidence Goes Stale", "Capability Is Not Trust", "RSS feed", "/editorial/when-evidence-goes-stale-v1.webp", "Evidence belongs to Candidate A"]
  },
  {
    route: "/proof/",
    file: "proof/index.html",
    includes: ["Proof surface", "All work", "SkillsBar", "Skills SDK", "Writing and proof notes"]
  },
  {
    route: "/now/",
    file: "now/index.html",
    includes: ["About", "22 years in the British Army", "Warrant Officer Class 1", "University Campus North Lincolnshire", "June 2027"]
  },
  {
    route: "/contact/",
    file: "contact/index.html",
    includes: ["Contact", "Jamie"]
  },
  {
    route: "/demos/skillsbar/",
    file: "demos/skillsbar/index.html",
    includes: ["SkillsBar", "See what needs attention next.", "Installed copy found", "Publication", "Runtime"]
  },
  {
    route: "/articles/why-ai-native-devrel/",
    file: "articles/why-ai-native-devrel/index.html",
    includes: ["Capability Is Not Trust", "trustworthy adoption"]
  },
  {
    route: "/articles/when-evidence-goes-stale/",
    file: "articles/when-evidence-goes-stale/index.html",
    includes: ["When Evidence Goes Stale", "Identity before readiness", "Inspect the work behind the article"]
  },
  {
    route: "/work/ai-native-devrel/",
    file: "work/ai-native-devrel/index.html",
    includes: ["AI-native DevRel", "Building trust surfaces"]
  },
  {
    route: "/work/brainwav-io/",
    file: "work/brainwav-io/index.html",
    includes: ["jscraik.com", "proof-led AI work"]
  },
  {
    route: "/work/skillsbar/",
    file: "work/skillsbar/index.html",
    includes: ["SkillsBar", "How the delivery unfolded", "Read the current native app documentation"]
  },
  {
    route: "/work/skills-sdk/",
    file: "work/skills-sdk/index.html",
    includes: ["Skills SDK", "How the delivery unfolded", "Portable contracts for inspectable AI skill packages"]
  },
  {
    route: "/work/cli-proof-series/",
    file: "work/cli-proof-series/index.html",
    includes: ["CLI Tools", "wSearch queries Wikidata", "wiki.entity.get.v1", "arxiv.download.dryrun.v1", "planning-output evidence"]
  }
];

const absentPages = [];

const failures = [];

for (const page of pages) {
  const path = join("dist", page.file);

  if (!existsSync(path)) {
    failures.push(`${page.route}: missing dist artifact ${path}`);
    continue;
  }

  const html = readFileSync(path, "utf8");
  for (const expected of page.includes) {
    if (!html.includes(expected)) {
      failures.push(`${page.route}: expected text not found: ${expected}`);
    }
  }
}

for (const page of absentPages) {
  const path = join("dist", page.file);
  if (existsSync(path)) {
    failures.push(`${page.route}: unpublished or externally routed work must not generate ${path}`);
  }
}

const rssPath = join("dist", "blog", "rss.xml");
if (!existsSync(rssPath)) {
  failures.push("/blog/rss.xml: missing generated RSS artifact " + rssPath);
} else {
  const rss = readFileSync(rssPath, "utf8");
  for (const expected of ["When Evidence Goes Stale", "Capability Is Not Trust", "https://jscraik.com/articles/when-evidence-goes-stale/"]) {
    if (!rss.includes(expected)) {
      failures.push(`/blog/rss.xml: expected text not found: ${expected}`);
    }
  }
  for (const excluded of ["How I Direct Codex Without Outsourcing Judgment", "The Army-to-AI Delivery Bridge"]) {
    if (rss.includes(excluded)) {
      failures.push(`/blog/rss.xml: draft title must not appear in feed: ${excluded}`);
    }
  }
  const itemCount = (rss.match(/<item>/g) ?? []).length;
  if (itemCount !== 2) {
    failures.push(`/blog/rss.xml: expected 2 published items, found ${itemCount}`);
  }
}

const sitemap = readFileSync(join("dist", "sitemap.xml"), "utf8");
for (const match of sitemap.matchAll(/<loc\b[^>]*>([^<]+)<\/loc>/gi)) {
  let pathname;
  try {
    pathname = new URL(match[1].trim(), "https://jscraik.com").pathname;
  } catch {
    failures.push("/sitemap.xml: invalid loc URL.");
    continue;
  }
  if (["/404", "/404/", "/404.html"].includes(pathname)) {
    failures.push("/sitemap.xml: 404 recovery page must not be indexed.");
    break;
  }
}

if (failures.length > 0) {
  console.error("Smoke page checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Smoke page checks passed for ${pages.length} generated routes.`);
