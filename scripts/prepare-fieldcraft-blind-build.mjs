import { cp, lstat, mkdir, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const outputArg = process.argv[2];
if (!outputArg) throw new Error("Usage: node scripts/prepare-fieldcraft-blind-build.mjs <output-directory>");

const root = await realpath(process.cwd());
const output = path.resolve(outputArg);

try {
  await lstat(output);
  throw new Error("Blind-build output must be a new, non-existing directory");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const directParent = path.dirname(output);
let parentMetadata;
try {
  parentMetadata = await lstat(directParent);
} catch (error) {
  if (error.code === "ENOENT") throw new Error("Blind-build output direct parent must already exist");
  throw error;
}
if (!parentMetadata.isDirectory()) {
  throw new Error("Blind-build output parent must be a real directory, not a symlink");
}
const canonicalParent = await realpath(directParent);
if (canonicalParent === root || canonicalParent.startsWith(`${root}${path.sep}`)) {
  throw new Error("Blind-build output must be outside the repository");
}

const workspace = [
  ".npmrc",
  "AGENTS.md",
  "CODESTYLE.md",
  "WORKFLOW.md",
  "astro.config.mjs",
  "package.json",
  "package-lock.json",
  "public",
  "src",
];

const inputs = [
  "docs/specifications/fieldcraft-fde-blind-build-agent-prompt.md",
  "docs/specifications/fieldcraft-fde-blind-build-brief.md",
  "docs/specifications/fieldcraft-fde-measured-scene-contract.md",
  "docs/specifications/fieldcraft-fde-internal-region-contract.json",
];

await mkdir(output);
for (const source of [...workspace, ...inputs]) {
  const destination = path.join(output, source);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(root, source), destination, { recursive: true });
}

const manifest = {
  schemaVersion: 1,
  authority: "builder-clean-room-workspace",
  workspace,
  inputs,
  exclusions: [
    "docs/reference/fieldcraft-fde/**",
    "artifacts/**",
    "scripts/**/*fieldcraft*",
  ],
};
await writeFile(path.join(output, "blind-build-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`PASS prepared isolated Fieldcraft blind-build input at ${output}`);
