import { test, type Page } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { stableScreenshotStyle } from "../helpers/visual";

const referenceBaseURL = process.env.REFERENCE_BASE_URL;
const candidateBaseURL = process.env.CANDIDATE_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4321";
const outputRoot = process.env.SCREENSHOT_OUTPUT_DIR ?? "artifacts/screenshots";

const viewports = [
  { name: "mobile", width: 393, height: 852 },
  { name: "desktop", width: 1440, height: 1000 }
] as const;

const captures = [
  { name: "home-top", path: "/", scrollY: 0 },
  { name: "home-work", path: "/", scrollY: 780 },
  { name: "about-top", path: "/now/", scrollY: 0 },
  { name: "blog-top", path: "/blog/", scrollY: 0 },
  { name: "footer", path: "/", selector: ".site-footer" }
] as const;

test.describe("Jose and Jamie screenshot contact sheet", () => {
  test("capture paired reference and prototype frames", async ({ page }) => {
    test.skip(!referenceBaseURL, "REFERENCE_BASE_URL environment variable must be set");

    const rows: string[] = [];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const capture of captures) {
        const pairName = `${capture.name}-${viewport.name}`;
        const reference = await captureFrame(page, referenceBaseURL!, capture, `jose/${pairName}.png`);
        const candidate = await captureFrame(page, candidateBaseURL, capture, `jamie/${pairName}.png`);
        const diff = await writeDiff(reference.filePath, candidate.filePath, `diff/${pairName}.png`);

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
  const url = new URL(capture.path, baseURL).toString();
  const filePath = path.join(outputRoot, relativePath);

  await mkdir(path.dirname(filePath), { recursive: true });
  await page.goto(url);
  await page.addStyleTag({ content: stableScreenshotStyle });

  if ("scrollY" in capture) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), capture.scrollY);
  }

  if ("selector" in capture) {
    const target = page.locator(capture.selector).first();
    if ((await target.count()) === 0) {
      throw new Error(`Selector "${capture.selector}" not found at ${baseURL}${capture.path}`);
    }
    await target.screenshot({ path: filePath, animations: "disabled" });
    return { filePath, relativePath };
  }

  await page.screenshot({ path: filePath, animations: "disabled" });
  return { filePath, relativePath };
}

async function writeDiff(referencePath: string, candidatePath: string, relativePath: string) {
  const reference = PNG.sync.read(await readFile(referencePath));
  const candidate = PNG.sync.read(await readFile(candidatePath));

  if (reference.width !== candidate.width || reference.height !== candidate.height) {
    return undefined;
  }

  const diff = new PNG({ width: reference.width, height: reference.height });
  pixelmatch(reference.data, candidate.data, diff.data, reference.width, reference.height, {
    threshold: 0.1
  });

  const filePath = path.join(outputRoot, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, PNG.sync.write(diff));
  return { filePath, relativePath };
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
