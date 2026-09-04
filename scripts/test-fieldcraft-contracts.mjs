import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import jpeg from "jpeg-js";
import {
  assertCandidateResourceIdentity,
  candidateResourceIdentity,
  assertReferenceBinding,
  parseEvaluationPolicy,
  parseFieldcraftJson,
  parseInternalRegionContract,
  parseReferenceManifest,
  parseSceneContract,
  requiredEvidencePasses,
  withControllerDeadline,
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
  assert.match(source, /writeBlockedReport/);
  assert.match(source, /writeBlockedReport\(\{ stage: "browser-launch", code: "browser_unavailable", browserStatus: "unavailable" \}\)/);
  assert.match(source, /writeFile\(path\.join\(outputRoot, "report\.json"\)/);
  assert.ok(source.indexOf("let observedCandidateId = null") < source.indexOf("const writeBlockedReport"));
  assert.ok(source.indexOf("let candidateResourceManifest = []") < source.indexOf("const writeBlockedReport"));
  for (const field of ["reference", "candidate", "environment", "states", "commands", "outcomes", "artifacts", "claims_boundary"]) {
    assert.match(source, new RegExp(`\\b${field}:`));
  }
});


test("controller deadline rejects an operation that never settles", async () => {
  await assert.rejects(
    withControllerDeadline(new Promise(() => {}), 5, "animation_deadline_expired"),
    /animation_deadline_expired/,
  );
});

test("controller deadline returns an operation that settles in time", async () => {
  assert.equal(await withControllerDeadline(Promise.resolve("settled"), 50, "deadline_expired"), "settled");
});
test("writes a blocked report and closes the browser when candidate navigation fails", async () => {
  const source = await readFile("scripts/evaluate-fieldcraft-scenes.mjs", "utf8");
  assert.match(source, /const code = error\.code \?\? "candidate_unreachable"/);
  assert.match(source, /writeBlockedReport\(\{ stage: "candidate-navigation", code, browserStatus: "available" \}\)/);
  assert.match(source, /await writeBlockedReport\(\{ stage: "candidate-navigation"/);
  assert.match(source, /await browser\.close\(\)/);
  assert.match(source, /BLOCKED Fieldcraft candidate navigation/);
});

test("records rendering inputs, page errors, blocked visuals, and post-navigation failures", async () => {
  const source = await readFile("scripts/evaluate-fieldcraft-scenes.mjs", "utf8");
  for (const field of [
    "browserVersion",
    "operatingSystem",
    "devicePixelRatio",
    "colorScheme",
    "resolvedFonts",
  ]) {
    assert.match(source, new RegExp("\\b" + field + ":"));
  }
  assert.match(source, /page\.on\("pageerror"/);
  assert.match(source, /withControllerDeadline\([\s\S]*?page\.evaluate\([\s\S]*?10_000,[\s\S]*?"animation_deadline_expired"/);
  assert.match(source, /stage: "candidate-stabilization", code/);
  assert.match(source, /BLOCKED Fieldcraft candidate stabilization/);
  assert.match(source, /FIELDCRAFT_CANDIDATE_ID/);
  assert.match(source, /candidate: \{ id: candidateId, url: candidateUrl \}/);
  assert.match(source, /digests: artifactDigests/);
  assert.match(source, /visualResults\.some\(\(result\) => result\.status === "blocked"\)/);
  assert.match(source, /stage: "candidate-evaluation", code: "evaluation_failed"/);
  assert.match(source, /await browser\.close\(\)\.catch/);
});

test("binds evaluator artifacts to deployment identity and candidate paths", async () => {
  const resources = [
    { url: "/", status: 200, bytes: Buffer.from("immutable candidate document") },
    { url: "/brand/font.woff2", status: 200, bytes: Buffer.from("immutable font") },
  ];
  const candidateId = candidateResourceIdentity(resources).id;
  assert.equal(assertCandidateResourceIdentity(candidateId, [...resources].reverse()).id, candidateId);
  assert.throws(
    () => assertCandidateResourceIdentity(candidateId, [{ ...resources[0], bytes: Buffer.from("changed") }, resources[1]]),
    (error) => error.code === "candidate_identity_mismatch",
  );

  const source = await readFile("scripts/evaluate-fieldcraft-scenes.mjs", "utf8");
  assert.match(source, /candidateResponses\.map\(async \(response\)/);
  assert.match(source, /bytes: await response\.body\(\)/);
  assert.match(source, /for \(const scene of contract\.scenes\)[\s\S]*candidateResponses\.map\(async \(response\)/);
  assert.match(source, /FIELDCRAFT_DISCOVER_CANDIDATE_ID/);
  assert.match(source, /observedCandidateId = observedCandidate\.id/);
  assert.match(source, /await mkdir\(discoveredCandidateRoot, \{ recursive: true \}\)/);
  assert.match(source, /path\.join\(discoveredCandidateRoot, path\.basename\(outputRoot\)\)/);
  assert.match(source, /await rename\(outputRoot, discoveredOutputRoot\)/);
  assert.match(source, /outputRoot = discoveredOutputRoot/);
  assert.match(source, /candidateOutputRoot = path\.join\(outputRoot, "candidate"\)/);
  assert.match(source, /stage: "candidate-identity", code: "candidate_identity_mismatch"/);
  assert.match(source, /candidateId,\n  observedCandidateId,\n  candidateResourceManifest,/);
  assert.match(source, /path\.join\(candidateOutputRoot, candidateName\)/);
  assert.match(source, /digestArtifact\(path\.relative\(outputRoot, candidatePath\), candidateBytes\)/);
});
