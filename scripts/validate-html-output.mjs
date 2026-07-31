import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const distRoot = path.join(repoRoot, "dist");
const failures = [];

if (!fs.existsSync(distRoot)) {
  console.error("HTML output validation failed: dist/ is missing. Run ASTRO_TELEMETRY_DISABLED=1 npm run build first.");
  process.exit(1);
}

const htmlFiles = listFiles(distRoot).filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const relativePath = path.relative(repoRoot, file);
  const html = fs.readFileSync(file, "utf8");
  validateHtml(relativePath, html);
}

if (failures.length > 0) {
  console.error("HTML output validation failed:");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}

console.log("HTML output validation passed: " + htmlFiles.length + " built HTML files checked.");

function listFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    if (entry.isFile()) return [fullPath];
    return [];
  });
}

function validateHtml(file, html) {
  const ids = new Map();
  const headings = [];
  const hashLinks = [];
  const mainTags = [...html.matchAll(/<main\b/gi)];
  const bodyText = stripTags(html).replace(/\s+/g, " ").trim();

  if (bodyText.length < 120) fail(file, 1, "page body is nearly blank after stripping markup.");

  for (const match of html.matchAll(/<([a-z][\w:-]*)\b([^>]*)>/gi)) {
    const tag = match[1].toLowerCase();
    const attrs = parseAttrs(match[2]);
    const line = lineForIndex(html, match.index);

    if (attrs.id) {
      if (ids.has(attrs.id)) {
        fail(file, line, "duplicate id \"" + attrs.id + "\"; first seen on line " + ids.get(attrs.id) + ".");
      } else {
        ids.set(attrs.id, line);
      }
    }

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag.slice(1));
      const text = elementTextAt(html, match.index, tag);
      headings.push({ level, line, text });
      if (text.length === 0) fail(file, line, tag + " is empty.");
    }

    if (tag === "a") {
      const text = elementTextAt(html, match.index, tag);
      if (!attrs.href) fail(file, line, "anchor is missing href.");
      if (attrs.href === "#" || /^javascript:/i.test(attrs.href)) fail(file, line, "anchor href must be a real route, hash target, or external URL.");
      if (attrs.href?.startsWith("#")) hashLinks.push({ href: attrs.href, line });
      if (attrs.target === "_blank" && !/\bnoopener\b/.test(attrs.rel ?? "")) {
        fail(file, line, "external/new-tab anchor must include rel=\"noopener noreferrer\".");
      }
      if (text.length === 0 && !attrs["aria-label"]) fail(file, line, "anchor has no accessible text or aria-label.");
    }

    if (tag === "button") {
      const text = elementTextAt(html, match.index, tag);
      if (!attrs.type) fail(file, line, "button is missing explicit type.");
      if (text.length === 0 && !attrs["aria-label"]) fail(file, line, "button has no accessible text or aria-label.");
    }

    if (tag === "img") {
      if (!("alt" in attrs)) fail(file, line, "image is missing alt text.");
      if (/^(image|photo|picture|graphic|icon)$/i.test(attrs.alt ?? "")) fail(file, line, "image has generic alt text.");
      if (!attrs.width || !attrs.height) fail(file, line, "image is missing width or height.");
      if (isBelowFoldPortrait(file, html, match.index, attrs)) {
        if (attrs.loading !== "lazy") fail(file, line, "below-fold portrait must use loading=\"lazy\".");
        if (attrs.decoding !== "async") fail(file, line, "below-fold portrait must use decoding=\"async\".");
      }
    }

    if (attrs["aria-labelledby"]) {
      for (const id of attrs["aria-labelledby"].split(/\s+/).filter(Boolean)) {
        if (!html.includes('id="' + id + '"') && !html.includes("id='" + id + "'")) {
          fail(file, line, "aria-labelledby points to missing id \"" + id + "\".");
        }
      }
    }
  }

  if (mainTags.length !== 1) fail(file, 1, "expected exactly one main landmark, found " + mainTags.length + ".");
  if (headings.filter((heading) => heading.level === 1).length !== 1) fail(file, 1, "expected exactly one h1 in built output.");

  let previous = null;
  for (const heading of headings) {
    if (previous !== null && heading.level > previous + 1) fail(file, heading.line, "heading hierarchy jumps from h" + previous + " to h" + heading.level + ".");
    previous = heading.level;
  }

  for (const link of hashLinks) {
    const id = decodeURIComponent(link.href.slice(1));
    if (id.length > 0 && !ids.has(id)) fail(file, link.line, "hash link targets missing id \"" + id + "\".");
  }
}

function isBelowFoldPortrait(file, html, index, attrs) {
  const isBlogAuthor = file === "dist/blog/index.html" && attrs.src === "/jamie-profile-640.webp";
  const footerStart = html.lastIndexOf("<footer", index);
  const footerEnd = html.lastIndexOf("</footer>", index);
  const isFooterPortrait = footerStart > footerEnd && attrs.src === "/jamie-profile-96.webp";
  return isBlogAuthor || isFooterPortrait;
}

function parseAttrs(source) {
  const attrs = {};
  for (const match of source.matchAll(/([:@\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g)) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function elementTextAt(html, start, tag) {
  const close = new RegExp("</" + tag + "\\s*>", "i").exec(html.slice(start));
  if (!close) return "";
  return stripTags(html.slice(start, start + close.index)).replace(/\s+/g, " ").trim();
}

function stripTags(value) {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");
}

function lineForIndex(source, index) {
  return source.slice(0, index).split("\n").length;
}

function fail(file, line, message) {
  failures.push(file + ":" + line + ": " + message);
}
