import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
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
  assert.match(source, /sections\.length !== sceneContract\.scenes\.length/);
  assert.match(source, /fixed-shell clearance violations/);
  assert.match(source, /activeSceneFixedShellOverlaps\[scene\.index\] = await page\.evaluate/);
  assert.match(source, /section\.scrollIntoView\(\{ behavior: "instant", block: "start" \}\)/);
  assert.match(source, /contract\.sectionHeight/);
  for (const state of ["workflowModals", "deploymentCheckpoints", "roadmapStates"]) {
    assert.match(source, new RegExp(`${state}: \\{`));
  }
});

test("blocks admission when any required lane or state lacks passing evidence", () => {
  assert.equal(requiredEvidencePasses(["geometry", "interaction"], { geometry: "pass", interaction: "blocked" }, { initial: { status: "pass" } }), false);
  assert.equal(requiredEvidencePasses(["geometry"], { geometry: "pass" }, { modal: { status: "blocked" } }), false);
  assert.equal(requiredEvidencePasses(["geometry"], { geometry: "pass" }, { initial: { status: "pass" } }), true);
});
