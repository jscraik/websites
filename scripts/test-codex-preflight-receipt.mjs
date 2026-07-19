import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "portfolio-preflight-receipt-"));
const runtimeStatusBefore = spawnSync("git", ["status", "--porcelain=v1", "--", ".harness/runtime"], {
  cwd: repoRoot,
  encoding: "utf8",
});

function run(name, paths) {
  const receiptPath = path.join(temporaryRoot, `${name}.json`);
  const result = spawnSync(
    "bash",
    ["scripts/codex-preflight.sh", "--stack", "js", "--mode", "off", "--bins", "node", "--paths", paths],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: { ...process.env, CODEX_PREFLIGHT_RECEIPT_PATH: receiptPath },
    },
  );
  return { result, receipt: JSON.parse(readFileSync(receiptPath, "utf8")) };
}

try {
  const pass = run("pass", "package.json");
  assert.equal(pass.result.status, 0, pass.result.stderr);
  assert.equal(pass.receipt.schemaVersion, "codex-preflight-status/v1");
  assert.equal(pass.receipt.status, "pass");
  assert.equal(pass.receipt.mode, "off");

  const fail = run("fail", "does-not-exist-for-receipt-test");
  assert.notEqual(fail.result.status, 0);
  assert.equal(fail.receipt.schemaVersion, "codex-preflight-status/v1");
  assert.equal(fail.receipt.status, "fail");
  assert.equal(fail.receipt.mode, "off");

  const runtimeStatusAfter = spawnSync("git", ["status", "--porcelain=v1", "--", ".harness/runtime"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  assert.equal(runtimeStatusAfter.stdout, runtimeStatusBefore.stdout);
  console.log("PASS preflight receipts remain external runtime state for pass and fail paths");
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
