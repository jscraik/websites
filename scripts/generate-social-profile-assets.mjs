import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GENERATOR_PATH = fileURLToPath(import.meta.url);
const MANIFEST_PATH = path.join(ROOT, "src/brand/social-profile-assets.json");
const TOKENS_PATH = path.join(ROOT, "src/styles/brand-tokens.json");
const manifestBuffer = await readFile(MANIFEST_PATH);
const tokensBuffer = await readFile(TOKENS_PATH);
const generatorBuffer = await readFile(GENERATOR_PATH);
const manifest = JSON.parse(manifestBuffer.toString("utf8"));
const tokens = JSON.parse(tokensBuffer.toString("utf8"));
const avatarBuffer = await readFile(path.join(ROOT, manifest.avatar_source));
const avatarDataUrl = `data:image/png;base64,${avatarBuffer.toString("base64")}`;
const embeddedFonts = await loadOfficialFonts();
const renderingStacks = resolveFontStacks();
const palette = {
  editorial: tokens.colors.portfolio_bg,
  editorialSurface: tokens.colors.portfolio_surface,
  editorialInk: tokens.colors.portfolio_ink,
  editorialText: tokens.colors.portfolio_text,
  editorialMuted: tokens.colors.portfolio_muted,
  technical: tokens.colors.brainwav_bg,
  technicalText: tokens.colors.brainwav_text,
  technicalMuted: tokens.colors.brainwav_muted,
  blue: tokens.colors.blue,
  blueHover: tokens.colors.blue_hover,
  blueInk: tokens.colors.blue_ink,
  orange: tokens.colors.orange
};

assertContract();

const browser = await chromium.launch({ headless: true });

try {
  for (const [platform, specification] of Object.entries(manifest.platforms)) {
    await renderAvatar(specification.avatar);
    await renderBanner(platform, specification.banner, 1, specification.banner.output);
    await renderBanner(
      platform,
      specification.banner,
      specification.banner.master_scale,
      specification.banner.master_output
    );
  }

  for (const [platform, specification] of Object.entries(manifest.platforms)) {
    await renderPreview(platform, specification);
  }

  await writeGenerationReceipt();
  console.log(`Generated ${Object.keys(manifest.platforms).length * 4} social-profile assets.`);
  console.log(`Generation receipt: ${manifest.generation_receipt}.`);
  console.log(`Typography source: ${JSON.stringify({ embedded: embeddedFonts.availability, stacks: renderingStacks })}`);
  if (!Object.values(embeddedFonts.availability).every(Boolean)) {
    console.log(`Typography status: ${manifest.typography.current_rendering_status}.`);
  }
} finally {
  await browser.close();
}

function assertContract() {
  const failures = [];
  if (manifest.contract !== "jamie-social-profile-assets/v1") failures.push("unexpected social-profile contract");
  if (manifest.design_system_version !== tokens.system?.version) failures.push("design-system version mismatch");
  if (manifest.brand_promise !== tokens.positioning?.brand_promise) failures.push("brand-promise mismatch");
  if (manifest.brand_promise_lines?.join(" ") !== manifest.brand_promise) failures.push("brand-promise line mismatch");
  if (manifest.role !== tokens.positioning?.personal_role) failures.push("personal-role mismatch");
  if (manifest.composition?.grid_columns !== 12) failures.push("expected a 12-column grid");
  if (manifest.composition?.editorial_columns !== 5 || manifest.composition?.technical_columns !== 7) {
    failures.push("expected the accepted 5/7 composition");
  }
  if (manifest.composition?.editorial_canvas !== palette.editorial) failures.push("editorial-canvas token mismatch");
  if (manifest.composition?.technical_canvas !== palette.technical) failures.push("technical-canvas token mismatch");
  if (manifest.composition?.technical_signal !== palette.blue) failures.push("technical-signal token mismatch");
  if (manifest.composition?.inspection_signal !== palette.orange) failures.push("inspection-signal token mismatch");
  if (!socialProfileProjectionMatches()) failures.push("social-profile token projection mismatch");
  if (failures.length > 0) throw new Error(`Social-profile manifest is invalid: ${failures.join("; ")}`);
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

async function renderAvatar(specification) {
  const outputPath = path.join(ROOT, specification.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await renderPage({
    width: specification.width,
    height: specification.height,
    scale: 1,
    outputPath,
    html: documentShell(`
      <main class="avatar-export" aria-label="Jamie Scott Craik profile portrait">
        <img src="${avatarDataUrl}" alt="" />
      </main>
    `, `
      .avatar-export { width: 100%; height: 100%; overflow: hidden; background: ${palette.technical}; }
      .avatar-export img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; }
    `)
  });
}

async function renderBanner(platform, specification, scale, relativeOutputPath) {
  const outputPath = path.join(ROOT, relativeOutputPath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await renderPage({
    width: specification.width,
    height: specification.height,
    scale,
    outputPath,
    html: bannerDocument(platform, specification.width, specification.height)
  });
}

async function renderPreview(platform, specification) {
  const preview = specification.preview_fixture;
  const bannerBuffer = await readFile(path.join(ROOT, specification.banner.output));
  const bannerDataUrl = `data:image/png;base64,${bannerBuffer.toString("base64")}`;
  const outputPath = path.join(ROOT, preview.output);
  const bannerHeight = specification.banner.height;
  const identityLeft = preview.avatar_left + preview.avatar_size + 32;
  const identityTop = Math.min(bannerHeight + 44, preview.avatar_top + preview.avatar_size - 72);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await renderPage({
    width: preview.width,
    height: preview.height,
    scale: 1,
    outputPath,
    html: documentShell(`
      <main class="preview ${platform}">
        <img class="banner" src="${bannerDataUrl}" alt="" />
        <section class="identity" aria-label="Profile identity preview">
          <img class="portrait" src="${avatarDataUrl}" alt="" />
          <div class="identity-copy">
            <strong>Jamie Scott Craik</strong>
            <span>${escapeHtml(manifest.role)}</span>
          </div>
        </section>
        <p class="fixture-label">AVATAR-OVERLAP PREVIEW · NOT A PLATFORM CAPTURE</p>
      </main>
    `, `
      .preview {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: ${palette.editorialSurface};
        color: ${palette.editorialInk};
      }
      .banner { display: block; width: 100%; height: ${bannerHeight}px; object-fit: cover; }
      .portrait {
        position: absolute;
        left: ${preview.avatar_left}px;
        top: ${preview.avatar_top}px;
        width: ${preview.avatar_size}px;
        height: ${preview.avatar_size}px;
        border: 8px solid ${palette.editorialSurface};
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 0 20px 48px ${withAlpha(palette.technical, 0.16)};
      }
      .identity-copy {
        position: absolute;
        left: ${identityLeft}px;
        top: ${identityTop}px;
        display: grid;
        gap: 8px;
      }
      .identity-copy strong {
        font: 600 30px/1.1 var(--font-sans);
        letter-spacing: -0.02em;
      }
      .identity-copy span { font: 400 17px/1.35 var(--font-sans); color: ${palette.editorialMuted}; }
      .fixture-label {
        position: absolute;
        right: 40px;
        bottom: 28px;
        margin: 0;
        font: 600 11px/1 var(--font-mono);
        letter-spacing: 0.09em;
        color: ${palette.editorialMuted};
      }
    `)
  });
}

function bannerDocument(platform, width, height) {
  const split = width * (5 / 12);
  const margin = platform === "x" ? 64 : 52;
  const technicalLeft = split + (platform === "x" ? 72 : 68);
  const headlineSize = platform === "x" ? 61 : 51;
  const nameSize = platform === "x" ? 29 : 25;
  const roleSize = platform === "x" ? 15 : 13;
  const wordmarkSize = platform === "x" ? 18 : 16;

  return documentShell(`
    <main class="banner-export ${platform}" aria-label="Jamie Scott Craik ${platform} profile banner">
      <div class="editorial-zone">
        <span class="identity-kicker">JAMIE SCOTT CRAIK</span>
        <strong class="identity-name">Jamie<br />Scott Craik</strong>
        <span class="identity-rule" aria-hidden="true"></span>
        <span class="identity-role">${escapeHtml(manifest.role)}</span>
      </div>
      <div class="technical-zone">
        <span class="promise-kicker">PERSONAL BRAND PROMISE</span>
        <h1>${manifest.brand_promise_lines.map(escapeHtml).join("<br />")}</h1>
        <div class="wordmark" aria-label="brAInwav"><span>br</span><b>AI</b><span>nwav</span></div>
      </div>
      ${neuronSvg(width, height, split)}
    </main>
  `, `
    .banner-export {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: linear-gradient(90deg, ${palette.editorial} 0 ${formatNumber(split)}px, ${palette.technical} ${formatNumber(split)}px 100%);
      isolation: isolate;
    }
    .banner-export::after {
      position: absolute;
      inset: 0 0 0 ${formatNumber(split)}px;
      z-index: 0;
      content: "";
      opacity: 0.18;
      background-image:
        linear-gradient(${withAlpha(palette.technicalText, 0.08)} 1px, transparent 1px),
        linear-gradient(90deg, ${withAlpha(palette.technicalText, 0.08)} 1px, transparent 1px);
      background-size: ${formatNumber(width / 24)}px ${formatNumber(height / 8)}px;
      mask-image: linear-gradient(90deg, transparent, #000 24%, #000 100%);
    }
    .editorial-zone,
    .technical-zone { position: absolute; z-index: 2; }
    .editorial-zone {
      inset: ${margin}px auto auto ${margin}px;
      width: ${formatNumber(split - margin * 2)}px;
      color: ${palette.editorialInk};
    }
    .identity-kicker,
    .promise-kicker {
      display: block;
      font: 600 ${platform === "x" ? 11 : 10}px/1 var(--font-mono);
      letter-spacing: 0.11em;
    }
    .identity-kicker { color: ${palette.blueInk}; }
    .identity-name {
      display: block;
      margin-top: ${platform === "x" ? 24 : 18}px;
      font: 600 ${nameSize}px/0.98 var(--font-sans);
      letter-spacing: -0.035em;
    }
    .identity-rule {
      display: block;
      width: ${platform === "x" ? 48 : 40}px;
      height: 2px;
      margin-top: ${platform === "x" ? 24 : 18}px;
      background: ${palette.blue};
    }
    .identity-role {
      display: block;
      margin-top: ${platform === "x" ? 14 : 11}px;
      font: 500 ${roleSize}px/1.25 var(--font-sans);
      color: ${palette.editorialText};
    }
    .technical-zone {
      inset: ${margin}px ${margin}px auto ${formatNumber(technicalLeft)}px;
      color: ${palette.technicalText};
    }
    .promise-kicker { color: ${palette.technicalMuted}; }
    h1 {
      max-width: ${formatNumber(width - technicalLeft - margin)}px;
      margin: ${platform === "x" ? 24 : 18}px 0 0;
      font: 300 ${headlineSize}px/0.94 var(--font-display);
      letter-spacing: -0.032em;
    }
    .wordmark {
      position: fixed;
      right: ${margin}px;
      bottom: ${platform === "x" ? 40 : 30}px;
      display: flex;
      font: 600 ${wordmarkSize}px/1 var(--font-sans);
      letter-spacing: -0.025em;
      color: ${palette.technicalText};
    }
    .wordmark b { color: ${palette.orange}; font: inherit; }
    .neuron { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; }
  `);
}

function neuronSvg(width, height, split) {
  const nodeX = split + width * 0.17;
  const nodeY = height * 0.69;
  const orangeX = width * 0.83;
  const orangeY = height * 0.73;
  const path = (d, opacity = 0.9, strokeWidth = 2) =>
    `<path d="${d}" fill="none" stroke="${palette.blue}" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="${opacity}" />`;

  return `<svg class="neuron" viewBox="0 0 ${width} ${height}" aria-hidden="true">
    <defs>
      <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <radialGradient id="nodeFill" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="${palette.blueHover}" stop-opacity="0.92" />
        <stop offset="1" stop-color="${palette.blue}" stop-opacity="0.08" />
      </radialGradient>
    </defs>
    <g filter="url(#blueGlow)" opacity="0.22">
      <circle cx="${formatNumber(nodeX)}" cy="${formatNumber(nodeY)}" r="${formatNumber(height * 0.055)}" fill="${palette.blue}" />
    </g>
    <g>
      ${path(`M ${formatNumber(nodeX)} ${formatNumber(nodeY)} C ${formatNumber(split + width * 0.08)} ${formatNumber(height * 0.55)}, ${formatNumber(split + width * 0.03)} ${formatNumber(height * 0.36)}, ${formatNumber(split - width * 0.05)} ${formatNumber(height * 0.33)}`, 0.7, 1.7)}
      ${path(`M ${formatNumber(nodeX)} ${formatNumber(nodeY)} C ${formatNumber(split + width * 0.23)} ${formatNumber(height * 0.63)}, ${formatNumber(width * 0.72)} ${formatNumber(height * 0.52)}, ${formatNumber(width * 0.78)} ${formatNumber(height * 0.45)}`, 0.64, 1.6)}
      ${path(`M ${formatNumber(nodeX)} ${formatNumber(nodeY)} C ${formatNumber(split + width * 0.29)} ${formatNumber(height * 0.72)}, ${formatNumber(width * 0.72)} ${formatNumber(height * 0.64)}, ${formatNumber(orangeX)} ${formatNumber(orangeY)}`, 0.94, 2.2)}
      ${path(`M ${formatNumber(nodeX)} ${formatNumber(nodeY)} C ${formatNumber(split + width * 0.25)} ${formatNumber(height * 0.85)}, ${formatNumber(width * 0.65)} ${formatNumber(height * 0.93)}, ${formatNumber(width * 0.69)} ${formatNumber(height * 1.04)}`, 0.58, 1.5)}
      ${path(`M ${formatNumber(nodeX)} ${formatNumber(nodeY)} C ${formatNumber(split + width * 0.13)} ${formatNumber(height * 0.83)}, ${formatNumber(split + width * 0.09)} ${formatNumber(height * 0.94)}, ${formatNumber(split + width * 0.11)} ${formatNumber(height * 1.06)}`, 0.5, 1.4)}
      ${path(`M ${formatNumber(width * 0.69)} ${formatNumber(height * 0.65)} C ${formatNumber(width * 0.73)} ${formatNumber(height * 0.52)}, ${formatNumber(width * 0.78)} ${formatNumber(height * 0.45)}, ${formatNumber(width * 0.82)} ${formatNumber(height * 0.34)}`, 0.48, 1.3)}
      ${path(`M ${formatNumber(width * 0.72)} ${formatNumber(height * 0.65)} C ${formatNumber(width * 0.78)} ${formatNumber(height * 0.62)}, ${formatNumber(width * 0.87)} ${formatNumber(height * 0.5)}, ${formatNumber(width * 0.94)} ${formatNumber(height * 0.52)}`, 0.42, 1.2)}
    </g>
    <circle cx="${formatNumber(nodeX)}" cy="${formatNumber(nodeY)}" r="${formatNumber(height * 0.024)}" fill="url(#nodeFill)" />
    <circle cx="${formatNumber(nodeX)}" cy="${formatNumber(nodeY)}" r="${formatNumber(height * 0.009)}" fill="${palette.technicalText}" opacity="0.9" />
    <circle cx="${formatNumber(orangeX)}" cy="${formatNumber(orangeY)}" r="${formatNumber(height * 0.011)}" fill="${palette.orange}" />
    <circle cx="${formatNumber(orangeX)}" cy="${formatNumber(orangeY)}" r="${formatNumber(height * 0.026)}" fill="none" stroke="${palette.orange}" stroke-width="1" opacity="0.34" />
  </svg>`;
}

function documentShell(body, componentCss) {
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <style>
        ${embeddedFonts.css}
        :root {
          --font-display: ${renderingStacks.display};
          --font-sans: ${renderingStacks.sans};
          --font-mono: ${renderingStacks.mono};
        }
        * { box-sizing: border-box; }
        html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
        body { -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }
        ${componentCss}
      </style>
    </head>
    <body>${body}</body>
  </html>`;
}

async function loadOfficialFonts() {
  const definitions = [
    { key: "newsreader", family: "Newsreader", weight: "200 800" },
    { key: "geist", family: "Geist", weight: "100 900" },
    { key: "geist_mono", family: "Geist Mono", weight: "100 900" }
  ];
  const availability = {};
  const rules = [];
  const sourceDigests = {};

  for (const definition of definitions) {
    const relativePath = manifest.typography.official_font_files?.[definition.key];
    if (!relativePath) throw new Error(`Missing official font path for ${definition.key}.`);
    try {
      const font = await readFile(path.join(ROOT, relativePath));
      availability[definition.key] = true;
      sourceDigests[relativePath] = sha256(font);
      rules.push(`
        @font-face {
          font-family: "${definition.family}";
          src: url("data:font/woff2;base64,${font.toString("base64")}") format("woff2");
          font-style: normal;
          font-weight: ${definition.weight};
          font-display: block;
        }
      `);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      availability[definition.key] = false;
    }
  }

  return { availability, css: rules.join("\n"), sourceDigests };
}

function resolveFontStacks() {
  const routes = {
    display: "newsreader",
    sans: "geist",
    mono: "geist_mono"
  };

  return Object.fromEntries(
    Object.entries(routes).map(([usage, font]) => [
      usage,
      embeddedFonts.availability[font]
        ? manifest.typography.embedded_stacks?.[usage]
        : manifest.typography.fallback_stacks?.[usage]
    ])
  );
}

async function writeGenerationReceipt() {
  const sources = sortObject({
    "scripts/generate-social-profile-assets.mjs": sha256(generatorBuffer),
    "src/brand/social-profile-assets.json": sha256(manifestBuffer),
    "src/styles/brand-tokens.json": sha256(tokensBuffer),
    [manifest.avatar_source]: sha256(avatarBuffer),
    ...embeddedFonts.sourceDigests
  });
  const outputs = {};

  for (const output of outputSpecifications()) {
    outputs[output.path] = {
      sha256: sha256(await readFile(path.join(ROOT, output.path))),
      width: output.width,
      height: output.height
    };
  }

  const receipt = {
    schema_version: "jamie-social-profile-assets-receipt/v1",
    contract: manifest.contract,
    design_system_version: manifest.design_system_version,
    source_digest: sha256(JSON.stringify(sources)),
    sources,
    outputs: sortObject(outputs),
    typography: {
      embedded: embeddedFonts.availability,
      rendering_stacks: renderingStacks,
      rendering_status: manifest.typography.current_rendering_status
    },
    claims_boundary:
      "Binds local sources to generated files; does not prove live platform cropping, upload, publication, or Jamie taste approval."
  };
  const receiptPath = path.join(ROOT, manifest.generation_receipt);
  await mkdir(path.dirname(receiptPath), { recursive: true });
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
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

async function renderPage({ width, height, scale, outputPath, html }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    colorScheme: "light",
    reducedMotion: "reduce"
  });
  const page = await context.newPage();
  try {
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: outputPath, type: "png", fullPage: false, animations: "disabled" });
  } finally {
    await context.close();
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value) {
  return Number(value.toFixed(2));
}

function withAlpha(hex, alpha) {
  const channels = hex.match(/[0-9a-f]{2}/gi)?.map((channel) => Number.parseInt(channel, 16));
  if (channels?.length !== 3) throw new Error(`Expected a six-digit hex colour; received ${hex}.`);
  return `rgba(${channels.join(", ")}, ${alpha})`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}
