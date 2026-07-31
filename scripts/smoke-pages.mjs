import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const pages = [
  {
    route: "/",
    file: "index.html",
    includes: ["Jamie Scott Craik", "AI-native DevRel", "SkillsBar", "/demos/skillsbar/"]
  },
  {
    route: "/blog/",
    file: "blog/index.html",
    includes: ["Blog", "Why AI-native DevRel"]
  },
  {
    route: "/proof/",
    file: "proof/index.html",
    includes: ["Proof surface", "All work", "Featured proof"]
  },
  {
    route: "/now/",
    file: "now/index.html",
    includes: ["About", "AI-native Developer Relations"]
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
    includes: ["Why AI-Native DevRel", "trust"]
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
  }
];

const absentPages = [
  { route: "/work/cli-proof-series/", file: "work/cli-proof-series/index.html" },
  { route: "/work/skillsbar/", file: "work/skillsbar/index.html" }
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

if (failures.length > 0) {
  console.error("Smoke page checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Smoke page checks passed for ${pages.length} generated routes.`);
