import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { maskPixelRegions, resolveEffectiveBackgroundRgb } from "./jose-parity-measurements.mjs";

const referenceBaseURL = process.env.REFERENCE_BASE_URL;
const candidateBaseURL = process.env.CANDIDATE_BASE_URL ?? "http://127.0.0.1:4321";
const cdpEndpoint = process.env.CHROME_CDP_URL ?? process.env.CDP_ENDPOINT ?? "http://127.0.0.1:9223";
const outputRoot = process.env.SCREENSHOT_OUTPUT_DIR ?? "artifacts/screenshots-cdp";

const stableScreenshotStyle = [
  "*,",
  "*::before,",
  "*::after {",
  "  animation-duration: 0.001s !important;",
  "  animation-delay: 0s !important;",
  "  transition-duration: 0.001s !important;",
  "  transition-delay: 0s !important;",
  "  scroll-behavior: auto !important;",
  "}",
].join("\n");

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 393, height: 852 },
];

const captures = [
  { name: "home-top", path: "/", scrollY: 0 },
  { name: "home-work", path: "/", scrollY: 780 },
  { name: "about-top", path: "/now/", referencePath: "/about", candidatePath: "/now/", scrollY: 0 },
  { name: "about-fun-facts", path: "/now/#fun-facts", referencePath: "/about#fun-facts", candidatePath: "/now/#fun-facts" },
  { name: "about-skills", path: "/now/#skills", referencePath: "/about#skills", candidatePath: "/now/#skills" },
  { name: "about-work-history", path: "/now/#current-focus", referencePath: "/about#work-history", candidatePath: "/now/#current-focus" },
  { name: "about-on-web", path: "/now/#on-the-web", referencePath: "/about#recognition", candidatePath: "/now/#on-the-web" },
  { name: "blog-top", path: "/blog/", scrollY: 0 },
  { name: "footer", path: "/", selector: ".site-footer" },
];

const candidateSurfaceRoutes = [
  "/",
  "/now/",
  "/blog/",
  "/contact/",
  "/articles/why-ai-native-devrel/",
  "/proof/",
  "/work/ai-native-devrel/",
  "/work/brainwav-io/",
];

const pixelRatioBudgets = {
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
  "blog-top-mobile": 0.17,
};

const structuredSurfaceCaptures = new Set([
  "blog-top",
  "about-top",
  "about-fun-facts",
  "about-skills",
  "about-work-history",
  "about-on-web",
]);

if (!referenceBaseURL) {
  console.error("REFERENCE_BASE_URL is required, for example https://www.joseocando.com.");
  process.exit(2);
}

let browser;
let page;

try {
  browser = await connectToChrome();
  const context = browser.contexts()[0] ?? await browser.newContext();
  page = await context.newPage();
  const rows = [];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await assertCandidateShellSurfaces(page, candidateBaseURL, viewport.name);
  }

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const capture of captures) {
      const pairName = capture.name + "-" + viewport.name;
      const reference = await captureFrame(page, referenceBaseURL, capture, "jose/" + pairName + ".png");
      const candidate = await captureFrame(page, candidateBaseURL, capture, "jamie/" + pairName + ".png");
      let referenceSurface;
      let candidateSurface;

      if (structuredSurfaceCaptures.has(capture.name)) {
        referenceSurface = await measureSurface(page, referenceBaseURL, capture);
        candidateSurface = await measureSurface(page, candidateBaseURL, capture);
        await writeJson(path.join(outputRoot, "metrics", pairName + "-surface.json"), { reference: referenceSurface, candidate: candidateSurface });
      }

      const identityRegions =
        ["about-top", "about-fun-facts"].includes(capture.name) && referenceSurface && candidateSurface
          ? [...referenceSurface.identityRegions, ...candidateSurface.identityRegions]
          : [];
      const diff = await writeDiff(reference.filePath, candidate.filePath, "diff/" + pairName + ".png", identityRegions);

      if (diff) {
        await writeJson(path.join(outputRoot, "metrics", pairName + "-pixel.json"), diff.metrics);
      }

      if (capture.name === "home-top") {
        const referenceTopbar = await measureTopbar(page, referenceBaseURL, capture);
        const candidateTopbar = await measureTopbar(page, candidateBaseURL, capture);
        await writeJson(path.join(outputRoot, "metrics", pairName + "-topbar.json"), { reference: referenceTopbar, candidate: candidateTopbar });
        assertTopbarParity(pairName, referenceTopbar, candidateTopbar);
      }

      if (referenceSurface && candidateSurface) {
        assertSurfaceParity(pairName, capture.name, viewport.name, referenceSurface, candidateSurface);
      }

      if (diff) {
        assertPixelBudget(pairName, diff.metrics);
      }

      rows.push(renderRow(pairName, reference.relativePath, candidate.relativePath, diff?.relativePath));
    }
  }

  await writeContactSheet(rows);
  await writeJson(path.join(outputRoot, "run-summary.json"), {
    status: "pass",
    command: "npm run test:jose-parity:cdp",
    cdpEndpoint,
    referenceBaseURL,
    candidateBaseURL,
    outputRoot,
  });
  console.log("Jose CDP parity passed. Contact sheet: " + path.join(outputRoot, "compare.html"));
} catch (error) {
  await writeJson(path.join(outputRoot, "run-summary.json"), {
    status: "fail",
    command: "npm run test:jose-parity:cdp",
    cdpEndpoint,
    referenceBaseURL,
    candidateBaseURL,
    outputRoot,
    error: error?.stack ?? String(error),
  });
  console.error(error?.stack ?? error);
  process.exitCode = 1;
} finally {
  if (page) {
    await page.close().catch(() => {});
  }
  if (browser) {
    await browser.close().catch(() => {});
  }
}

async function connectToChrome() {
  try {
    return await chromium.connectOverCDP(cdpEndpoint);
  } catch (error) {
    throw new Error(
      [
        "Could not connect to Chrome over CDP at " + cdpEndpoint + ".",
        "Start a separate debug Chrome first, then rerun this command.",
        "Example:",
        "  profile_dir=\"$(mktemp -d \\\"${TMPDIR:-/tmp}/portfolio-chrome-cdp.XXXXXX\\\")\"",
        "  /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9223 --user-data-dir=\"$profile_dir\" --no-first-run",
        "Original error: " + (error?.message ?? error),
      ].join("\n")
    );
  }
}

function routeFor(baseURL, capture) {
  if (baseURL === referenceBaseURL) {
    return "referencePath" in capture ? capture.referencePath : capture.path;
  }
  return "candidatePath" in capture ? capture.candidatePath : capture.path;
}

async function captureFrame(activePage, baseURL, capture, relativePath) {
  const url = new URL(routeFor(baseURL, capture), baseURL).toString();
  const filePath = path.join(outputRoot, relativePath);

  await mkdir(path.dirname(filePath), { recursive: true });
  await activePage.goto(url);
  await activePage.addStyleTag({ content: stableScreenshotStyle });
  await settleHashScroll(activePage, url);

  if ("scrollY" in capture) {
    await activePage.evaluate((scrollY) => window.scrollTo(0, scrollY), capture.scrollY);
  }

  if ("selector" in capture) {
    const selector = capture.selector === ".site-footer" ? ".site-footer, footer" : capture.selector;
    const target = activePage.locator(selector).first();
    if ((await target.count()) === 0) {
      throw new Error("Selector " + selector + " not found at " + url);
    }
    await target.screenshot({ path: filePath, animations: "disabled" });
    return { filePath, relativePath };
  }

  await activePage.screenshot({ path: filePath, animations: "disabled" });
  return { filePath, relativePath };
}

async function measureTopbar(activePage, baseURL, capture) {
  await activePage.goto(new URL(routeFor(baseURL, capture), baseURL).toString());
  await activePage.addStyleTag({ content: stableScreenshotStyle });

  return activePage.evaluate(() => {
    const nav = document.querySelector(".nav-inner");
    if (!nav) {
      throw new Error("Topbar parity gate could not find .nav-inner");
    }
    const toRect = (rect) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    const toNumber = (value) => Number.parseFloat(value) || 0;
    const navStyle = window.getComputedStyle(nav);
    const items = [...nav.querySelectorAll("a")].map((item) => {
      const style = window.getComputedStyle(item);
      return {
        text: item.textContent?.trim() ?? "",
        aria: item.getAttribute("aria-label"),
        rect: toRect(item.getBoundingClientRect()),
        fontSize: toNumber(style.fontSize),
        fontWeight: toNumber(style.fontWeight),
        letterSpacing: style.letterSpacing === "normal" ? 0 : toNumber(style.letterSpacing),
      };
    });

    return {
      nav: toRect(nav.getBoundingClientRect()),
      navPaddingLeft: toNumber(navStyle.paddingLeft),
      navPaddingRight: toNumber(navStyle.paddingRight),
      items,
    };
  });
}

async function assertCandidateShellSurfaces(activePage, baseURL, viewportName) {
  let reference;

  for (const route of candidateSurfaceRoutes) {
    const url = new URL(route, baseURL).toString();
    await activePage.goto(url);
    const surfaces = await activePage.evaluate(() => {
      const transparent = "rgba(0, 0, 0, 0)";
      const body = getComputedStyle(document.body);
      const main = getComputedStyle(document.querySelector("main"));
      const header = getComputedStyle(document.querySelector(".site-header"));
      const nav = getComputedStyle(document.querySelector(".site-header .nav-bg"));
      const navInner = getComputedStyle(document.querySelector(".site-header .nav-inner"));
      const footer = getComputedStyle(document.querySelector(".site-footer"));

      return {
        header: header.backgroundImage,
        nav: nav.backgroundColor,
        navInner: navInner.backgroundColor,
        footer: footer.backgroundImage,
        bodyImage: body.backgroundImage,
        bodyColor: body.backgroundColor,
        mainImage: main.backgroundImage,
        effectiveMainColor: main.backgroundColor === transparent ? body.backgroundColor : main.backgroundColor,
      };
    });

    const sharedSurfaces = {
      nav: surfaces.nav,
      navInner: surfaces.navInner,
      footer: surfaces.footer,
      bodyColor: surfaces.bodyColor,
      mainImage: surfaces.mainImage,
      effectiveMainColor: surfaces.effectiveMainColor,
    };

    reference ??= sharedSurfaces;
    if (JSON.stringify(sharedSurfaces) !== JSON.stringify(reference)) {
      throw new Error("Candidate navigation/footer surface mismatch at " + route + " for " + viewportName + ".");
    }

    const expectedFade = "linear-gradient(rgb(251, 250, 245), rgb(213, 214, 208))";
    const expectedBodyImage = route === "/" ? expectedFade : "none";
    const expectedHeaderImage = route === "/" ? "none" : expectedFade;
    if (
      surfaces.bodyImage !== expectedBodyImage ||
      surfaces.header !== expectedHeaderImage ||
      surfaces.mainImage !== "none" ||
      surfaces.bodyColor !== "rgb(213, 214, 208)" ||
      surfaces.effectiveMainColor !== "rgb(213, 214, 208)"
    ) {
      throw new Error(
        "Candidate route fade ownership is incorrect at " + route + " for " + viewportName +
        ": " + JSON.stringify(surfaces) + "."
      );
    }
  }

  console.log("Candidate shell/canvas ownership passed for " + candidateSurfaceRoutes.length + " routes at " + viewportName + ".");
}

async function measureSurface(activePage, baseURL, capture) {
  const url = new URL(routeFor(baseURL, capture), baseURL).toString();
  await activePage.goto(url);
  await activePage.addStyleTag({ content: stableScreenshotStyle });
  await settleHashScroll(activePage, url);

  const measured = await activePage.evaluate((captureName) => {
    const toRect = (rect) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    const toNumber = (value) => Number.parseFloat(value) || 0;
    const visibleRect = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) return null;
      return toRect(rect);
    };
    const withType = (element) => {
      if (!element) return null;
      const style = window.getComputedStyle(element);
      return {
        ...toRect(element.getBoundingClientRect()),
        fontSize: toNumber(style.fontSize),
        fontWeight: toNumber(style.fontWeight),
        lineHeight: toNumber(style.lineHeight),
      };
    };
    const mediaPanelRect = (element) => {
      if (!(element instanceof HTMLImageElement)) return visibleRect(element);
      let panel = element;
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
    const mediaRect = (element) => {
      const rect = element?.getBoundingClientRect();
      if (!rect || rect.width <= 1 || rect.height <= 1) return null;
      return { ...toRect(rect), aspectRatio: rect.width / rect.height };
    };
    const byText = (selector, text) =>
      [...document.querySelectorAll(selector)].find((element) => element.textContent?.trim() === text) ?? null;
    const containsText = (selector, text) =>
      [...document.querySelectorAll(selector)].find((element) => element.textContent?.includes(text)) ?? null;
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
    const surfaceRoot = headingElement?.closest("section") ?? headingElement?.parentElement?.parentElement ?? document;
    const sampleElement = document.elementFromPoint(20, 20) ?? document.body;
    const sampleBackgroundLayers = [];
    let backgroundElement = sampleElement;
    while (backgroundElement) {
      sampleBackgroundLayers.push(window.getComputedStyle(backgroundElement).backgroundColor);
      backgroundElement = backgroundElement.parentElement;
    }
    const cardSources =
      document.querySelectorAll(".about-object").length > 0
        ? [...document.querySelectorAll(".about-object")]
        : [...document.querySelectorAll("img")];

    return {
      nav: visibleRect(document.querySelector(".nav-inner") ?? document.querySelector("nav")),
      sampleBackgroundLayers,
      h1: visibleRect(headingElement),
      lead:
        captureName === "blog-top"
          ? withType(
              containsText("h2, h3", "When Evidence Goes Stale") ??
                containsText("h2, h3", "creative direction") ??
                document.querySelector("article h2, article h3")
            )
          : null,
      draftRows:
        captureName === "blog-top"
          ? [...document.querySelectorAll(".icon-link-item, .draft-links span")].map(visibleRect).filter(Boolean).slice(0, 3)
          : [],
      authorImage:
        captureName === "blog-top"
          ? mediaRect(document.querySelector(".blog-about-card img") ?? document.querySelector(".u-img-cover"))
          : null,
      copy:
        captureName === "about-top"
          ? visibleRect(document.querySelector(".about-copy") ?? document.querySelector(".rich-text.text-3xl"))
          : null,
      aside:
        captureName === "about-top"
          ? visibleRect(document.querySelector(".about-sidebar") ?? containsText("aside, div, nav", "Get to know me"))
          : null,
      portrait:
        captureName === "about-top"
          ? visibleRect(document.querySelector(".about-portrait") ?? document.querySelector("img[alt*='Portrait'], img[alt*='Jamie']"))
          : null,
      cards:
        captureName === "about-fun-facts"
          ? cardSources
              .map(mediaPanelRect)
              .filter(Boolean)
              .filter((rect) => rect.width >= 100 && rect.height >= 100)
              .filter((rect) => rect.y >= -1)
              .slice(0, 4)
          : [],
      identityRegions:
        captureName === "about-top"
          ? [document.querySelector(".about-copy") ?? document.querySelector(".rich-text.text-3xl")]
              .map(visibleRect)
              .filter(Boolean)
          : captureName === "about-fun-facts"
          ? cardSources
              .map((element) => visibleRect(element.closest(".about-fact-card, .grid__2-col > div")))
              .filter(Boolean)
              .filter((rect) => rect.y < window.innerHeight && rect.y + rect.height > 0)
              .slice(0, 4)
          : [],
      blocks:
        captureName === "about-skills" || captureName === "about-work-history" || captureName === "about-on-web"
          ? [...surfaceRoot.querySelectorAll("article, .about-skill-list article, .about-history article, .recognition-list a, li, h3")]
              .map(visibleRect)
              .filter(Boolean)
              .filter((rect) => rect.y >= -20 && rect.width >= 80 && rect.height >= 16)
              .slice(0, 8)
          : [],
      topContaminationCount:
        captureName === "about-skills" || captureName === "about-work-history" || captureName === "about-on-web"
          ? [...document.querySelectorAll("body *")]
              .filter((element) => !surfaceRoot.contains(element))
              .filter((element) => {
                const rect = element.getBoundingClientRect();
                const text = element.textContent?.trim() ?? "";
                return text.length > 0 && rect.width > 20 && rect.height > 8 && rect.y >= -1 && rect.y < 80;
              }).length
          : 0,
      bottomContaminationCount:
        captureName === "about-on-web"
          ? [...document.querySelectorAll("body *")]
              .filter((element) => !surfaceRoot.contains(element))
              .filter((element) => {
                const rect = element.getBoundingClientRect();
                const text = element.textContent?.trim() ?? "";
                return text.length > 0 && rect.width > 20 && rect.height > 8 && rect.y > window.innerHeight * 0.72 && rect.y < window.innerHeight - 8;
              }).length
          : 0,
    };
  }, capture.name);

  return {
    ...measured,
    sampleColor: resolveEffectiveBackgroundRgb(measured.sampleBackgroundLayers),
  };
}

async function settleHashScroll(activePage, url) {
  const hash = new URL(url).hash;
  if (!hash) return;
  await activePage.evaluate((rawHash) => {
    const target = document.getElementById(decodeURIComponent(rawHash.slice(1)));
    target?.scrollIntoView();
  }, hash);
}

function assertTopbarParity(pairName, reference, candidate) {
  const failures = [];
  const checkDelta = deltaChecker(failures);
  checkDelta("nav.x", candidate.nav.x, reference.nav.x, 2);
  checkDelta("nav.y", candidate.nav.y, reference.nav.y, 2);
  checkDelta("nav.width", candidate.nav.width, reference.nav.width, 2);
  checkDelta("nav.height", candidate.nav.height, reference.nav.height, 2);
  checkDelta("nav.paddingLeft", candidate.navPaddingLeft, reference.navPaddingLeft, 3);
  checkDelta("nav.paddingRight", candidate.navPaddingRight, reference.navPaddingRight, 3);

  for (const [index, referenceItem] of reference.items.entries()) {
    const candidateItem = candidate.items[index];
    if (!candidateItem) {
      failures.push("item[" + index + "]: missing candidate item");
      continue;
    }
    const label = "item[" + index + ":" + (referenceItem.text || referenceItem.aria || "icon") + "]";
    checkDelta(label + ".x", candidateItem.rect.x, referenceItem.rect.x, 4);
    checkDelta(label + ".y", candidateItem.rect.y, referenceItem.rect.y, 4);
    checkDelta(label + ".width", candidateItem.rect.width, referenceItem.rect.width, 4);
    checkDelta(label + ".height", candidateItem.rect.height, referenceItem.rect.height, 4);
    checkDelta(label + ".fontSize", candidateItem.fontSize, referenceItem.fontSize, 0.75);
    checkDelta(label + ".fontWeight", candidateItem.fontWeight, referenceItem.fontWeight, 125);
    checkDelta(label + ".letterSpacing", candidateItem.letterSpacing, referenceItem.letterSpacing, 0.25);
  }

  throwIfFailures("Topbar parity gate failed for " + pairName + ":", failures);
}

function assertSurfaceParity(pairName, captureName, viewportName, reference, candidate) {
  const failures = [];
  const checkDelta = deltaChecker(failures);
  const requireRect = (label, referenceRect, candidateRect) => {
    if (!referenceRect) failures.push(label + ": missing reference measurement");
    if (!candidateRect) failures.push(label + ": missing candidate measurement");
    return Boolean(referenceRect && candidateRect);
  };

  if (captureName === "blog-top" && requireRect("lead article heading", reference.lead, candidate.lead)) {
    checkDelta("lead.x", candidate.lead.x, reference.lead.x, viewportName === "mobile" ? 36 : 56);
    checkDelta("lead.y", candidate.lead.y, reference.lead.y, 96);
    checkDelta("lead.width", candidate.lead.width, reference.lead.width, 90);
    checkDelta("lead.fontSize", candidate.lead.fontSize, reference.lead.fontSize, 5);
    if (viewportName === "mobile") {
      checkDelta("lead.fontWeight", candidate.lead.fontWeight, reference.lead.fontWeight, 50);
    }
  }

  if (captureName === "blog-top" && viewportName === "mobile") {
    if (requireRect("blog heading", reference.h1, candidate.h1)) {
      checkDelta("heading.x", candidate.h1.x, reference.h1.x, 12);
      checkDelta("heading.y", candidate.h1.y, reference.h1.y, 12);
      checkDelta("heading.width", candidate.h1.width, reference.h1.width, 12);
      checkDelta("heading.height", candidate.h1.height, reference.h1.height, 8);
    }

    if (reference.draftRows.length < 3) failures.push("draft rows: expected at least three reference rows");
    if (candidate.draftRows.length < 3) failures.push("draft rows: expected at least three candidate rows");
    if (reference.draftRows.length >= 3 && candidate.draftRows.length >= 3) {
      for (const index of [0, 1, 2]) {
        checkDelta("draft[" + index + "].x", candidate.draftRows[index].x, reference.draftRows[index].x, 12);
        checkDelta("draft[" + index + "].width", candidate.draftRows[index].width, reference.draftRows[index].width, 16);
        checkDelta("draft[" + index + "].height", candidate.draftRows[index].height, reference.draftRows[index].height, 8);
        checkDelta("draft[" + index + "].y", candidate.draftRows[index].y, reference.draftRows[index].y, 18);
      }
    }

    if (requireRect("blog author image", reference.authorImage, candidate.authorImage)) {
      checkDelta("authorImage.aspectRatio", candidate.authorImage.aspectRatio, reference.authorImage.aspectRatio, 0.05);
    }
  }

  if (captureName === "about-top") {
    if (requireRect("about heading", reference.h1, candidate.h1)) {
      checkDelta("heading.x", candidate.h1.x, reference.h1.x, viewportName === "mobile" ? 12 : 72);
      checkDelta("heading.y", candidate.h1.y, reference.h1.y, viewportName === "mobile" ? 12 : 72);
      checkDelta("heading.width", candidate.h1.width, reference.h1.width, viewportName === "mobile" ? 12 : 72);
      checkDelta("heading.height", candidate.h1.height, reference.h1.height, viewportName === "mobile" ? 8 : 24);
    }
    if (requireRect("about copy", reference.copy, candidate.copy)) {
      checkDelta("copy.x", candidate.copy.x, reference.copy.x, viewportName === "mobile" ? 12 : 72);
      checkDelta("copy.y", candidate.copy.y, reference.copy.y, viewportName === "mobile" ? 12 : 72);
      checkDelta("copy.width", candidate.copy.width, reference.copy.width, viewportName === "mobile" ? 12 : 72);
    }
    if (requireRect("about sidebar", reference.aside, candidate.aside)) {
      checkDelta("aside.x", candidate.aside.x, reference.aside.x, viewportName === "mobile" ? 56 : 72);
      checkDelta("aside.width", candidate.aside.width, reference.aside.width, viewportName === "mobile" ? 72 : 40);
    }
    if (requireRect("about portrait", reference.portrait, candidate.portrait)) {
      checkDelta("portrait.x", candidate.portrait.x, reference.portrait.x, viewportName === "mobile" ? 56 : 72);
      checkDelta("portrait.width", candidate.portrait.width, reference.portrait.width, viewportName === "mobile" ? 72 : 40);
      checkDelta("portrait.height", candidate.portrait.height, reference.portrait.height, viewportName === "mobile" ? 90 : 58);
    }
  }

  if (captureName === "about-fun-facts") {
    if (requireRect("fun facts heading", reference.h1, candidate.h1)) {
      checkDelta("heading.height", candidate.h1.height, reference.h1.height, viewportName === "mobile" ? 42 : 24);
      checkDelta("heading.width", candidate.h1.width, reference.h1.width, viewportName === "mobile" ? 90 : 70);
    }
    if (reference.cards.length < 2) failures.push("fun facts: expected at least two reference media cards");
    if (candidate.cards.length < 2) failures.push("fun facts: expected at least two candidate media cards");
    if (reference.identityRegions.length < 2) failures.push("fun facts: expected at least two reference identity regions");
    if (candidate.identityRegions.length < 2) failures.push("fun facts: expected at least two candidate identity regions");
    if (reference.cards.length >= 2 && candidate.cards.length >= 2) {
      checkDelta("card[0].x", candidate.cards[0].x, reference.cards[0].x, viewportName === "mobile" ? 56 : 72);
      checkDelta("card[0].width", candidate.cards[0].width, reference.cards[0].width, 72);
      checkDelta("card[0].height", candidate.cards[0].height, reference.cards[0].height, viewportName === "mobile" ? 90 : 72);
      checkDelta("card[1].x", candidate.cards[1].x, reference.cards[1].x, viewportName === "mobile" ? 96 : 96);
      checkDelta("card[1].width", candidate.cards[1].width, reference.cards[1].width, 72);
      checkDelta("card[1].height", candidate.cards[1].height, reference.cards[1].height, viewportName === "mobile" ? 90 : 72);
    }
    if (reference.identityRegions.length >= 2 && candidate.identityRegions.length >= 2) {
      for (const index of [0, 1]) {
        checkDelta("identityRegion[" + index + "].x", candidate.identityRegions[index].x, reference.identityRegions[index].x, viewportName === "mobile" ? 56 : 72);
        checkDelta("identityRegion[" + index + "].width", candidate.identityRegions[index].width, reference.identityRegions[index].width, 72);
      }
    }
  }

  if (["about-skills", "about-work-history", "about-on-web"].includes(captureName)) {
    if (requireRect("section heading", reference.h1, candidate.h1)) {
      checkDelta("heading.x", candidate.h1.x, reference.h1.x, viewportName === "mobile" ? 72 : 96);
      checkDelta("heading.y", candidate.h1.y, reference.h1.y, 150);
      checkDelta("heading.width", candidate.h1.width, reference.h1.width, viewportName === "mobile" ? 180 : 180);
    }
    if (candidate.topContaminationCount > reference.topContaminationCount) {
      failures.push("top contamination: expected <= " + reference.topContaminationCount + ", got " + candidate.topContaminationCount);
    }
    if (captureName === "about-on-web" && candidate.bottomContaminationCount > reference.bottomContaminationCount) {
      failures.push("bottom contamination: expected <= " + reference.bottomContaminationCount + ", got " + candidate.bottomContaminationCount);
    }
  }

  if (structuredSurfaceCaptures.has(captureName)) {
    for (const [index, expected] of reference.sampleColor.entries()) {
      checkDelta("sampleColor[" + index + "]", candidate.sampleColor[index], expected, 16);
    }
  }

  throwIfFailures("Surface parity gate failed for " + pairName + ":", failures);
}

function deltaChecker(failures) {
  return (label, actual, expected, tolerance) => {
    const delta = Math.abs(actual - expected);
    if (delta > tolerance) {
      failures.push(label + ": expected " + expected.toFixed(2) + " +/- " + tolerance + ", got " + actual.toFixed(2) + " (delta " + delta.toFixed(2) + ")");
    }
  };
}

async function writeDiff(referencePath, candidatePath, relativePath, identityRegions = []) {
  const reference = PNG.sync.read(await readFile(referencePath));
  const candidate = PNG.sync.read(await readFile(candidatePath));
  if (reference.width !== candidate.width || reference.height !== candidate.height) {
    return undefined;
  }

  maskPixelRegions(reference.data, reference.width, reference.height, identityRegions);
  maskPixelRegions(candidate.data, candidate.width, candidate.height, identityRegions);

  const diff = new PNG({ width: reference.width, height: reference.height });
  const mismatches = pixelmatch(reference.data, candidate.data, diff.data, reference.width, reference.height, {
    threshold: 0.1,
  });
  const metrics = {
    mismatches,
    ratio: mismatches / (reference.width * reference.height),
    width: reference.width,
    height: reference.height,
    maskedIdentityRegions: identityRegions.length,
  };

  const filePath = path.join(outputRoot, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, PNG.sync.write(diff));
  return { filePath, relativePath, metrics };
}

function assertPixelBudget(pairName, metrics) {
  const budget = pixelRatioBudgets[pairName];
  if (budget === undefined) return;
  if (metrics.ratio > budget) {
    throw new Error(
      "Pixel parity budget failed for " +
        pairName +
        ": expected ratio <= " +
        budget.toFixed(4) +
        ", got " +
        metrics.ratio.toFixed(4) +
        " (" +
        metrics.mismatches +
        " mismatched pixels)"
    );
  }
}

async function writeContactSheet(rows) {
  const filePath = path.join(outputRoot, "compare.html");
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    [
      "<!doctype html>",
      "<html lang=\"en\">",
      "  <head>",
      "    <meta charset=\"utf-8\" />",
      "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />",
      "    <title>Jose / Jamie CDP screenshot comparison</title>",
      "    <style>",
      "      body { margin: 0; padding: 32px; font-family: ui-sans-serif, system-ui, sans-serif; background: #f4f3ed; color: #20231f; }",
      "      h1 { margin: 0 0 24px; font-size: 28px; }",
      "      section { margin-bottom: 48px; }",
      "      h2 { font-size: 16px; text-transform: uppercase; letter-spacing: .08em; }",
      "      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: start; }",
      "      figure { margin: 0; }",
      "      figcaption { margin-bottom: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #656960; }",
      "      img { width: 100%; height: auto; border: 1px solid rgba(0, 0, 0, .12); border-radius: 8px; background: white; }",
      "    </style>",
      "  </head>",
      "  <body>",
      "    <h1>Jose / Jamie CDP screenshot comparison</h1>",
      rows.join("\n"),
      "  </body>",
      "</html>",
      "",
    ].join("\n")
  );
}

function renderRow(name, reference, candidate, diff) {
  return [
    "<section>",
    "  <h2>" + name + "</h2>",
    "  <div class=\"grid\">",
    "    <figure><figcaption>Jose reference</figcaption><img src=\"" + reference + "\" alt=\"" + name + " Jose reference\" /></figure>",
    "    <figure><figcaption>Jamie prototype</figcaption><img src=\"" + candidate + "\" alt=\"" + name + " Jamie prototype\" /></figure>",
    "    <figure><figcaption>Pixel diff</figcaption>" +
      (diff ? "<img src=\"" + diff + "\" alt=\"" + name + " pixel diff\" />" : "<p>Different image dimensions; diff skipped.</p>") +
      "</figure>",
    "  </div>",
    "</section>",
  ].join("\n");
}

async function writeJson(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

function throwIfFailures(prefix, failures) {
  if (failures.length > 0) {
    throw new Error([prefix, ...failures].join("\n"));
  }
}
