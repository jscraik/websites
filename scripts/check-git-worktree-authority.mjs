import { access, readdir, stat } from "node:fs/promises";
import { W_OK, X_OK } from "node:constants";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();

function git(...args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

function fail(message) {
  console.error(`Git worktree authority check failed: ${message}`);
  process.exit(1);
}

export async function writableDirectoryForTarget(originalTarget, kind) {
  if (kind === "file") {
    try {
      const details = await stat(originalTarget);
      if (!details.isFile()) throw new Error(`path component is not a regular file: ${originalTarget}`);
      await access(originalTarget, W_OK);
      return originalTarget;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  let target = kind === "file" ? path.dirname(originalTarget) : originalTarget;
  while (true) {
    try {
      const details = await stat(target);
      if (!details.isDirectory()) {
        throw new Error(`path component is not a directory: ${target}`);
      }
      await access(target, W_OK | X_OK);
      return target;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      const parent = path.dirname(target);
      if (parent === target) throw error;
      target = parent;
    }
  }
}

async function main() {
  const branch = git("branch", "--show-current");
  if (!branch) {
    console.error("Git worktree authority check failed: detached HEAD has no branch ref to update");
    process.exit(1);
  }

  const paths = [
    ["index", git("rev-parse", "--git-path", "index"), "file"],
    ["objects", git("rev-parse", "--git-path", "objects"), "directory"],
    ["refs", git("rev-parse", "--git-path", "refs"), "directory"],
    ["logs/HEAD", git("rev-parse", "--git-path", "logs/HEAD"), "file"],
    ["current branch ref", git("rev-parse", "--git-path", `refs/heads/${branch}`), "file"],
    ["current branch reflog", git("rev-parse", "--git-path", `logs/refs/heads/${branch}`), "file"],
    ["packed refs (optional)", git("rev-parse", "--git-path", "packed-refs"), "file", true]
  ];

  for (const [label, originalTarget, kind, optional] of paths) {
    try {
      await writableDirectoryForTarget(originalTarget, kind);
    } catch (error) {
      if (optional) {
        console.warn(`Git worktree authority check warning: ${label} is unavailable at ${originalTarget}; loose refs remain the normal commit path.`);
        continue;
      }
      console.error(`Git worktree authority check failed: ${label} is not writable at ${originalTarget}: ${error.message}`);
      process.exit(1);
    }
  }

  const objectsPath = git("rev-parse", "--git-path", "objects");
  let entries;
  try {
    entries = await readdir(objectsPath, { withFileTypes: true });
  } catch (error) {
    fail(`object store fanout directories could not be inspected at ${objectsPath}: ${error.message}`);
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || !/^[0-9a-f]{2}$/.test(entry.name)) continue;
    const fanout = path.join(objectsPath, entry.name);
    try {
      await access(fanout, W_OK | X_OK);
    } catch (error) {
      fail(`object store fanout ${entry.name} is not writable at ${fanout}: ${error.message}`);
    }
  }

  console.log(`Git worktree authority check passed: ${paths.length} linked Git paths writable for ${branch}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
