/** Extract literal primary-link metadata while ignoring comments and unrelated objects. */
export function extractStartLinkRecords(source) {
  return extractObjectBlocks(stripJavaScriptComments(source))
    .map(parseDirectProperties)
    .filter(({ primary }) => primary === true)
    .filter(({ href, title, label }) => typeof href === "string" && typeof title === "string" && typeof label === "string")
    .map(({ href, title, label }) => ({ href, title, label }));
}

/** Check that one primary link binds the SkillsProof demo route, title, and supporting label. */
export function hasPrimarySkillsProofLink(source) {
  return extractStartLinkRecords(source).some(
    ({ href, title, label }) => href === "/demos/skillsbar/" && title === "Try SkillsProof" && label === "Explore the interactive demo"
  );
}

/** Replace comments with whitespace while preserving quoted strings and source offsets. */
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

/** Collect brace-delimited object blocks without treating quoted braces as structure. */
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

/** Read supported literal properties only at the direct object depth and name boundary. */
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

    const match = block.slice(index - 1).match(/^[\s,{](href|title|label|primary)\s*:\s*/);
    if (!match) continue;
    const key = match[1];
    index += match[0].length - 2;
    if (key === "primary") {
      if (/^true\s*(?=[,}])/.test(block.slice(index + 1))) properties.primary = true;
      continue;
    }
    const value = block.slice(index + 1).match(/^["']([^"']*)["']/)?.[1];
    if (value !== undefined) properties[key] = value;
  }

  return properties;
}
