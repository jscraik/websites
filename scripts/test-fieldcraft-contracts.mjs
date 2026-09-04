import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import jpeg from "jpeg-js";
import {
  assertReferenceBinding,
  parseEvaluationPolicy,
  parseFieldcraftJson,
  parseInternalRegionContract,
  parseReferenceManifest,
  parseSceneContract,
  requiredEvidencePasses,
} from "./lib/fieldcraft-contracts.mjs";

test("rejects non-object Fieldcraft roots", () => {
  assert.throws(() => parseSceneContract([]), /scene contract must be an object/);
  assert.throws(() => parseInternalRegionContract(null), /internal-region contract must be an object/);
  assert.throws(() => parseEvaluationPolicy("policy"), /evaluation policy must be an object/);
  assert.throws(() => parseReferenceManifest([]), /reference manifest must be an object/);
});

test("rejects invalid JSON at the domain boundary", () => {
  assert.throws(() => parseFieldcraftJson("{", "fixture"), /fixture is invalid JSON/);
});

test("rejects unknown policy and scene-contract keys", () => {
  assert.throws(() => parseSceneContract({ extra: true }), /unknown keys/);
  assert.throws(() => parseEvaluationPolicy({ extra: true }), /unknown keys/);
});

test("rejects a manifest that is not bound to the sealed policy", () => {
  assert.throws(
    () => assertReferenceBinding("sealed", { authority: "evaluator" }, { policySha256: "changed", authority: "evaluator" }),
    /not bound to the sealed evaluation policy/,
  );
});

test("the evaluator binds sealed thresholds, exact sections, and required state coverage", async () => {
  const source = await readFile("scripts/evaluate-fieldcraft-scenes.mjs", "utf8");
  assert.equal(source.includes("FIELDCRAFT_PIXEL_MISMATCH_LIMIT"), false);
  assert.match(source, /threshold: policy\.pixelmatchThreshold/);
  assert.match(source, /policy\.geometryTolerances/);
  assert.match(source, /scene tolerances do not match the sealed evaluation policy/);
  assert.doesNotMatch(source, /contract\.tolerances\.(?:anchorPx|boxPx)/);
  assert.match(source, /sections\.length !== sceneContract\.scenes\.length/);
  assert.match(source, /fixed-shell clearance violations/);
  assert.match(source, /\[data-fixed-shell\], \.site-header, \.shell-header, \.hud, \.pager, \.rail/);
  assert.match(source, /activeSceneFixedShellOverlaps\[scene\.index\] = await page\.evaluate/);
  assert.match(source, /section\.scrollIntoView\(\{ behavior: "instant", block: "start" \}\)/);
  assert.match(source, /page\.on\("response"/);
  assert.match(source, /response\.status\(\) >= 400/);
  assert.match(source, /rendered\(element\) &&/);
  assert.match(source, /referenceBytes\[0\] === 0xff/);
  assert.match(source, /jpeg\.decode\(referenceBytes/);
  assert.match(source, /\[tabindex\]:not\(\[tabindex="-1"\]\)/);
  assert.match(source, /Math\.max\(document\.documentElement\.scrollWidth, document\.body\?\.scrollWidth \?\? 0\) > window\.innerWidth/);
  assert.match(source, /document has horizontal overflow/);
  assert.match(source, /\.split\(\/\\s\+\/\)/);
  assert.match(source, /`\$\{element\.dataset\.sceneRegion\}>\$\{containedRegion\}`/);
  assert.match(source, /contract\.sectionHeight/);
  for (const state of ["workflowModals", "deploymentCheckpoints", "roadmapStates"]) {
    assert.match(source, new RegExp(`${state}: \\{`));
  }
});

test("decodes the sealed JPEG captures before pixel comparison", async () => {
  const bytes = await readFile("docs/reference/fieldcraft-fde/v3/screenshots/1280x720/scene-00.png");
  assert.deepEqual([...bytes.subarray(0, 2)], [0xff, 0xd8]);
  const decoded = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
  assert.equal(decoded.width, 1280);
  assert.equal(decoded.height, 720);
  assert.equal(decoded.data.length, 1280 * 720 * 4);
});

test("blocks admission when any required lane or state lacks passing evidence", () => {
  assert.equal(requiredEvidencePasses(["geometry", "interaction"], { geometry: "pass", interaction: "blocked" }, { initial: { status: "pass" } }), false);
  assert.equal(requiredEvidencePasses(["geometry"], { geometry: "pass" }, { modal: { status: "blocked" } }), false);
  assert.equal(requiredEvidencePasses(["geometry"], { geometry: "pass" }, { initial: { status: "pass" } }), true);
});

test("writes a blocked report when the browser runtime cannot launch", async () => {
  const source = await readFile("scripts/evaluate-fieldcraft-scenes.mjs", "utf8");
  assert.match(source, /await mkdir\(outputRoot, \{ recursive: true \}\)/);
  assert.match(source, /await import\("playwright"\)/);
  assert.match(source, /catch \{/);
  assert.match(source, /writeBrowserBlockedReport/);
  assert.match(source, /failure: \{ stage: "browser-launch", code: "browser_unavailable", retryable: true \}/);
  assert.match(source, /writeFile\(path\.join\(outputRoot, "report\.json"\)/);
  for (const field of ["reference", "candidate", "environment", "states", "commands", "outcomes", "artifacts", "claims_boundary"]) {
    assert.match(source, new RegExp(`\\b${field}:`));
  }
});
