import { cp, lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
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

const staging = await mkdtemp(path.join(canonicalParent, `.${path.basename(output)}.staging-`));
const canonicalParentAfterCreate = await realpath(directParent);
const canonicalStaging = await realpath(staging);
if (canonicalParentAfterCreate !== canonicalParent || path.dirname(canonicalStaging) !== canonicalParent) {
  throw new Error("Blind-build output parent changed during staging creation");
}

try {
  for (const source of [...workspace, ...inputs]) {
    const destination = path.join(canonicalStaging, source);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(root, source), destination, { recursive: true });
  }

const exportedPackagePath = path.join(canonicalStaging, "package.json");
const exportedPackage = JSON.parse(await readFile(exportedPackagePath, "utf8"));
exportedPackage.scripts = {
  dev: "astro dev",
  check: "astro check",
  build: "astro build",
  preview: "astro preview",
  "validate:fast": "npm run check && npm run build",
};
await writeFile(exportedPackagePath, `${JSON.stringify(exportedPackage, null, 2)}\n`);
await writeFile(
  path.join(canonicalStaging, "WORKFLOW.md"),
  `# Fieldcraft clean-room workflow

Run \u0060npm ci\u0060, then \u0060npm run validate:fast\u0060. The exported validation surface is intentionally limited to Astro check and build commands that are present in this workspace.
`,
);

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
  await writeFile(path.join(canonicalStaging, "blind-build-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await rename(canonicalStaging, output);
} catch (error) {
  await rm(canonicalStaging, { recursive: true, force: true });
  throw error;
}
console.log(`PASS prepared isolated Fieldcraft blind-build input at ${output}`);
