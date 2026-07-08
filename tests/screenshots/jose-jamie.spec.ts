import { test, type Page } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { stableScreenshotStyle } from "../helpers/visual";

const referenceBaseURL = process.env.REFERENCE_BASE_URL;
const candidateBaseURL = process.env.CANDIDATE_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4321";
const outputRoot = process.env.SCREENSHOT_OUTPUT_DIR ?? "artifacts/screenshots";

type RectMetrics = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type NavItemMetrics = {
  text: string;
  aria: string | null;
  rect: RectMetrics;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
};

type TopbarMetrics = {
  nav: RectMetrics;
  navPaddingLeft: number;
  navPaddingRight: number;
  items: NavItemMetrics[];
};

type SurfaceMetrics = {
  nav: RectMetrics | null;
  sampleColor: [number, number, number];
  h1: RectMetrics | null;
  lead: (RectMetrics & {
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
  }) | null;
  aside: RectMetrics | null;
  portrait: RectMetrics | null;
  cards: RectMetrics[];
  blocks: RectMetrics[];
  topContaminationCount: number;
  bottomContaminationCount: number;
};

type PixelDiffMetrics = {
  mismatches: number;
  ratio: number;
  width: number;
  height: number;
};

type EffectMetrics = {
  linkTransitionMs: number;
  linkTransitionTiming: string;
  buttonTransitionMs: number;
  buttonTransitionTiming: string;
};

const viewports = [
  { name: "mobile", width: 393, height: 852 },
  { name: "desktop", width: 1440, height: 1000 }
] as const;

const captures = [
  { name: "home-top", path: "/", scrollY: 0 },
  { name: "home-work", path: "/", scrollY: 780 },
  { name: "about-top", path: "/now/", referencePath: "/about", candidatePath: "/now/", scrollY: 0 },
  { name: "about-fun-facts", path: "/now/#fun-facts", referencePath: "/about#fun-facts", candidatePath: "/now/#fun-facts" },
  { name: "about-skills", path: "/now/#skills", referencePath: "/about#skills", candidatePath: "/now/#skills" },
  { name: "about-work-history", path: "/now/#current-focus", referencePath: "/about#work-history", candidatePath: "/now/#current-focus" },
  { name: "about-on-web", path: "/now/#on-the-web", referencePath: "/about#recognition", candidatePath: "/now/#on-the-web" },
  { name: "blog-top", path: "/blog/", scrollY: 0 },
  { name: "footer", path: "/", selector: ".site-footer" }
] as const;

const pixelRatioBudgets: Record<string, number> = {
  "home-top-desktop": 0.34,
  "home-top-mobile": 0.3,
  "home-work-desktop": 0.72,
  "home-work-mobile": 0.79,
  "about-top-desktop": 0.26,
  "about-top-mobile": 0.11,
  "about-fun-facts-desktop": 0.17,
  "about-fun-facts-mobile": 0.23,
  "about-skills-desktop": 0.94,
  "about-skills-mobile": 0.96,
  "about-work-history-desktop": 0.98,
  "about-work-history-mobile": 0.98,
  "about-on-web-desktop": 0.96,
  "about-on-web-mobile": 0.98,
  "blog-top-desktop": 0.26,
  "blog-top-mobile": 0.17
};

const structuredSurfaceCaptures = [
  "blog-top",
  "about-top",
  "about-fun-facts",
  "about-skills",
  "about-work-history",
  "about-on-web"
];

test.describe("Jose and Jamie screenshot contact sheet", () => {
  test("capture paired reference and prototype frames", async ({ page }, testInfo) => {
    test.skip(!referenceBaseURL, "REFERENCE_BASE_URL environment variable must be set");

    const rows: string[] = [];
    const activeViewports = viewports.filter((viewport) => testInfo.project.name.includes(viewport.name));
    const projectViewports = activeViewports.length > 0 ? activeViewports : viewports;

    for (const viewport of projectViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const capture of captures) {
        const pairName = `${capture.name}-${viewport.name}`;
        const reference = await captureFrame(page, referenceBaseURL!, capture, `jose/${pairName}.png`);
        const candidate = await captureFrame(page, candidateBaseURL, capture, `jamie/${pairName}.png`);
        const diff = await writeDiff(reference.filePath, candidate.filePath, `diff/${pairName}.png`);
        if (diff) {
          await writePixelMetrics(pairName, diff.metrics);
          assertPixelBudget(pairName, diff.metrics);
        }

        if (capture.name === "home-top") {
          const referenceTopbar = await measureTopbar(page, referenceBaseURL!, capture);
          const candidateTopbar = await measureTopbar(page, candidateBaseURL, capture);
          await writeTopbarMetrics(pairName, referenceTopbar, candidateTopbar);
          assertTopbarParity(pairName, referenceTopbar, candidateTopbar);

          const referenceEffects = await measureEffects(page, referenceBaseURL!, capture);
          const candidateEffects = await measureEffects(page, candidateBaseURL, capture);
          await writeEffectMetrics(pairName, referenceEffects, candidateEffects);
          assertEffectParity(pairName, referenceEffects, candidateEffects);
        }

        if (structuredSurfaceCaptures.includes(capture.name)) {
          const referenceSurface = await measureSurface(page, referenceBaseURL!, capture);
          const candidateSurface = await measureSurface(page, candidateBaseURL, capture);
          await writeSurfaceMetrics(pairName, referenceSurface, candidateSurface);
          assertSurfaceParity(pairName, capture.name, viewport.name, referenceSurface, candidateSurface);
        }

        rows.push(renderRow(pairName, reference.relativePath, candidate.relativePath, diff?.relativePath));
      }
    }

    await writeContactSheet(rows);
  });
});

async function captureFrame(
  page: Page,
  baseURL: string,
  capture: (typeof captures)[number],
  relativePath: string
) {
  const routePath =
    baseURL === referenceBaseURL
      ? "referencePath" in capture
        ? capture.referencePath
        : capture.path
      : "candidatePath" in capture
        ? capture.candidatePath
        : capture.path;
  const url = new URL(routePath, baseURL).toString();
  const filePath = path.join(outputRoot, relativePath);

  await mkdir(path.dirname(filePath), { recursive: true });
  await page.goto(url);
  await page.addStyleTag({ content: stableScreenshotStyle });
  await settleHashScroll(page, url);

  if ("scrollY" in capture) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), capture.scrollY);
  }

  if ("selector" in capture) {
    const selector = capture.selector === ".site-footer" ? ".site-footer, footer" : capture.selector;
    const target = page.locator(selector).first();
    if ((await target.count()) === 0) {
      throw new Error(`Selector "${selector}" not found at ${url}`);
    }
    await target.screenshot({ path: filePath, animations: "disabled" });
    return { filePath, relativePath };
  }

  await page.screenshot({ path: filePath, animations: "disabled" });
  return { filePath, relativePath };
}

async function measureSurface(page: Page, baseURL: string, capture: (typeof captures)[number]): Promise<SurfaceMetrics> {
  const routePath =
    baseURL === referenceBaseURL
      ? "referencePath" in capture
        ? capture.referencePath
        : capture.path
      : "candidatePath" in capture
        ? capture.candidatePath
        : capture.path;

  await page.goto(new URL(routePath, baseURL).toString());
  await page.addStyleTag({ content: stableScreenshotStyle });
  await settleHashScroll(page, new URL(routePath, baseURL).toString());

  return page.evaluate((captureName) => {
    const toRect = (rect: DOMRect): RectMetrics => ({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    });
    const toNumber = (value: string) => Number.parseFloat(value) || 0;
    const withType = (element: Element | null) => {
      if (!element) return null;
      const style = window.getComputedStyle(element);
      return {
        ...toRect(element.getBoundingClientRect()),
        fontSize: toNumber(style.fontSize),
        fontWeight: toNumber(style.fontWeight),
        lineHeight: toNumber(style.lineHeight)
      };
    };
    const visibleRect = (element: Element | null) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) return null;
      return toRect(rect);
    };
    const mediaPanelRect = (element: Element) => {
      if (!(element instanceof HTMLImageElement)) return visibleRect(element);

      let panel: Element = element;
      let parent = element.parentElement;
      while (parent) {
        const imageRect = element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        if (parentRect.width >= imageRect.width * 1.45 && parentRect.height >= imageRect.height * 1.45) {
          panel = parent;
          break;
        }
        parent = parent.parentElement;
      }

      return visibleRect(panel);
    };
    const byText = (selector: string, text: string) =>
      [...document.querySelectorAll(selector)].find((element) => element.textContent?.trim() === text) ?? null;
    const containsText = (selector: string, text: string) =>
      [...document.querySelectorAll(selector)].find((element) => element.textContent?.includes(text)) ?? null;
    const nav = visibleRect(document.querySelector(".nav-inner") ?? document.querySelector("nav"));
    const sampleElement = document.elementFromPoint(20, 20) ?? document.body;
    const sampleColor = window
      .getComputedStyle(sampleElement)
      .backgroundColor.match(/\d+(?:\.\d+)?/g)
      ?.slice(0, 3)
      .map(Number) as [number, number, number] | undefined;

    const headingElement =
      captureName === "about-fun-facts"
        ? byText("h2", "Fun Facts")
        : captureName === "about-skills"
          ? byText("h2, h3", "Skills")
          : captureName === "about-work-history"
            ? byText("h2, h3", "Work history") ?? byText("h2, h3", "Current focus")
            : captureName === "about-on-web"
              ? byText("h2, h3", "On the web") ?? byText("h2, h3", "Links")
              : document.querySelector("h1") ?? byText("h2, .h1, [class*='heading']", "Blog");
    const h1 = visibleRect(headingElement);
    const surfaceRoot =
      headingElement?.closest("section") ??
      headingElement?.parentElement?.parentElement ??
      document;
    const topContaminationCount =
      captureName === "about-skills" || captureName === "about-work-history" || captureName === "about-on-web"
        ? [...document.querySelectorAll("body *")]
            .filter((element) => !surfaceRoot.contains(element))
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              const text = element.textContent?.trim() ?? "";
              return text.length > 0 && rect.width > 20 && rect.height > 8 && rect.y >= -1 && rect.y < 80;
            }).length
        : 0;
    const bottomContaminationCount =
      captureName === "about-on-web"
        ? [...document.querySelectorAll("body *")]
            .filter((element) => !surfaceRoot.contains(element))
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              const text = element.textContent?.trim() ?? "";
              return text.length > 0 && rect.width > 20 && rect.height > 8 && rect.y > window.innerHeight * 0.72 && rect.y < window.innerHeight;
            }).length
        : 0;
    const lead =
      captureName === "blog-top"
        ? withType(
            containsText("h2, h3", "Why AI-native DevRel") ??
              containsText("h2, h3", "creative direction") ??
              document.querySelector("article h2, article h3")
          )
        : null;
    const aside =
      captureName === "about-top"
        ? visibleRect(document.querySelector(".about-sidebar") ?? containsText("aside, div, nav", "Get to know me"))
        : null;
    const portrait =
      captureName === "about-top"
        ? visibleRect(document.querySelector(".about-portrait") ?? document.querySelector("img[alt*='Portrait'], img[alt*='Jamie']"))
        : null;
    const cardSources =
      document.querySelectorAll(".about-object").length > 0
        ? [...document.querySelectorAll(".about-object")]
        : [...document.querySelectorAll("img")];
    const cards =
      captureName === "about-fun-facts"
        ? cardSources
            .map(mediaPanelRect)
            .filter((rect): rect is RectMetrics => Boolean(rect))
            .filter((rect) => rect.width >= 100 && rect.height >= 100)
            .filter((rect) => rect.y >= -1)
            .slice(0, 4)
        : [];
    const blocks =
      captureName === "about-skills" || captureName === "about-work-history" || captureName === "about-on-web"
        ? [...surfaceRoot.querySelectorAll("article, .about-skill-list article, .about-history article, .web-table a, li, h3")]
            .map(visibleRect)
            .filter((rect): rect is RectMetrics => Boolean(rect))
            .filter((rect) => rect.y >= -20 && rect.width >= 80 && rect.height >= 16)
            .slice(0, 8)
        : [];

    return { nav, sampleColor: sampleColor ?? [0, 0, 0], h1, lead, aside, portrait, cards, blocks, topContaminationCount, bottomContaminationCount };
  }, capture.name);
}

async function settleHashScroll(page: Page, url: string) {
  const hash = new URL(url).hash;
  if (!hash) return;

  await page.evaluate((rawHash) => {
    const target = document.getElementById(decodeURIComponent(rawHash.slice(1)));
    target?.scrollIntoView();
  }, hash);
}

async function writeSurfaceMetrics(pairName: string, reference: SurfaceMetrics, candidate: SurfaceMetrics) {
  const filePath = path.join(outputRoot, "metrics", `${pairName}-surface.json`);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify({ reference, candidate }, null, 2));
}

async function measureEffects(page: Page, baseURL: string, capture: (typeof captures)[number]): Promise<EffectMetrics> {
  const routePath =
    baseURL === referenceBaseURL
      ? "referencePath" in capture
        ? capture.referencePath
        : capture.path
      : "candidatePath" in capture
        ? capture.candidatePath
        : capture.path;

  const url = new URL(routePath, baseURL).toString();
  await page.goto(url);
  await settleHashScroll(page, url);

  return page.evaluate(() => {
    const parseDuration = (value: string) =>
      Math.max(
        ...value
          .split(",")
          .map((part) => part.trim())
          .map((part) => (part.endsWith("ms") ? Number.parseFloat(part) : Number.parseFloat(part) * 1000))
          .filter(Number.isFinite),
        0
      );
    const styleFor = (selector: string) => window.getComputedStyle(document.querySelector(selector) ?? document.body);
    const linkStyle = styleFor(".nav-inner a, nav a");
    const buttonStyle = styleFor(".small-button, .start-links a, a[href*='blog'], a[href*='work']");

    return {
      linkTransitionMs: parseDuration(linkStyle.transitionDuration),
      linkTransitionTiming: linkStyle.transitionTimingFunction,
      buttonTransitionMs: parseDuration(buttonStyle.transitionDuration),
      buttonTransitionTiming: buttonStyle.transitionTimingFunction
    };
  });
}

async function writeEffectMetrics(pairName: string, reference: EffectMetrics, candidate: EffectMetrics) {
  const filePath = path.join(outputRoot, "metrics", `${pairName}-effects.json`);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify({ reference, candidate }, null, 2));
}

function assertEffectParity(pairName: string, reference: EffectMetrics, candidate: EffectMetrics) {
  const failures: string[] = [];
  const checkDelta = (label: string, actual: number, expected: number, tolerance: number) => {
    const delta = Math.abs(actual - expected);
    if (delta > tolerance) {
      failures.push(`${label}: expected ${expected.toFixed(2)} +/- ${tolerance}, got ${actual.toFixed(2)} (delta ${delta.toFixed(2)})`);
    }
  };
  const checkEase = (label: string, value: string) => {
    if (!value.includes("ease")) {
      failures.push(`${label}: expected an ease timing function, got ${value}`);
    }
  };

  checkDelta("linkTransitionMs", candidate.linkTransitionMs, reference.linkTransitionMs, 80);
  checkDelta("buttonTransitionMs", candidate.buttonTransitionMs, reference.buttonTransitionMs, 80);
  checkEase("linkTransitionTiming", candidate.linkTransitionTiming);
  checkEase("buttonTransitionTiming", candidate.buttonTransitionTiming);

  if (failures.length > 0) {
    throw new Error([`Effect parity gate failed for ${pairName}:`, ...failures].join("\n"));
  }
}

function assertSurfaceParity(
  pairName: string,
  captureName: string,
  viewportName: string,
  reference: SurfaceMetrics,
  candidate: SurfaceMetrics
) {
  const failures: string[] = [];
  const checkDelta = (label: string, actual: number, expected: number, tolerance: number) => {
    const delta = Math.abs(actual - expected);
    if (delta > tolerance) {
      failures.push(`${label}: expected ${expected.toFixed(2)} +/- ${tolerance}, got ${actual.toFixed(2)} (delta ${delta.toFixed(2)})`);
    }
  };
  const requireRect = (label: string, referenceRect: RectMetrics | null, candidateRect: RectMetrics | null) => {
    if (!referenceRect) failures.push(`${label}: missing reference measurement`);
    if (!candidateRect) failures.push(`${label}: missing candidate measurement`);
    return Boolean(referenceRect && candidateRect);
  };

  if (captureName === "blog-top" && requireRect("lead article heading", reference.lead, candidate.lead)) {
    checkDelta("lead.x", candidate.lead!.x, reference.lead!.x, viewportName === "mobile" ? 36 : 56);
    checkDelta("lead.y", candidate.lead!.y, reference.lead!.y, viewportName === "mobile" ? 96 : 96);
    checkDelta("lead.width", candidate.lead!.width, reference.lead!.width, 90);
    checkDelta("lead.fontSize", candidate.lead!.fontSize, reference.lead!.fontSize, 5);
    checkDelta("lead.fontWeight", candidate.lead!.fontWeight, reference.lead!.fontWeight, 175);
  }

  if (captureName === "about-top") {
    if (requireRect("about sidebar", reference.aside, candidate.aside)) {
      checkDelta("aside.x", candidate.aside!.x, reference.aside!.x, viewportName === "mobile" ? 56 : 72);
      checkDelta("aside.width", candidate.aside!.width, reference.aside!.width, viewportName === "mobile" ? 72 : 40);
    }
    if (requireRect("about portrait", reference.portrait, candidate.portrait)) {
      checkDelta("portrait.x", candidate.portrait!.x, reference.portrait!.x, viewportName === "mobile" ? 56 : 72);
      checkDelta("portrait.width", candidate.portrait!.width, reference.portrait!.width, viewportName === "mobile" ? 72 : 40);
      checkDelta("portrait.height", candidate.portrait!.height, reference.portrait!.height, viewportName === "mobile" ? 90 : 58);
    }
  }

  if (captureName === "about-fun-facts") {
    if (requireRect("fun facts heading", reference.h1, candidate.h1)) {
      checkDelta("heading.height", candidate.h1!.height, reference.h1!.height, viewportName === "mobile" ? 42 : 24);
      checkDelta("heading.width", candidate.h1!.width, reference.h1!.width, viewportName === "mobile" ? 90 : 70);
    }
    if (requireRect("scrolled nav", reference.nav, candidate.nav)) {
      checkDelta("nav.y", candidate.nav!.y, reference.nav!.y, 96);
    }
    if (reference.cards.length < 2) failures.push("fun facts: expected at least two reference media cards");
    if (candidate.cards.length < 2) failures.push("fun facts: expected at least two candidate media cards");
    if (reference.cards.length >= 2 && candidate.cards.length >= 2) {
      checkDelta("card[0].x", candidate.cards[0].x, reference.cards[0].x, viewportName === "mobile" ? 56 : 72);
      checkDelta("card[0].width", candidate.cards[0].width, reference.cards[0].width, viewportName === "mobile" ? 72 : 72);
      checkDelta("card[1].x", candidate.cards[1].x, reference.cards[1].x, viewportName === "mobile" ? 96 : 96);
      checkDelta("card[1].width", candidate.cards[1].width, reference.cards[1].width, viewportName === "mobile" ? 72 : 72);
    }
  }

  if (["about-skills", "about-work-history", "about-on-web"].includes(captureName)) {
    if (requireRect("section heading", reference.h1, candidate.h1)) {
      checkDelta("heading.x", candidate.h1!.x, reference.h1!.x, viewportName === "mobile" ? 72 : 96);
      checkDelta("heading.y", candidate.h1!.y, reference.h1!.y, viewportName === "mobile" ? 150 : 150);
      checkDelta("heading.width", candidate.h1!.width, reference.h1!.width, viewportName === "mobile" ? 180 : 180);
    }
    if (reference.blocks.length < 2) failures.push(`${captureName}: expected at least two reference blocks`);
    if (candidate.blocks.length < 2) failures.push(`${captureName}: expected at least two candidate blocks`);
    if (reference.blocks.length >= 2 && candidate.blocks.length >= 2) {
      checkDelta("block[0].x", candidate.blocks[0].x, reference.blocks[0].x, viewportName === "mobile" ? 96 : 140);
      checkDelta("block[0].width", candidate.blocks[0].width, reference.blocks[0].width, viewportName === "mobile" ? 180 : 220);
    }
    if (candidate.topContaminationCount > reference.topContaminationCount) {
      failures.push(`top contamination: expected <= ${reference.topContaminationCount}, got ${candidate.topContaminationCount}`);
    }
    if (captureName === "about-on-web" && candidate.bottomContaminationCount > reference.bottomContaminationCount) {
      failures.push(
        `bottom contamination: expected <= ${reference.bottomContaminationCount}, got ${candidate.bottomContaminationCount}`
      );
    }
  }

  if (structuredSurfaceCaptures.includes(captureName)) {
    for (const [index, expected] of reference.sampleColor.entries()) {
      checkDelta(`sampleColor[${index}]`, candidate.sampleColor[index], expected, 16);
    }
  }

  if (failures.length > 0) {
    throw new Error([`Surface parity gate failed for ${pairName}:`, ...failures].join("\n"));
  }
}

async function measureTopbar(page: Page, baseURL: string, capture: (typeof captures)[number]): Promise<TopbarMetrics> {
  const routePath =
    baseURL === referenceBaseURL
      ? "referencePath" in capture
        ? capture.referencePath
        : capture.path
      : "candidatePath" in capture
        ? capture.candidatePath
        : capture.path;

  await page.goto(new URL(routePath, baseURL).toString());
  await page.addStyleTag({ content: stableScreenshotStyle });

  return page.evaluate(() => {
    const nav = document.querySelector(".nav-inner, [data-component='nav'] > div, nav > div");
    if (!nav) {
      throw new Error("Topbar parity gate could not find a nav shell");
    }

    const toRect = (rect: DOMRect): RectMetrics => ({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    });

    const toNumber = (value: string) => Number.parseFloat(value) || 0;
    const navStyle = window.getComputedStyle(nav);
    const items = [...nav.querySelectorAll("a")].map((item) => {
      const style = window.getComputedStyle(item);
      return {
        text: item.textContent?.trim() ?? "",
        aria: item.getAttribute("aria-label"),
        rect: toRect(item.getBoundingClientRect()),
        fontSize: toNumber(style.fontSize),
        fontWeight: toNumber(style.fontWeight),
        letterSpacing: style.letterSpacing === "normal" ? 0 : toNumber(style.letterSpacing)
      };
    });

    return {
      nav: toRect(nav.getBoundingClientRect()),
      navPaddingLeft: toNumber(navStyle.paddingLeft),
      navPaddingRight: toNumber(navStyle.paddingRight),
      items
    };
  });
}

async function writeTopbarMetrics(pairName: string, reference: TopbarMetrics, candidate: TopbarMetrics) {
  const filePath = path.join(outputRoot, "metrics", `${pairName}-topbar.json`);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify({ reference, candidate }, null, 2));
}

function assertTopbarParity(pairName: string, reference: TopbarMetrics, candidate: TopbarMetrics) {
  const failures: string[] = [];
  const checkDelta = (label: string, actual: number, expected: number, tolerance: number) => {
    const delta = Math.abs(actual - expected);
    if (delta > tolerance) {
      failures.push(`${label}: expected ${expected.toFixed(2)} +/- ${tolerance}, got ${actual.toFixed(2)} (delta ${delta.toFixed(2)})`);
    }
  };

  checkDelta("nav.x", candidate.nav.x, reference.nav.x, 2);
  checkDelta("nav.y", candidate.nav.y, reference.nav.y, 2);
  checkDelta("nav.width", candidate.nav.width, reference.nav.width, 2);
  checkDelta("nav.height", candidate.nav.height, reference.nav.height, 2);
  checkDelta("nav.paddingLeft", candidate.navPaddingLeft, reference.navPaddingLeft, 3);
  checkDelta("nav.paddingRight", candidate.navPaddingRight, reference.navPaddingRight, 3);

  for (const [index, referenceItem] of reference.items.entries()) {
    const candidateItem = candidate.items[index];
    if (!candidateItem) {
      failures.push(`item[${index}]: missing candidate item for "${referenceItem.text || referenceItem.aria || "icon"}"`);
      continue;
    }

    const label = `item[${index}:${referenceItem.text || referenceItem.aria || "icon"}]`;
    checkDelta(`${label}.x`, candidateItem.rect.x, referenceItem.rect.x, 4);
    checkDelta(`${label}.y`, candidateItem.rect.y, referenceItem.rect.y, 4);
    checkDelta(`${label}.width`, candidateItem.rect.width, referenceItem.rect.width, 4);
    checkDelta(`${label}.height`, candidateItem.rect.height, referenceItem.rect.height, 4);
    checkDelta(`${label}.fontSize`, candidateItem.fontSize, referenceItem.fontSize, 0.75);
    checkDelta(`${label}.fontWeight`, candidateItem.fontWeight, referenceItem.fontWeight, 125);
    checkDelta(`${label}.letterSpacing`, candidateItem.letterSpacing, referenceItem.letterSpacing, 0.25);
  }

  if (failures.length > 0) {
    throw new Error([`Topbar parity gate failed for ${pairName}:`, ...failures].join("\n"));
  }
}

async function writeDiff(referencePath: string, candidatePath: string, relativePath: string) {
  const reference = PNG.sync.read(await readFile(referencePath));
  const candidate = PNG.sync.read(await readFile(candidatePath));

  if (reference.width !== candidate.width || reference.height !== candidate.height) {
    return undefined;
  }

  const diff = new PNG({ width: reference.width, height: reference.height });
  const mismatches = pixelmatch(reference.data, candidate.data, diff.data, reference.width, reference.height, {
    threshold: 0.1
  });
  const metrics = {
    mismatches,
    ratio: mismatches / (reference.width * reference.height),
    width: reference.width,
    height: reference.height
  };

  const filePath = path.join(outputRoot, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, PNG.sync.write(diff));
  return { filePath, relativePath, metrics };
}

async function writePixelMetrics(pairName: string, metrics: PixelDiffMetrics) {
  const filePath = path.join(outputRoot, "metrics", `${pairName}-pixel.json`);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(metrics, null, 2));
}

function assertPixelBudget(pairName: string, metrics: PixelDiffMetrics) {
  const budget = pixelRatioBudgets[pairName];
  if (budget === undefined) return;

  if (metrics.ratio > budget) {
    throw new Error(
      `Pixel parity budget failed for ${pairName}: expected ratio <= ${budget.toFixed(4)}, got ${metrics.ratio.toFixed(4)} (${metrics.mismatches} mismatched pixels)`
    );
  }
}

async function writeContactSheet(rows: string[]) {
  const filePath = path.join(outputRoot, "compare.html");
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Jose / Jamie screenshot comparison</title>
    <style>
      body { margin: 0; padding: 32px; font-family: ui-sans-serif, system-ui, sans-serif; background: #f4f3ed; color: #20231f; }
      h1 { margin: 0 0 24px; font-size: 28px; }
      section { margin-bottom: 48px; }
      h2 { font-size: 16px; text-transform: uppercase; letter-spacing: .08em; }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: start; }
      figure { margin: 0; }
      figcaption { margin-bottom: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #656960; }
      img { width: 100%; height: auto; border: 1px solid rgba(0, 0, 0, .12); border-radius: 8px; background: white; }
    </style>
  </head>
  <body>
    <h1>Jose / Jamie screenshot comparison</h1>
    ${rows.join("\n")}
  </body>
</html>
`
  );
}

function renderRow(name: string, reference: string, candidate: string, diff?: string) {
  return `<section>
  <h2>${name}</h2>
  <div class="grid">
    <figure><figcaption>Jose reference</figcaption><img src="${reference}" alt="${name} Jose reference" /></figure>
    <figure><figcaption>Jamie prototype</figcaption><img src="${candidate}" alt="${name} Jamie prototype" /></figure>
    <figure><figcaption>Pixel diff</figcaption>${diff ? `<img src="${diff}" alt="${name} pixel diff" />` : "<p>Different image dimensions; diff skipped.</p>"}</figure>
  </div>
</section>`;
}
