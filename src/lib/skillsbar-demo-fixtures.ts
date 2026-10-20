/** Initial security evidence shared by server markup and the client-only demo. */
export const securityStageStates = ["Passed", "Passed", "Review required", "Held", "Unproven", "Unproven", "Unproven", "Unproven", "Unproven"] as const;

/** Render the same non-colour evidence symbol before and after enhancement. */
export function stageSymbol(state: string): string {
  return state === "Passed" ? "✓" : state === "Review required" ? "!" : state === "Held" ? "Ⅱ" : "−";
}
