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
const PLACEHOLDER_VALUE_PATTERNS = [
  /^n\.a\.\s+because\s+reason[.!]?$/i,
  /^Prototype\s*\/\s*Portfolio\s*\/\s*Product\s*\/\s*Harness\s*\/\s*n\.a\.\s+because\s+reason$/i,
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripHtmlComments(content) {
  return content.replace(/<!--[\s\S]*?-->/g, "");
}

function sectionBody(visibleContent, heading) {
  const headingPattern = new RegExp(`^${escapeRegExp(heading)}[ \\t]*$`, "im");
  const match = headingPattern.exec(visibleContent);
  if (!match) return null;
  const start = match.index + match[0].length;
  const nextHeading = visibleContent.slice(start).search(/^##? /m);
  return visibleContent.slice(start, nextHeading < 0 ? visibleContent.length : start + nextHeading);
}

function hasField(section, label) {
  return new RegExp(`^- ${escapeRegExp(label)}:`, "m").test(section);
}

function fieldValue(section, label) {
  const match = section.match(new RegExp(`^- ${escapeRegExp(label)}:[ \\t]*(.*)$`, "m"));
  return match?.[1]?.trim() ?? null;
}

function collectRequiredSectionErrors(content, surface) {
  const errors = [];
  const visibleContent = stripHtmlComments(content);
  const positions = REQUIRED_SECTIONS.map((section) =>
    visibleContent.search(new RegExp(`^${escapeRegExp(section)}[ \\t]*$`, "im")),
  );

  if (positions.every((position) => position >= 0)) {
    for (let index = 1; index < positions.length; index += 1) {
      if (positions[index] <= positions[index - 1]) {
        errors.push(`${surface} required sections must remain in the declared order.`);
        break;
      }
    }
  }

  for (const section of REQUIRED_SECTIONS) {
    const body = sectionBody(visibleContent, section);
    if (body === null) {
      errors.push(`${surface} is missing required section: ${section}`);
      continue;
    }
    for (const field of REQUIRED_FIELDS.get(section) ?? []) {
      if (!hasField(body, field)) errors.push(`${surface} section ${section} is missing field: ${field}`);
    }
  }

  return errors;
}

/** Return actionable contract violations for the repository PR template. */
export function collectPrTemplateContractErrors(content) {
  const errors = [];
  const visibleContent = stripHtmlComments(content);
  if (!visibleContent.startsWith("# Pull request")) errors.push("PR template must start with '# Pull request'.");
  if (!/Write for maintainers\./.test(visibleContent)) errors.push("PR template must address maintainers.");
  if (!/Use `n\.a\.` with a reason/.test(visibleContent)) errors.push("PR template must define the n.a. reason convention.");

  errors.push(...collectRequiredSectionErrors(content, "PR template"));

  for (const section of RETIRED_SECTIONS) {
    if (new RegExp(`^${escapeRegExp(section)}[ \\t]*$`, "m").test(visibleContent)) {
      errors.push(`PR template must not retain retired section: ${section}`);
    }
  }

  if (!/`jscraik\/<linear-key>-<short-description>`/.test(visibleContent)) {
    errors.push("PR template must use the Linear-linked branch policy.");
  }
  if (!STANDALONE_REMEDIATION_POLICY.test(visibleContent)) {
    errors.push("PR template must document the standalone remediation branch exception.");
  }
  if (/jscraik\/feature\/\*/.test(visibleContent)) {
    errors.push("PR template must not retain the retired agent branch prefix.");
  }

  const checklist = sectionBody(visibleContent, "## Checklist") ?? "";
  for (const marker of ["**(Pending)** CodeRabbit", "**(Pending)** An independent reviewer", "**(Pending)** Codex"]) {
    if (!checklist.includes(marker)) errors.push(`PR template checklist is missing status marker: ${marker}`);
  }
  if (!/I ran the required validation for the changed surfaces/.test(checklist)) {
    errors.push("PR template checklist must require recorded validation outcomes.");
  }
  if (!/Merge is blocked until all required checks pass\./.test(checklist)) {
    errors.push("PR template checklist must keep merge blocked until required checks pass.");
  }

  const validation = sectionBody(visibleContent, "## Validation") ?? "";
  if (!/- Command: `bash scripts\/validate-codestyle\.sh` -> pass/.test(validation)) {
    errors.push("PR template validation guidance must show codestyle command evidence.");
  }
  if (!/- Command: `npm run check` -> blocked \(reason\)/.test(validation)) {
    errors.push("PR template validation guidance must show blocked command evidence with a reason.");
  }
  if (!/\| Artifact \| Durable reference \| Schema \/ version \| Producer command \| Digest \| Replay command \| Authority \|/.test(visibleContent)) {
    errors.push("PR template must retain the durable evidence map columns.");
  }

  return errors;
}

/** Return actionable contract violations for a completed PR body. */
export function collectPrBodyContractErrors(content, template) {
  const errors = collectRequiredSectionErrors(content, "PR body");
  const visibleContent = stripHtmlComments(content);
  const visibleTemplate = stripHtmlComments(template);

  if (!visibleContent.startsWith("# Pull request")) errors.push("PR body must start with '# Pull request'.");

  const headings = [...visibleContent.matchAll(/^## .+$/gm)].map((match) => match[0]);
  if (headings.length !== REQUIRED_SECTIONS.length || headings.some((heading, index) => heading !== REQUIRED_SECTIONS[index])) {
    errors.push("PR body must use exactly the repository template sections in the declared order.");
  }

  for (const [section, fields] of REQUIRED_FIELDS) {
    const body = sectionBody(visibleContent, section);
    if (body === null) continue;
    for (const field of fields) {
      const value = fieldValue(body, field);
      if (value === "") errors.push(`PR body field ${section} / ${field} must not be empty.`);
      if (value !== null && /^n\.a\.$/i.test(value)) {
        errors.push(`PR body field ${section} / ${field} must give a concrete reason after n.a.`);
      }
      if (value !== null && PLACEHOLDER_VALUE_PATTERNS.some((pattern) => pattern.test(value))) {
        errors.push(`PR body field ${section} / ${field} must replace the template placeholder.`);
      }
    }
  }

  const checklistItems = (value) =>
    (sectionBody(value, "## Checklist") ?? "")
      .split("\n")
      .filter((line) => /^- \[[ xX]\] /.test(line))
      .map((line) => line.replace(/^- \[[ xX]\] /, ""));
  if (JSON.stringify(checklistItems(visibleContent)) !== JSON.stringify(checklistItems(visibleTemplate))) {
    errors.push("PR body checklist items must exactly match the repository template.");
  }

  const validation = sectionBody(visibleContent, "## Validation") ?? "";
  if (!/^- Command: `[^`]+` -> (?:pass|fail|blocked)(?: \([^\n]+\))?$/m.test(validation)) {
    errors.push("PR body validation must include an exact command with a pass, fail, or blocked outcome.");
  }

  return errors;
}

export { REQUIRED_FIELDS, REQUIRED_SECTIONS };
