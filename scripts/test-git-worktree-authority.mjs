import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { writableDirectoryForTarget } from "./check-git-worktree-authority.mjs";

const AUTHORITY_SCRIPT = fileURLToPath(new URL("./check-git-worktree-authority.mjs", import.meta.url));

async function makeCliFixture(root) {
  const gitDir = path.join(root, ".git");
  const binDir = path.join(root, "bin");
  const fakeGit = path.join(binDir, "git");
  await mkdir(path.join(gitDir, "refs", "heads"), { recursive: true });
  await mkdir(path.join(gitDir, "logs", "refs", "heads"), { recursive: true });
  await mkdir(path.join(gitDir, "objects"), { recursive: true });
  await mkdir(binDir);
  await Promise.all([
    writeFile(path.join(gitDir, "index"), "index\n"),
    writeFile(path.join(gitDir, "logs", "HEAD"), "head\n"),
    writeFile(path.join(gitDir, "refs", "heads", "test-branch"), "ref\n"),
    writeFile(path.join(gitDir, "logs", "refs", "heads", "test-branch"), "reflog\n"),
    writeFile(fakeGit, `#!/bin/sh
if [ "$1" = "branch" ]; then
  printf '%s\\n' test-branch
  exit 0
fi
if [ "$1" = "rev-parse" ] && [ "$2" = "--git-path" ]; then
  printf '%s/%s\\n' "$FAKE_GIT_DIR" "$3"
  exit 0
fi
exit 1
`),
  ]);
  await chmod(fakeGit, 0o755);
  return { gitDir, binDir };
}

function runAuthorityCli(root, gitDir, binDir) {
  return spawnSync(process.execPath, [AUTHORITY_SCRIPT], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      FAKE_GIT_DIR: gitDir,
      PATH: `${binDir}:${process.env.PATH}`,
    },
  });
}

const root = await mkdtemp(path.join(os.tmpdir(), "portfolio-git-authority-"));
try {
  const gitDir = path.join(root, ".git");
  await mkdir(path.join(gitDir, "refs", "heads"), { recursive: true });
  await mkdir(path.join(gitDir, "logs", "refs", "heads"), { recursive: true });

  assert.equal(
    await writableDirectoryForTarget(path.join(gitDir, "packed-refs"), "file"),
    gitDir,
    "an absent packed-refs file must probe the Git directory exactly once"
  );
  assert.equal(
    await writableDirectoryForTarget(path.join(gitDir, "refs", "heads", "codex", "topic"), "file"),
    path.join(gitDir, "refs", "heads"),
    "a nested branch must probe its nearest existing ref directory"
  );
  assert.equal(
    await writableDirectoryForTarget(path.join(gitDir, "logs", "refs", "heads", "codex", "topic"), "file"),
    path.join(gitDir, "logs", "refs", "heads"),
    "a nested branch must probe its nearest existing reflog directory"
  );

  await writeFile(path.join(gitDir, "refs", "heads", "blocked"), "not a directory\n");
  await assert.rejects(
    writableDirectoryForTarget(path.join(gitDir, "refs", "heads", "blocked", "topic"), "file"),
    /path component is not a directory|ENOTDIR|not a directory/,
    "a file in the branch path must fail closed"
  );

  const searchBlocked = path.join(gitDir, "search-blocked");
  await mkdir(searchBlocked);
  await chmod(searchBlocked, 0o200);
  if (process.getuid?.() !== 0) {
    await assert.rejects(
      writableDirectoryForTarget(searchBlocked, "directory"),
      /EACCES|permission denied|operation not permitted/i,
      "a Git directory without search permission must fail closed"
    );
  }

  const readOnlyFile = path.join(gitDir, "readonly-log");
  await writeFile(readOnlyFile, "reflog\n");
  await chmod(readOnlyFile, 0o400);
  if (process.getuid?.() !== 0) {
    await assert.rejects(
      writableDirectoryForTarget(readOnlyFile, "file"),
      /EACCES|permission denied|operation not permitted/i,
      "an existing Git file without write permission must fail closed"
    );
  }

  const parentBlocked = path.join(gitDir, "parent-blocked");
  const parentBlockedFile = path.join(parentBlocked, "index");
  await mkdir(parentBlocked);
  await writeFile(parentBlockedFile, "index\n");
  if (process.getuid?.() !== 0) {
    try {
      await chmod(parentBlocked, 0o500);
      await assert.rejects(
        writableDirectoryForTarget(parentBlockedFile, "file"),
        /EACCES|permission denied|operation not permitted/i,
        "an existing Git file in a directory without write permission must fail closed"
      );
    } finally {
      await chmod(parentBlocked, 0o700);
    }
  }
} finally {
  await rm(root, { recursive: true, force: true });
}

if (process.getuid?.() !== 0) {
  const cliRoot = await mkdtemp(path.join(os.tmpdir(), "portfolio-git-authority-cli-"));
  try {
    const { gitDir, binDir } = await makeCliFixture(cliRoot);
    const packedRefs = path.join(gitDir, "packed-refs");
    await writeFile(packedRefs, "refs\n");
    await chmod(packedRefs, 0o400);
    const blockedRuntime = runAuthorityCli(cliRoot, gitDir, binDir);
    assert.equal(blockedRuntime.status, 1, "a non-writable packed-refs file must fail the command");
    assert.equal(JSON.parse(blockedRuntime.stderr).outcome, "blocked_runtime");

    await chmod(packedRefs, 0o700);
    await rm(packedRefs);
    await mkdir(packedRefs);
    const invalidPath = runAuthorityCli(cliRoot, gitDir, binDir);
    assert.equal(invalidPath.status, 1, "a non-file packed-refs path must fail the command");
    assert.equal(JSON.parse(invalidPath.stderr).outcome, "invalid_git_path");
  } finally {
    await rm(cliRoot, { recursive: true, force: true });
  }
}

console.log("Git worktree authority regression tests passed.");
