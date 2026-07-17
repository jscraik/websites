import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestBuffer = await readFile(path.join(ROOT, "src/brand/social-profile-assets.json"));
const tokensBuffer = await readFile(path.join(ROOT, "src/styles/brand-tokens.json"));
const generatorBuffer = await readFile(path.join(ROOT, "scripts/generate-social-profile-assets.mjs"));
const manifest = JSON.parse(manifestBuffer.toString("utf8"));
const tokens = JSON.parse(tokensBuffer.toString("utf8"));
const generator = generatorBuffer.toString("utf8");
const failures = [];
let checks = 0;
let receipt;

try {
  receipt = JSON.parse(await readFile(path.join(ROOT, manifest.generation_receipt), "utf8"));
} catch (error) {
  failures.push(`generation receipt: ${error.message}`);
}

check("contract id", manifest.contract === "jamie-social-profile-assets/v1", "unexpected manifest contract");
check("design-system version", manifest.design_system_version === tokens.system?.version, "manifest and token versions differ");
check("brand promise", manifest.brand_promise === tokens.positioning?.brand_promise, "manifest and canonical promise differ");
check(
  "brand promise line wrapping",
  manifest.brand_promise_lines?.join(" ") === manifest.brand_promise,
  "manifest line wrapping must reconstruct the canonical promise"
);
check("personal role", manifest.role === tokens.positioning?.personal_role, "manifest and canonical role differ");
check(
  "5/7 composition",
  manifest.composition?.grid_columns === 12 &&
    manifest.composition?.editorial_columns === 5 &&
    manifest.composition?.technical_columns === 7,
  "expected the accepted 12-column 5/7 split"
);
check(
  "composition palette matches canonical tokens",
  manifest.composition?.editorial_canvas === tokens.colors?.portfolio_bg &&
    manifest.composition?.technical_canvas === tokens.colors?.brainwav_bg &&
    manifest.composition?.technical_signal === tokens.colors?.blue &&
    manifest.composition?.inspection_signal === tokens.colors?.orange,
  "manifest composition colours must match the canonical token source"
);
check(
  "social-profile token projection",
  socialProfileProjectionMatches(),
  "canonical social_profile projection must exactly reconcile to the owning manifest"
);
check(
  "banner excludes avatar",
  manifest.composition?.banner_rule ===
    "The profile avatar is supplied by the platform and must never be baked into a banner export.",
  "expected the platform-avatar separation rule"
);
check(
  "official font paths are deterministic",
  manifest.typography?.official_font_files?.newsreader === "public/brand/fonts/newsreader-variable.woff2" &&
    manifest.typography?.official_font_files?.geist === "public/brand/fonts/geist-variable.woff2" &&
    manifest.typography?.official_font_files?.geist_mono === "public/brand/fonts/geist-mono-variable.woff2",
  "expected fixed self-host paths for Newsreader, Geist, and Geist Mono"
);
check(
  "generator embeds admitted fonts",
  generator.includes("loadOfficialFonts") && generator.includes("data:font/woff2;base64"),
  "expected the generator to embed official font files when present"
);
check(
  "fallback font routes ignore local official installations",
  manifest.typography?.fallback_stacks?.display === "Georgia, serif" &&
    manifest.typography?.fallback_stacks?.sans === "Arial, sans-serif" &&
    manifest.typography?.fallback_stacks?.mono === "Menlo, monospace" &&
    generator.includes("resolveFontStacks") &&
    generator.includes("embeddedFonts.availability[font]") &&
    generator.includes("manifest.typography.fallback_stacks?.[usage]"),
  "expected rendering stacks to depend only on admitted embedded-font files"
);
check(
  "generator renders manifest promise",
  generator.includes("manifest.brand_promise_lines.map(escapeHtml)") && !generator.includes("<h1>Making AI-assisted"),
  "expected banner copy to render from escaped manifest lines rather than a hardcoded promise"
);
check(
  "generator renders canonical token palette",
  generator.includes("editorial: tokens.colors.portfolio_bg") &&
    generator.includes("technical: tokens.colors.brainwav_bg") &&
    generator.includes("blue: tokens.colors.blue") &&
    generator.includes("orange: tokens.colors.orange") &&
    !/#[0-9A-Fa-f]{6}/.test(generator),
  "expected generated colours to come from canonical tokens rather than hardcoded literals"
);
check(
  "generator keeps avatar out of banner markup",
  !generator.slice(generator.indexOf("function bannerDocument"), generator.indexOf("function neuronSvg")).includes("avatarDataUrl"),
  "bannerDocument must not reference the avatar image"
);

const sourceAvatar = await readPng(manifest.avatar_source);
check("source avatar is square", sourceAvatar.width === sourceAvatar.height, "expected a square source portrait");
check("source avatar is high resolution", sourceAvatar.width >= 1200, "expected a source portrait at least 1200px wide");

for (const [platform, specification] of Object.entries(manifest.platforms)) {
  await checkPng(`${platform} avatar`, specification.avatar.output, specification.avatar.width, specification.avatar.height);
  await checkPng(`${platform} banner`, specification.banner.output, specification.banner.width, specification.banner.height);
  const banner = await readPng(specification.banner.output);
  const split = Math.round(specification.banner.width * (5 / 12));
  check(
    `${platform} banner editorial split pixel`,
    pixelMatches(banner, split - 10, 17, [230, 230, 225, 255]),
    "expected the five-column editorial canvas immediately before the split"
  );
  check(
    `${platform} banner technical split pixel`,
    pixelMatches(banner, split + 10, 17, [11, 15, 23, 255]),
    "expected the seven-column technical canvas immediately after the split"
  );
  await checkPng(
    `${platform} 2x banner master`,
    specification.banner.master_output,
    specification.banner.width * specification.banner.master_scale,
    specification.banner.height * specification.banner.master_scale
  );
  await checkPng(
    `${platform} avatar-aware preview`,
    specification.preview_fixture.output,
    specification.preview_fixture.width,
    specification.preview_fixture.height
  );
}

const expectedSources = await sourceDigests();
check(
  "receipt schema",
  receipt?.schema_version === "jamie-social-profile-assets-receipt/v1" && receipt?.contract === manifest.contract,
  "unexpected or mismatched generation receipt"
);
check(
  "receipt source map",
  JSON.stringify(receipt?.sources) === JSON.stringify(expectedSources),
  "generated receipt does not bind the current manifest, tokens, avatar, renderer, and admitted fonts"
);
check(
  "receipt source digest",
  receipt?.source_digest === sha256(JSON.stringify(expectedSources)),
  "generation receipt source digest is stale"
);

const expectedOutputs = {};
for (const output of outputSpecifications()) {
  expectedOutputs[output.path] = {
    sha256: sha256(await readFile(path.join(ROOT, output.path))),
    width: output.width,
    height: output.height
  };
}
check(
  "receipt output hashes",
  JSON.stringify(receipt?.outputs) === JSON.stringify(sortObject(expectedOutputs)),
  "one or more generated PNGs are stale or were changed after generation"
);

const forbiddenCopy = [
  "Evidence before claims",
  "Trust surfaces",
  "Former Army Leader",
  "OpenAI",
  "Tessl",
  "brainwav.io",
  "jscraik.com"
];
const manifestText = JSON.stringify(manifest);
for (const copy of forbiddenCopy) {
  check(`forbidden banner copy ${copy}`, !manifestText.includes(copy), `manifest contains forbidden social copy: ${copy}`);
}

if (failures.length > 0) {
  console.error(`Social-profile asset validation failed (${failures.length}/${checks} checks):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Social-profile asset validation passed (${checks} checks).`);
console.log(`Typography status: ${manifest.typography.current_rendering_status}.`);

function check(name, passed, detail) {
  checks += 1;
  if (!passed) failures.push(`${name}: ${detail}`);
}

async function checkPng(name, relativePath, expectedWidth, expectedHeight) {
  try {
    const png = await readPng(relativePath);
    check(
      `${name} dimensions`,
      png.width === expectedWidth && png.height === expectedHeight,
      `expected ${expectedWidth}x${expectedHeight}; found ${png.width}x${png.height}`
    );
    check(`${name} has pixels`, png.data.length > expectedWidth * expectedHeight, "PNG has no image payload");
  } catch (error) {
    check(`${name} exists`, false, error.message);
  }
}

async function readPng(relativePath) {
  return PNG.sync.read(await readFile(path.join(ROOT, relativePath)));
}

function pixelMatches(png, x, y, expected) {
  const offset = (png.width * y + x) * 4;
  return expected.every((channel, index) => png.data[offset + index] === channel);
}

function socialProfileProjectionMatches() {
  const projection = tokens.social_profile;
  return (
    projection?.contract === manifest.contract &&
    projection?.source_manifest === "src/brand/social-profile-assets.json" &&
    projection?.avatar_source === manifest.avatar_source &&
    projection?.promise === manifest.brand_promise &&
    projection?.composition?.grid_columns === manifest.composition?.grid_columns &&
    projection?.composition?.editorial_columns === manifest.composition?.editorial_columns &&
    projection?.composition?.technical_columns === manifest.composition?.technical_columns &&
    projection?.banner_rule === manifest.composition?.banner_rule &&
    projection?.platforms?.x?.avatar === `${manifest.platforms?.x?.avatar?.width}x${manifest.platforms?.x?.avatar?.height}` &&
    projection?.platforms?.x?.banner === `${manifest.platforms?.x?.banner?.width}x${manifest.platforms?.x?.banner?.height}` &&
    projection?.platforms?.linkedin?.avatar ===
      `${manifest.platforms?.linkedin?.avatar?.width}x${manifest.platforms?.linkedin?.avatar?.height} minimum` &&
    projection?.platforms?.linkedin?.banner ===
      `${manifest.platforms?.linkedin?.banner?.width}x${manifest.platforms?.linkedin?.banner?.height}`
  );
}

async function sourceDigests() {
  const sources = {
    "scripts/generate-social-profile-assets.mjs": sha256(generatorBuffer),
    "src/brand/social-profile-assets.json": sha256(manifestBuffer),
    "src/styles/brand-tokens.json": sha256(tokensBuffer),
    [manifest.avatar_source]: sha256(await readFile(path.join(ROOT, manifest.avatar_source)))
  };

  for (const relativePath of Object.values(manifest.typography.official_font_files)) {
    try {
      sources[relativePath] = sha256(await readFile(path.join(ROOT, relativePath)));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  return sortObject(sources);
}

function outputSpecifications() {
  return Object.values(manifest.platforms).flatMap((specification) => [
    { path: specification.avatar.output, width: specification.avatar.width, height: specification.avatar.height },
    { path: specification.banner.output, width: specification.banner.width, height: specification.banner.height },
    {
      path: specification.banner.master_output,
      width: specification.banner.width * specification.banner.master_scale,
      height: specification.banner.height * specification.banner.master_scale
    },
    {
      path: specification.preview_fixture.output,
      width: specification.preview_fixture.width,
      height: specification.preview_fixture.height
    }
  ]);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}
