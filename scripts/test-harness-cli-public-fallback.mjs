import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), "portfolio-harness-cli-"));
const fixtureScripts = path.join(fixtureRoot, "scripts");
const npmPath = path.join(fixtureRoot, "npm");
const logPath = path.join(fixtureRoot, "npm.log");

try {
  mkdirSync(fixtureScripts);
  copyFileSync(path.join(repoRoot, "scripts/harness-cli.sh"), path.join(fixtureScripts, "harness-cli.sh"));
  writeFileSync(
    npmPath,
    `#!/usr/bin/env bash\nprintf '%s\\n' "$*" >> "${logPath}"\nif [[ "$1" == "whoami" ]]; then\n  exit 99\nfi\nexit 0\n`,
    "utf8"
  );
  chmodSync(npmPath, 0o755);

  execFileSync("bash", [path.join(fixtureScripts, "harness-cli.sh"), "docs-gate", "--mode", "required"], {
    cwd: fixtureRoot,
    env: {
      ...process.env,
      HARNESS_CLI_ALLOW_NPM_EXEC: "1",
      PATH: `${fixtureRoot}:${process.env.PATH}`,
    },
    stdio: "pipe",
  });

  const npmCalls = readFileSync(logPath, "utf8");
  assert.match(npmCalls, /^exec --yes --package @brainwav\/coding-harness@latest -- harness docs-gate --mode required$/m);
  assert.doesNotMatch(npmCalls, /^whoami/m);
  console.log("PASS harness CLI public fallback uses npm exec without authentication preflight");
} finally {
  rmSync(fixtureRoot, { force: true, recursive: true });
}
