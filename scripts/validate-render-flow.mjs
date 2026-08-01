import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const repoRoot = process.cwd();
const distRoot = path.join(repoRoot, "dist");
const failures = [];
const cdpEndpoint = process.env.CHROME_CDP_URL ?? process.env.CDP_ENDPOINT;
const viewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 }
];

if (!fs.existsSync(distRoot)) {
  console.error("Render-flow validation failed: dist/ is missing. Run ASTRO_TELEMETRY_DISABLED=1 npm run build first.");
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (error) {
  console.error("Render-flow validation blocked: Playwright is not available: " + error.message);
  process.exit(1);
}

const routes = builtRoutes();
const server = await startStaticServer(distRoot);
const baseUrl = "http://127.0.0.1:" + server.port;
let browser;
let context;
try {
  if (cdpEndpoint) {
    browser = await chromium.connectOverCDP(cdpEndpoint);
    context = browser.contexts()[0] ?? await browser.newContext();
  } else {
    browser = await chromium.launch();
    context = await browser.newContext();
  }
} catch (error) {
  await new Promise((resolve) => server.instance.close(resolve));
  const mode = cdpEndpoint ? "connect to Chrome over CDP at " + cdpEndpoint : "launch in this environment";
  console.error("Render-flow validation blocked: Chromium could not " + mode + ": " + cleanError(error));
  process.exit(1);
}

try {
  for (const viewport of viewports) {
    const page = await context.newPage();
    await page.setViewportSize(viewport);
    for (const route of routes) await validateRoute(page, baseUrl, route, viewport);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.instance.close(resolve));
}

if (failures.length > 0) {
  console.error("Render-flow validation failed:");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}

console.log(
  "Render-flow validation passed: " +
    routes.length +
    " routes across " +
    viewports.length +
    " viewports" +
    (cdpEndpoint ? " via " + cdpEndpoint : "") +
    ".",
);

function builtRoutes() {
  return listFiles(distRoot)
    .filter((file) => file.endsWith(".html"))
    .map((file) => {
      const relative = path.relative(distRoot, file);
      if (relative === "index.html") return "/";
      return "/" + relative.replace(/\/index\.html$/, "").replace(/\.html$/, "");
    })
    .sort();
}

async function validateRoute(page, baseUrl, route, viewport) {
  const label = route + " @ " + viewport.width + "x" + viewport.height;
  await page.goto(baseUrl + route, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts?.ready);

  const metrics = await page.evaluate(() => {
    const body = document.body;
    const doc = document.documentElement;
    const main = document.querySelector("main");
    const shellHeader = body.classList.contains("skillsbar-demo")
      ? document.querySelector("header.demo-nav")
      : document.querySelector("header.site-header");
    const shellFooter = document.querySelector("footer.site-footer");
    const linksAndButtons = [...document.querySelectorAll("a, button")].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        text: (element.getAttribute("aria-label") || element.textContent || element.tagName).trim().slice(0, 80),
        width: rect.width,
        height: rect.height
      };
    });
    const images = [...document.images].map((image) => {
      const rect = image.getBoundingClientRect();
      return { src: image.currentSrc || image.src, width: rect.width, height: rect.height, complete: image.complete };
    });
    const overflowingElements = [...document.querySelectorAll("body *")]
      .filter((element) => !element.closest(".work-carousel, .work-row, .proof-row"))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -32 || rect.right > doc.clientWidth + 2;
      })
      .slice(0, 10)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          text: (element.textContent || element.tagName).trim().slice(0, 80),
          left: rect.left,
          right: rect.right
        };
      });
    return {
      scrollWidth: Math.max(body.scrollWidth, doc.scrollWidth),
      clientWidth: doc.clientWidth,
      bodyTextLength: (body.innerText || "").trim().length,
      mainTop: main ? main.getBoundingClientRect().top : null,
      shellHeader: shellHeader
        ? { width: shellHeader.getBoundingClientRect().width, height: shellHeader.getBoundingClientRect().height }
        : null,
      shellFooter: shellFooter
        ? { width: shellFooter.getBoundingClientRect().width, height: shellFooter.getBoundingClientRect().height }
        : null,
      linksAndButtons,
      images,
      overflowingElements
    };
  });

  if (metrics.overflowingElements.length > 0) {
    const offenders = metrics.overflowingElements.map((item) => "\"" + item.text + "\" [" + Math.round(item.left) + "," + Math.round(item.right) + "]").join(", ");
    failures.push(label + ": horizontal overflow outside carousel content: " + offenders + ".");
  }
  if (metrics.bodyTextLength < 120) failures.push(label + ": rendered body text is nearly blank.");
  if (metrics.mainTop === null) failures.push(label + ": missing main landmark.");
  if (metrics.mainTop !== null && metrics.mainTop > viewport.height * 0.85) failures.push(label + ": main content starts too low in the viewport.");
  if (metrics.shellHeader === null) failures.push(label + ": missing route shell header landmark.");
  if (metrics.shellHeader && (metrics.shellHeader.width === 0 || metrics.shellHeader.height === 0)) failures.push(label + ": route shell header rendered at zero size.");
  if (metrics.shellFooter === null) failures.push(label + ": missing shared footer landmark.");
  if (metrics.shellFooter && (metrics.shellFooter.width === 0 || metrics.shellFooter.height === 0)) failures.push(label + ": shared footer rendered at zero size.");

  for (const item of metrics.linksAndButtons) {
    if (item.tag === "button" && (item.width > 0 || item.height > 0) && (item.width < 24 || item.height < 24)) failures.push(label + ": small button target for \"" + item.text + "\" (" + Math.round(item.width) + "x" + Math.round(item.height) + ").");
  }
  for (const image of metrics.images) {
    if (image.complete && (image.width === 0 || image.height === 0)) failures.push(label + ": image rendered at zero size: " + image.src);
  }
}

function listFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    if (entry.isFile()) return [fullPath];
    return [];
  });
}

async function startStaticServer(root) {
  const instance = http.createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const filePath = resolveStaticPath(root, url.pathname);
    if (!filePath) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "content-type": contentType(filePath) });
    fs.createReadStream(filePath).pipe(response);
  });
  await new Promise((resolve) => instance.listen(0, "127.0.0.1", resolve));
  return { instance, port: instance.address().port };
}

function resolveStaticPath(root, pathname) {
  const decoded = decodeURIComponent(pathname);
  const clean = path.normalize(decoded).replace(/^\/+/, "");
  const candidates = [path.join(root, clean), path.join(root, clean, "index.html"), path.join(root, clean + ".html")];
  for (const candidate of candidates) {
    if (!candidate.startsWith(root)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function contentType(file) {
  const ext = path.extname(file);
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

function cleanError(error) {
  return String(error?.message ?? error)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 6)
    .join(" ");
}
