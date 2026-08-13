const REQUIRED_SECTIONS = [
  "## Summary",
  "## Release boundary",
  "## Behavior proof",
  "## Change details",
  "## Checklist",
  "## Validation",
  "## Review and closeout",
];

const REQUIRED_FIELDS = new Map([
  ["## Summary", ["Problem", "Change", "Why this approach", "Intended outcome", "Out of scope", "Reviewer focus", "Risk and rollback"]],
  ["## Release boundary", ["Release mode", "Completion condition", "Deferred work", "Stronger-proof condition"]],
  ["## Behavior proof", ["Before", "After", "Environment or operator path", "Verification steps", "Evidence after fix", "Untested paths and limitations"]],
  ["## Change details", ["Plan IDs", "Linear reference", "Linked issue relationship", "Completed work", "Affected surfaces", "Documentation impact", "SemVer impact", "Acceptance trace", "Runtime impact", "Deferred work", "Validation evidence", "Review artifacts", "Pattern scope inventory", "Meta-behavior proof", "Repeated-error research", "Durable evidence map", "Learning / reinforcement"]],
  ["## Validation", ["Regression coverage", "Untested or blocked paths"]],
  ["## Review and closeout", ["CodeRabbit", "Independent reviewer evidence", "Codex", "CodeRabbit Semgrep", "User-facing impact", "Remaining findings or waivers", "Current blockers"]],
]);

const RETIRED_SECTIONS = [
  "## What Problem This Solves",
  "## Release Boundary",
  "## Why This Change Was Made",
  "## Work performed",
  "## Testing",
  "## Review artifacts",
  "## Notes",
];

const STANDALONE_REMEDIATION_POLICY =
  /standalone review-remediation PRs may use\s+`jscraik\/<short-description>`\s+when the body records a concrete Linear `n\/a` reason/i;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sectionBody(content, heading) {
  const headingPattern = new RegExp(`^${escapeRegExp(heading)}[ \\t]*$`, "im");
  const match = headingPattern.exec(content);
  if (!match) return null;
  const start = match.index + match[0].length;
  const nextHeading = content.slice(start).search(/^##? /m);
  return content.slice(start, nextHeading < 0 ? content.length : start + nextHeading);
}

function hasField(section, label) {
  return new RegExp(`^- ${escapeRegExp(label)}:`, "m").test(section);
}

/** Return actionable contract violations for the repository PR template. */
export function collectPrTemplateContractErrors(content) {
  const errors = [];
  if (!content.startsWith("# Pull request")) errors.push("PR template must start with '# Pull request'.");
  if (!/Write for maintainers\./.test(content)) errors.push("PR template must address maintainers.");
  if (!/Use `n\.a\.` with a reason/.test(content)) errors.push("PR template must define the n.a. reason convention.");

  for (const section of REQUIRED_SECTIONS) {
    const body = sectionBody(content, section);
    if (body === null) {
      errors.push(`PR template is missing required section: ${section}`);
      continue;
    }
    for (const field of REQUIRED_FIELDS.get(section) ?? []) {
      if (!hasField(body, field)) errors.push(`PR template section ${section} is missing field: ${field}`);
    }
  }

  for (const section of RETIRED_SECTIONS) {
    if (new RegExp(`^${escapeRegExp(section)}[ \\t]*$`, "m").test(content)) {
      errors.push(`PR template must not retain retired section: ${section}`);
    }
  }

  if (!/`jscraik\/<linear-key>-<short-description>`/.test(content)) {
    errors.push("PR template must use the Linear-linked branch policy.");
  }
  if (!STANDALONE_REMEDIATION_POLICY.test(content)) {
    errors.push("PR template must document the standalone remediation branch exception.");
  }
  if (/jscraik\/feature\/\*/.test(content)) {
    errors.push("PR template must not retain the retired agent branch prefix.");
  }

  const checklist = sectionBody(content, "## Checklist") ?? "";
  for (const marker of ["**(Pending)** CodeRabbit", "**(Pending)** An independent reviewer", "**(Pending)** Codex"]) {
    if (!checklist.includes(marker)) errors.push(`PR template checklist is missing status marker: ${marker}`);
  }
  if (!/I ran the required validation for the changed surfaces/.test(checklist)) {
    errors.push("PR template checklist must require recorded validation outcomes.");
  }
  if (!/Merge is blocked until all required checks pass\./.test(checklist)) {
    errors.push("PR template checklist must keep merge blocked until required checks pass.");
  }

  const validation = sectionBody(content, "## Validation") ?? "";
  if (!/- Command: `bash scripts\/validate-codestyle\.sh` -> pass/.test(validation)) {
    errors.push("PR template validation guidance must show codestyle command evidence.");
  }
  if (!/- Command: `npm run check` -> blocked \(reason\)/.test(validation)) {
    errors.push("PR template validation guidance must show blocked command evidence with a reason.");
  }
  if (!/\| Artifact \| Durable reference \| Schema \/ version \| Producer command \| Digest \| Replay command \| Authority \|/.test(content)) {
    errors.push("PR template must retain the durable evidence map columns.");
  }

  return errors;
}

export { REQUIRED_FIELDS, REQUIRED_SECTIONS };
