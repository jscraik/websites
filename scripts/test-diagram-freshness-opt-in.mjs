import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
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
const contract = JSON.parse(read("harness.contract.json"));
assert.equal(contract.toolingPolicy.requiredDocumentationTerms.includes("diagram"), false);
assert.equal(contract.toolingPolicy.requiredBinaries.includes("diagram"), false);
assert.equal(contract.toolingPolicy.requiredMiseTools.some((entry) => entry.tool === "npm:@brainwav/diagram"), false);
assert.equal(contract.toolingPolicy.makefile.requiredTargets.includes("diagrams"), false);
assert.equal(contract.toolingPolicy.makefile.requiredTargets.includes("diagrams-check"), false);
for (const file of ["scripts/check-diagram-freshness.sh", "scripts/refresh-diagram-context.sh", "scripts/lib/normalize-mermaid-artifact.cjs"]) {
  assert.equal(existsSync(path.join(root, file)), false, `${file}: retired entrypoint absent`);
}
for (const target of ["diagrams", "diagrams-check"]) {
  const result = spawnSync("make", ["-n", target], { cwd: root, encoding: "utf8" });
  assert.notEqual(result.status, 0, `${target}: obsolete target must not remain runnable`);
  assert.match(result.stderr, /No rule to make target/);
}
console.log("PASS historical diagram integrity; no mandatory generator dependency");
