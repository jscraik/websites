import { access, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();

function git(...args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

function fail(message) {
  console.error(`Git worktree authority check failed: ${message}`);
  process.exit(1);
}

const branch = git("branch", "--show-current");
const paths = [
  ["index", git("rev-parse", "--git-path", "index")],
  ["objects", git("rev-parse", "--git-path", "objects")],
  ["refs", git("rev-parse", "--git-path", "refs")],
  ["logs/HEAD", git("rev-parse", "--git-path", "logs/HEAD")],
  ["current branch ref directory", git("rev-parse", "--git-path", "refs/heads")],
  ["packed refs", git("rev-parse", "--git-path", "packed-refs")]
];

for (const [label, originalTarget] of paths) {
  let target = originalTarget;
  try {
    try {
      await stat(target);
    } catch {
      target = path.dirname(target);
    }
    if (label === "index" || label === "logs/HEAD" || label === "packed refs") {
      target = path.dirname(target);
    }
    await access(target, 2);
  } catch (error) {
    fail(`${label} is not writable at ${target}: ${error.message}`);
  }
}

console.log(`Git worktree authority check passed: ${paths.length} linked Git paths writable for ${branch}.`);
