import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) =>
	readFileSync(path.join(repoRoot, relativePath), "utf8");

const debtValidator = read("scripts/check-code-quality-debt.mjs");
const environment = read(".codex/environments/environment.toml");
const packageJson = JSON.parse(read("package.json"));
const debtValidatorPath = path.join(repoRoot, "scripts/check-code-quality-debt.mjs");

function runDebtValidator(cwd) {
	const result = spawnSync(process.execPath, [debtValidatorPath, "--json"], {
		cwd,
		encoding: "utf8",
	});
	assert.equal(result.error, undefined, "the debt validator must start");
	assert.notEqual(result.stdout.trim(), "", "the debt validator must emit JSON");
	return { exitCode: result.status, report: JSON.parse(result.stdout) };
}

function baseline(entries) {
	return {
		schemaVersion: "code-quality-debt-baseline/v1",
		generatedAt: "2026-07-21T00:00:00.000Z",
		thresholds: {
			maxFileLines: 400,
			maxFunctionLines: 80,
			maxComplexity: 10,
			maxTestFileLines: 1200,
			duplicateBlockLines: 24,
		},
		entries,
	};
}

function assertDuplicateOccurrenceContract() {
	const fixtureRoot = mkdtempSync(path.join(tmpdir(), "portfolio-debt-contract-"));
	const repeatedBlock = Array.from(
		{ length: 24 },
		(_, index) => `const duplicateFixtureLine${index} = ${index};`,
	).join("\n");
	const expectedFingerprint = createHash("sha256")
		.update(repeatedBlock)
		.digest("hex")
		.slice(0, 16);
	const firstSource = [
		"const firstFixturePrefix = true;",
		repeatedBlock,
		"const firstFixtureDivider = true;",
		repeatedBlock,
	].join("\n");
	const secondSource = [
		"const secondFixturePrefix = true;",
		repeatedBlock,
		"const secondFixtureDivider = true;",
		repeatedBlock,
	].join("\n");

	try {
		mkdirSync(path.join(fixtureRoot, "src"), { recursive: true });
		mkdirSync(path.join(fixtureRoot, "contracts"), { recursive: true });
		writeFileSync(path.join(fixtureRoot, "src/first.ts"), firstSource);
		writeFileSync(path.join(fixtureRoot, "src/second.ts"), secondSource);
		writeFileSync(
			path.join(fixtureRoot, "src/interop.d.mts"),
			"declare const interopValue: any;\n",
		);
		writeFileSync(
			path.join(fixtureRoot, "contracts/code-quality-debt-baseline.json"),
			`${JSON.stringify(baseline([]), null, 2)}\n`,
		);
		const initialized = spawnSync("git", ["init", "--quiet"], {
			cwd: fixtureRoot,
			encoding: "utf8",
		});
		assert.equal(initialized.status, 0, initialized.stderr);

		const firstRun = runDebtValidator(fixtureRoot);
		assert.equal(firstRun.exitCode, 1, "unbaselined duplicates must fail the gate");
		const duplicateEntries = firstRun.report.newDebt.filter(
			(entry) => entry.category === "duplicate_block",
		);
		assert.equal(duplicateEntries.length, 4, "every cross-file occurrence pair must be reported");
		assert.deepEqual(
			duplicateEntries.map((entry) => entry.id).sort(),
			[
				`duplicate_block:src/first.ts:${expectedFingerprint}:0:src/second.ts:0`,
				`duplicate_block:src/first.ts:${expectedFingerprint}:0:src/second.ts:1`,
				`duplicate_block:src/first.ts:${expectedFingerprint}:1:src/second.ts:0`,
				`duplicate_block:src/first.ts:${expectedFingerprint}:1:src/second.ts:1`,
			],
			"duplicate IDs must distinguish each stable occurrence pair",
		);
		assert.equal(
			firstRun.report.newDebt.some(
				(entry) => entry.category === "typescript_escape_hatch",
			),
			false,
			"module declaration files must stay out of type escape-hatch debt",
		);

		writeFileSync(
			path.join(fixtureRoot, "contracts/code-quality-debt-baseline.json"),
			`${JSON.stringify(baseline(firstRun.report.newDebt), null, 2)}\n`,
		);
		writeFileSync(
			path.join(fixtureRoot, "src/first.ts"),
			`// ignored source shift\n\n${firstSource}`,
		);
		const shiftedRun = runDebtValidator(fixtureRoot);
		assert.equal(shiftedRun.exitCode, 0, "ignored source shifts must not create new debt");
		assert.equal(shiftedRun.report.status, "pass");
		assert.deepEqual(shiftedRun.report.newDebt, []);
		assert.deepEqual(shiftedRun.report.resolvedDebt, []);
	} finally {
		rmSync(fixtureRoot, { recursive: true, force: true });
	}
}

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
assertDuplicateOccurrenceContract();
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
const setupScript = environment.match(/\[setup\]\nscript = '''([\s\S]*?)'''/)?.[1];
assert.ok(setupScript, "environment must declare a setup script");
assert.match(
	setupScript,
	/run_node_pm ci/,
	"environment setup must install the reviewed lockfile deterministically",
);
assert.match(
	setupScript,
	/node scripts\/setup-git-hooks\.js/,
	"environment setup must prepare hooks without changing Git revisions",
);
assert.doesNotMatch(
	setupScript,
	/prepare-worktree/,
	"environment setup must not attach or fast-forward the requested checkout",
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
