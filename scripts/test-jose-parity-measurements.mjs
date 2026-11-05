import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { assertPatchedChrome, MINIMUM_CHROME_VERSION } from "./lib/patched-chrome.mjs";

import {
  maskPixelRegions,
  resolveEffectiveBackgroundRgb,
} from "./jose-parity-measurements.mjs";

const brandTokens = JSON.parse(readFileSync("src/styles/brand-tokens.json", "utf8"));
assert.equal(
  brandTokens.colors.portfolio_bg,
  "#D5D6D0",
  "the portfolio canvas token must map to Jose's stored neutral-03 reference",
);

assert.deepEqual(
  resolveEffectiveBackgroundRgb(["rgba(0, 0, 0, 0)", "rgb(213, 214, 208)"]),
  [213, 214, 208],
  "a transparent hit target must inherit the first painted ancestor background",
);

assert.deepEqual(
  resolveEffectiveBackgroundRgb(["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]),
  [255, 255, 255],
  "an entirely transparent chain must resolve to the browser canvas fallback",
);

assert.deepEqual(
  resolveEffectiveBackgroundRgb(["rgba(0, 0, 0, 0.5)", "rgb(255, 255, 255)"]),
  [128, 128, 128],
  "semi-transparent layers must be composited instead of treated as opaque RGB",
);

assert.deepEqual(
  resolveEffectiveBackgroundRgb(["color(srgb 0.903529 0.948235 0.964706 / 0.8)", "rgb(213, 214, 208)"]),
  [227, 236, 238],
  "modern color(srgb) layers must convert normalized channels before compositing",
);

const pixels = new Uint8Array([
  10, 20, 30, 255,
  40, 50, 60, 255,
]);

maskPixelRegions(pixels, 2, 1, [{ x: 0, y: 0, width: 1, height: 1 }]);

assert.deepEqual(
  [...pixels],
  [0, 0, 0, 0, 40, 50, 60, 255],
  "identity-region masking must neutralize only pixels inside the bounded region",
);

for (const scriptPath of ["tests/screenshots/jose-jamie.spec.ts", "scripts/jose-parity-cdp.mjs"]) {
  const source = readFileSync(scriptPath, "utf8");
  assert.match(source, /resolveEffectiveBackgroundRgb\(measured\.sampleBackgroundLayers\)/);
  assert.match(source, /maskPixelRegions\(reference\.data/);
  assert.match(source, /maskPixelRegions\(candidate\.data/);
  assert.match(
    source,
    /\["about-top", "about-fun-facts"\]\.includes\(capture\.name\)/,
    "About identity copy must be masked without weakening its geometry assertions",
  );
  assert.match(source, /copy\s*(?:=|:)\s*captureName === "about-top"/);
  assert.match(source, /\.recognition-list a/);
  assert.doesNotMatch(source, /\.web-table a/);
  assert.match(source, /requireRect\("about copy", reference\.copy, candidate\.copy\)/);
  assert.match(source, /card\[0\]\.height/);
  assert.doesNotMatch(
    source,
    /identityRegion[^\n]+\.height[^\n]+candidate\.identityRegions\[index\]\.height/,
    "identity-specific copy length must not define the shared card-height contract",
  );
  assert.doesNotMatch(source, /backgroundColor\.match/);
  assert.match(
    source,
    /rect\.y < window\.innerHeight - 8/,
    "bottom contamination must require a materially visible viewport intersection",
  );
  assert.match(source, /"about-fun-facts-mobile": 0\.23/);
  assert.match(source, /reference\.sampleColor\.entries\(\)/);
  if (scriptPath === "scripts/jose-parity-cdp.mjs") {
    assert.match(
      source,
      /assertCandidateShellSurfaces\(page, candidateBaseURL, viewport\.name\)/,
      "CDP parity must check route-independent shell and canvas surfaces before pixel comparisons",
    );
    assert.match(
      source,
      /if \(context\) \{\s+await context\.close\(\)\.catch\(\(\) => \{\}\);\s+\}/,
      "CDP parity must release only its own isolated context",
    );
    assert.doesNotMatch(source, /browser\.close\(|browser\.contexts\(/,
      "CDP parity must not close the owner browser or enumerate existing contexts");
    assert.match(source, /process\.exit\(process\.exitCode \?\? 0\)/,
      "CDP parity must terminate without manipulating the external browser");
  }
}

// Execute the real formatter without starting the runner's browser/subprocess entrypoint.
const runnerSource = readFileSync("scripts/jose-parity-runner.mjs", "utf8");
const formatterStart = runnerSource.indexOf("function renderManagedChromiumBlocker(error) {");
const formatterEnd = runnerSource.indexOf("\nfunction run(", formatterStart);
assert.ok(formatterStart >= 0 && formatterEnd > formatterStart);
const renderBlocker = runInNewContext(
  `(${runnerSource.slice(formatterStart, formatterEnd).trim()})`,
  { MINIMUM_CHROME_VERSION },
);
for (const version of ["156.0.8078.72", "unknown"]) {
  let rejection;
  assert.throws(() => {
    try { assertPatchedChrome(version); } catch (error) { rejection = error; throw error; }
  }, /Chrome security check blocked/);
  const output = renderBlocker(rejection);
  assert.ok(output.includes(`Update Google Chrome to ${MINIMUM_CHROME_VERSION} or newer`));
  assert.ok(output.includes(rejection.stack), "preserve the exact original security error");
  assert.doesNotMatch(output, /Mach bootstrap|entitlement|CDP attach/);
}
for (const detail of ["MachPortRendezvousServer failed", "bootstrap_check_in failed", "Chrome executable missing"]) {
  const failure = new Error(detail);
  const output = renderBlocker(failure);
  assert.match(output, /Use the approved Portfolio CDP attach lane instead/);
  assert.ok(output.includes(failure.stack));
  assert.doesNotMatch(output, /Update Google Chrome/);
}

console.log("Jose parity measurement and browser diagnostic contracts passed.");
