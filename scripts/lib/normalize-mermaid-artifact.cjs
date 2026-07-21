"use strict";

const normalizeMermaidId = (id) => {
	const roleMatch = id.match(/(_(?:create|lookup|result|update|write))$/i);
	const roleSuffix = roleMatch?.[1] ?? "";
	const baseId = roleSuffix ? id.slice(0, -roleSuffix.length) : id;

	return `${baseId
		.replace(/(?:[_-](?:[a-f0-9]{6,}|[0-9]{4,}))+$/i, "")
		.replace(/(?:[_-][0-9]+)+$/i, "")}${roleSuffix}`;
};
const normalizeQuotedPackageLists = (line) =>
	line.replace(/"([^"]*,[^"]*)"/g, (match, value) => {
		if (!/\b(packages?|dependencies|deps|requires|depends on)\b/i.test(line)) {
			return match;
		}
		const items = value.split(",").map((item) => item.trim());
		if (
			items.length < 2 ||
			!items.every((item) => /^[A-Za-z0-9@:/._-]+$/.test(item))
		) {
			return match;
		}
		return `"${[...new Set(items)].sort().join(", ")}"`;
	});

const normalizeMermaidLine = (line) => {
	let value = line.trim();
	if (!value) return "";
	if (/^[+-][A-Za-z0-9_./-]+\.(?:[cm]?[jt]sx?|json|md|ya?ml)$/.test(value)) {
		return "";
	}

	value = value.replace(
		/^class\s+([A-Za-z0-9_:-]+(?:,[A-Za-z0-9_:-]+)*)\s+([A-Za-z0-9_-]+)$/,
		(_, ids, className) =>
			`class ${[...new Set(ids.split(",").map((id) => normalizeMermaidId(id)))]
				.sort()
				.join(",")} ${className}`,
	);
	value = value.replace(
		/^(actor|boundary|collections?|control|database|entity|participant|queue)\s+([A-Za-z0-9_:-]+)(\b.*)?$/,
		(_, declaration, id, rest = "") =>
			`${declaration} ${normalizeMermaidId(id)}${rest}`,
	);
	value = value.replace(
		/^subgraph\s+([A-Za-z0-9_:-]+)(\s*(?:\[[^\]]+\])?)/,
		(_, id, rest) => `subgraph ${normalizeMermaidId(id)}${rest}`,
	);
	value = value.replace(
		/^([A-Za-z0-9_:-]+)(\s*(\[[^\]]+\]|\([^)]*\)|\{[^}]*\}))/,
		(_, id, rest) => `${normalizeMermaidId(id)}${rest}`,
	);
	value = value.replace(
		/^class\s+([A-Za-z0-9_:-]+)\s*\{$/,
		(_, id) => `class ${normalizeMermaidId(id)} {`,
	);
	value = value.replace(
		/\b(style|class|click)\s+([A-Za-z0-9_:-]+)\b/g,
		(_, command, id) => `${command} ${normalizeMermaidId(id)}`,
	);
	value = value.replace(
		/^([A-Za-z0-9_:-]+)(\s*[-.=]+.*)$/,
		(_, id, rest) => `${normalizeMermaidId(id)}${rest}`,
	);
	value = value.replace(
		/([-.=]+>|<[-.=]+)\s*([A-Za-z0-9_:-]+)/g,
		(_, arrow, id) => `${arrow} ${normalizeMermaidId(id)}`,
	);
	value = normalizeQuotedPackageLists(value);
	return value.replace(/\s+/g, " ").trim();
};
const canonicalizeMermaidLines = (lines) => {
	const topLevel = [];
	const blocks = [];
	let currentBlock = null;

	const flushBlock = () => {
		if (!currentBlock) return;
		blocks.push(
			[currentBlock.start, ...currentBlock.body.sort(), currentBlock.end].join(
				"\n",
			),
		);
		currentBlock = null;
	};

	for (const line of lines) {
		const normalizedLine = normalizeMermaidLine(line);
		if (!normalizedLine) continue;

		if (currentBlock) {
			if (normalizedLine === "end" || normalizedLine === "}") {
				currentBlock.end = normalizedLine;
				flushBlock();
			} else {
				currentBlock.body.push(normalizedLine);
			}
			continue;
		}

		if (
			/^subgraph\s+/.test(normalizedLine) ||
			/^class\s+.+\s\{$/.test(normalizedLine)
		) {
			currentBlock = { start: normalizedLine, body: [], end: "end" };
			continue;
		}

		topLevel.push(normalizedLine);
	}

	flushBlock();

	return `${[...topLevel.sort(), ...blocks.sort()].join("\n")}\n`;
};

const normalizeMermaidLines = (lines) => canonicalizeMermaidLines(lines);

const VOLATILE_CONTEXT_SECTIONS = new Set([
  "changed source focus",
  "agent",
  "architecture",
  "c4context",
  "class",
  "events",
  "flow",
  "security",
  "sequence",
  "user",
]);

const classifyContextLine = (line, state) => {
  if (/^Generated: /.test(line)) return { kind: "skip" };
  if (state.inMermaid && line.trim() === "```") return { kind: "mermaid-end" };
  if (state.inMermaid) return { kind: "mermaid-body", line };

  const sectionMatch = line.match(/^##\s+(.+?)\s*$/);
  if (sectionMatch) {
    state.skipSection = VOLATILE_CONTEXT_SECTIONS.has(
      sectionMatch[1].trim().toLowerCase(),
    );
    if (state.skipSection) return { kind: "skip" };
  }
  if (state.skipSection) return { kind: "skip" };
  if (line.trim() === "```") return { kind: "mermaid-start" };
  return { kind: "text", line: line.trimEnd() };
};

const normalizeDiagramContextLines = (lines) => {
  const normalized = [];
  const state = { inMermaid: false, skipSection: false };
  let mermaidLines = [];

  const flushMermaid = () => {
    normalized.push("```");
    normalized.push(
      ...canonicalizeMermaidLines(mermaidLines).trimEnd().split("\n"),
    );
    normalized.push("```");
    mermaidLines = [];
  };

  for (const line of lines) {
    const result = classifyContextLine(line, state);
    if (result.kind === "skip") continue;
    if (result.kind === "mermaid-end") {
      flushMermaid();
      state.inMermaid = false;
      continue;
    }
    if (result.kind === "mermaid-body") {
      mermaidLines.push(result.line);
      continue;
    }
    if (result.kind === "mermaid-start") {
      state.inMermaid = true;
      mermaidLines = [];
      continue;
    }
    normalized.push(result.line);
  }

  if (state.inMermaid) flushMermaid();
  return normalized.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
};

module.exports = {
  normalizeDiagramContextLines,
  normalizeMermaidId,
  normalizeMermaidLine,
  normalizeMermaidLines,
  normalizeQuotedPackageLists,
};
