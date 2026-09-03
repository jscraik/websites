import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const contract = JSON.parse(
  await readFile("docs/specifications/fieldcraft-fde-internal-region-contract.json", "utf8"),
);

assert.equal(contract.schemaVersion, 1);
assert.deepEqual(contract.viewport, { width: 1280, height: 720 });
assert.equal(contract.scenes.length, 19, "internal contract must cover the 19 failing scenes");
assert.deepEqual(contract.scenes.map((scene) => scene.index), Array.from({ length: 19 }, (_, index) => index + 1));

for (const scene of contract.scenes) {
  const keys = Object.keys(scene.regions);
  assert.ok(keys.length >= 3, `scene ${scene.index} needs at least three internal regions`);
  for (const [key, bounds] of Object.entries(scene.regions)) {
    assert.equal(bounds.length, 4, `scene ${scene.index} ${key} must have four bounds`);
    assert.ok(bounds.every(Number.isFinite), `scene ${scene.index} ${key} bounds must be numeric`);
    assert.ok(bounds[0] >= 0 && bounds[1] >= 0 && bounds[2] > 0 && bounds[3] > 0);
    assert.ok(bounds[0] + bounds[2] <= contract.viewport.width);
    assert.ok(bounds[1] + bounds[3] <= contract.viewport.height);
  }
  assert.ok(scene.collisionPairs.length >= 2, `scene ${scene.index} needs collision coverage`);
  for (const [left, right] of scene.collisionPairs) {
    assert.ok(Object.hasOwn(scene.regions, left));
    assert.ok(Object.hasOwn(scene.regions, right));
    assert.notEqual(left, right);
  }
}

const modalKeys = ["backdrop", "panel", "tag", "title", "punch", "bullets", "closing-label", "closing", "close"];
for (const key of modalKeys) {
  const bounds = contract.modalShell[key];
  assert.equal(bounds.length, 4, `modal ${key} must have four bounds`);
  assert.ok(bounds.every(Number.isFinite));
}
assert.equal(contract.modalVariants.length, 5);
assert.deepEqual(contract.modalVariants.map((variant) => variant.modal), [1, 2, 3, 4, 5]);
console.log("PASS Fieldcraft internal-region contract is complete and internally valid");
