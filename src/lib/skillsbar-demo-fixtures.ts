/** Gate names shared by server markup and the client-only demo. */
export const stageNames = ["Identity", "Validation", "Security", "Eval prep", "Local eval", "Cloud eval", "Staging", "Publication", "Runtime"] as const;

/** Initial security selection shared by server markup and the client-only demo. */
export const securityNextStage = 2;

/** Initial security summary shared by server markup and the client-only demo. */
export const securitySummary = "2 passed · 1 needs review · 6 awaiting proof";

/** Initial security evidence shared by server markup and the client-only demo. */
export const securityStageStates = ["Passed", "Passed", "Review required", "Held", "Unproven", "Unproven", "Unproven", "Unproven", "Unproven"] as const;

/** Render the same non-colour evidence symbol before and after enhancement. */
export function stageSymbol(state: string): string {
  return state === "Passed" ? "✓" : state === "Review required" ? "!" : state === "Held" ? "Ⅱ" : "−";
}
