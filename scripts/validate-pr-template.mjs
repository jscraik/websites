import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectPrTemplateContractErrors } from "./lib/pr-template-contract.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(repoRoot, ".github", "PULL_REQUEST_TEMPLATE.md");
const errors = collectPrTemplateContractErrors(readFileSync(templatePath, "utf8"));

if (errors.length > 0) {
  for (const error of errors) console.error(`pr-template: ${error}`);
  process.exit(1);
}

console.log("pr-template: pass");
