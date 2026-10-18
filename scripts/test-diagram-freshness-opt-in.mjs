import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");

// Historical captures remain readable without reinstalling the retired generator.
const manifest = JSON.parse(read(".diagram/manifest.json"));
for (const entry of manifest.diagrams) {
  const content = readFileSync(path.join(root, entry.outputPath));
  assert.equal(entry.lines, content.toString("utf8").split(/\r?\n/).length, `${entry.outputPath}: line count`);
  assert.equal(entry.bytes, content.byteLength, `${entry.outputPath}: byte count`);
}
assert.doesNotMatch(read("scripts/hook-pre-push.sh"), /check-diagram-freshness|refresh-diagram-context/);
assert.doesNotMatch(read(".mise.toml"), /npm:@brainwav\/diagram/);
assert.doesNotMatch(read("scripts/check-environment.sh"), /"diagram"|npm:@brainwav\/diagram/);
assert.doesNotMatch(read(".circleci/config.yml"), /npm:@brainwav\/diagram/);
console.log("PASS historical diagram integrity; no mandatory generator dependency");
