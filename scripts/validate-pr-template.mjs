import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectPrBodyContractErrors, collectPrTemplateContractErrors } from "./lib/pr-template-contract.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(repoRoot, ".github", "PULL_REQUEST_TEMPLATE.md");
const template = readFileSync(templatePath, "utf8");
const errors = collectPrTemplateContractErrors(template);
if (process.env.PR_TEMPLATE_BODY !== undefined) {
  errors.push(...collectPrBodyContractErrors(process.env.PR_TEMPLATE_BODY, template));
}

if (errors.length > 0) {
  for (const error of errors) console.error(`pr-template: ${error}`);
  process.exit(1);
}

console.log("pr-template: pass");
