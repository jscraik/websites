import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const pages = [
  {
    route: "/",
    file: "index.html",
    includes: ["Jamie Scott Craik", "AI-native DevRel", "Featured work"]
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
    includes: ["brainwav.io", "proof-led AI work"]
  }
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

if (failures.length > 0) {
  console.error("Smoke page checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Smoke page checks passed for ${pages.length} generated routes.`);
