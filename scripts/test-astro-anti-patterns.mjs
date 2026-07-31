import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validatorPath = path.join(repoRoot, "scripts/validate-astro-anti-patterns.mjs");
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "portfolio-astro-patterns-"));
const fixturePath = path.join(fixtureRoot, "src/styles/fixture.css");

function runValidator() {
  return spawnSync(process.execPath, [validatorPath], {
    cwd: fixtureRoot,
    encoding: "utf8",
  });
}

try {
  mkdirSync(path.dirname(fixturePath), { recursive: true });

  writeFileSync(fixturePath, ".control { transition-duration: 160ms; transition-timing-function: ease; }\n");
  const implicitTransition = runValidator();
  assert.equal(implicitTransition.status, 1, "implicit transition-property: all must fail");
  assert.match(implicitTransition.stderr, /transition-property/);

  writeFileSync(fixturePath, ".card { will-change: transform; }\n");
  const speculativeLayer = runValidator();
  assert.equal(speculativeLayer.status, 1, "unmeasured persistent layer promotion must fail");
  assert.match(speculativeLayer.stderr, /will-change/);

  writeFileSync(fixturePath, ".meter { transition: width 350ms ease; }\n");
  const layoutTransition = runValidator();
  assert.equal(layoutTransition.status, 1, "layout-bound width transitions must fail");
  assert.match(layoutTransition.stderr, /layout/);

  writeFileSync(
    fixturePath,
    ".control { transition-property: color, transform; transition-duration: 160ms; transition-timing-function: ease; }\n",
  );
  const explicitTransition = runValidator();
  assert.equal(explicitTransition.status, 0, explicitTransition.stderr);
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("Astro anti-pattern transition contract passed.");
