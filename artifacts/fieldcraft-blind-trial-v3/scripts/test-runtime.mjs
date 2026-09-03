import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { createStaticServer } from "./static-server.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "dist");
const reportPath = resolve(root, "test-results/runtime-report.json");
const artifacts = await Promise.all(["index.html", "style.css", "app.js"].map((name) => readFile(resolve(output, name))));
const artifactId = `sha256:${createHash("sha256").update(Buffer.concat(artifacts)).digest("hex")}`;
const server = createStaticServer(output);
await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

const sceneContract = [
  [89.6, 158.8, 1100.8, 395.1, 134.4, 131.712, "center", "rgb(2, 43, 114)", 3],
  [89.6, 119.6, 619.5, 117.1, 56.32, 58.573, "start", "rgb(23, 26, 34)", 2],
  [217.6, 105.2, 844.8, 175.7, 56.32, 58.573, "center", "rgb(23, 26, 34)", 3],
  [301, 185.3, 678, 94.7, 94.72, 94.72, "center", "rgb(23, 26, 34)", 1],
  [89.6, 220.9, 788.5, 117.1, 56.32, 58.573, "start", "rgb(243, 246, 251)", 2],
  [208, 118.5, 864, 80.6, 36, 40.32, "center", "rgb(23, 26, 34)", 2],
  [89.6, 98, 1100.8, 117.1, 56.32, 58.573, "start", "rgb(23, 26, 34)", 2],
  [89.6, 98, 901.1, 175.7, 56.32, 58.573, "start", "rgb(23, 26, 34)", 3],
  [240, 163.9, 800, 95.8, 42, 47.88, "center", "rgb(243, 246, 251)", 2],
  [353.8, 245, 572.4, 58.6, 56.32, 58.573, "center", "rgb(243, 246, 251)", 1],
  [89.6, 96, 1100.8, 58.6, 56.32, 58.573, "start", "rgb(23, 26, 34)", 1],
  [189.4, 98, 901.1, 117.1, 56.32, 58.573, "center", "rgb(23, 26, 34)", 2],
  [89.6, 96, 1100.8, 58.6, 56.32, 58.573, "start", "rgb(23, 26, 34)", 1],
  [89.6, 96, 1100.8, 117.1, 56.32, 58.573, "start", "rgb(23, 26, 34)", 2],
  [161.3, 413.5, 957.4, 117.1, 56.32, 58.573, "center", "rgb(23, 26, 34)", 2],
  [89.6, 107.5, 1100.8, 58.6, 56.32, 58.573, "start", "rgb(23, 26, 34)", 1],
  [89.6, 101.9, 1100.8, 46.1, 43.52, 46.131, "start", "rgb(23, 26, 34)", 1],
  [89.6, 101.9, 1100.8, 46.1, 43.52, 46.131, "start", "rgb(23, 26, 34)", 1],
  [89.6, 101.9, 1100.8, 92.3, 43.52, 46.131, "start", "rgb(23, 26, 34)", 2],
  [89.6, 101.9, 1100.8, 46.1, 43.52, 46.131, "start", "rgb(23, 26, 34)", 1],
];

const report = {
  artifactId,
  baseUrl,
  viewport: { width: 1280, height: 720 },
  initialScenes: [],
  modalStates: [],
  deploymentStates: [],
  roadmapStates: [],
  chapterStates: [],
  responsiveStates: [],
  console: [],
  requestFailures: [],
  pageErrors: [],
};

function near(actual, expected, tolerance, label) {
  assert.equal(Math.abs(actual - expected) <= tolerance, true, `${label}: expected ${expected}±${tolerance}, got ${actual}`);
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
  });
}

async function measure(page, label) {
  const record = await page.evaluate(({ artifactId: id, label: stateLabel }) => {
    const state = window.__fieldcraft.getState();
    const active = document.querySelector(`.scene[data-index='${state.activeSection}']`);
    const heading = active.querySelector("[data-scene-heading]");
    const rect = heading.getBoundingClientRect();
    const style = getComputedStyle(heading);
    const spanLines = [...heading.children].filter((child) => child.tagName === "SPAN");
    const lineRects = (spanLines.length ? spanLines : [heading]).flatMap((line) => {
      const range = document.createRange();
      range.selectNodeContents(line);
      return [...range.getClientRects()].filter((lineRect) => lineRect.width > 0).map((lineRect) => ({
        x: lineRect.x,
        y: lineRect.y,
        width: lineRect.width,
        height: lineRect.height,
      }));
    });

    const isVisible = (element) => {
      const computed = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return computed.visibility !== "hidden" && Number(computed.opacity) > 0 && computed.display !== "none" && box.width > 0 && box.height > 0;
    };
    const overlaps = (first, second) => {
      const x = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left));
      const y = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));
      return x * y;
    };
    const markers = [...active.querySelectorAll("[data-scene-region]")]
      .concat([...document.querySelectorAll("body > [data-scene-region], body > header[data-scene-region]")])
      .filter((element, index, all) => all.indexOf(element) === index && isVisible(element))
      .map((element) => ({ element, name: element.dataset.sceneRegion, role: element.dataset.regionRole, rect: element.getBoundingClientRect() }));
    const allowedPairs = new Set([
      "body:diagram", "body:heading", "body:calendar", "calendar:choices", "calendar:heading", "diagram:heading",
      "body:header", "body:pager", "body:rail", "choices:header", "choices:pager", "choices:rail",
      "diagram:header", "diagram:pager", "diagram:rail", "heading:header", "heading:pager", "heading:rail",
      "calendar:header", "calendar:pager", "calendar:rail",
    ]);
    const collisions = [];
    for (let firstIndex = 0; firstIndex < markers.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < markers.length; secondIndex += 1) {
        const first = markers[firstIndex];
        const second = markers[secondIndex];
        const key = [first.role, second.role].sort().join(":");
        if (!allowedPairs.has(key)) continue;
        const area = overlaps(first.rect, second.rect);
        if (area > .25) collisions.push({ first: first.name, second: second.name, area });
      }
    }

    const hiddenStateFailures = [...document.querySelectorAll("[data-state-hidden='true']")].flatMap((element) => {
      const computed = getComputedStyle(element);
      const focusable = element.matches("button, a, input, select, textarea, [tabindex]") && element.tabIndex >= 0;
      const failed = computed.visibility !== "hidden" || Number(computed.opacity) !== 0 || computed.pointerEvents !== "none" || focusable;
      return failed ? [{ key: element.dataset.stateKey ?? element.className, visibility: computed.visibility, opacity: computed.opacity, pointerEvents: computed.pointerEvents, tabIndex: element.tabIndex }] : [];
    });

    return {
      artifactId: id,
      label: stateLabel,
      activeSection: state.activeSection,
      visibleStateKeys: state.visibleStateKeys,
      focusedElement: document.activeElement?.getAttribute("data-modal-step") ?? document.activeElement?.className ?? document.activeElement?.tagName,
      heading: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        textAlign: style.textAlign,
        color: style.color,
        lineRects,
        clipped: ((style.overflowX !== "visible" && heading.scrollWidth > heading.clientWidth + 1) || (style.overflowY !== "visible" && heading.scrollHeight > heading.clientHeight + 1)),
      },
      sceneActive: active.classList.contains("is-active"),
      documentOverflow: document.documentElement.scrollWidth !== document.documentElement.clientWidth,
      sceneOverflow: active.scrollWidth !== active.clientWidth,
      collisions,
      hiddenStateFailures,
    };
  }, { artifactId, label });
  return record;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    page.on("console", (message) => {
      if (["warning", "error"].includes(message.type())) report.console.push({ type: message.type(), text: message.text() });
    });
    page.on("requestfailed", (request) => report.requestFailures.push({ url: request.url(), failure: request.failure()?.errorText }));
    page.on("pageerror", (error) => report.pageErrors.push(error.message));
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await settle(page);

    assert.equal(await page.title(), "Varick — Forward Deployed Engineering");
    assert.equal(await page.locator(".scene").count(), 20);
    assert.equal(await page.locator("button").count(), 15);
    assert.equal(await page.locator("svg").count(), 10);
    assert.equal(await page.locator("[role='img']").count(), 4);

    for (let index = 0; index < sceneContract.length; index += 1) {
      await page.evaluate((sceneIndex) => window.__fieldcraft.goTo(sceneIndex, { immediate: true }), index);
      await settle(page);
      const record = await measure(page, `initial-scene-${index}`);
      const [x, y, width, height, fontSize, lineHeight, textAlign, color, lineCount] = sceneContract[index];
      assert.equal(record.activeSection, index);
      assert.equal(record.sceneActive, true);
      near(record.heading.x, x, 3, `scene ${index} heading x`);
      near(record.heading.y, y, 3, `scene ${index} heading y`);
      near(record.heading.width, width, 3, `scene ${index} heading width`);
      near(record.heading.height, height, 3, `scene ${index} heading height`);
      near(record.heading.fontSize, fontSize, .05, `scene ${index} font size`);
      near(record.heading.lineHeight, lineHeight, .05, `scene ${index} line height`);
      assert.equal(record.heading.textAlign, textAlign, `scene ${index} alignment`);
      assert.equal(record.heading.color, color, `scene ${index} color`);
      assert.equal(record.heading.lineRects.length, lineCount, `scene ${index} rendered line count`);
      assert.equal(record.heading.clipped, false, `scene ${index} heading clipping`);
      assert.equal(record.documentOverflow, false, `scene ${index} document overflow`);
      assert.equal(record.sceneOverflow, false, `scene ${index} scene overflow`);
      assert.deepEqual(record.collisions, [], `scene ${index} region collisions`);
      assert.deepEqual(record.hiddenStateFailures, [], `scene ${index} hidden state contract`);
      report.initialScenes.push(record);
    }

    await page.evaluate(() => window.__fieldcraft.goTo(6, { immediate: true }));
    for (let index = 0; index < 5; index += 1) {
      const card = page.locator(`[data-modal-step='${index}']`);
      await card.click();
      await settle(page);
      const openState = await measure(page, `modal-${index + 1}-open`);
      assert.equal(await page.locator(".workflow-dialog").getAttribute("data-state-hidden"), "false");
      assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute("data-close-modal")), true, `modal ${index + 1} focuses Close`);
      assert.equal(await page.locator("#modal-title").textContent(), modalContentTitle(index));
      report.modalStates.push(openState);
      if (index % 2 === 0) await page.locator("[data-close-modal]").click();
      else await page.keyboard.press("Escape");
      assert.equal(await page.locator(".workflow-dialog").getAttribute("data-state-hidden"), "true");
      assert.equal(await card.evaluate((element) => document.activeElement === element), true, `modal ${index + 1} restores focus`);
    }

    await page.evaluate(() => window.__fieldcraft.goTo(8, { immediate: true }));
    report.deploymentStates.push(await measure(page, "deployment-initial"));
    await page.waitForTimeout(6600);
    let deployment = await page.evaluate(() => window.__fieldcraft.getState().deploymentState);
    assert.equal(deployment, "waiting-for-approval");
    assert.equal(await page.locator(".approve").getAttribute("data-state-hidden"), "false");
    report.deploymentStates.push(await measure(page, "deployment-waiting-for-approval"));
    await page.locator(".approve").click();
    report.deploymentStates.push(await measure(page, "deployment-approved"));
    await page.waitForTimeout(500);
    report.deploymentStates.push(await measure(page, "deployment-posting"));
    await page.waitForTimeout(900);
    deployment = await page.evaluate(() => window.__fieldcraft.getState().deploymentState);
    assert.equal(deployment, "posted");
    report.deploymentStates.push(await measure(page, "deployment-posted"));
    await page.evaluate(() => window.__fieldcraft.goTo(7, { immediate: true }));
    assert.equal(await page.evaluate(() => window.__fieldcraft.getState().deploymentState), "initial");
    report.deploymentStates.push(await measure(page, "deployment-reset"));
    await page.evaluate(() => window.__fieldcraft.goTo(8, { immediate: true }));
    report.deploymentStates.push(await measure(page, "deployment-re-entry"));
    await page.evaluate(() => window.__fieldcraft.goTo(7, { immediate: true }));

    for (const section of [15, 16, 17, 18, 19]) {
      await page.evaluate((sceneIndex) => window.__fieldcraft.goTo(sceneIndex, { immediate: true }), section);
      await settle(page);
      report.roadmapStates.push(await measure(page, section === 15 ? "roadmap-introduction" : `roadmap-week-${section - 15}`));
    }
    await page.evaluate(() => window.__fieldcraft.next());
    assert.equal(await page.evaluate(() => window.__fieldcraft.getState().finalComplete), true);
    assert.equal(await page.locator("[data-direction='next']").isDisabled(), true);
    report.roadmapStates.push(await measure(page, "roadmap-complete-month"));
    await page.evaluate(() => window.__fieldcraft.previous());
    assert.equal(await page.evaluate(() => window.__fieldcraft.getState().activeSection), 19);
    assert.equal(await page.evaluate(() => window.__fieldcraft.getState().finalComplete), false);
    report.roadmapStates.push(await measure(page, "roadmap-backward-from-complete"));

    for (const section of [1, 5, 10, 12, 13, 15]) {
      await page.locator(`[data-chapter='${section}']`).click();
      await page.waitForTimeout(500);
      const state = await page.evaluate(() => window.__fieldcraft.getState());
      assert.equal(state.activeSection, section);
      assert.equal(await page.locator(`[data-chapter='${section}']`).getAttribute("aria-current"), "true");
      report.chapterStates.push({ section, active: true });
    }

    await page.evaluate(() => window.__fieldcraft.goTo(0, { immediate: true }));
    assert.equal(await page.locator("[data-direction='previous']").isDisabled(), true);
    await page.keyboard.press("End");
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => window.__fieldcraft.getState().activeSection), 19);
    await page.keyboard.press("Home");
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => window.__fieldcraft.getState().activeSection), 0);
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(520);
    assert.equal(await page.evaluate(() => window.__fieldcraft.getState().activeSection), 1, "wheel advances exactly one section");

    for (const viewport of [
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 820, height: 1180 },
      { width: 1280, height: 720 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.__fieldcraft.goTo(0, { immediate: true }));
      await settle(page);
      const responsive = await page.evaluate(() => {
        const heading = document.querySelector("#scene-0 h1").getBoundingClientRect();
        const pager = document.querySelector(".pager").getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth !== document.documentElement.clientWidth,
          headingClipped: heading.left < 0 || heading.right > innerWidth || heading.top < 0 || heading.bottom > innerHeight,
          pagerReachable: pager.left >= 0 && pager.right <= innerWidth && pager.top >= 0 && pager.bottom <= innerHeight,
          chapterDots: innerWidth <= 960 ? getComputedStyle(document.querySelector(".chapters i")).display !== "none" : true,
        };
      });
      assert.equal(responsive.overflow, false, `${viewport.width}x${viewport.height} horizontal overflow`);
      assert.equal(responsive.headingClipped, false, `${viewport.width}x${viewport.height} hero clipping`);
      assert.equal(responsive.pagerReachable, true, `${viewport.width}x${viewport.height} pager reachability`);
      assert.equal(responsive.chapterDots, true, `${viewport.width}x${viewport.height} chapter mode`);
      report.responsiveStates.push({ viewport, ...responsive });
    }
    await context.close();

    const reducedContext = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
    const reducedPage = await reducedContext.newPage();
    await reducedPage.goto(baseUrl, { waitUntil: "networkidle" });
    await reducedPage.evaluate(() => window.__fieldcraft.goTo(8, { immediate: true }));
    await settle(reducedPage);
    assert.equal(await reducedPage.evaluate(() => window.__fieldcraft.getState().deploymentState), "posted");
    report.deploymentStates.push(await measure(reducedPage, "deployment-reduced-motion"));
    await reducedContext.close();

    assert.deepEqual(report.console, [], "no site-authored console warnings or errors");
    assert.deepEqual(report.requestFailures, [], "no failed requests");
    assert.deepEqual(report.pageErrors, [], "no uncaught page errors");
  } finally {
    await browser.close();
  }
}

function modalContentTitle(index) {
  return ["“An email arrives”", "“Copied into a spreadsheet”", "“Checked in an internal system”", "“Approved in Slack”", "“Entered into the ERP”"][index];
}

try {
  await run();
  report.status = "pass";
  console.log(`Runtime scene contract: PASS (${artifactId})`);
} catch (error) {
  report.status = "fail";
  report.failure = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { message: String(error) };
  console.error(error);
  process.exitCode = 1;
} finally {
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  await new Promise((resolveClose) => server.close(resolveClose));
}
