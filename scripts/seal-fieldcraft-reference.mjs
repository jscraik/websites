import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseEvaluationPolicy, parseFieldcraftJson } from "./lib/fieldcraft-contracts.mjs";

const root = path.resolve("docs/reference/fieldcraft-fde/v3");
const policyPath = path.join(root, "policy.json");
const policyText = await readFile(policyPath, "utf8");
const policy = parseEvaluationPolicy(parseFieldcraftJson(policyText, "evaluation policy"));

async function filesBelow(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await filesBelow(absolute)));
    else if (entry.isFile() && entry.name.endsWith(".png")) output.push(absolute);
  }
  return output;
}

const captures = [];
for (const absolute of (await filesBelow(path.join(root, "screenshots"))).sort()) {
  const bytes = await readFile(absolute);
  const metadata = await stat(absolute);
  captures.push({
    path: path.relative(root, absolute),
    bytes: metadata.size,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
}

const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  authority: policy.authority,
  policySha256: createHash("sha256").update(await readFile(policyPath)).digest("hex"),
  captureCount: captures.length,
  captures,
  claimsBoundary: {
    proves: "The listed protected images existed and were hash-bound when this manifest was generated.",
    doesNotProve: "Candidate parity, uncaptured state parity, responsive parity, interaction correctness, or runtime cleanliness."
  }
};

await writeFile(path.join(root, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`PASS sealed ${captures.length} Fieldcraft reference captures`);
