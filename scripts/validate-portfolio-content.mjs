import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const failures = [];

const collectionDirs = {
  work: "src/content/work",
  blog: "src/content/blog",
  proof: "src/content/proof"
};

for (const [name, dir] of Object.entries(collectionDirs)) {
  if (!existsSync(dir)) {
    failures.push(dir + ": missing " + name + " content collection directory.");
    continue;
  }

  const files = readdirSync(dir).filter((file) => file.endsWith(".md")).sort();
  if (files.length === 0) {
    failures.push(dir + ": collection must contain at least one markdown entry.");
  }
}

function readFrontmatter(file) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch (error) {
    failures.push(file + ": could not be read (" + error.message + ").");
    return "";
  }

  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    failures.push(file + ": missing YAML frontmatter block.");
    return "";
  }
  return match[1];
}

function requirePattern(file, frontmatter, pattern, label) {
  if (!pattern.test(frontmatter)) {
    failures.push(file + ": missing required " + label + ".");
  }
}

function stringValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp("^" + key + ":\\s+(?:\\\"([^\\\"]+)\\\"|'([^']+)'|([^#\\n]+))", "m"));
  return (match?.[1] ?? match?.[2] ?? match?.[3])?.trim();
}

function scalarValue(frontmatter, key) {
  return stringValue(frontmatter, key);
}

function requirePublicationState(file, frontmatter) {
  const state = scalarValue(frontmatter, "publicationState");
  if (!["draft", "unlisted", "published"].includes(state)) {
    failures.push(file + ": publicationState must be draft, unlisted, or published.");
  }
}

function contentFiles(dir) {
  return readdirSync(dir).filter((file) => file.endsWith(".md")).sort();
}

function requireUniqueOrders(collectionName, entries) {
  const seen = new Map();
  for (const entry of entries) {
    const order = scalarValue(entry.frontmatter, "order");
    if (!order) {
      continue;
    }

    if (seen.has(order)) {
      failures.push(entry.file + ": duplicate " + collectionName + " order " + order + " also used by " + seen.get(order) + ".");
      continue;
    }

    seen.set(order, entry.file);
  }
}

function localHrefToPath(href) {
  if (!href?.startsWith("/")) {
    return undefined;
  }

  if (href === "/") {
    return "src/pages/index.astro";
  }

  const cleanHref = href.replace(/\/$/, "");
  const candidate = "src/pages" + cleanHref + ".astro";
  if (existsSync(candidate)) {
    return candidate;
  }

  const workMatch = cleanHref.match(/^\/work\/([^/]+)$/);
  if (workMatch && existsSync("src/pages/work/[slug].astro")) {
    return join(collectionDirs.work, workMatch[1] + ".md");
  }

  return "src/pages" + cleanHref + "/index.astro";
}

const workEntries = [];
for (const fileName of contentFiles(collectionDirs.work)) {
  const file = join(collectionDirs.work, fileName);
  const frontmatter = readFrontmatter(file);
  workEntries.push({ file, frontmatter });
  requirePublicationState(file, frontmatter);
  const workSlug = fileName.replace(/\.md$/, "");
  const workHrefPath = localHrefToPath("/work/" + workSlug + "/");
  if (!workHrefPath || !existsSync(workHrefPath)) {
    failures.push(file + ": generated work href /work/" + workSlug + "/ does not resolve to collection content.");
  }

  for (const key of ["title", "shortTitle", "subtitle", "date", "order", "publicationState", "overview", "organization", "work", "role", "tone"]) {
    requirePattern(file, frontmatter, new RegExp("^" + key + ":", "m"), key);
  }

  requirePattern(file, frontmatter, /^tags:\n(?:\s+-\s+.+\n?)+/m, "tags list");
  requirePattern(file, frontmatter, /^featured:\n\s+eyebrow:\s+/m, "featured eyebrow");
  requirePattern(file, frontmatter, /^\s+quote:\s+/m, "featured quote");
  requirePattern(file, frontmatter, /^\s+previewTitle:\s+/m, "featured preview title");
  requirePattern(file, frontmatter, /^proof:\n\s+claim:\s+/m, "proof claim");
  requirePattern(file, frontmatter, /^\s+evidence:\s+/m, "proof evidence");
  requirePattern(file, frontmatter, /^\s+caveat:\s+/m, "proof caveat");
  requirePattern(file, frontmatter, /^frames:\n(?:\s+-\s+\[.+\]\n?)+/m, "proof frames");

  const directHref = stringValue(frontmatter, "href");
  const directPath = localHrefToPath(directHref);
  if (directPath && !existsSync(directPath)) {
    failures.push(file + ": href " + directHref + " does not resolve to " + directPath + ".");
  }
}

requireUniqueOrders("work", workEntries);
if (!workEntries.some((entry) => scalarValue(entry.frontmatter, "isFeatured") === "true")) {
  failures.push(collectionDirs.work + ": collection must include at least one featured work entry.");
}

const firstPublishedFeatured = workEntries
  .filter((entry) => scalarValue(entry.frontmatter, "publicationState") === "published")
  .filter((entry) => scalarValue(entry.frontmatter, "isFeatured") === "true")
  .sort((a, b) => Number(scalarValue(a.frontmatter, "order")) - Number(scalarValue(b.frontmatter, "order")))[0];
if (!firstPublishedFeatured?.file.endsWith("/skillsbar.md")) {
  failures.push(collectionDirs.work + ": SkillsBar must be the first published featured work entry.");
}

const skillsBarEntry = workEntries.find((entry) => entry.file.endsWith("/skillsbar.md"));
if (skillsBarEntry) {
  requirePattern(skillsBarEntry.file, skillsBarEntry.frontmatter, /^caseStudy:\n\s+problem:\n\s+title:\s+/m, "flagship case-study problem");
  requirePattern(skillsBarEntry.file, skillsBarEntry.frontmatter, /^\s+roleBoundary:\n\s+jamie:\s+/m, "flagship Jamie role boundary");
  requirePattern(skillsBarEntry.file, skillsBarEntry.frontmatter, /^\s+links:\n(?:\s+-\s+label:\s+.+\n?)+/m, "flagship evidence links");
  const primaryEvidenceLinks = skillsBarEntry.frontmatter.match(/^\s+primary:\s+true$/gm) ?? [];
  if (primaryEvidenceLinks.length !== 1) {
    failures.push(skillsBarEntry.file + ": flagship case study must contain exactly one primary evidence link.");
  }
}

const blogEntries = [];
for (const fileName of contentFiles(collectionDirs.blog)) {
  const file = join(collectionDirs.blog, fileName);
  const frontmatter = readFrontmatter(file);
  blogEntries.push({ file, frontmatter });
  requirePublicationState(file, frontmatter);
  for (const key of ["title", "date", "order", "publicationState", "category", "summary", "proofLink", "featured"]) {
    requirePattern(file, frontmatter, new RegExp("^" + key + ":", "m"), key);
  }

  requirePattern(file, frontmatter, /^proof:\n\s+claim:\s+/m, "proof claim");
  requirePattern(file, frontmatter, /^\s+evidence:\s+/m, "proof evidence");
  requirePattern(file, frontmatter, /^\s+caveat:\s+/m, "proof caveat");

  const state = scalarValue(frontmatter, "publicationState");
  const href = stringValue(frontmatter, "href");
  if (state === "draft" && href) {
    failures.push(file + ": draft entries must not advertise an unbuilt href.");
  }
  if (state !== "draft" && !href) {
    failures.push(file + ": published and unlisted entries require href.");
  }
  const hrefPath = localHrefToPath(href);
  if (hrefPath && !existsSync(hrefPath)) {
    failures.push(file + ": href " + href + " does not resolve to " + hrefPath + ".");
  }

  const proofLink = stringValue(frontmatter, "proofLink");
  const proofPath = localHrefToPath(proofLink);
  if (proofPath && !existsSync(proofPath)) {
    failures.push(file + ": proofLink " + proofLink + " does not resolve to " + proofPath + ".");
  }
}

requireUniqueOrders("blog", blogEntries);
const publishedFeaturedBlogEntries = blogEntries
  .filter((entry) => scalarValue(entry.frontmatter, "publicationState") === "published")
  .filter((entry) => scalarValue(entry.frontmatter, "featured") === "true");
if (publishedFeaturedBlogEntries.length !== 1) {
  failures.push(collectionDirs.blog + ": collection must include exactly one published featured blog entry.");
}

const proofEntries = [];
for (const fileName of contentFiles(collectionDirs.proof)) {
  const file = join(collectionDirs.proof, fileName);
  const frontmatter = readFrontmatter(file);
  proofEntries.push({ file, frontmatter });
  requirePublicationState(file, frontmatter);
  for (const key of ["title", "status", "order", "publicationState", "href", "claim", "evidence", "caveat", "nextState"]) {
    requirePattern(file, frontmatter, new RegExp("^" + key + ":", "m"), key);
  }

  const href = stringValue(frontmatter, "href");
  const path = localHrefToPath(href);
  if (path && !existsSync(path)) {
    failures.push(file + ": href " + href + " does not resolve to " + path + ".");
  }
}

requireUniqueOrders("proof", proofEntries);

if (existsSync("src/data/work.ts")) {
  failures.push("src/data/work.ts: central work data array should not be reintroduced; use src/content/work/*.md.");
}

if (!existsSync("src/content.config.ts")) {
  failures.push("src/content.config.ts: missing Astro content collection schema.");
} else {
  const schema = readFileSync("src/content.config.ts", "utf8");
  const requiredSchemaPatterns = [
    { pattern: /const\s+work\s*=\s*defineCollection/, label: "work collection" },
    { pattern: /const\s+blog\s*=\s*defineCollection/, label: "blog collection" },
    { pattern: /const\s+proof\s*=\s*defineCollection/, label: "proof collection" },
    { pattern: /glob\(\s*\{\s*pattern:\s*["']\*\*\/\*\.md["']/, label: "markdown glob loader" },
    { pattern: /proof:\s*z\.object/, label: "proof schema object" },
    { pattern: /caseStudy:\s*caseStudySchema\.optional\(\)/, label: "optional case-study schema" }
  ];
  for (const check of requiredSchemaPatterns) {
    if (!check.pattern.test(schema)) {
      failures.push("src/content.config.ts: missing schema marker " + check.label + ".");
    }
  }
}

if (failures.length > 0) {
  console.error("Portfolio content validation failed:");
  for (const failure of failures) {
    console.error("- " + failure);
  }
  process.exit(1);
}

console.log("Portfolio content validation passed: collections include required proof metadata and local links.");
