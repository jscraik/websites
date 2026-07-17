import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_PATH = path.join(ROOT, "docs/implementation-notes/operational-telemetry.json");
const inputIndex = process.argv.indexOf("--file");
const telemetryPath = inputIndex >= 0 && process.argv[inputIndex + 1]
  ? path.resolve(ROOT, process.argv[inputIndex + 1])
  : DEFAULT_PATH;

const allowedCategories = new Set([
  "missing_context",
  "stale_state",
  "weak_validation",
  "hidden_assumptions",
  "retrieval_failure",
  "poor_workflow_design",
  "runtime_ambiguity",
  "architecture_drift",
  "lack_of_verification",
  "weak_observability",
  "missing_guardrails",
  "missing_decomposition",
  "unclear_authority_boundaries",
  "excessive_context_noise",
  "poor_task_routing",
  "insufficient_deterministic_enforcement"
]);

const allowedMechanisms = new Set([
  "validator",
  "schema",
  "trace_event",
  "runtime_check",
  "workflow_rule",
  "recovery_handler",
  "ci_gate",
  "repo_artifact",
  "skill_improvement",
  "context_routing",
  "governance_rule",
  "reusable_primitive"
]);

const requiredCheckpointFields = new Set([
  "activeLane",
  "worktree",
  "branch",
  "headSha",
  "dirtyState",
  "nextAction",
  "dependencyGate",
  "blockers",
  "validationEvidence"
]);
const requiredClaimLanes = new Set(["local", "hosted", "review", "runtime", "release"]);

function fail(message) {
  console.error(`Operational telemetry validation failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

let telemetry;
try {
  telemetry = JSON.parse(await readFile(telemetryPath, "utf8"));
} catch (error) {
  fail(`unable to read ${path.relative(ROOT, telemetryPath)}: ${error.message}`);
}

assert(telemetry.schemaVersion === "portfolio-operational-telemetry/v1", "unexpected schema version");
assert(telemetry.status === "active", "telemetry contract must be active");
assert(telemetry.purpose?.length > 20, "purpose must explain the operational outcome");

const contract = telemetry.operatingContract;
assert(contract?.continuationCheckpointRequired === true, "continuation checkpoint requirement is disabled");
assert(contract.validationExecution === "serial", "validation must be serial unless generated output isolation is separately implemented");
assert(contract.dependencyRule?.length > 20, "dependency rule is missing");
assert(
  Array.isArray(contract.claimLanes)
    && contract.claimLanes.length === requiredClaimLanes.size
    && new Set(contract.claimLanes).size === contract.claimLanes.length
    && [...requiredClaimLanes].every((lane) => contract.claimLanes.includes(lane)),
  "claim lanes must preserve each evidence boundary"
);
assert(Array.isArray(contract.checkpointFields), "checkpointFields must be an array");
assert([...requiredCheckpointFields].every((field) => contract.checkpointFields.includes(field)), "continuation checkpoint is missing a required state field");

assert(Array.isArray(telemetry.signals) && telemetry.signals.length > 0, "at least one feedback signal is required");
const ids = new Set();
for (const signal of telemetry.signals) {
  assert(signal && typeof signal.id === "string" && signal.id.length > 0, "every signal needs an id");
  assert(!ids.has(signal.id), `duplicate signal id: ${signal.id}`);
  ids.add(signal.id);
  assert(signal.feedback?.length > 20, `${signal.id}: feedback signal is too short`);
  assert(signal.rootFailure?.length > 20, `${signal.id}: root operational failure is missing`);
  assert(Array.isArray(signal.categories) && signal.categories.length > 0, `${signal.id}: failure category is missing`);
  assert(signal.categories.every((category) => allowedCategories.has(category)), `${signal.id}: unknown failure category`);
  assert(allowedMechanisms.has(signal.mechanism), `${signal.id}: unknown durable mechanism`);
  assert(signal.status === "implemented" || signal.status === "proposed", `${signal.id}: status must be implemented or proposed`);
  assert(signal.durableImprovement?.artifact && signal.durableImprovement.validator && signal.durableImprovement.gate, `${signal.id}: durable improvement is incomplete`);
  assert(signal.durableImprovement.prevention?.length > 20, `${signal.id}: prevention behavior is missing`);
  assert(signal.proof?.command && signal.proof.expectedBehavior?.length > 20, `${signal.id}: proof contract is incomplete`);
  if (signal.proof.outcome === "blocked_runtime") {
    assert(signal.proof.blockedReason?.length > 20, `${signal.id}: blocked_runtime proof needs an exact blocker reason`);
  }
  if (signal.status === "proposed") {
    assert(signal.durableImprovement.followUp?.length > 20, `${signal.id}: proposed improvement needs an explicit follow-up`);
  }
}

const durableText = JSON.stringify(telemetry);
assert(!/(?:\/Users\/|\/private\/tmp\/|file:\/\/)/.test(durableText), "durable telemetry must not contain machine-specific absolute paths");

console.log(`Operational telemetry validation passed: ${telemetry.signals.length} signals, serial validation, and continuation checkpoint contract enforced.`);
