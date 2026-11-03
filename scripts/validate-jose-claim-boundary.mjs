import { readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const captureScript = readFileSync("scripts/capture-jose-reference.mjs", "utf8");
const notePath = "docs/implementation-notes/jose-parity-guardrail.md";
const notes = readFileSync(notePath, "utf8");
const referencePath = "docs/reference/jose-ocando/README.md";
const referenceNotes = readFileSync(referencePath, "utf8");
const decisionPath = "docs/decisions/2026-07-31-freeze-jose-reference-authority.md";
const decision = readFileSync(decisionPath, "utf8");
const cdpParityScript = readFileSync("scripts/jose-parity-cdp.mjs", "utf8");
const parityRunnerScript = readFileSync("scripts/jose-parity-runner.mjs", "utf8");

const failures = [];

if (!packageJson.scripts?.["capture:jose-reference"]?.includes("scripts/capture-jose-reference.mjs")) {
  failures.push("package.json: capture:jose-reference must invoke scripts/capture-jose-reference.mjs.");
}

if (!packageJson.scripts?.["test:jose-parity"]?.includes("scripts/jose-parity-runner.mjs")) {
  failures.push("package.json: test:jose-parity must invoke scripts/jose-parity-runner.mjs.");
}

if (!packageJson.scripts?.["test:jose-parity:cdp"]?.includes("scripts/jose-parity-cdp.mjs")) {
  failures.push("package.json: test:jose-parity:cdp must invoke scripts/jose-parity-cdp.mjs.");
}

const requiredCdpCapabilities = [
  "connectOverCDP",
  "CHROME_CDP_URL",
  "artifacts/screenshots-cdp",
  "run-summary.json"
];

for (const capability of requiredCdpCapabilities) {
  if (!cdpParityScript.includes(capability)) {
    failures.push("scripts/jose-parity-cdp.mjs: missing CDP parity capability marker: " + capability + ".");
  }
}

const requiredParityRunnerCapabilities = [
  "chromium.launch",
  "MachPortRendezvousServer",
  "bootstrap_check_in",
  "workspace-net or filesystem grants",
  "scripts/jose-parity-cdp.mjs",
  "playwright",
  "tests/screenshots"
];

for (const capability of requiredParityRunnerCapabilities) {
  if (!parityRunnerScript.includes(capability)) {
    failures.push("scripts/jose-parity-runner.mjs: missing parity runner capability marker: " + capability + ".");
  }
}

for (const [path, source] of [
  ["scripts/jose-parity-runner.mjs", parityRunnerScript],
  ["scripts/jose-parity-cdp.mjs", cdpParityScript],
]) {
  if (!source.includes("--remote-debugging-port=9223") ||
      source.includes("--remote-debugging-port=9222") ||
      !source.includes("mktemp -d") ||
      !source.includes("portfolio-chrome-cdp") ||
      !source.includes("--user-data-dir=") ||
      !source.includes("$profile_dir")) {
    failures.push(`${path}: recovery guidance must use the approved Portfolio 9223 route and dedicated profile.`);
  }
}
const requiredCaptureCapabilities = [
  "JOSE_REFERENCE_RENDERED_ARTIFACTS",
  "screenshots",
  "computed",
  "accessibility"
];

for (const capability of requiredCaptureCapabilities) {
  if (!captureScript.includes(capability)) {
    failures.push("scripts/capture-jose-reference.mjs: missing rendered-reference capability marker: " + capability + ".");
  }
}

const requiredBoundaryStatements = [
  "capture/reference pipeline is not visual parity proof",
  "Do not claim the Jamie prototype matches the stored Jose contract unless",
  "REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity",
  "CHROME_CDP_URL=http://127.0.0.1:9223 REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity",
  "CHROME_CDP_URL=http://127.0.0.1:9223 REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity:cdp",
  "Approved macOS external-CDP recovery",
  "--remote-debugging-port=9223",
  "mktemp -d",
  "--user-data-dir=\"$profile_dir\"",
  "rm -rf -- \"$profile_dir\"",
  "scripts/jose-parity-cdp.mjs` closes only its own context",
  "workspace-net and filesystem grants can provide network access, local binding, cache access, and profile-directory writes",
  "Command: cd /Users/jamiecraik/dev/brainwav.io && REFERENCE_BASE_URL=https://www.joseocando.com npm run test:jose-parity -> blocked"
];

const requiredAuthorityStatements = [
  [referencePath, referenceNotes, "The stored bundle is the canonical structural reference"],
  [referencePath, referenceNotes, "The current live site is advisory evidence"],
  [notePath, notes, "identity-content regions are masked before pixel comparison"],
  [notePath, notes, "Page-surface colors remain part of Jose palette parity"],
  [decisionPath, decision, "Status: Accepted"],
  [decisionPath, decision, "Stored-reference stability"],
];

for (const statement of requiredBoundaryStatements) {
  if (!notes.includes(statement)) {
    failures.push(notePath + ": missing claim-boundary statement: " + statement + ".");
  }
}

for (const [filePath, contents, statement] of requiredAuthorityStatements) {
  if (!contents.includes(statement)) {
    failures.push(filePath + ": missing stored-reference authority statement: " + statement + ".");
  }
}

if (failures.length > 0) {
  console.error("Jose claim-boundary validation failed:");
  for (const failure of failures) {
    console.error("- " + failure);
  }
  process.exit(1);
}

console.log("Jose claim-boundary validation passed: capture proof cannot be reported as visual parity proof.");
