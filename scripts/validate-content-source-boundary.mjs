import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const failures = [];

const packageJsonPath = "package.json";
let packageJson;
try {
  packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
} catch (error) {
  console.error(`Content source-boundary validation failed: ${packageJsonPath} could not be parsed (${error.message}).`);
  process.exit(1);
}
const boundaryDocPath = "docs/implementation-notes/content-source-boundary.md";
const boundaryDoc = existsSync(boundaryDocPath) ? readFileSync(boundaryDocPath, "utf8") : "";
const readmePath = "README.md";
const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";

const requiredPackageScript = "node scripts/validate-content-source-boundary.mjs";
if (!packageJson.scripts?.["validate:content-source-boundary"]?.includes(requiredPackageScript)) {
  failures.push(
    packageJsonPath + ": validate:content-source-boundary must invoke " + requiredPackageScript + "."
  );
}

const requiredDocStatements = [
  "The portfolio content source of truth is the repository",
  "Do not add a database, hosted CMS, or remote content API for portfolio content",
  "Astro Content Collections are the preferred next storage model",
  "The current owned model is Astro Content Collections",
  "A database requires an architecture decision record before implementation"
];

if (!boundaryDoc) {
  failures.push(boundaryDocPath + ": missing content source boundary documentation.");
} else {
  for (const statement of requiredDocStatements) {
    if (!boundaryDoc.includes(statement)) {
      failures.push(boundaryDocPath + ": missing required boundary statement: " + statement + ".");
    }
  }
}

const requiredReadmeStatements = [
  "portfolio content collections under src/content/",
  "src/content.config.ts",
  "src/content/work/",
  "src/content/blog/",
  "src/content/proof/",
  "npm run validate:portfolio-content",
  "npm run validate:content-source-boundary"
];

if (!readme) {
  failures.push(readmePath + ": missing project README.");
} else {
  for (const statement of requiredReadmeStatements) {
    if (!readme.includes(statement)) {
      failures.push(readmePath + ": missing current content-source statement: " + statement + ".");
    }
  }

  if (readme.includes("src/data/work.ts")) {
    failures.push(readmePath + ": must not document src/data/work.ts as the portfolio content source.");
  }
}

const dependencyBuckets = {
  dependencies: packageJson.dependencies ?? {},
  devDependencies: packageJson.devDependencies ?? {},
  optionalDependencies: packageJson.optionalDependencies ?? {}
};

const forbiddenDependencyPatterns = [
  /^@prisma\//,
  /^prisma$/,
  /^@supabase\//,
  /^supabase$/,
  /^mongodb$/,
  /^mongoose$/,
  /^pg$/,
  /^postgres$/,
  /^mysql2?$/,
  /^better-sqlite3$/,
  /^sqlite3$/,
  /^@libsql\//,
  /^drizzle-orm$/,
  /^knex$/,
  /^typeorm$/,
  /^sequelize$/,
  /^@sanity\//,
  /^sanity$/,
  /^contentful$/,
  /^@contentful\//,
  /^airtable$/,
  /^@notionhq\/client$/,
  /^firebase$/,
  /^@firebase\//
];

for (const [bucketName, deps] of Object.entries(dependencyBuckets)) {
  for (const depName of Object.keys(deps)) {
    if (forbiddenDependencyPatterns.some((pattern) => pattern.test(depName))) {
      failures.push(
        packageJsonPath + ": " + bucketName + " includes database/CMS dependency '" + depName + "'. Portfolio content must stay repo-file-backed unless an ADR changes the boundary."
      );
    }
  }
}

const sourceRoots = ["src", "astro.config.mjs"].filter((path) => existsSync(path));
const allowedTextFiles = new Set(["src/content/README.md"]);
const importStart = String.raw`(?:from\s+|require\(\s*|import\(\s*)`;

function forbiddenImportPattern(specifier) {
  return new RegExp(importStart + "[\"']" + specifier + "[\"']", "g");
}

const forbiddenSourcePatterns = [
  { pattern: forbiddenImportPattern("@prisma\\/client"), label: "@prisma/client import" },
  { pattern: forbiddenImportPattern("@supabase\\/supabase-js"), label: "@supabase/supabase-js import" },
  { pattern: forbiddenImportPattern("mongodb"), label: "mongodb import" },
  { pattern: forbiddenImportPattern("pg"), label: "pg import" },
  { pattern: forbiddenImportPattern("better-sqlite3"), label: "better-sqlite3 import" },
  { pattern: forbiddenImportPattern("drizzle-orm"), label: "drizzle-orm import" },
  { pattern: new RegExp(importStart + "[\"']@sanity\\/", "g"), label: "Sanity import" },
  { pattern: forbiddenImportPattern("contentful"), label: "Contentful import" },
  { pattern: forbiddenImportPattern("airtable"), label: "Airtable import" },
  { pattern: forbiddenImportPattern("@notionhq\\/client"), label: "Notion client import" },
  {
    pattern: /process\.env\.(DATABASE_URL|POSTGRES_URL|SUPABASE_URL|SANITY_PROJECT_ID|CONTENTFUL_SPACE_ID|AIRTABLE_API_KEY|NOTION_TOKEN)/g,
    label: "database/CMS environment contract"
  },
  {
    pattern: /import\.meta\.env\.(DATABASE_URL|PUBLIC_SUPABASE_URL|SANITY_PROJECT_ID|CONTENTFUL_SPACE_ID|AIRTABLE_API_KEY|NOTION_TOKEN)/g,
    label: "database/CMS environment contract"
  }
];

function listFiles(path) {
  const entry = statSync(path);
  if (entry.isFile()) {
    return [path];
  }

  const files = [];
  for (const child of readdirSync(path)) {
    if (child === ".DS_Store") {
      continue;
    }

    const childPath = join(path, child);
    const childEntry = statSync(childPath);
    if (childEntry.isDirectory()) {
      files.push(...listFiles(childPath));
    } else {
      files.push(childPath);
    }
  }

  return files;
}

const textExtensions = new Set([".astro", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json", ".md", ".mdx"]);
for (const root of sourceRoots) {
  for (const file of listFiles(root)) {
    const normalized = relative(process.cwd(), file);
    if (allowedTextFiles.has(normalized)) {
      continue;
    }

    const extension = normalized.includes(".") ? normalized.slice(normalized.lastIndexOf(".")) : "";
    if (!textExtensions.has(extension)) {
      continue;
    }

    const content = readFileSync(file, "utf8");
    for (const check of forbiddenSourcePatterns) {
      check.pattern.lastIndex = 0;
      const matches = [...content.matchAll(check.pattern)];
      for (const match of matches) {
        const line = content.slice(0, match.index).split("\n").length;
        failures.push(
          normalized + ":" + line + ": forbidden " + check.label + ". Portfolio content must stay repo-file-backed unless an ADR changes the boundary."
        );
      }
    }
  }
}

const requiredFileBackedSurfaces = [
  "src/content.config.ts",
  "src/content/work",
  "src/content/blog",
  "src/content/proof",
  "src/pages/work/[slug].astro",
  "src/pages/blog/index.astro"
];

for (const file of requiredFileBackedSurfaces) {
  if (!existsSync(file)) {
    failures.push(file + ": missing file-backed portfolio content surface.");
  }
}

if (failures.length > 0) {
  console.error("Content source-boundary validation failed:");
  for (const failure of failures) {
    console.error("- " + failure);
  }
  process.exit(1);
}

console.log("Content source-boundary validation passed: portfolio content remains repo-file-backed.");
