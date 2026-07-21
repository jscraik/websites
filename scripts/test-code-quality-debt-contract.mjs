import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) =>
	readFileSync(path.join(repoRoot, relativePath), "utf8");

const debtValidator = read("scripts/check-code-quality-debt.mjs");
const environment = read(".codex/environments/environment.toml");
const packageJson = JSON.parse(read("package.json"));

assert.ok(
	debtValidator.includes(
		"const SOURCE_EXTENSIONS = /\\.(astro|ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;",
	),
	"Astro source must participate in the debt collection surface",
);
assert.ok(
	debtValidator.includes("!/\\.(?:ts|tsx|mts|cts)$/.test(path)"),
	"TypeScript escape-hatch debt must include TSX and module extensions",
);
assert.ok(
	debtValidator.includes("const TYPE_DECLARATION = /\\.d\\.(ts|mts|cts)$/;"),
	"module declaration files must stay outside the debt source surface",
);
assert.ok(
	debtValidator.includes("TYPE_DECLARATION.test(path)"),
	"escape-hatch scanning must exclude declaration files directly",
);
assert.doesNotMatch(
	debtValidator,
	/const reportedPairs = new Set\(\)/,
	"duplicate debt must not suppress later occurrences by file pair",
);
assert.match(
	debtValidator,
	/const reportedOccurrences = new Set\(\)/,
	"duplicate debt must deduplicate only identical occurrences",
);
assert.match(
	debtValidator,
	/debt\.relatedPath \? `:\$\{debt\.line\}:\$\{debt\.relatedPath\}:\$\{debt\.relatedLine\}`/,
	"duplicate debt IDs must include their reported occurrence coordinates",
);
assert.match(
	packageJson.scripts["validate:fast"],
	/^npm run test:code-quality-debt &&/,
	"the debt contract test must run in the standard fast validation gate",
);

assert.equal(
	(environment.match(/run_node_pm run test:smoke/g) ?? []).length,
	2,
	"Test and Run tests actions must use the repository smoke contract",
);
assert.equal(
	(environment.match(/npm run dev/g) ?? []).length,
	2,
	"Run and Run app actions must invoke the repository dev script",
);
assert.doesNotMatch(
	environment,
	/codex\/scripts\//,
	"environment actions must not point at nonexistent codex/scripts helpers",
);
assert.match(
	environment,
	/bash scripts\/prepare-worktree\.sh/,
	"environment setup must use the repository worktree preparation helper",
);
assert.match(
	environment,
	/bash scripts\/codex-preflight\.sh --mode optional/,
	"Codex preflight must use the project-local helper path",
);
assert.match(
	environment,
	/bash scripts\/verify-work\.sh --fast/,
	"Codex verify must use the project-local helper path",
);
for (const removedAction of [
	"Codex config",
	"Codex hooks",
	"Codex hooks runtime",
	"Codex symlinks",
]) {
	assert.doesNotMatch(
		environment,
		new RegExp(`name = "${removedAction}"`),
		`${removedAction} must not advertise an unavailable helper`,
	);
}

console.log("PASS code-quality-debt and environment action contracts");
