import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { writableDirectoryForTarget } from "./check-git-worktree-authority.mjs";

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
    /path component is not a directory/,
    "a file in the branch path must fail closed"
  );

  const searchBlocked = path.join(gitDir, "search-blocked");
  await mkdir(searchBlocked);
  await chmod(searchBlocked, 0o200);
  await assert.rejects(
    writableDirectoryForTarget(searchBlocked, "directory"),
    /EACCES|permission denied|operation not permitted/i,
    "a Git directory without search permission must fail closed"
  );
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log("Git worktree authority regression tests passed.");
