export function extractStartLinkRecords(source) {
  return extractObjectBlocks(stripJavaScriptComments(source))
    .map(parseDirectProperties)
    .filter(({ primary }) => primary === true)
    .filter(({ href, label }) => typeof href === "string" && typeof label === "string")
    .map(({ href, label }) => ({ href, label }));
}

/** Check that one primary link binds the SkillsBar demo route to its supporting label. */
export function hasPrimarySkillsBarLink(source) {
  return extractStartLinkRecords(source).some(
    ({ href, label }) => href === "/demos/skillsbar/" && label === "Explore the interactive demo"
  );
}

function stripJavaScriptComments(source) {
  let output = "";
  let quote = null;
  let escaped = false;
  let index = 0;

  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];
    if (quote) {
      output += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      output += character;
      index += 1;
      continue;
    }
    if (character === "/" && next === "/") {
      output += "  ";
      index += 2;
      while (index < source.length && source[index] !== "\n") {
        output += " ";
        index += 1;
      }
      continue;
    }
    if (character === "/" && next === "*") {
      output += "  ";
      index += 2;
      while (index < source.length && !(source[index] === "*" && source[index + 1] === "/")) {
        output += source[index] === "\n" ? "\n" : " ";
        index += 1;
      }
      if (index < source.length) {
        output += "  ";
        index += 2;
      }
      continue;
    }
    output += character;
    index += 1;
  }

  return output;
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
      if (/^true\s*(?=[,}])/.test(block.slice(index + 1))) properties.primary = true;
      continue;
    }
    const value = block.slice(index + 1).match(/^["']([^"']*)["']/)?.[1];
    if (value !== undefined) properties[key] = value;
  }

  return properties;
}
