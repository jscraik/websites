import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import {
  candidateResourceIdentity,
  assertReferenceBinding,
  parseEvaluationPolicy,
  parseFieldcraftJson,
  parseInternalRegionContract,
  parseReferenceManifest,
  parseSceneContract,
  requiredEvidencePasses,
  readBoundedBody,
  withControllerDeadline,
} from "./lib/fieldcraft-contracts.mjs";
import path from "node:path";
import os from "node:os";
import process from "node:process";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";

const candidateUrl = process.env.CANDIDATE_BASE_URL;
if (!candidateUrl) {
  throw new Error("CANDIDATE_BASE_URL is required");
}

const discoverCandidateId = process.env.FIELDCRAFT_DISCOVER_CANDIDATE_ID === "1";
let candidateId = process.env.FIELDCRAFT_CANDIDATE_ID;
if (!discoverCandidateId && (!candidateId || !/^sha256:[a-f0-9]{64}$/.test(candidateId))) {
  throw new Error("FIELDCRAFT_CANDIDATE_ID must be sha256:<64-hex-digest> for the served candidate resource set");
}
if (discoverCandidateId && candidateId) {
  throw new Error("Do not set FIELDCRAFT_CANDIDATE_ID during discovery");
}
const candidateSlug = discoverCandidateId
  ? `discovery-${process.pid}-${Date.now()}`
  : candidateId.replace(":", "-");

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
if (JSON.stringify(policy.geometryTolerances) !== JSON.stringify(contract.tolerances)) {
  throw new Error("Fieldcraft scene tolerances do not match the sealed evaluation policy");
}
const geometryTolerances = policy.geometryTolerances;
const outputBase = process.env.FIELDCRAFT_EVIDENCE_DIR ?? "artifacts/fieldcraft-scene-evaluation";
let outputRoot = path.join(outputBase, candidateSlug);
const referenceRoot = process.env.FIELDCRAFT_REFERENCE_SCREENSHOTS
  ? path.resolve(process.env.FIELDCRAFT_REFERENCE_SCREENSHOTS)
  : path.join(referenceBundleRoot, "screenshots/1280x720");
const mismatchLimit = policy.pixelMismatchLimit;
await mkdir(outputRoot, { recursive: true });
let candidateOutputRoot = path.join(outputRoot, "candidate");
await mkdir(candidateOutputRoot, { recursive: true });
const artifactDigests = [];
let candidateResourceManifest = [];
let observedCandidateId = null;
const digestArtifact = (relativePath, bytes) => {
  artifactDigests.push({
    path: relativePath,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes: bytes.byteLength,
  });
};

const renderingEnvironment = {
  browserVersion: null,
  operatingSystem: { platform: process.platform, release: os.release(), architecture: process.arch },
  devicePixelRatio: null,
  colorScheme: null,
  resolvedFonts: [],
};

const buildEvidenceEnvelope = ({ laneEvidence, stateCoverage, pass, browserStatus }) => ({
  reference: {
    bundle: "fieldcraft-fde/v3",
    manifest: "docs/reference/fieldcraft-fde/v3/manifest.json",
    policySha256: policyDigest,
  },
  candidate: { id: candidateId, url: candidateUrl },
  environment: {
    browser: "playwright-chromium",
    browserStatus,
    viewport: contract.viewport,
    reducedMotion: "no-preference",
    browserVersion: renderingEnvironment.browserVersion,
    operatingSystem: renderingEnvironment.operatingSystem,
    devicePixelRatio: renderingEnvironment.devicePixelRatio,
    colorScheme: renderingEnvironment.colorScheme,
    resolvedFonts: renderingEnvironment.resolvedFonts,
  },
  states: stateCoverage,
  commands: [{
    name: "evaluate",
    command: discoverCandidateId
      ? "FIELDCRAFT_DISCOVER_CANDIDATE_ID=1 CANDIDATE_BASE_URL=<candidate-url> node scripts/evaluate-fieldcraft-scenes.mjs"
      : "FIELDCRAFT_CANDIDATE_ID=sha256:<candidate-resource-set-digest> CANDIDATE_BASE_URL=<candidate-url> node scripts/evaluate-fieldcraft-scenes.mjs",
  }],
  outcomes: { laneEvidence, pass },
  completionStatus: pass ? "pass" : Object.values(laneEvidence).includes("blocked") || Object.values(stateCoverage).some((state) => state.status === "blocked") ? "incomplete" : "fail",
  evidenceGaps: Object.entries(stateCoverage).filter(([, state]) => state.status === "blocked").map(([state]) => state),
  artifacts: {
    report: "report.json",
    digests: artifactDigests,
    candidateScreenshots: "candidate/scene-*.png",
    visualDiffs: "scene-*-diff.png",
  },
  claims_boundary: "This report covers only the recorded candidate, viewport, states, and required lanes; blocked lanes cannot support a parity claim.",
});

const writeBlockedReport = async ({ stage, code, browserStatus }) => {
  const laneEvidence = Object.fromEntries(
    policy.requiredLanes.map((lane) => [lane, "blocked"]),
  );
  const stateCoverage = {
    initialScenes: { expected: contract.requiredVisualMatrix.initialScenes, observed: 0, status: "blocked" },
    workflowModals: { expected: contract.requiredVisualMatrix.workflowModals, observed: 0, status: "blocked" },
    deploymentCheckpoints: { expected: contract.requiredVisualMatrix.deploymentCheckpoints, observed: 0, status: "blocked" },
    roadmapStates: { expected: contract.requiredVisualMatrix.roadmapStates, observed: 0, status: "blocked" },
  };
  const report = {
    schemaVersion: 1,
    candidateId,
    observedCandidateId,
    candidateResourceManifest,
    ...buildEvidenceEnvelope({ laneEvidence, stateCoverage, pass: false, browserStatus }),
    viewport: contract.viewport,
    geometry: [],
    completionStatus: "incomplete",
    visual: [],
    consoleFindings: [],
    requestFailures: [],
    policy: { authority: policy.authority, sha256: policyDigest, mismatchLimit, pixelmatchThreshold: policy.pixelmatchThreshold },
    laneEvidence,
    stateCoverage,
    failure: { stage, code, retryable: true },
    pass: false,
  };
  await writeFile(path.join(outputRoot, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
};

let browser;
try {
  const { chromium } = await import("playwright");
  browser = await chromium.launch({ headless: true });
  renderingEnvironment.browserVersion = browser.version();
} catch {
  await writeBlockedReport({ stage: "browser-launch", code: "browser_unavailable", browserStatus: "unavailable" });
  console.error(`BLOCKED Fieldcraft rendered scene evaluation; see ${outputRoot}/report.json`);
  process.exit(1);
}
let page;
try {
  page = await browser.newPage({ viewport: contract.viewport, reducedMotion: "no-preference" });
} catch {
  await writeBlockedReport({ stage: "page-creation", code: "page_creation_failed", browserStatus: "available" });
  await browser.close().catch(() => undefined);
  console.error(`BLOCKED Fieldcraft browser page creation; see ${outputRoot}/report.json`);
  process.exit(1);
}
const consoleFindings = [];
const requestFailures = [];
const candidateResponses = [];
const maxCandidateResponses = 256;
const maxCandidateResourceBytes = 64 * 1024 * 1024;
let candidateResourceBudgetFailure = null;

page.on("console", (message) => {
  if (["warning", "error"].includes(message.type())) {
    consoleFindings.push({ type: message.type(), text: message.text() });
  }
});
page.on("pageerror", (error) => {
  consoleFindings.push({ type: "pageerror", text: error.message });
});
page.on("requestfailed", (request) => {
  requestFailures.push({ url: request.url(), error: request.failure()?.errorText ?? "unknown" });
});
page.on("response", (response) => {
  if (response.status() >= 200 && response.status() < 300) {
    if (candidateResponses.length >= maxCandidateResponses) {
      candidateResourceBudgetFailure = "candidate_response_count_exceeded";
    } else if (!candidateResourceBudgetFailure) {
      candidateResponses.push(response);
    }
  }
  if (response.status() >= 400) {
    requestFailures.push({
      url: response.url(),
      status: response.status(),
      error: `HTTP ${response.status()}`,
    });
  }
});

try {
  await page.goto(candidateUrl, { waitUntil: "networkidle" });
  await page.evaluate(async () => document.fonts.ready);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  Object.assign(renderingEnvironment, await page.evaluate(() => ({
    devicePixelRatio: window.devicePixelRatio,
    colorScheme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    resolvedFonts: [...new Set(
      [...document.querySelectorAll("body, h1, h2, h3, p, button, a")]
        .map((element) => getComputedStyle(element).fontFamily)
        .filter(Boolean),
    )].sort(),
  })));
} catch (error) {
  const code = error.code ?? "candidate_unreachable";
  await writeBlockedReport({ stage: "candidate-navigation", code, browserStatus: "available" });
  await browser.close();
  console.error(`BLOCKED Fieldcraft candidate navigation; see ${outputRoot}/report.json`);
  process.exit(1);
}

try {
  await withControllerDeadline(
    page.evaluate(async () => {
      await Promise.all(
        document.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
      );
    }),
    10_000,
    "animation_deadline_expired",
  );
} catch (error) {
  const code = error.message === "animation_deadline_expired" ? error.message : "animation_stabilization_failed";
  await writeBlockedReport({ stage: "candidate-stabilization", code, browserStatus: "available" });
  await browser.close().catch(() => undefined);
  console.error("BLOCKED Fieldcraft candidate stabilization; see " + outputRoot + "/report.json");
  process.exit(1);
}

try {
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
  const rendered = (element) => {
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
  };
  const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';
  const keyboardReachable = (element) =>
    rendered(element) &&
    !element.closest("[inert]") &&
    !element.hidden &&
    (element.matches(focusableSelector) ||
      [...element.querySelectorAll(focusableSelector)].some(
        (candidate) => rendered(candidate) && !candidate.closest("[inert]") && !candidate.hidden,
      ));
  const documentOverflow = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth ?? 0) > window.innerWidth;
  const dialog = document.querySelector("[role=dialog]");
  const buttons = [...document.querySelectorAll("button")];
  const modalTitle = dialog?.querySelector("h3");
  const closeButton = dialog?.querySelector("button[aria-label=Close]") ?? null;
  const approveButton = buttons.find((button) => /^approve$/i.test(button.textContent?.trim() ?? ""));
  const initiallyHidden = (element) => Boolean(
    element && !visible(element) && !keyboardReachable(element) &&
    (!rendered(element) || getComputedStyle(element).pointerEvents === "none"),
  );
  const hiddenControlInventory = {
    buttonCount: buttons.length === 15,
    svgCount: document.querySelectorAll("svg").length === 10,
    roleImageCount: document.querySelectorAll("[role=img]").length === 4,
    headingInventory: document.querySelectorAll("h1").length === 1 && document.querySelectorAll("main section h2").length === 20 && document.querySelectorAll("[role=dialog] h3").length === 1,
    noLinksOrForms: document.querySelectorAll("a, form, input, select, textarea").length === 0,
    dialogSemantics: Boolean(dialog && dialog.getAttribute("aria-modal") === "true" && modalTitle?.id && dialog.getAttribute("aria-labelledby") === modalTitle.id),
    dialogInitiallyHidden: initiallyHidden(dialog),
    modalTitleInitiallyHidden: initiallyHidden(modalTitle),
    closeInitiallyHidden: initiallyHidden(closeButton),
    approveInitiallyHidden: initiallyHidden(approveButton),
  };

  if (sections.length !== sceneContract.scenes.length) {
    return { sectionCount: sections.length, hiddenControlInventory, scenes: [] };
  }
  return { sectionCount: sections.length, hiddenControlInventory, scenes: sceneContract.scenes.map((expected, index) => {
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
      .filter(
        (element) =>
          visible(element) ||
          (rendered(element) && getComputedStyle(element).pointerEvents !== "none") ||
          keyboardReachable(element),
      )
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
const missingHiddenControls = Object.entries(measurements.hiddenControlInventory)
  .filter(([, present]) => !present)
  .map(([control]) => control);

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
  const laneFailures = Object.fromEntries(
    ["geometry", "typography", "rendered-line-boxes", "collision", "visibility-state"]
      .map((lane) => [lane, []]),
  );
  const fail = (lane, message) => laneFailures[lane].push(message);
  if (actual.missing) {
    for (const lane of Object.keys(laneFailures)) fail(lane, "missing scene or heading");
    return { index: actual.index, name: expected.name, pass: false, failures: ["missing scene or heading"], laneFailures, lanePass: Object.fromEntries(Object.keys(laneFailures).map((lane) => [lane, false])) };
  }
  const expectedHeading = expected.heading;
  const checks = [
    ["geometry", "x", actual.heading.box.x, expectedHeading.x, geometryTolerances.anchorPx],
    ["geometry", "localY", actual.heading.localY, expectedHeading.localY, geometryTolerances.anchorPx],
    ["geometry", "width", actual.heading.box.width, expectedHeading.width, geometryTolerances.boxPx],
    ["geometry", "height", actual.heading.box.height, expectedHeading.height, geometryTolerances.boxPx],
    ["geometry", "sectionHeight", actual.sectionBox.height, contract.sectionHeight, geometryTolerances.boxPx],
    ["typography", "fontSize", actual.heading.fontSize, expectedHeading.fontSize, 0.1],
    ["typography", "lineHeight", actual.heading.lineHeight, expectedHeading.lineHeight, 0.1],
  ];
  for (const [lane, key, observed, wanted, tolerance] of checks) {
    if (!near(observed, wanted, tolerance)) fail(lane, `${key}: expected ${wanted}±${tolerance}, observed ${observed}`);
  }
  if (normalizeAlign(actual.heading.align) !== expectedHeading.align) {
    fail("typography", `align: expected ${expectedHeading.align}, observed ${actual.heading.align}`);
  }
  if (actual.heading.color !== contract.colors[expectedHeading.color]) {
    fail("typography", `color: expected ${contract.colors[expectedHeading.color]}, observed ${actual.heading.color}`);
  }
  if (expectedHeading.lines && actual.heading.lines.length !== expectedHeading.lines) {
    fail("rendered-line-boxes", `lines: expected ${expectedHeading.lines}, observed ${actual.heading.lines.length}`);
  }
  if (actual.heading.clipped) fail("rendered-line-boxes", "heading is internally clipped");
  if (actual.sceneOverflow) fail("visibility-state", "scene has horizontal overflow");
  if (actual.documentOverflow) fail("visibility-state", "document has horizontal overflow");
  if (actual.collisions.length) fail("collision", `undeclared collisions: ${JSON.stringify(actual.collisions)}`);
  if (actual.hiddenStateViolations.length) fail("visibility-state", `hidden state violations: ${actual.hiddenStateViolations.join(", ")}`);
  if (actual.index === 0 && missingHiddenControls.length) fail("visibility-state", `missing initial hidden controls: ${missingHiddenControls.join(", ")}`);
  const fixedShellOverlaps = activeSceneFixedShellOverlaps[actual.index] ?? [];
  if (fixedShellOverlaps.length) fail("collision", `fixed-shell clearance violations: ${JSON.stringify(fixedShellOverlaps)}`);
  const internalScene = internalContract.scenes.find((scene) => scene.index === actual.index);
  if (internalScene) {
    const observed = new Map(actual.regions.map((region) => [region.key, region.localBox]));
    for (const [key, bounds] of Object.entries(internalScene.regions)) {
      const box = observed.get(key);
      if (!box) {
        fail("geometry", `missing internal region: ${key}`);
        continue;
      }
      for (const [dimension, value, wanted] of [["x", box.x, bounds[0]], ["y", box.y, bounds[1]], ["width", box.width, bounds[2]], ["height", box.height, bounds[3]]]) {
        if (!near(value, wanted, internalContract.tolerancePx)) {
          fail("geometry", `region ${key}.${dimension}: expected ${wanted}±${internalContract.tolerancePx}, observed ${value}`);
        }
      }
    }
    const intersect = (a, b) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
    for (const [left, right] of internalScene.collisionPairs) {
      const a = observed.get(left);
      const b = observed.get(right);
      if (a && b && intersect(a, b) > 0) fail("collision", `contract collision: ${left}/${right}`);
    }
  }
  const lanePass = Object.fromEntries(Object.entries(laneFailures).map(([lane, failures]) => [lane, failures.length === 0]));
  const failures = Object.values(laneFailures).flat();
  return { index: actual.index, name: expected.name, pass: failures.length === 0, failures, laneFailures, lanePass };
});

const visualResults = [];
for (const scene of contract.scenes) {
  await page.evaluate((index) => {
    const section = document.querySelectorAll("main section")[index];
    section.scrollIntoView({ behavior: "instant", block: "start" });
  }, scene.index);
  await page.waitForTimeout(50);
  const candidateName = `scene-${String(scene.index).padStart(2, "0")}-candidate.png`;
  const candidatePath = path.join(candidateOutputRoot, candidateName);
  await page.screenshot({ path: candidatePath, animations: "disabled" });
  const referenceName = `scene-${String(scene.index).padStart(2, "0")}.png`;
  const candidateBytes = await readFile(candidatePath);
  digestArtifact(path.relative(outputRoot, candidatePath), candidateBytes);
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
    reference =
      referenceBytes[0] === 0xff && referenceBytes[1] === 0xd8
        ? jpeg.decode(referenceBytes, { useTArray: true, formatAsRGBA: true })
        : PNG.sync.read(referenceBytes);
  } catch (error) {
    visualResults.push({ index: scene.index, status: "blocked", reason: `${referenceName}: ${error.message}` });
    continue;
  }
  const candidate = PNG.sync.read(candidateBytes);
  if (reference.width !== candidate.width || reference.height !== candidate.height) {
    visualResults.push({ index: scene.index, status: "fail", reason: "image dimensions differ" });
    continue;
  }
  const diff = new PNG({ width: reference.width, height: reference.height });
  const mismatched = pixelmatch(reference.data, candidate.data, diff.data, reference.width, reference.height, { threshold: policy.pixelmatchThreshold });
  const ratio = mismatched / (reference.width * reference.height);
  const diffName = `scene-${String(scene.index).padStart(2, "0")}-diff.png`;
  const diffBytes = PNG.sync.write(diff);
  await writeFile(path.join(outputRoot, diffName), diffBytes);
  digestArtifact(diffName, diffBytes);
  visualResults.push({ index: scene.index, status: ratio <= mismatchLimit ? "pass" : "fail", ratio, limit: mismatchLimit });
}

await page.waitForLoadState("networkidle");
const candidateOrigin = new URL(candidateUrl).origin;
if (candidateResourceBudgetFailure) {
  await writeBlockedReport({ stage: "candidate-resources", code: candidateResourceBudgetFailure, browserStatus: "available" });
  await browser.close();
  console.error(`BLOCKED Fieldcraft candidate resource budget exceeded; see ${outputRoot}/report.json`);
  process.exit(1);
}
const candidateResources = [];
let candidateResourceBytes = 0;
for (const response of candidateResponses) {
  let streamedResponse;
  try {
    streamedResponse = await fetch(response.url(), { redirect: "follow" });
  } catch {
    candidateResourceBudgetFailure = "candidate_resource_stream_unavailable";
    break;
  }
  const { bytes, failure } = await readBoundedBody(streamedResponse.body, {
    perResponseLimit: maxCandidateResourceBytes,
    cumulativeRemaining: maxCandidateResourceBytes - candidateResourceBytes,
  });
  if (failure) {
    candidateResourceBudgetFailure = failure;
    break;
  }
  candidateResourceBytes += bytes.byteLength;
  const resourceUrl = new URL(response.url());
  candidateResources.push({
    url: resourceUrl.origin === candidateOrigin ? `${resourceUrl.pathname}${resourceUrl.search}` : resourceUrl.href,
    status: response.status(),
    bytes,
  });
}
if (candidateResourceBudgetFailure) {
  await writeBlockedReport({ stage: "candidate-resources", code: candidateResourceBudgetFailure, browserStatus: "available" });
  await browser.close();
  console.error(`BLOCKED Fieldcraft candidate resource budget exceeded; see ${outputRoot}/report.json`);
  process.exit(1);
}
const observedCandidate = candidateResourceIdentity(candidateResources);
observedCandidateId = observedCandidate.id;
candidateResourceManifest = observedCandidate.manifest;
if (discoverCandidateId) {
  candidateId = observedCandidateId;
  const discoveredCandidateRoot = path.join(outputBase, observedCandidateId.replace(":", "-"));
  await mkdir(discoveredCandidateRoot, { recursive: true });
  const discoveredOutputRoot = path.join(discoveredCandidateRoot, path.basename(outputRoot));
  await rename(outputRoot, discoveredOutputRoot);
  outputRoot = discoveredOutputRoot;
  candidateOutputRoot = path.join(outputRoot, "candidate");
} else if (observedCandidateId !== candidateId) {
  await writeBlockedReport({ stage: "candidate-identity", code: "candidate_identity_mismatch", browserStatus: "available" });
  await browser.close();
  console.error(`BLOCKED Fieldcraft candidate identity mismatch; observed ${observedCandidateId}; see ${outputRoot}/report.json`);
  process.exit(1);
}

const captureEnvironmentCompatible = policy.captureConditions.browserSurface === "playwright-chromium";
const laneEvidence = {
  geometry: results.every((result) => result.lanePass.geometry) ? "pass" : "fail",
  typography: results.every((result) => result.lanePass.typography) ? "pass" : "fail",
  "rendered-line-boxes": results.every((result) => result.lanePass["rendered-line-boxes"]) ? "pass" : "fail",
  collision: results.every((result) => result.lanePass.collision) ? "pass" : "fail",
  "visibility-state": results.every((result) => result.lanePass["visibility-state"]) ? "pass" : "fail",
  interaction: "blocked",
  "runtime-cleanliness": consoleFindings.length === 0 && requestFailures.length === 0 ? "pass" : "fail",
  "visual-difference": !captureEnvironmentCompatible || visualResults.some((result) => result.status === "blocked")
    ? "blocked"
    : visualResults.every((result) => result.status === "pass")
      ? "pass"
      : "fail",
};
const stateCoverage = {
  initialScenes: { expected: contract.requiredVisualMatrix.initialScenes, observed: results.length, status: results.length === contract.requiredVisualMatrix.initialScenes ? "pass" : "blocked" },
  workflowModals: { expected: contract.requiredVisualMatrix.workflowModals, observed: 0, status: "blocked" },
  deploymentCheckpoints: { expected: contract.requiredVisualMatrix.deploymentCheckpoints, observed: policy.capturedStates.deploymentCheckpoints, status: "blocked" },
  roadmapStates: { expected: contract.requiredVisualMatrix.roadmapStates, observed: policy.capturedStates.advancedRoadmapStates, status: "blocked" },
};
const reportPass = requiredEvidencePasses(policy.requiredLanes, laneEvidence, stateCoverage);
const report = {
  schemaVersion: 1,
  ...buildEvidenceEnvelope({ laneEvidence, stateCoverage, pass: reportPass, browserStatus: "available" }),
  candidateId,
  observedCandidateId,
  candidateResourceManifest,
  viewport: contract.viewport,
  geometry: results,
  visual: visualResults,
  consoleFindings,
  requestFailures,
  policy: { authority: policy.authority, sha256: policyDigest, mismatchLimit, pixelmatchThreshold: policy.pixelmatchThreshold },
  laneEvidence,
  stateCoverage,
  pass: reportPass,
  completionStatus: reportPass ? "pass" : Object.values(laneEvidence).includes("blocked") || Object.values(stateCoverage).some((state) => state.status === "blocked") ? "incomplete" : "fail",
  evidenceGaps: Object.entries(stateCoverage).filter(([, state]) => state.status === "blocked").map(([state]) => state),
};
await writeFile(path.join(outputRoot, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
await browser.close();

if (!report.pass) {
  if (report.completionStatus === "incomplete") {
    console.error(`BLOCKED Fieldcraft rendered scene evaluation has incomplete required evidence; see ${outputRoot}/report.json`);
  } else {
    console.error(`FAIL Fieldcraft rendered scene evaluation; see ${outputRoot}/report.json`);
  }
  process.exitCode = 1;
} else {
  console.log(`PASS Fieldcraft rendered scene evaluation; see ${outputRoot}/report.json`);
}
} catch {
  await writeBlockedReport({ stage: "candidate-evaluation", code: "evaluation_failed", browserStatus: "available" });
  await browser.close().catch(() => undefined);
  console.error("BLOCKED Fieldcraft candidate evaluation; see " + outputRoot + "/report.json");
  process.exitCode = 1;
}
