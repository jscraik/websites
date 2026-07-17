import { access, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();

function git(...args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

export async function writableDirectoryForTarget(originalTarget, kind) {
  let target = kind === "file" ? path.dirname(originalTarget) : originalTarget;
  while (true) {
    try {
      const details = await stat(target);
      if (!details.isDirectory()) {
        throw new Error(`path component is not a directory: ${target}`);
      }
      await access(target, 2);
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
    ["packed refs", git("rev-parse", "--git-path", "packed-refs"), "file"]
  ];

  for (const [label, originalTarget, kind] of paths) {
    try {
      await writableDirectoryForTarget(originalTarget, kind);
    } catch (error) {
      console.error(`Git worktree authority check failed: ${label} is not writable at ${originalTarget}: ${error.message}`);
      process.exit(1);
    }
  }

  console.log(`Git worktree authority check passed: ${paths.length} linked Git paths writable for ${branch}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
