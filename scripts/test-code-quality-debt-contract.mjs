import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) =>
	readFileSync(path.join(repoRoot, relativePath), "utf8");

const debtValidator = read("scripts/check-code-quality-debt.mjs");
const environment = read(".codex/environments/environment.toml");
const environmentCheck = read("scripts/check-environment.sh");
const packageJson = JSON.parse(read("package.json"));
const harnessContract = JSON.parse(read("harness.contract.json"));
const debtValidatorPath = path.join(repoRoot, "scripts/check-code-quality-debt.mjs");

function createFixtureRoot(prefix) {
	const candidates = [
		tmpdir(),
		process.env.RUNNER_TEMP,
		path.join(repoRoot, ".playwright-tmp"),
	].filter(Boolean);
	for (const candidate of [...new Set(candidates)]) {
		try {
			mkdirSync(candidate, { recursive: true });
			return mkdtempSync(path.join(candidate, prefix));
		} catch {
			// CI images can expose a non-writable TMPDIR; try the next owned root.
		}
	}
	throw new Error(`Unable to create a writable fixture directory for ${prefix}`);
}

function fixtureEnvironment(overrides = {}) {
	return {
		...Object.fromEntries(
			Object.entries(process.env).filter(
				([name]) =>
					name !== "HARNESS_CODE_QUALITY_DEBT_BASELINE" &&
					!name.startsWith("GIT_"),
			),
		),
		...overrides,
	};
}

function runDebtValidator(cwd) {
	const result = spawnSync(process.execPath, [debtValidatorPath, "--json"], {
		cwd,
		encoding: "utf8",
		env: fixtureEnvironment(),
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
	const fixtureRoot = createFixtureRoot("portfolio-debt-contract-");
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
		"const firstFixtureTail = true;",
	].join("\n");
	const secondSource = [
		"const secondFixturePrefix = true;",
		repeatedBlock,
		"const secondFixtureDivider = true;",
		repeatedBlock,
		"const secondFixtureTail = true;",
	].join("\n");
	const replacementBlock = Array.from(
		{ length: 24 },
		(_, index) => `const replacementFixtureLine${index} = ${index};`,
	).join("\n");
	const replacementFirstSource = [
		"const firstFixturePrefix = true;",
		replacementBlock,
		"const firstFixtureDivider = true;",
		repeatedBlock,
		"const firstFixtureTail = true;",
		"const replacementFixtureDivider = true;",
		repeatedBlock,
		"const replacementFixtureTail = true;",
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
			env: fixtureEnvironment(),
		});
		assert.equal(initialized.status, 0, initialized.stderr);

		const firstRun = runDebtValidator(fixtureRoot);
		assert.equal(firstRun.exitCode, 1, "unbaselined duplicates must fail the gate");
		const duplicateEntries = firstRun.report.newDebt.filter(
			(entry) => entry.category === "duplicate_block",
		);
		assert.equal(duplicateEntries.length, 4, "every cross-file occurrence pair must be reported");
		assert.equal(new Set(duplicateEntries.map((entry) => entry.id)).size, 4,
			"duplicate IDs must distinguish each stable occurrence pair");
		assert.ok(duplicateEntries.every((entry) =>
			entry.id.startsWith(`duplicate_block:src/first.ts:${expectedFingerprint}:`) &&
			entry.id.includes("src/second.ts"),
		), "duplicate IDs must bind the two reported source paths");
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

		const previousOverride = process.env.HARNESS_CODE_QUALITY_DEBT_BASELINE;
		process.env.HARNESS_CODE_QUALITY_DEBT_BASELINE = path.join(
			repoRoot,
			"contracts/code-quality-debt-baseline.json",
		);
		try {
			const overrideRun = runDebtValidator(fixtureRoot);
			assert.equal(overrideRun.exitCode, 0, "fixture validation must ignore inherited baseline overrides");
			assert.equal(overrideRun.report.status, "pass");
		} finally {
			if (previousOverride === undefined) {
				delete process.env.HARNESS_CODE_QUALITY_DEBT_BASELINE;
			} else {
				process.env.HARNESS_CODE_QUALITY_DEBT_BASELINE = previousOverride;
			}
		}

		writeFileSync(path.join(fixtureRoot, "src/first.ts"), replacementFirstSource);
		const replacementRun = runDebtValidator(fixtureRoot);
		assert.equal(replacementRun.exitCode, 1, "replacing a copy must create new debt");
		assert.equal(replacementRun.report.newDebt.filter((entry) => entry.category === "duplicate_block").length, 2);
		assert.equal(replacementRun.report.resolvedDebt.filter((entry) => entry.category === "duplicate_block").length, 2);
	} finally {
		rmSync(fixtureRoot, { recursive: true, force: true });
	}
}

function assertEnvironmentSetupContract() {
	const setupScript = environment.match(/\[setup\]\nscript = '''([\s\S]*?)'''/)?.[1];
	assert.ok(setupScript, "environment must declare a setup script");
	assert.match(setupScript, /run_node_pm ci/);
	assert.match(setupScript, /mise install cargo:prek/);
	assert.match(setupScript, /node scripts\/setup-git-hooks\.js/);
	assert.doesNotMatch(setupScript, /prepare-worktree/);
	assert.match(setupScript, /UV_CACHE_DIR=.*\$\{TMPDIR:-\/tmp\}\/codex-uv-cache-/);
	assert.doesNotMatch(setupScript, /UV_CACHE_DIR=.*\/private\/tmp\/codex-uv-cache-/);

	// Validate the full environment file beyond just the setup script
	const uvCacheDirMatches = environment.match(/UV_CACHE_DIR=[^\n]*/g) || [];
	assert.ok(uvCacheDirMatches.length > 0, "environment must contain UV_CACHE_DIR assignments");
	for (const match of uvCacheDirMatches) {
		assert.match(match, /UV_CACHE_DIR=.*\$\{TMPDIR:-\/tmp\}\/codex-uv-cache-/,
			`every UV_CACHE_DIR assignment must use the TMPDIR fallback pattern: ${match}`);
	}
	assert.doesNotMatch(environment, /\/private\/tmp\/codex-uv-cache-/,
		"environment must not contain any /private/tmp/codex-uv-cache- occurrence");

	const fixtureRoot = createFixtureRoot("portfolio-environment-contract-");
	const binDirectory = path.join(fixtureRoot, "bin");
	const logPath = path.join(fixtureRoot, "setup.log");
	const writeExecutable = (name, content) => {
		const target = path.join(binDirectory, name);
		writeFileSync(target, content);
		chmodSync(target, 0o755);
	};

	try {
		mkdirSync(binDirectory, { recursive: true });
		mkdirSync(path.join(fixtureRoot, "scripts"), { recursive: true });
		mkdirSync(path.join(fixtureRoot, "tmp"), { recursive: true });
		writeFileSync(path.join(fixtureRoot, ".mise.toml"), "[tools]\n");
		writeExecutable("mise", "#!/usr/bin/env bash\nprintf 'mise %s\\n' \"$*\" >> \"$SETUP_LOG\"\nif [ \"$1\" = activate ]; then printf ':\\n'; fi\n");
		writeExecutable("npm", "#!/usr/bin/env bash\nprintf 'npm %s\\n' \"$*\" >> \"$SETUP_LOG\"\n");
		writeExecutable("node", "#!/usr/bin/env bash\nprintf 'node %s\\n' \"$*\" >> \"$SETUP_LOG\"\n");
		for (const command of ["git", "rg", "jq", "fd"]) {
			writeExecutable(command, "#!/usr/bin/env bash\nexit 0\n");
		}
		const scriptPath = path.join(fixtureRoot, "setup.sh");
		writeFileSync(
			scriptPath,
			`#!/usr/bin/env bash\n${setupScript.replace(/^export PATH=.*$/gm, 'export PATH="$CONTRACT_BIN:/usr/bin:/bin"')}`,
		);
		chmodSync(scriptPath, 0o755);
		const setup = spawnSync("bash", [scriptPath], {
			cwd: fixtureRoot,
			encoding: "utf8",
			env: { ...process.env, HOME: fixtureRoot, PATH: `${binDirectory}:${process.env.PATH}`, CONTRACT_BIN: binDirectory, SETUP_LOG: logPath, TMPDIR: path.join(fixtureRoot, "tmp") },
		});
		assert.equal(setup.status, 0, setup.stderr);
		const commands = readFileSync(logPath, "utf8").trim().split("\n");
		assert.ok(commands.includes("npm ci"));
		assert.ok(commands.indexOf("mise install cargo:prek") < commands.indexOf("node scripts/setup-git-hooks.js"));
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
assertEnvironmentSetupContract();
const uvCacheAssignments = [...environment.matchAll(/UV_CACHE_DIR=.*$/gm)].map(
	([assignment]) => assignment,
);
assert.ok(uvCacheAssignments.length > 0, "environment actions must declare a UV cache");
assert.ok(
	uvCacheAssignments.every((assignment) =>
		assignment.includes("${TMPDIR:-/tmp}/codex-uv-cache-"),
	),
	"every environment UV cache must use the portable TMPDIR fallback",
);
assert.doesNotMatch(
	environment,
	/\/private\/tmp\/codex-uv-cache-/,
	"environment actions must not use a private temporary cache path",
);
assert.ok(
	harnessContract.toolingPolicy.requiredBinaries.includes("gitleaks"),
	"harness required binaries must include the security scanner",
);
assert.match(
	environmentCheck,
	/required_tooling_doc_terms=.*"gitleaks"/,
	"environment documentation checks must include the security scanner",
);
assert.equal(
	harnessContract.toolingPolicy.requiredBinaries.includes("beautiful-mermaid"),
	false,
	"harness required binaries must not require the package without a standalone CLI",
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
assert.doesNotMatch(
	environment,
	/name = "Beautiful Mermaid"|command -v beautiful-mermaid|beautiful-mermaid --help/,
	"the Codex environment must not advertise a dead Beautiful Mermaid CLI action",
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
