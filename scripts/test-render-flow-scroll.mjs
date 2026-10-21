import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

test("render-flow distinguishes contained chart scrolling from escaped content", () => {
  assert.ok(process.env.CHROME_CDP_URL, "An approved external Chrome CDP endpoint is required");
  const repo = process.cwd();
  const fixture = mkdtempSync(join(tmpdir(), "portfolio-scroll-contract-"));
  try {
    const dist = join(fixture, "dist");
    cpSync(join(repo, "dist"), dist, { recursive: true });
    // Keep actual built assets and About markup; other routes are outside this regression.
    for (const entry of readdirSync(dist, { recursive: true })) {
      if (entry.endsWith(".html") && entry !== "now/index.html") rmSync(join(dist, entry));
    }
    const page = join(dist, "now/index.html");
    const original = readFileSync(page, "utf8");
    for (const [name, style, expected] of [
      ["contained scroll", "", 0],
      ["unclipped image", "overflow-x:visible!important", 1],
      ["escaped container", "transform:translateX(100px)!important", 1],
    ]) {
      writeFileSync(page, original.replace("</head>", `<style>.about-contributions__scroll{${style}}</style></head>`));
      const result = spawnSync(process.execPath, [join(repo, "scripts/validate-render-flow.mjs")], {
        cwd: fixture, encoding: "utf8", timeout: 60_000,
      });
      assert.equal(result.status, expected, `${name}: ${result.stdout}\n${result.stderr}`);
      if (expected === 1) assert.match(result.stderr, /horizontal overflow/);
    }
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
