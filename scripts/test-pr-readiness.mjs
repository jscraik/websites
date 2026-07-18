import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  checkDirty,
  globMatches,
  loadScope,
  readChangedFiles,
  requiredChecks,
  rulesetApplies,
} from "./lib/pr-readiness-boundaries.mjs";

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

test("rulesets honor all-branch, glob, and exclusion targets", () => {
  const base = { enforcement: "active", target: "branch" };
  assert.equal(rulesetApplies({ ...base, conditions: { ref_name: { include: ["~ALL"] } } }, "release/candidate"), true);
  assert.equal(rulesetApplies({ ...base, conditions: { ref_name: { include: ["release/*"] } } }, "release/candidate"), true);
  assert.equal(rulesetApplies({ ...base, conditions: { ref_name: { include: ["~ALL"], exclude: ["release/*"] } } }, "release/candidate"), false);
  assert.equal(rulesetApplies({ ...base, conditions: { ref_name: { include: ["~DEFAULT_BRANCH"] } } }, "main"), true);
});

test("scope manifests fail closed without applying malformed fields", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-pr-readiness-"));
  const scopeFile = path.join(directory, "scope.json");
  await writeFile(
    scopeFile,
    JSON.stringify({
      schema_version: "portfolio-pr-scope/v1",
      allowed_paths: ["scripts", 42],
      excluded_paths: ["docs", null],
      dirty_allowed_paths: "runtime/**",
      max_files: -1,
    })
  );
  const result = { blockers: [] };
  const scope = loadScope(
    result,
    { allowPath: ["package.json"], allowDirty: [], scopeFile },
    (target, code, message, evidence) => target.blockers.push({ code, message, evidence })
  );
  assert.deepEqual(scope.allowed_paths, ["package.json"]);
  assert.deepEqual(scope.excluded_paths, []);
  assert.deepEqual(scope.dirty_allowed_paths, []);
  assert.equal(scope.max_files, null);
  assert.deepEqual(
    result.blockers.map((blocker) => blocker.code),
    ["scope_field_invalid", "scope_field_invalid", "scope_dirty_allowed_paths_invalid", "scope_max_files_invalid"]
  );
  await rm(directory, { recursive: true, force: true });
});

test("changed and dirty paths preserve NUL-delimited filenames exactly", () => {
  const changedResult = {};
  const changed = readChangedFiles(
    changedResult,
    { base: "origin/main", head: "HEAD" },
    null,
    () => ({ ok: true, stdout: "dir/with space/file -> still-a-name\0exact-name\0", output: "" }),
    "git",
    "gh"
  );
  assert.deepEqual(changed, ["dir/with space/file -> still-a-name", "exact-name"]);
  const dirtyResult = { blockers: [] };
  const scope = { dirty_allowed_paths: ["**"] };
  checkDirty(
    dirtyResult,
    scope,
    () => ({ ok: true, stdout: "R  new name\0old name\0 M file -> literal\0", output: "" }),
    "git",
    (target, code, message, evidence) => target.blockers.push({ code, message, evidence })
  );
  assert.deepEqual(dirtyResult.dirty_worktree.files, ["new name", "old name", "file -> literal"]);
});

test("required checks union active rulesets and branch protection", () => {
  const result = { blockers: [] };
  const commandJson = (_result, _command, args) => {
    if (args[0] === "api" && args.at(-1).endsWith("/rulesets")) return [{ id: 1 }];
    if (args[0] === "api" && args.at(-1).endsWith("/rulesets/1")) {
      return {
        enforcement: "active",
        target: "branch",
        conditions: { ref_name: { include: ["~ALL"] } },
        rules: [{ type: "required_status_checks", parameters: { required_status_checks: [{ context: "lint" }] } }],
      };
    }
    return null;
  };
  const checks = requiredChecks(
    result,
    "jscraik/portfolio",
    "main",
    () => ({ ok: true, stdout: JSON.stringify({ required_status_checks: { contexts: ["test"], checks: [] } }), output: "" }),
    "gh",
    commandJson,
    (output) => ({ value: JSON.parse(output), error: null }),
    (target, code, message, evidence) => target.blockers.push({ code, message, evidence })
  );
  assert.deepEqual(checks.contexts, ["lint", "test"]);
  assert.equal(checks.source, "active repository ruleset + branch protection");
  assert.deepEqual(result.blockers, []);
});
