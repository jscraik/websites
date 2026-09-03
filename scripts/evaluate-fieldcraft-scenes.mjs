import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  assertReferenceBinding,
  parseEvaluationPolicy,
  parseFieldcraftJson,
  parseInternalRegionContract,
  parseReferenceManifest,
  parseSceneContract,
  requiredEvidencePasses,
} from "./lib/fieldcraft-contracts.mjs";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const candidateUrl = process.env.CANDIDATE_BASE_URL;
if (!candidateUrl) {
  throw new Error("CANDIDATE_BASE_URL is required");
}

const referenceBundleRoot = path.resolve("docs/reference/fieldcraft-fde/v3");
const policyPath = path.join(referenceBundleRoot, "policy.json");
const manifestPath = path.join(referenceBundleRoot, "manifest.json");
const sceneContractText = await readFile("docs/specifications/fieldcraft-fde-scene-contract.json", "utf8");
const internalContractText = await readFile("docs/specifications/fieldcraft-fde-internal-region-contract.json", "utf8");
const policyBytes = await readFile(policyPath);
const manifestText = await readFile(manifestPath, "utf8");
const contract = parseSceneContract(parseFieldcraftJson(sceneContractText, "scene contract"));
const internalContract = parseInternalRegionContract(parseFieldcraftJson(internalContractText, "internal-region contract"));
const policy = parseEvaluationPolicy(parseFieldcraftJson(policyBytes.toString("utf8"), "evaluation policy"));
const manifest = parseReferenceManifest(parseFieldcraftJson(manifestText, "reference manifest"));
const policyDigest = createHash("sha256").update(policyBytes).digest("hex");
assertReferenceBinding(policyDigest, policy, manifest);
if (JSON.stringify(policy.viewport) !== JSON.stringify(contract.viewport)) {
  throw new Error("Fieldcraft evaluation policy viewport does not match the scene contract");
}
const outputRoot = process.env.FIELDCRAFT_EVIDENCE_DIR ?? "artifacts/fieldcraft-scene-evaluation";
const referenceRoot = process.env.FIELDCRAFT_REFERENCE_SCREENSHOTS
  ? path.resolve(process.env.FIELDCRAFT_REFERENCE_SCREENSHOTS)
  : path.join(referenceBundleRoot, "screenshots/1280x720");
const mismatchLimit = policy.pixelMismatchLimit;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: contract.viewport, reducedMotion: "no-preference" });
const consoleFindings = [];
const requestFailures = [];

page.on("console", (message) => {
  if (["warning", "error"].includes(message.type())) {
    consoleFindings.push({ type: message.type(), text: message.text() });
  }
});
page.on("requestfailed", (request) => {
  requestFailures.push({ url: request.url(), error: request.failure()?.errorText ?? "unknown" });
});
page.on("response", (response) => {
  if (response.status() >= 400) {
    requestFailures.push({
      url: response.url(),
      status: response.status(),
      error: `HTTP ${response.status()}`,
    });
  }
});

await page.goto(candidateUrl, { waitUntil: "networkidle" });
await page.evaluate(async () => document.fonts.ready);
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.evaluate(async () => {
  await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
});
await mkdir(outputRoot, { recursive: true });

const measurements = await page.evaluate((sceneContract) => {
  const sections = [...document.querySelectorAll("main section")];
  const rect = (element) => {
    const box = element.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  };
  const renderedLines = (element) => {
    const range = document.createRange();
    const lines = [];
    for (const node of element.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE) continue;
      range.selectNodeContents(node);
      for (const box of range.getClientRects()) {
        if (box.width > 0 && box.height > 0) lines.push({ x: box.x, y: box.y, width: box.width, height: box.height });
      }
    }
    const distinct = [];
    for (const line of lines.sort((a, b) => a.y - b.y || a.x - b.x)) {
      if (!distinct.some((existing) => Math.abs(existing.y - line.y) < 2)) distinct.push(line);
    }
    return distinct;
  };
  const intersectionArea = (a, b) => {
    const width = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
    const height = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
    return width * height;
  };
  const visible = (element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && box.width > 0 && box.height > 0;
  };
  const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';
  const keyboardReachable = (element) =>
    !element.closest("[inert]") &&
    !element.hidden &&
    (element.matches(focusableSelector) || [...element.querySelectorAll(focusableSelector)].some((candidate) => !candidate.closest("[inert]") && !candidate.hidden));
  const documentOverflow = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth ?? 0) > window.innerWidth;

  if (sections.length !== sceneContract.scenes.length) {
    return { sectionCount: sections.length, scenes: [] };
  }
  return { sectionCount: sections.length, scenes: sceneContract.scenes.map((expected, index) => {
    const section = sections[index];
    const heading = section?.querySelector(index === 0 ? "h1" : "h2");
    if (!section || !heading) return { index, missing: true };
    const sectionBox = rect(section);
    const headingBox = rect(heading);
    const style = getComputedStyle(heading);
    const regions = [...section.querySelectorAll("[data-scene-region]")]
      .filter(visible)
      .map((element) => {
        const box = rect(element);
        return {
          key: element.dataset.sceneRegion,
          box,
          localBox: { x: box.x - sectionBox.x, y: box.y - sectionBox.y, width: box.width, height: box.height },
        };
      });
    const allowed = new Set(
      [...section.querySelectorAll("[data-contains-region]")].flatMap((element) =>
        (element.dataset.containsRegion ?? "")
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((containedRegion) => `${element.dataset.sceneRegion}>${containedRegion}`),
      ),
    );
    const collisions = [];
    for (let left = 0; left < regions.length; left += 1) {
      for (let right = left + 1; right < regions.length; right += 1) {
        const a = regions[left];
        const b = regions[right];
        if (allowed.has(`${a.key}>${b.key}`) || allowed.has(`${b.key}>${a.key}`)) continue;
        const area = intersectionArea(a.box, b.box);
        if (area > 0) collisions.push({ a: a.key, b: b.key, area });
      }
    }
    const hiddenStateViolations = [...section.querySelectorAll("[data-state-hidden='true']")]
      .filter((element) => visible(element) || getComputedStyle(element).pointerEvents !== "none" || keyboardReachable(element))
      .map((element) => element.id || element.dataset.sceneRegion || element.tagName);
    return {
      index,
      name: expected.name,
      sectionBox,
      heading: {
        box: headingBox,
        localY: headingBox.y - sectionBox.y,
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        align: style.textAlign,
        color: style.color,
        lines: renderedLines(heading),
        clipped: heading.scrollWidth > heading.clientWidth || heading.scrollHeight > heading.clientHeight,
      },
      sceneOverflow: section.scrollWidth > section.clientWidth,
      documentOverflow,
      regions,
      collisions,
      hiddenStateViolations,
    };
  }) };
}, contract);

if (measurements.sectionCount !== contract.scenes.length) {
  throw new Error(`Fieldcraft scene count mismatch: expected ${contract.scenes.length}, observed ${measurements.sectionCount}`);
}
const measuredScenes = measurements.scenes;

const activeSceneFixedShellOverlaps = [];
for (const scene of contract.scenes) {
  await page.evaluate((index) => {
    const section = document.querySelectorAll("main section")[index];
    section.scrollIntoView({ behavior: "instant", block: "start" });
  }, scene.index);
  await page.waitForTimeout(50);
  activeSceneFixedShellOverlaps[scene.index] = await page.evaluate((index) => {
    const section = document.querySelectorAll("main section")[index];
    const heading = section?.querySelector(index === 0 ? "h1" : "h2");
    if (!section || !heading) return [];
    const rect = (element) => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    const visible = (element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && box.width > 0 && box.height > 0;
    };
    const intersectionArea = (a, b) => {
      const width = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
      const height = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
      return width * height;
    };
    const targets = [
      { key: "heading", box: rect(heading) },
      ...[...section.querySelectorAll("[data-scene-region]")]
        .filter(visible)
        .map((element) => ({ key: element.dataset.sceneRegion, box: rect(element) })),
    ];
    return [...document.querySelectorAll("[data-fixed-shell], .site-header, .shell-header, .hud, .pager, .rail")]
      .filter(visible)
      .flatMap((element) => {
        const shell = { key: element.id || element.className || element.tagName, box: rect(element) };
        return targets
          .filter((target) => intersectionArea(shell.box, target.box) > 0)
          .map((target) => ({ shell: String(shell.key), target: target.key }));
      });
  }, scene.index);
}

const near = (actual, expected, tolerance) => Math.abs(actual - expected) <= tolerance;
const normalizeAlign = (value) => ({ left: "start", right: "end" })[value] ?? value;
const results = measuredScenes.map((actual) => {
  const expected = contract.scenes[actual.index];
  if (actual.missing) return { index: actual.index, name: expected.name, pass: false, failures: ["missing scene or heading"] };
  const failures = [];
  const expectedHeading = expected.heading;
  const checks = [
    ["x", actual.heading.box.x, expectedHeading.x, contract.tolerances.anchorPx],
    ["localY", actual.heading.localY, expectedHeading.localY, contract.tolerances.anchorPx],
    ["width", actual.heading.box.width, expectedHeading.width, contract.tolerances.boxPx],
    ["height", actual.heading.box.height, expectedHeading.height, contract.tolerances.boxPx],
    ["sectionHeight", actual.sectionBox.height, contract.sectionHeight, contract.tolerances.boxPx],
    ["fontSize", actual.heading.fontSize, expectedHeading.fontSize, 0.1],
    ["lineHeight", actual.heading.lineHeight, expectedHeading.lineHeight, 0.1],
  ];
  for (const [key, observed, wanted, tolerance] of checks) {
    if (!near(observed, wanted, tolerance)) failures.push(`${key}: expected ${wanted}±${tolerance}, observed ${observed}`);
  }
  if (normalizeAlign(actual.heading.align) !== expectedHeading.align) {
    failures.push(`align: expected ${expectedHeading.align}, observed ${actual.heading.align}`);
  }
  if (actual.heading.color !== contract.colors[expectedHeading.color]) {
    failures.push(`color: expected ${contract.colors[expectedHeading.color]}, observed ${actual.heading.color}`);
  }
  if (expectedHeading.lines && actual.heading.lines.length !== expectedHeading.lines) {
    failures.push(`lines: expected ${expectedHeading.lines}, observed ${actual.heading.lines.length}`);
  }
  if (actual.heading.clipped) failures.push("heading is internally clipped");
  if (actual.sceneOverflow) failures.push("scene has horizontal overflow");
  if (actual.documentOverflow) failures.push("document has horizontal overflow");
  if (actual.collisions.length) failures.push(`undeclared collisions: ${JSON.stringify(actual.collisions)}`);
  if (actual.hiddenStateViolations.length) failures.push(`hidden state violations: ${actual.hiddenStateViolations.join(", ")}`);
  const fixedShellOverlaps = activeSceneFixedShellOverlaps[actual.index] ?? [];
  if (fixedShellOverlaps.length) failures.push(`fixed-shell clearance violations: ${JSON.stringify(fixedShellOverlaps)}`);
  const internalScene = internalContract.scenes.find((scene) => scene.index === actual.index);
  if (internalScene) {
    const observed = new Map(actual.regions.map((region) => [region.key, region.localBox]));
    for (const [key, bounds] of Object.entries(internalScene.regions)) {
      const box = observed.get(key);
      if (!box) {
        failures.push(`missing internal region: ${key}`);
        continue;
      }
      for (const [dimension, value, wanted] of [["x", box.x, bounds[0]], ["y", box.y, bounds[1]], ["width", box.width, bounds[2]], ["height", box.height, bounds[3]]]) {
        if (!near(value, wanted, internalContract.tolerancePx)) {
          failures.push(`region ${key}.${dimension}: expected ${wanted}±${internalContract.tolerancePx}, observed ${value}`);
        }
      }
    }
    const intersect = (a, b) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
    for (const [left, right] of internalScene.collisionPairs) {
      const a = observed.get(left);
      const b = observed.get(right);
      if (a && b && intersect(a, b) > 0) failures.push(`contract collision: ${left}/${right}`);
    }
  }
  return { index: actual.index, name: expected.name, pass: failures.length === 0, failures };
});

const visualResults = [];
for (const scene of contract.scenes) {
  await page.evaluate((index) => {
    const section = document.querySelectorAll("main section")[index];
    section.scrollIntoView({ behavior: "instant", block: "start" });
  }, scene.index);
  await page.waitForTimeout(50);
  const candidatePath = path.join(outputRoot, `scene-${String(scene.index).padStart(2, "0")}-candidate.png`);
  await page.screenshot({ path: candidatePath, animations: "disabled" });
  const referenceName = `scene-${String(scene.index).padStart(2, "0")}.png`;
  const manifestPathForScene = `screenshots/1280x720/${referenceName}`;
  const sealedCapture = manifest.captures.find((capture) => capture.path === manifestPathForScene);
  if (!sealedCapture) {
    visualResults.push({ index: scene.index, status: "blocked", reason: `manifest omits ${manifestPathForScene}` });
    continue;
  }
  const referencePath = path.join(referenceRoot, referenceName);
  let reference;
  try {
    const referenceBytes = await readFile(referencePath);
    const digest = createHash("sha256").update(referenceBytes).digest("hex");
    if (digest !== sealedCapture.sha256 || referenceBytes.byteLength !== sealedCapture.bytes) {
      throw new Error("digest or byte length differs from sealed manifest");
    }
    reference = PNG.sync.read(referenceBytes);
  } catch (error) {
    visualResults.push({ index: scene.index, status: "blocked", reason: `${referenceName}: ${error.message}` });
    continue;
  }
  const candidate = PNG.sync.read(await readFile(candidatePath));
  if (reference.width !== candidate.width || reference.height !== candidate.height) {
    visualResults.push({ index: scene.index, status: "fail", reason: "image dimensions differ" });
    continue;
  }
  const diff = new PNG({ width: reference.width, height: reference.height });
  const mismatched = pixelmatch(reference.data, candidate.data, diff.data, reference.width, reference.height, { threshold: policy.pixelmatchThreshold });
  const ratio = mismatched / (reference.width * reference.height);
  await writeFile(path.join(outputRoot, `scene-${String(scene.index).padStart(2, "0")}-diff.png`), PNG.sync.write(diff));
  visualResults.push({ index: scene.index, status: ratio <= mismatchLimit ? "pass" : "fail", ratio, limit: mismatchLimit });
}

const laneEvidence = {
  geometry: results.every((result) => result.pass) ? "pass" : "fail",
  typography: results.every((result) => result.pass) ? "pass" : "fail",
  "rendered-line-boxes": results.every((result) => result.pass) ? "pass" : "fail",
  collision: results.every((result) => result.pass) ? "pass" : "fail",
  "visibility-state": results.every((result) => result.pass) ? "pass" : "fail",
  interaction: "blocked",
  "runtime-cleanliness": consoleFindings.length === 0 && requestFailures.length === 0 ? "pass" : "fail",
  "visual-difference": visualResults.every((result) => result.status === "pass") ? "pass" : "fail",
};
const stateCoverage = {
  initialScenes: { expected: contract.requiredVisualMatrix.initialScenes, observed: results.length, status: results.length === contract.requiredVisualMatrix.initialScenes ? "pass" : "blocked" },
  workflowModals: { expected: contract.requiredVisualMatrix.workflowModals, observed: 0, status: "blocked" },
  deploymentCheckpoints: { expected: contract.requiredVisualMatrix.deploymentCheckpoints, observed: policy.capturedStates.deploymentCheckpoints, status: "blocked" },
  roadmapStates: { expected: contract.requiredVisualMatrix.roadmapStates, observed: policy.capturedStates.advancedRoadmapStates, status: "blocked" },
};
const report = {
  schemaVersion: 1,
  candidateUrl,
  viewport: contract.viewport,
  geometry: results,
  visual: visualResults,
  consoleFindings,
  requestFailures,
  policy: { authority: policy.authority, sha256: policyDigest, mismatchLimit, pixelmatchThreshold: policy.pixelmatchThreshold },
  laneEvidence,
  stateCoverage,
  pass: requiredEvidencePasses(policy.requiredLanes, laneEvidence, stateCoverage),
};
await writeFile(path.join(outputRoot, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
await browser.close();

if (!report.pass) {
  console.error(`FAIL Fieldcraft rendered scene evaluation; see ${outputRoot}/report.json`);
  process.exitCode = 1;
} else {
  console.log(`PASS Fieldcraft rendered scene evaluation; see ${outputRoot}/report.json`);
}
