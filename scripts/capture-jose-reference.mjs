import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = new URL(process.env.JOSE_REFERENCE_BASE_URL ?? "https://www.joseocando.com/");
const outputRoot = path.resolve(process.env.JOSE_REFERENCE_OUTPUT_DIR ?? "docs/reference/jose-ocando");
const maxPages = Number.parseInt(process.env.JOSE_REFERENCE_MAX_PAGES ?? "32", 10);
const userAgent =
  "jscraik.com Jose reference capture (+https://jscraik.com; design parity documentation)";
const shouldCaptureRenderedArtifacts = process.env.JOSE_REFERENCE_RENDERED_ARTIFACTS !== "0";
const renderNavigationTimeoutMs = Number.parseInt(
  process.env.JOSE_REFERENCE_RENDER_TIMEOUT_MS ?? "60000",
  10
);
const renderStepTimeoutMs = Number.parseInt(
  process.env.JOSE_REFERENCE_RENDER_STEP_TIMEOUT_MS ?? "15000",
  10
);

const renderViewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 393, height: 852 },
];

const fetched = new Map();
const pages = new Map();
const stylesheets = new Map();
const assets = new Map();

const CSS_VALUE_PATTERNS = {
  colors: /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:black|white|transparent|currentColor)\b/gi,
  fontSizes: /font-size\s*:\s*([^;}{]+)/gi,
  fontFamilies: /font-family\s*:\s*([^;}{]+)/gi,
  spacing: /(?:margin|padding|gap|inset|top|right|bottom|left|width|max-width|min-width|height|line-height)\s*:\s*([^;}{]+)/gi,
  radii: /border-radius\s*:\s*([^;}{]+)/gi,
  shadows: /box-shadow\s*:\s*([^;}{]+)/gi,
  transitions: /transition(?:-[\w-]+)?\s*:\s*([^;}{]+)/gi,
  animations: /animation(?:-[\w-]+)?\s*:\s*([^;}{]+)/gi,
  easings: /cubic-bezier\([^)]*\)|\b(?:linear|ease|ease-in|ease-out|ease-in-out|steps\([^)]*\))\b/gi,
  breakpoints: /@media[^{]+/gi,
  layout: /(?:display\s*:\s*(?:grid|flex)|grid-template[^:]*\s*:[^;}{]+|flex-[\w-]+\s*:[^;}{]+|justify-content\s*:[^;}{]+|align-items\s*:[^;}{]+)/gi,
  variables: /--[\w-]+\s*:\s*([^;}{]+)/gi,
};

function sameOrigin(url) {
  return url.origin === baseURL.origin;
}

function normalizePagePath(url) {
  const pathname = url.pathname.endsWith("/") ? `${url.pathname}index` : url.pathname;
  const clean = pathname.replace(/^\/+/, "").replace(/\/+$/, "") || "index";
  return `${clean.replace(/[^a-z0-9/_-]/gi, "_")}.html`;
}

function normalizeAssetPath(url, prefix) {
  const hostPrefix = url.hostname.replace(/[^a-z0-9.-]/gi, "_");
  const ext = path.extname(url.pathname) || ".txt";
  const body = url.pathname.replace(/^\/+/, "").replace(/\/+$/, "") || "asset";
  return path.join(prefix, hostPrefix, body.replace(/[^a-z0-9/_.-]/gi, "_") + (path.extname(body) ? "" : ext));
}

async function fetchText(url) {
  const href = url.toString();
  if (fetched.has(href)) return fetched.get(href);

  const response = await fetch(href, {
    headers: {
      "user-agent": userAgent,
      accept: "text/html,application/xhtml+xml,text/css,image/svg+xml,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${href}`);
  }

  const text = await response.text();
  fetched.set(href, text);
  return text;
}

async function fetchBinary(url) {
  const href = url.toString();
  const response = await fetch(href, {
    headers: {
      "user-agent": userAgent,
      accept: "image/*,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${href}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function urlsFromAttributes(html, attr, documentURL = baseURL) {
  const urls = [];
  const pattern = new RegExp(`${attr}=["']([^"']+)["']`, "gi");
  for (const match of html.matchAll(pattern)) {
    const raw = match[1];
    if (raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) continue;
    try {
      urls.push(new URL(raw, documentURL));
    } catch {
      // Ignore invalid authoring fragments.
    }
  }
  return urls;
}

function urlsFromSrcset(html, documentURL = baseURL) {
  const urls = [];
  for (const match of html.matchAll(/srcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) {
      const raw = candidate.trim().split(/\s+/)[0];
      if (!raw) continue;
      try {
        urls.push(new URL(raw, documentURL));
      } catch {
        // Ignore invalid candidates.
      }
    }
  }
  return urls;
}

function urlsFromMetaContent(html, documentURL = baseURL) {
  const urls = [];
  for (const match of html.matchAll(/<meta\b[^>]*content=["'](https?:\/\/[^"']+)["'][^>]*>/gi)) {
    try {
      urls.push(new URL(match[1], documentURL));
    } catch {
      // Ignore invalid metadata URLs.
    }
  }
  return urls;
}

function urlsFromCSS(css, stylesheetURL = baseURL) {
  const urls = [];
  for (const match of css.matchAll(/url\((['"]?)([^)'"]+)\1\)/gi)) {
    const raw = match[2];
    if (!raw || raw.startsWith("data:")) continue;
    try {
      urls.push(new URL(raw, stylesheetURL));
    } catch {
      // Ignore invalid CSS URLs.
    }
  }
  return urls;
}

function extractInlineStyles(html) {
  return [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1].trim());
}

function extractPageTitle(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

function extractBodyClasses(html) {
  return html.match(/<body\b[^>]*class=["']([^"']+)["']/i)?.[1]?.split(/\s+/).filter(Boolean) ?? [];
}

function summarizeInlineSVG(html) {
  const svgs = [...html.matchAll(/<svg\b([\s\S]*?)<\/svg>/gi)].map((match) => match[0]);
  const viewBoxes = new Set();
  const strokeWidths = new Set();
  const fills = new Set();

  for (const svg of svgs) {
    const viewBox = svg.match(/viewBox=["']([^"']+)["']/i)?.[1];
    if (viewBox) viewBoxes.add(viewBox);
    for (const stroke of svg.matchAll(/stroke-width=["']([^"']+)["']/gi)) {
      strokeWidths.add(stroke[1]);
    }
    for (const fill of svg.matchAll(/fill=["']([^"']+)["']/gi)) {
      fills.add(fill[1]);
    }
  }

  return {
    count: svgs.length,
    viewBoxes: [...viewBoxes],
    strokeWidths: [...strokeWidths],
    fills: [...fills],
  };
}

function uniqueMatches(text, pattern, limit = 120) {
  const found = new Set();
  pattern.lastIndex = 0;
  for (const match of text.matchAll(pattern)) {
    const value = (match[1] ?? match[0]).replace(/\s+/g, " ").trim();
    if (value) found.add(value);
    if (found.size >= limit) break;
  }
  return [...found];
}

function summarizeCSS(css) {
  return Object.fromEntries(
    Object.entries(CSS_VALUE_PATTERNS).map(([key, pattern]) => [key, uniqueMatches(css, pattern)])
  );
}

function mergeSummaries(summaries) {
  const merged = Object.fromEntries(Object.keys(CSS_VALUE_PATTERNS).map((key) => [key, new Set()]));
  for (const summary of summaries) {
    for (const [key, values] of Object.entries(summary)) {
      merged[key] ??= new Set();
      for (const value of values) merged[key].add(value);
    }
  }
  return Object.fromEntries(Object.entries(merged).map(([key, values]) => [key, [...values]]));
}

function classifyAsset(url) {
  const ext = path.extname(url.pathname).toLowerCase();
  if ([".svg", ".ico"].includes(ext)) return "icon";
  if ([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"].includes(ext)) return "image";
  if ([".woff", ".woff2", ".ttf", ".otf"].includes(ext)) return "font";
  if ([".js", ".mjs"].includes(ext)) return "script";
  if ([".css"].includes(ext)) return "stylesheet";
  return "other";
}

function recordAsset(url) {
  const type = classifyAsset(url);
  if (type === "other") return;
  const href = url.toString();
  const existing = assets.get(href);
  if (existing) return existing;
  const entry = { url: href, type };
  assets.set(href, entry);
  if (type === "stylesheet") stylesheets.set(href, { url: href });
  return entry;
}

async function listFilesIfPresent(directory) {
  try {
    const entries = await readdir(directory, { recursive: true, withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(path.relative(outputRoot, directory), entry.name).replace(/\\/g, "/"))
      .sort();
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

function classifyRenderedFile(file) {
  const name = path.basename(file);
  const viewport = name.includes("-mobile.") ? "mobile" : name.includes("-desktop.") ? "desktop" : "unknown";
  const page = name.replace(/-(desktop|mobile)\.(computed\.json|a11y\.txt|png)$/i, "");
  const type = file.endsWith(".computed.json")
    ? "computed-style"
    : file.endsWith(".a11y.txt")
      ? "accessibility-tree"
      : file.endsWith(".png")
        ? "full-page-screenshot"
        : "unknown";

  return { page, viewport, type, file };
}

async function withTimeout(promise, label, timeoutMs) {
  let timeout;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

function renderedPageName(pageFile) {
  const pageName = pageFile
    .replace(/\.html$/i, "")
    .replace(/\/index$/i, "")
    .replace(/\//g, "-");

  return pageName === "index" || pageName === "" ? "home" : pageName;
}

function expectedRenderedArtifactFiles() {
  if (!shouldCaptureRenderedArtifacts) return [];

  return [...pages.values()].flatMap((pageEntry) => {
    const pageName = renderedPageName(pageEntry.file);
    return renderViewports.flatMap((viewport) => {
      const artifactName = `${pageName}-${viewport.name}`;
      return [
        `devtools/${artifactName}.a11y.txt`,
        `devtools/${artifactName}.computed.json`,
        `screenshots/${artifactName}.png`,
      ];
    });
  });
}

async function captureRenderedArtifacts() {
  if (!shouldCaptureRenderedArtifacts) return;

  const { chromium } = await import("@playwright/test");
  const browser = await withTimeout(
    chromium.launch({ headless: true }),
    "chromium launch",
    renderStepTimeoutMs
  );

  try {
    for (const pageEntry of pages.values()) {
      const pageName = renderedPageName(pageEntry.file);

      for (const viewport of renderViewports) {
        const page = await browser.newPage({
          viewport: { width: viewport.width, height: viewport.height },
          userAgent,
        });
        const artifactName = `${pageName}-${viewport.name}`;

        try {
          await page.goto(pageEntry.url, {
            waitUntil: "domcontentloaded",
            timeout: renderNavigationTimeoutMs,
          });
          await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
          await page.addStyleTag({
            content: `
              *, *::before, *::after {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
                scroll-behavior: auto !important;
              }
            `,
          });

          const screenshotPath = path.join(outputRoot, "screenshots", `${artifactName}.png`);
          await mkdir(path.dirname(screenshotPath), { recursive: true });
          await page.screenshot({
            path: screenshotPath,
            animations: "disabled",
            fullPage: true,
            timeout: renderStepTimeoutMs,
          });

          const computedPath = path.join(outputRoot, "devtools", `${artifactName}.computed.json`);
          await mkdir(path.dirname(computedPath), { recursive: true });
          const computed = await withTimeout(page.evaluate(() => {
            const serializeRect = (element) => {
              if (!element) return null;
              const rect = element.getBoundingClientRect();
              return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
              };
            };
            const serializeStyle = (element) => {
              if (!element) return null;
              const style = window.getComputedStyle(element);
              return {
                selector: element.tagName.toLowerCase(),
                className: element.getAttribute("class") ?? "",
                text: element.textContent?.replace(/\s+/g, " ").trim().slice(0, 180) ?? "",
                rect: serializeRect(element),
                color: style.color,
                backgroundColor: style.backgroundColor,
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                letterSpacing: style.letterSpacing,
                lineHeight: style.lineHeight,
                display: style.display,
                gridTemplateColumns: style.gridTemplateColumns,
                gap: style.gap,
                padding: style.padding,
                margin: style.margin,
                borderRadius: style.borderRadius,
                boxShadow: style.boxShadow,
                transitionDuration: style.transitionDuration,
                transitionTimingFunction: style.transitionTimingFunction,
              };
            };
            const selectors = [
              "body",
              "nav",
              ".nav-inner",
              "main",
              "section",
              "article",
              "h1",
              "h2",
              "h3",
              "p",
              "a",
              "img",
              "footer",
            ];

            return {
              url: window.location.href,
              title: document.title,
              viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
              },
              scrollHeight: document.documentElement.scrollHeight,
              bodyClasses: [...document.body.classList],
              samples: selectors.flatMap((selector) =>
                [...document.querySelectorAll(selector)].slice(0, 12).map(serializeStyle)
              ),
            };
          }), `${artifactName} computed-style capture`, renderStepTimeoutMs);
          await writeFile(computedPath, JSON.stringify(computed, null, 2));

          const accessibilityPath = path.join(outputRoot, "devtools", `${artifactName}.a11y.txt`);
          const accessibility = await withTimeout(
            page.accessibility.snapshot({ interestingOnly: false }),
            `${artifactName} accessibility capture`,
            renderStepTimeoutMs
          );
          await writeFile(accessibilityPath, JSON.stringify(accessibility, null, 2));
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
}

function renderMarkdown(report) {
  const renderedByPage = new Map();
  for (const artifact of report.renderedArtifacts) {
    const key = `${artifact.page}:${artifact.viewport}`;
    const group = renderedByPage.get(key) ?? [];
    group.push(artifact);
    renderedByPage.set(key, group);
  }

  return `# Jose Ocando Design Reference Capture

This reference was generated from ${report.baseURL} on ${report.capturedAt}. It is a local design-analysis artifact for mapping Jamie's prototype against Jose Ocando's live portfolio without repeating the discovery step.

## Capture Scope

- Rendered artifacts indexed: ${report.renderedArtifacts.length}
- Browser-computed captures live under \`devtools/\`; full-page screenshots live under \`screenshots/\`

- Pages captured: ${report.pages.length}
- Stylesheets captured: ${report.stylesheets.length}
- Same-origin and CDN assets indexed: ${report.assets.length}
- Raw source files live under this directory: \`pages/\` and \`css/\`; asset URLs are indexed in \`design-reference.json\`

## Pages

${report.pages
  .map((page) => `- \`${page.url}\` -> \`${page.file}\` (${page.title || "untitled"})`)
  .join("\n")}

## Rendered Browser Artifacts

${[...renderedByPage.entries()]
  .map(([key, artifacts]) => {
    const [page, viewport] = key.split(":");
    const files = artifacts.map((artifact) => `\`${artifact.file}\``).join(", ");
    return `- \`${page}\` ${viewport}: ${files}`;
  })
  .join("\n") || "- n.a."}

## Design Tokens

### Color

${report.design.colors.map((value) => `- \`${value}\``).join("\n") || "- n.a."}

### Typography

Font families:
${report.design.fontFamilies.map((value) => `- \`${value}\``).join("\n") || "- n.a."}

Font sizes:
${report.design.fontSizes.map((value) => `- \`${value}\``).join("\n") || "- n.a."}

### Spacing And Layout

Spacing, sizing, and line-height values:
${report.design.spacing.slice(0, 160).map((value) => `- \`${value}\``).join("\n") || "- n.a."}

Layout declarations:
${report.design.layout.map((value) => `- \`${value}\``).join("\n") || "- n.a."}

Breakpoints:
${report.design.breakpoints.map((value) => `- \`${value}\``).join("\n") || "- n.a."}

### Effects

Radii:
${report.design.radii.map((value) => `- \`${value}\``).join("\n") || "- n.a."}

Shadows:
${report.design.shadows.map((value) => `- \`${value}\``).join("\n") || "- n.a."}

Transitions:
${report.design.transitions.map((value) => `- \`${value}\``).join("\n") || "- n.a."}

Animations:
${report.design.animations.map((value) => `- \`${value}\``).join("\n") || "- n.a."}

Easing:
${report.design.easings.map((value) => `- \`${value}\``).join("\n") || "- n.a."}

### Iconography And Assets

Inline SVG summary:
- SVG instances: \`${report.iconography.inlineSvgCount}\`
- View boxes: ${report.iconography.viewBoxes.map((value) => `\`${value}\``).join(", ") || "n.a."}
- Stroke widths: ${report.iconography.strokeWidths.map((value) => `\`${value}\``).join(", ") || "n.a."}
- Fill values: ${report.iconography.fills.map((value) => `\`${value}\``).join(", ") || "n.a."}

${report.assets
  .filter((asset) => asset.type === "icon" || asset.type === "font" || asset.type === "image")
  .slice(0, 120)
  .map((asset) => `- ${asset.type}: \`${asset.url}\`${asset.file ? ` -> \`${asset.file}\`` : ""}`)
  .join("\n") || "- n.a."}

## Mapping Notes For Jamie's Prototype

- Use \`design-reference.json\` for machine-readable tokens, raw source paths, and rendered artifact indexes.
- Use \`devtools/*.computed.json\` for rendered spacing, typography, color, icon, motion, asset, and section-flow evidence.
- Use \`screenshots/*.png\` for visual parity and page pacing checks at desktop and mobile viewports.
- Treat this as the source capture, not the implementation target. Preserve Jamie's content and brand direction while matching Jose's structural proportions, type rhythm, navigation behavior, and section flow.
- Use the existing \`test:jose-parity\` guardrail after applying changes; this capture complements that guardrail by storing source evidence for repeated design decisions.
`;
}

async function crawl() {
  const queue = [baseURL];
  const visited = new Set();

  while (queue.length > 0 && pages.size < maxPages) {
    const url = queue.shift();
    const cleanURL = new URL(url);
    cleanURL.hash = "";
    if (!sameOrigin(cleanURL) || visited.has(cleanURL.toString())) continue;
    if (path.extname(cleanURL.pathname)) continue;

    visited.add(cleanURL.toString());
    const html = await fetchText(cleanURL);
    const pageFile = normalizePagePath(cleanURL);
    pages.set(cleanURL.toString(), {
      url: cleanURL.toString(),
      file: pageFile,
      title: extractPageTitle(html),
      bodyClasses: extractBodyClasses(html),
      inlineStyleCount: extractInlineStyles(html).length,
      inlineSVG: summarizeInlineSVG(html),
      source: html,
    });

    const hrefs = urlsFromAttributes(html, "href", cleanURL);
    const srcs = urlsFromAttributes(html, "src", cleanURL);
    const srcsets = urlsFromSrcset(html, cleanURL);
    const metadata = urlsFromMetaContent(html, cleanURL);
    for (const linked of [...hrefs, ...srcs, ...srcsets, ...metadata]) {
      linked.hash = "";
      recordAsset(linked);
      if (sameOrigin(linked) && !path.extname(linked.pathname) && pages.size + queue.length < maxPages) {
        queue.push(linked);
      }
    }
  }
}

async function writeCapture() {
  await crawl();
  await mkdir(outputRoot, { recursive: true });
  await mkdir(path.join(outputRoot, "pages"), { recursive: true });
  await mkdir(path.join(outputRoot, "css"), { recursive: true });
  await mkdir(path.join(outputRoot, "assets"), { recursive: true });

  const styleSummaries = [];
  for (const page of pages.values()) {
    await mkdir(path.dirname(path.join(outputRoot, "pages", page.file)), { recursive: true });
    await writeFile(path.join(outputRoot, "pages", page.file), page.source);
    for (const inlineStyle of extractInlineStyles(page.source)) {
      styleSummaries.push(summarizeCSS(inlineStyle));
    }
  }

  for (const entry of stylesheets.values()) {
    const url = new URL(entry.url);
    const css = await fetchText(url);
    const file = normalizeAssetPath(url, "css");
    entry.file = file;
    entry.summary = summarizeCSS(css);
    styleSummaries.push(entry.summary);
    for (const assetURL of urlsFromCSS(css, url)) {
      recordAsset(assetURL);
    }
    await mkdir(path.dirname(path.join(outputRoot, file)), { recursive: true });
    await writeFile(path.join(outputRoot, file), css);
  }

  for (const entry of assets.values()) {
    if (entry.type !== "icon") continue;
    const url = new URL(entry.url);
    const source = path.extname(url.pathname).toLowerCase() === ".svg" ? await fetchText(url) : await fetchBinary(url);
    const file = normalizeAssetPath(url, "assets");
    entry.file = file;
    await mkdir(path.dirname(path.join(outputRoot, file)), { recursive: true });
    await writeFile(path.join(outputRoot, file), source);
  }

  await captureRenderedArtifacts();

  const renderedArtifacts = expectedRenderedArtifactFiles().map(classifyRenderedFile);

  const report = {
    schema_version: 1,
    baseURL: baseURL.toString(),
    capturedAt: new Date().toISOString(),
    pages: [...pages.values()].map(({ source, ...page }) => page),
    stylesheets: [...stylesheets.values()],
    assets: [...assets.values()],
    renderedArtifacts,
    design: mergeSummaries(styleSummaries),
    iconography: {
      inlineSvgCount: [...pages.values()].reduce((total, page) => total + page.inlineSVG.count, 0),
      viewBoxes: [...new Set([...pages.values()].flatMap((page) => page.inlineSVG.viewBoxes))],
      strokeWidths: [...new Set([...pages.values()].flatMap((page) => page.inlineSVG.strokeWidths))],
      fills: [...new Set([...pages.values()].flatMap((page) => page.inlineSVG.fills))],
    },
  };

  await writeFile(path.join(outputRoot, "design-reference.json"), JSON.stringify(report, null, 2));
  await writeFile(path.join(outputRoot, "README.md"), renderMarkdown(report));

  console.log(JSON.stringify({
    outputRoot,
    pages: report.pages.length,
    stylesheets: report.stylesheets.length,
    assets: report.assets.length,
    renderedArtifacts: report.renderedArtifacts.length,
  }, null, 2));
}

writeCapture().catch((error) => {
  console.error(error);
  process.exit(1);
});
