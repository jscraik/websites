import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const pages = [
  {
    route: "/",
    file: "index.html",
    includes: ["Jamie Scott Craik", "AI workflow delivery", "SkillsBar", "/work/skillsbar/"]
  },
  {
    route: "/blog/",
    file: "blog/index.html",
    includes: ["Blog", "When Evidence Goes Stale", "Capability Is Not Trust", "RSS feed"]
  },
  {
    route: "/proof/",
    file: "proof/index.html",
    includes: ["Proof surface", "All work", "Featured proof"]
  },
  {
    route: "/now/",
    file: "now/index.html",
    includes: ["About", "customer-facing AI deployment", "life-changing injury"]
  },
  {
    route: "/contact/",
    file: "contact/index.html",
    includes: ["Contact", "Jamie"]
  },
  {
    route: "/demos/skillsbar/",
    file: "demos/skillsbar/index.html",
    includes: ["SkillsBar", "When evidence goes stale.", "Candidate held"]
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
    includes: ["SkillsBar", "How the delivery unfolded", "Inspect the merged adaptive delivery"]
  }
];

const absentPages = [
  { route: "/work/cli-proof-series/", file: "work/cli-proof-series/index.html" }
];

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

if (failures.length > 0) {
  console.error("Smoke page checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Smoke page checks passed for ${pages.length} generated routes.`);
