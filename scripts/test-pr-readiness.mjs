import test from "node:test";
import assert from "node:assert/strict";

import { globMatches } from "./lib/pr-readiness-boundaries.mjs";

test("directory scope patterns include nested files", () => {
  assert.equal(globMatches("docs/implementation-notes/pr-readiness-gate.md", "docs/implementation-notes/"), true);
  assert.equal(globMatches("docs/implementation-notes/pr-readiness-gate.md", "docs/implementation-notes"), true);
});

test("single-star patterns stay within one path segment", () => {
  assert.equal(globMatches("scripts/validate-pr-readiness.mjs", "scripts/*.mjs"), true);
  assert.equal(globMatches("scripts/lib/pr-readiness-boundaries.mjs", "scripts/*.mjs"), false);
});

test("double-star patterns cross path segments", () => {
  assert.equal(globMatches("scripts/lib/pr-readiness-boundaries.mjs", "scripts/**/*.mjs"), true);
  assert.equal(globMatches("scripts/validate-pr-readiness.mjs", "scripts/**/*.mjs"), true);
});

test("exact patterns include the path itself and its descendants", () => {
  assert.equal(globMatches("package.json", "package.json"), true);
  assert.equal(globMatches("package.json/backup", "package.json"), true);
  assert.equal(globMatches("package-lock.json", "package.json"), false);
});
