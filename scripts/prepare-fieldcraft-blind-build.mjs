import { cp, lstat, mkdir, mkdtemp, open, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export async function prepareBlindBuild(outputArg, { afterParentValidation } = {}) {
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

const parentHandle = await open(canonicalParent, "r");
let canonicalStaging;

try {
  const openedParentMetadata = await parentHandle.stat();
  const canonicalParentMetadata = await lstat(canonicalParent);
  if (openedParentMetadata.dev !== canonicalParentMetadata.dev || openedParentMetadata.ino !== canonicalParentMetadata.ino) {
    throw new Error("Blind-build output parent changed before staging creation");
  }
  const stagingParent = path.dirname(canonicalParent);
  canonicalStaging = await realpath(
    await mkdtemp(path.join(stagingParent, `.${path.basename(canonicalParent)}-${path.basename(output)}.staging-`)),
  );
  if (path.dirname(canonicalStaging) !== stagingParent) {
    throw new Error("Blind-build staging directory escaped its private sibling parent");
  }
  await afterParentValidation?.({ directParent, canonicalParent });

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
  const parentMetadataBeforePublish = await lstat(directParent);
  if (
    parentMetadataBeforePublish.dev !== openedParentMetadata.dev ||
    parentMetadataBeforePublish.ino !== openedParentMetadata.ino
  ) {
    throw new Error("Blind-build output parent changed before publication");
  }
  await rename(canonicalStaging, output);
} catch (error) {
  if (canonicalStaging) await rm(canonicalStaging, { recursive: true, force: true });
  throw error;
} finally {
  await parentHandle.close();
}
console.log(`PASS prepared isolated Fieldcraft blind-build input at ${output}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await prepareBlindBuild(process.argv[2]);
}
