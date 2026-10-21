/** Canonical lifecycle labels and descriptions for server and client examples. */
export const stages = [
  ["Identity", "The exact source package is known and bound to its package ID, source revision and content digest, with provenance and ownership recorded."],
  ["Validation", "The plugin and its skills meet the applicable structural, metadata, resource, reference and presentation requirements."],
  ["Security", "Applicable security and permission checks have acceptable evidence, with no unresolved risk blocking evaluation or release."],
  ["Eval prep", "Scenarios, assertions, scoring criteria and scorer calibration are ready; comparison settings and budgets are frozen."],
  ["Local eval", "Baseline and candidate have been compared under matched local conditions, and any accepted winner is selected and frozen."],
  ["Cloud eval", "Cloud refinement has been compared against the accepted local winner under matched cloud conditions, with a recorded selection decision."],
  ["Staging", "The selected release archive, required resources, presentation, recovery plan and registry preparation are verified, including the final scoped security check."],
  ["Publication", "The authorised, exact checked version has been published to the selected registry and verified by readback."],
  ["Runtime", "That version has been installed and its discovery, activation and behaviour verified, with rollback evidence where applicable."],
];

/** Shared ordered names for the interactive inspector. */
export const stageNames = stages.map(([name]) => name);

/** Next required gate and summary of the initial synthetic security example. */
export const securityNextStage = 2;
export const securitySummary = "2 passed · 1 needs review · 6 awaiting proof";

/** Initial security evidence shared by server markup and the client-only demo. */
export const securityStageStates = ["Passed", "Passed", "Review required", "Held", "Unproven", "Unproven", "Unproven", "Unproven", "Unproven"] as const;

/** Render the same non-colour evidence symbol before and after enhancement. */
export function stageSymbol(state: string): string {
  return state === "Passed" ? "✓" : state === "Review required" ? "!" : state === "Held" ? "Ⅱ" : "−";
}
