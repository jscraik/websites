import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const candidateBaseURL = process.env.CANDIDATE_BASE_URL || "http://127.0.0.1:4324";
const referenceBaseURL = process.env.REFERENCE_BASE_URL || "https://www.joseocando.com";
const outputRoot = process.env.PARITY_OUTPUT_DIR || "artifacts/parity-measurements";

const viewports = [
  { name: "mobile", width: 393, height: 852 },
  { name: "desktop", width: 1440, height: 900 }
];

const pages = [
  { name: "home", path: "/" },
  { name: "about", referencePath: "/about", candidatePath: "/now/" },
  { name: "about-fun-facts", referencePath: "/about#fun-facts", candidatePath: "/now/#fun-facts" },
  { name: "blog", path: "/blog/" }
];

function pageURL(base, page, label) {
  const pagePath = label === "reference"
    ? page.referencePath || page.path
    : page.candidatePath || page.path;
  return new URL(pagePath, base).toString();
}

function safeName(value) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

async function capture(browser, label, baseURL, pageDef, viewport) {
  const page = await browser.newPage({ viewport });
  const url = pageURL(baseURL, pageDef, label);
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

  if (pageDef.name === "about-fun-facts") {
    await page.evaluate(() => document.querySelector("#fun-facts")?.scrollIntoView());
  }

  const fileName = label + "-" + safeName(pageDef.name) + "-" + viewport.name + ".png";
  const screenshotPath = path.join(outputRoot, "screenshots", fileName);
  await mkdir(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, animations: "disabled", fullPage: false });

  const data = await page.evaluate(() => {
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const textOf = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();

    const byText = (text, root = document) => {
      const needle = text.toLowerCase();
      return [...root.querySelectorAll("a, h1, h2, h3, p, span, div, li")]
        .find((el) => visible(el) && textOf(el).toLowerCase().includes(needle));
    };

    const byExactText = (text, root = document) => {
      const needle = text.toLowerCase();
      return [...root.querySelectorAll("a, h1, h2, h3, p, span, div, li")]
        .find((el) => visible(el) && textOf(el).toLowerCase() === needle);
    };

    const sectionAfterHeading = (text) => {
      const heading = byExactText(text) || byText(text);
      return heading?.closest("section, header, main > div, div") || heading;
    };

    const styleOf = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        className: typeof el.className === "string" ? el.className : "",
        text: textOf(el).slice(0, 180),
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom)
        },
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        border: cs.border,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        opacity: cs.opacity,
        display: cs.display,
        gridTemplateColumns: cs.gridTemplateColumns,
        gap: cs.gap,
        columnGap: cs.columnGap,
        rowGap: cs.rowGap,
        margin: cs.margin,
        padding: cs.padding,
        transform: cs.transform,
        transition: cs.transition
      };
    };

    const nav = document.querySelector("nav") || byText("Work")?.closest("div");
    const h1 = document.querySelector("h1");
    const intro = byText("deepest joys") || byText("Welcome. I'm Jose") || byText("I am building toward") || byText("One of the hardest");
    const profile = byText("Brand Designer")?.closest("div") || byText("AI-native DevRel")?.closest("div");
    const start = byText("Where you can start")?.closest("aside, div, section") || byText("Get to know me")?.closest("aside, div, section");
    const draft = byText("In my drafts")?.closest("div, section");
    const latest = byText("Latest article")?.closest("article, section, div");
    const funFacts = sectionAfterHeading("Fun Facts");
    const firstCard = funFacts?.querySelector("article, [role='listitem'], .w-dyn-item") || byText("Favorite Book")?.closest("article, div");
    const footer = document.querySelector("footer") || [...document.querySelectorAll("div")].find((el) => textOf(el).includes("CONTACT") && textOf(el).includes("LinkedIn"));

    return {
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight },
      body: styleOf(document.body),
      nav: styleOf(nav),
      h1: styleOf(h1),
      intro: styleOf(intro),
      profile: styleOf(profile),
      start: styleOf(start),
      draft: styleOf(draft),
      latest: styleOf(latest),
      funFacts: styleOf(funFacts),
      firstCard: styleOf(firstCard),
      footer: styleOf(footer),
      colors: [...new Set([...document.querySelectorAll("body *")]
        .slice(0, 500)
        .flatMap((el) => {
          const cs = getComputedStyle(el);
          return [cs.color, cs.backgroundColor, cs.borderTopColor].filter((value) => value && value !== "rgba(0, 0, 0, 0)");
        }))]
        .slice(0, 40)
    };
  });

  await page.close();
  return { label, page: pageDef.name, viewport, screenshotPath, data };
}

await mkdir(outputRoot, { recursive: true });
const browser = await chromium.launch({ headless: true });
const rows = [];

for (const viewport of viewports) {
  for (const pageDef of pages) {
    rows.push(await capture(browser, "reference", referenceBaseURL, pageDef, viewport));
    rows.push(await capture(browser, "candidate", candidateBaseURL, pageDef, viewport));
  }
}

await browser.close();

const outPath = path.join(outputRoot, "metrics.json");
await writeFile(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2));

const digest = rows.map((row) => ({
  label: row.label,
  page: row.page,
  viewport: row.viewport.name,
  screenshotPath: row.screenshotPath,
  bodyBackground: row.data.body?.backgroundColor,
  nav: row.data.nav,
  h1: row.data.h1,
  intro: row.data.intro,
  start: row.data.start,
  draft: row.data.draft,
  latest: row.data.latest,
  funFacts: row.data.funFacts,
  firstCard: row.data.firstCard
}));

console.log(JSON.stringify({ outPath, digest }, null, 2));
