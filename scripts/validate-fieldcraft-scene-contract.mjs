import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const contractPath = new URL(
  "../docs/specifications/fieldcraft-fde-scene-contract.json",
  import.meta.url,
);
const contract = JSON.parse(await readFile(contractPath, "utf8"));

assert.equal(contract.schemaVersion, 1, "scene contract schema must be v1");
assert.deepEqual(contract.viewport, { width: 1280, height: 720 });
assert.equal(contract.scenes.length, 20, "exactly 20 measured scenes are required");
assert.deepEqual(
  contract.scenes.map((scene) => scene.index),
  Array.from({ length: 20 }, (_, index) => index),
  "scene indices must be complete and ordered",
);

for (const scene of contract.scenes) {
  const { heading } = scene;
  for (const key of ["x", "localY", "width", "height", "fontSize", "lineHeight"]) {
    assert.equal(
      Number.isFinite(heading[key]),
      true,
      `scene ${scene.index} heading.${key} must be a finite number`,
    );
  }
  assert.ok(["start", "center", "end"].includes(heading.align));
  assert.ok(Object.hasOwn(contract.colors, heading.color));
  assert.ok(heading.x >= 0 && heading.localY >= 0);
  assert.ok(heading.x + heading.width <= contract.viewport.width + 0.5);
  assert.ok(heading.localY + heading.height <= contract.viewport.height + 0.5);
}

const hero = contract.scenes[0].heading;
assert.equal(hero.lines, 3, "hero must declare three rendered lines");
assert.equal(hero.align, "center");
assert.equal(hero.color, "navy");
assert.ok(hero.height > 390, "hero box must preserve the three-line composition");

assert.equal(contract.requiredVisualMatrix.initialScenes, 20);
assert.equal(contract.requiredVisualMatrix.workflowModals, 5);
assert.equal(contract.requiredVisualMatrix.deploymentCheckpoints, 4);
assert.equal(contract.requiredVisualMatrix.roadmapStates, 6);
assert.ok(contract.requiredStates.includes("roadmap:complete-month"));
assert.ok(contract.requiredStates.includes("deployment:reduced-motion"));

console.log("PASS Fieldcraft measured scene contract is complete and internally valid");
