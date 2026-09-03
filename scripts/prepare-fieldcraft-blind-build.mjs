import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const outputArg = process.argv[2];
if (!outputArg) throw new Error("Usage: node scripts/prepare-fieldcraft-blind-build.mjs <output-directory>");
const root = process.cwd();
const output = path.resolve(outputArg);
const forbiddenRoots = [
  path.resolve(root, "docs/reference/fieldcraft-fde"),
  path.resolve(root, "artifacts"),
  root,
];
if (forbiddenRoots.includes(output) || output.startsWith(`${forbiddenRoots[0]}${path.sep}`) || output.startsWith(`${forbiddenRoots[1]}${path.sep}`)) {
  throw new Error("Blind-build output must be an isolated directory outside evaluator-only references and artifacts");
}
const inputs = [
  "docs/specifications/fieldcraft-fde-blind-build-agent-prompt.md",
  "docs/specifications/fieldcraft-fde-blind-build-brief.md",
  "docs/specifications/fieldcraft-fde-measured-scene-contract.md",
  "docs/specifications/fieldcraft-fde-internal-region-contract.json",
];
await mkdir(output, { recursive: true });
for (const source of inputs) {
  const destination = path.join(output, source);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(root, source), destination);
}
const manifest = {
  schemaVersion: 1,
  authority: "builder-clean-room-input",
  inputs,
  exclusions: ["docs/reference/fieldcraft-fde/**", "artifacts/**", "scripts/evaluate-fieldcraft-scenes.mjs"],
};
await writeFile(path.join(output, "blind-build-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`PASS prepared isolated Fieldcraft blind-build input at ${output}`);
