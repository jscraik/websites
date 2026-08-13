export function extractStartLinkRecords(source) {
  return extractObjectBlocks(source)
    .map(parseDirectProperties)
    .filter(({ primary }) => primary === true)
    .filter(({ href, label }) => typeof href === "string" && typeof label === "string")
    .map(({ href, label }) => ({ href, label }));
}

export function hasPrimarySkillsBarLink(source) {
  return extractStartLinkRecords(source).some(
    ({ href, label }) => href === "/demos/skillsbar/" && label === "Start with SkillsBar"
  );
}

function extractObjectBlocks(source) {
  const blocks = [];
  const starts = [];
  let quote = null;
  let escaped = false;
  let depth = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "{") {
      starts.push(index);
      depth += 1;
      continue;
    }
    if (character === "}") {
      const start = starts.pop();
      if (start !== undefined) blocks.push(source.slice(start, index + 1));
      depth = Math.max(0, depth - 1);
    }
  }

  return blocks;
}

function parseDirectProperties(block) {
  const properties = {};
  let quote = null;
  let escaped = false;
  let depth = 0;

  for (let index = 0; index < block.length; index += 1) {
    const character = block[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "{") {
      depth += 1;
      continue;
    }
    if (character === "}") {
      depth -= 1;
      continue;
    }
    if (depth !== 1) continue;

    const match = block.slice(index).match(/^(href|label|primary)\s*:\s*/);
    if (!match) continue;
    const key = match[1];
    index += match[0].length - 1;
    if (key === "primary") {
      if (block.slice(index + 1).startsWith("true")) properties.primary = true;
      continue;
    }
    const value = block.slice(index + 1).match(/^["']([^"']*)["']/)?.[1];
    if (value !== undefined) properties[key] = value;
  }

  return properties;
}
