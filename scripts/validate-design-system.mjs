import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), "utf8");

const checks = [];
const addCheck = (name, passed, detail) => {
  checks.push({ name, passed, detail });
};

const tokensCss = read("src/styles/brand-tokens.css");
const tokensJson = JSON.parse(read("src/styles/brand-tokens.json"));
const globalCss = read("src/styles/global.css");
const blogPage = read("src/pages/blog/index.astro");

const requiredTokens = {
  "--bds-color-brainwav-bg": "#0b0f17",
  "--bds-color-brainwav-surface": "#141a23",
  "--bds-color-brainwav-surface-elevated": "#1b2230",
  "--bds-color-brainwav-text": "#f8f8f6",
  "--bds-color-brainwav-text-secondary": "#c5cad3",
  "--bds-color-brainwav-muted": "#8b93a4",
  "--bds-color-blue": "#2da8ff",
  "--bds-color-orange": "#ff7a00",
  "--bds-space-1": "8px",
  "--bds-space-2": "16px",
  "--bds-space-3": "24px",
  "--bds-space-4": "32px",
  "--bds-space-5": "48px",
  "--bds-space-6": "64px",
  "--bds-space-7": "96px",
  "--bds-space-8": "128px",
  "--bds-radius-card": "18px",
  "--bds-radius-button": "14px",
  "--bds-radius-image": "20px",
  "--bds-radius-pill": "999px",
  "--bds-icon-stroke": "1.75"
};

for (const [token, value] of Object.entries(requiredTokens)) {
  addCheck(
    `token ${token}`,
    tokensCss.includes(`${token}: ${value};`),
    `expected ${token}: ${value}; in src/styles/brand-tokens.css`
  );
}

addCheck(
  "token json names design system",
  tokensJson.system?.name === "brAInwav Design System",
  "expected brand-tokens.json system.name to be brAInwav Design System"
);

addCheck(
  "global imports token layer",
  globalCss.startsWith('@import "./brand-tokens.css";'),
  "expected global.css to import brand-tokens.css first"
);

const requiredGlobalSnippets = [
  "--color-brand-blue: var(--bds-color-blue);",
  "--color-brand-orange: var(--bds-color-orange);",
  "--space-1: var(--bds-space-1);",
  "--radius-card: var(--bds-radius-card);",
  "--radius-button: var(--bds-radius-button);",
  "--radius-image: var(--bds-radius-image);",
  "--icon-stroke: var(--bds-icon-stroke);",
  "/* Design system enforcement layer.",
  "stroke-width: var(--icon-stroke);",
  "border-radius: var(--radius-card);",
  "border-radius: var(--radius-button);",
  "border-radius: var(--radius-image);",
  "font-family: var(--body-serif);",
  "font-family: var(--body-sans);",
  "font-family: var(--body-mono);"
];

for (const snippet of requiredGlobalSnippets) {
  addCheck(
    `global snippet ${snippet.slice(0, 40)}`,
    globalCss.includes(snippet),
    `expected global.css to contain ${snippet}`
  );
}

const forbiddenGlobalSnippets = [
  "Blog reference pass",
  "Blog page final cascade guard",
  "Blog screenshot repair",
  "Blog page reference pass",
  "Static Jose parity audit layer",
  "--color-brand-blue: #2f80ff",
  "--color-brand-orange: #ff7a1a",
  "--color-surface-dark: #263129",
  "--color-surface-dark-2: #172219"
];

for (const snippet of forbiddenGlobalSnippets) {
  addCheck(
    `forbidden snippet ${snippet}`,
    !globalCss.includes(snippet),
    `did not expect global.css to contain ${snippet}`
  );
}

const requiredBlogSnippets = [
  "font-family: var(--body-serif);",
  "font-family: var(--body-sans);",
  "font-family: var(--body-mono);",
  "width: min(1100px, calc(100% - var(--space-6)));",
  "border-radius: var(--radius-pill);",
  "border-radius: var(--radius-image);",
  "border-top: 1px solid var(--border-subtle);"
];

for (const snippet of requiredBlogSnippets) {
  addCheck(
    `blog snippet ${snippet.slice(0, 40)}`,
    blogPage.includes(snippet),
    `expected blog page scoped styles to contain ${snippet}`
  );
}

const pageFiles = fs
  .readdirSync(path.join(repoRoot, "src/pages"), { recursive: true })
  .filter((file) => file.endsWith(".astro"))
  .map((file) => path.join("src/pages", file));

for (const file of pageFiles) {
  const source = read(file);
  addCheck(
    `${file} uses BaseLayout`,
    source.includes("<BaseLayout"),
    "expected every page to render inside BaseLayout so global design-system CSS applies"
  );
}

const failed = checks.filter((check) => !check.passed);

if (failed.length > 0) {
  console.error("Design system validation failed:");
  for (const failure of failed) {
    console.error(`- ${failure.name}: ${failure.detail}`);
  }
  process.exit(1);
}

console.log(`Design system validation passed: ${checks.length} checks.`);
