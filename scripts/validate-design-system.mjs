import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), "utf8");

const checks = [];
const addCheck = (name, passed, detail) => {
  checks.push({ name, passed, detail });
};

let tokensCss, tokensJson, globalCss, blogPage, brandGuide, readme, astroConfig, homepage;
try {
  tokensCss = read("src/styles/brand-tokens.css");
  tokensJson = JSON.parse(read("src/styles/brand-tokens.json"));
  globalCss = read("src/styles/global.css");
  blogPage = read("src/pages/blog/index.astro");
  brandGuide = read("BRAND_GUIDELINES.md");
  readme = read("README.md");
  astroConfig = read("astro.config.mjs");
  homepage = read("src/pages/index.astro");
} catch (error) {
  console.error(`Design system validation failed to read inputs: ${error.message}`);
  process.exit(1);
}

const requiredTokens = {
  "--bds-color-brainwav-bg": "#0b0f17",
  "--bds-color-brainwav-surface": "#141a23",
  "--bds-color-brainwav-surface-elevated": "#1b2230",
  "--bds-color-brainwav-text": "#f8f8f6",
  "--bds-color-brainwav-text-secondary": "#c5cad3",
  "--bds-color-brainwav-muted": "#8b93a4",
  "--bds-color-blue": "#2da8ff",
  "--bds-color-blue-ink": "#005f99",
  "--bds-color-orange": "#ff7a00",
  "--bds-color-orange-ink": "#8f3a00",
  "--bds-color-success-ink": "#0d6638",
  "--bds-color-warning-ink": "#6f5200",
  "--bds-color-error-ink": "#aa2727",
  "--bds-space-000": "0px",
  "--bds-space-050": "4px",
  "--bds-space-100": "8px",
  "--bds-space-150": "12px",
  "--bds-space-200": "16px",
  "--bds-space-300": "24px",
  "--bds-space-400": "32px",
  "--bds-space-600": "48px",
  "--bds-space-800": "64px",
  "--bds-space-1200": "96px",
  "--bds-space-1600": "128px",
  "--bds-radius-card": "18px",
  "--bds-radius-button": "14px",
  "--bds-radius-image": "20px",
  "--bds-radius-pill": "999px",
  "--bds-shadow-soft": "0 10px 40px rgba(0, 0, 0, 0.25)",
  "--bds-motion-fast": "150ms",
  "--bds-motion-normal": "250ms",
  "--bds-motion-slow": "400ms",
  "--bds-ease-out": "cubic-bezier(0.22, 0.61, 0.36, 1)",
  "--bds-icon-size-xs": "16px",
  "--bds-icon-size-sm": "20px",
  "--bds-icon-size-md": "24px",
  "--bds-icon-size-lg": "32px",
  "--bds-icon-size-xl": "48px",
  "--bds-icon-stroke-small": "1.5",
  "--bds-icon-stroke-default": "1.75",
  "--bds-icon-stroke-large": "2",
  "--bds-icon-linecap": "round",
  "--bds-icon-linejoin": "round"
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
  tokensJson.system?.name === "brAInwav Design System" && tokensJson.system?.version === "1.1.0",
  "expected brand-tokens.json to name brAInwav Design System version 1.1.0"
);

addCheck(
  "token json declares canonical source",
  tokensJson.system?.canonical_source === "src/styles/brand-tokens.json",
  "expected brand-tokens.json to declare itself as the canonical machine-readable source"
);

addCheck(
  "token json defines the cross-product consumer contract",
  tokensJson.consumer_contract?.record_version === true &&
    tokensJson.consumer_contract?.record_source_commit === true &&
    tokensJson.consumer_contract?.forbidden_overrides?.includes("primitive palette") &&
    tokensJson.consumer_contract?.forbidden_overrides?.includes("icon grammar"),
  "expected consumers to record the version and source commit without forking primitives"
);

addCheck(
  "token json binds the accepted brand decision",
  tokensJson.system?.decision_contract === "jamie-brain-brand-system/v1" &&
    tokensJson.system?.decision_accepted === "2026-07-15",
  "expected the design system to bind jamie-brain-brand-system/v1 accepted on 2026-07-15"
);

addCheck(
  "positioning contract is canonical",
  tokensJson.positioning?.personal_role === "AI-native DevRel builder" &&
    tokensJson.positioning?.brand_promise === "Making AI-assisted developer work inspectable." &&
    tokensJson.positioning?.developer_benefit === "Help developers adopt emerging AI tools with confidence." &&
    tokensJson.positioning?.flagship_product === "SkillsBar",
  "expected the accepted role, promise, benefit, and flagship product"
);

addCheck(
  "canonical portfolio front door and technical depth boundary",
  astroConfig.includes('site: "https://jscraik.com"') &&
    tokensJson.positioning?.canonical_portfolio_url === "https://jscraik.com" &&
    tokensJson.positioning?.site_roles?.portfolio?.includes("Single public front door") &&
    tokensJson.positioning?.site_roles?.brAInwav?.includes("Jamie's identity and shared presentation system") &&
    tokensJson.positioning?.site_handoffs?.technical_depth?.includes("public ChatGPT Sites, GitBooks, GitHub repositories") &&
    tokensJson.positioning?.site_handoffs?.claim_boundary === "Evidence before claims; current source identity and freshness remain visible.",
  "expected jscraik.com to be the canonical front door with brAInwav identity and explicit technical-depth routing"
);

addCheck(
  "homepage exposes SkillsBar as the first concrete proof",
  homepage.includes('href="/demos/skillsbar/"') &&
    homepage.includes("See SkillsBar in action") &&
    homepage.includes("SkillsBar is the first concrete demonstration."),
  "expected the homepage to link to the SkillsBar demo and name it as the first concrete proof"
);

addCheck(
  "identity naming and origin are explicit",
  tokensJson.identity?.written_name === "brAInwav" &&
    tokensJson.identity?.spoken_name === "brain-wave" &&
    tokensJson.identity?.technical_identifier === "brainwav" &&
    tokensJson.identity?.canonical_origin ===
      "brAInwav brings together the human perspective, AI tools, and technical wave I continue to explore and build with." &&
    tokensJson.identity?.origin_publication_status === "reviewed_public_safe" &&
    tokensJson.identity?.origin_parts?.brain === "The human perspective that shapes how Jamie works.",
  "expected the accepted written/spoken/technical names and reviewed-safe public origin"
);

addCheck(
  "wordmark and neuron boundaries are deterministic",
  tokensJson.identity?.wordmark?.family === "Geist" &&
    tokensJson.identity?.wordmark?.weight === "600" &&
    tokensJson.identity?.wordmark?.construction?.includes("same size and weight") &&
    tokensJson.identity?.neuron?.forbidden_uses?.includes("standard product-cover icon") &&
    tokensJson.identity?.neuron?.motion?.allowed?.join("|") ===
      "one optional branch reveal|one restrained signal pulse" &&
    tokensJson.identity?.neuron?.motion?.frequency === "infrequent" &&
    tokensJson.identity?.neuron?.motion?.reduced_motion === "complete static fallback" &&
    tokensJson.identity?.neuron?.motion?.static_surfaces?.join("|") === "product covers|proof objects" &&
    tokensJson.identity?.approved_lockups?.length === 4,
  "expected continuous Geist Semibold wordmark, four lockups, neuron product-mark exclusion, and static-safe motion contract"
);

addCheck(
  "product identity separates marks from interface icons",
  tokensJson.product_identity?.product_mark?.grid === "24px" &&
    tokensJson.product_identity?.product_mark?.monochrome_minimum === "16px" &&
    tokensJson.product_identity?.stock_icon_boundary?.includes("must not become a product logo") &&
    tokensJson.product_identity?.endorsement === "by brAInwav",
  "expected custom functional marks, a stock-icon boundary, and the exact endorsement"
);

const requiredCoverFields = [
  "product_name",
  "product_mark",
  "hook",
  "proof_object",
  "proof_source_identity",
  "caption",
  "provenance",
  "status",
  "endorsement",
  "design_system_version",
  "design_system_source_commit"
];
const requiredProvenanceLabels = [
  "LIVE PRODUCT CAPTURE",
  "IMPLEMENTATION EXCERPT",
  "SYSTEM DIAGRAM",
  "CONCEPT MOCKUP · NOT RUNTIME EVIDENCE"
];

addCheck(
  "product cover master and reflow are fixed",
  tokensJson.product_cover?.master?.width === 1600 &&
    tokensJson.product_cover?.master?.height === 900 &&
    tokensJson.product_cover?.master?.outer_margin === 64 &&
    tokensJson.product_cover?.master?.grid_columns === 12 &&
    tokensJson.product_cover?.master?.editorial_columns === 5 &&
    tokensJson.product_cover?.master?.technical_columns === 7 &&
    tokensJson.product_cover?.formats?.join("|") === "16:9|1.91:1|1:1|4:5" &&
    tokensJson.product_cover?.reflow_rule?.includes("not automatic crops"),
  "expected 1600x900, 5/7 two-zone grid, four formats, and deliberate portrait/square reflow"
);

addCheck(
  "product cover manifest and provenance are complete",
  tokensJson.product_cover?.required_manifest_fields?.join("|") === requiredCoverFields.join("|") &&
    tokensJson.product_cover?.optional_manifest_fields?.join("|") === "support" &&
    tokensJson.product_cover?.manifest_field_contracts?.support?.startsWith("Optional short explanation") &&
    tokensJson.product_cover?.manifest_field_contracts?.proof_source_identity?.includes("Exact source revision") &&
    tokensJson.product_cover?.manifest_field_contracts?.design_system_source_commit?.includes("Exact source commit") &&
    tokensJson.consumer_contract?.record_source_commit === true &&
    requiredProvenanceLabels.every((label) => tokensJson.product_cover?.provenance_labels?.includes(label)) &&
    tokensJson.product_cover?.invalid_inputs?.includes("missing proof source identity") &&
    tokensJson.product_cover?.invalid_inputs?.includes("missing design-system source commit") &&
    tokensJson.product_cover?.invalid_inputs?.includes("claim without proof") &&
    tokensJson.product_cover?.imagegen_boundary?.includes("must not generate final typography"),
  "expected exact required/optional manifest fields, proof/source-commit bindings, provenance labels, invalid-input rules, and the ImageGen boundary"
);

addCheck(
  "colour semantics match the accepted contract",
  tokensJson.color_rules?.includes("Blue represents current or verified technical evidence and navigation.") &&
    tokensJson.color_rules?.includes(
      "Orange represents AI in the brAInwav wordmark, inspection, attention, stale evidence, and required action."
    ) &&
    brandGuide.includes("Blue is the normal accent for current or verified technical evidence and navigation.") &&
    brandGuide.includes("inspection, attention, stale evidence, required action"),
  "expected blue=current/verified/technical evidence/navigation and orange=AI/inspection/attention/stale/required action"
);

addCheck(
  "evidence maturity and freshness lanes are separate",
  tokensJson.evidence?.maturity_levels?.map(({ id }) => id).join("|") ===
    "behavior_proven|usability_tested|adoption_evidenced" &&
    tokensJson.evidence?.ledger_fields?.join("|") ===
      "claim|evidence|scope|limitation|status|last_verified|reproduce" &&
    tokensJson.evidence?.mismatch_rule === "Source mismatch automatically makes evidence stale." &&
    tokensJson.evidence?.unknown_rule === "Unknown evidence defaults to unverified." &&
    tokensJson.evidence?.separate_lanes?.includes("developer confidence"),
  "expected three maturity levels, seven ledger fields, and explicit stale/unverified/confidence boundaries"
);

addCheck(
  "every AI-assisted case study has one role, CTA, and channel contract",
  tokensJson.case_study_contract?.applies_to === "every AI-assisted case study" &&
    tokensJson.case_study_contract?.role_boundary_placement === "near the start" &&
    tokensJson.case_study_contract?.role_boundary?.jamie?.includes("owns the claims") &&
    tokensJson.case_study_contract?.role_boundary?.codex?.includes("supports inspection and validation") &&
    tokensJson.case_study_contract?.primary_cta?.count === 1 &&
    tokensJson.case_study_contract?.primary_cta?.purpose === "evidence-seeking" &&
    tokensJson.case_study_contract?.channel_separation?.rule ===
      "Keep public technical feedback separate from private hiring or contact routes." &&
    brandGuide.includes("End every case study with one primary evidence-seeking call to action") &&
    brandGuide.includes("Keep public technical feedback separate from private hiring or contact routes."),
  "expected a cross-product Jamie/Codex boundary, one evidence-seeking CTA, and separate public-feedback/private-contact channels"
);

addCheck(
  "SkillsBar flagship proof contract is fixed",
  tokensJson.skillsbar_flagship?.hook === "When evidence goes stale." &&
    tokensJson.skillsbar_flagship?.core_sentence ===
      "A changed Skill candidate should not inherit proof that no longer belongs to it." &&
    tokensJson.skillsbar_flagship?.career_bridge?.includes("short closing bridge") &&
    tokensJson.skillsbar_flagship?.visual_proof_set?.join("|") ===
      "one static fallback|one short walkthrough|one stale-proof diagram|one implementation or test excerpt",
  "expected the accepted SkillsBar hook, core sentence, career bridge, and four-part proof set"
);

addCheck(
  "accessibility and stress-test acceptance are explicit",
  tokensJson.accessibility?.baseline === "WCAG 2.2 AA" &&
    tokensJson.accessibility?.forbidden?.includes("hover-only evidence") &&
    tokensJson.stress_test?.fixtures?.includes("short and long support copy") &&
    tokensJson.stress_test?.fixtures?.includes("light and dark proof") &&
    tokensJson.stress_test?.fixtures?.includes("technical overflow") &&
    tokensJson.stress_test?.fixtures?.includes(
      "reduced motion, no JavaScript, slow images, and complete static fallback"
    ) &&
    tokensJson.stress_test?.fixtures?.includes("rSearch and wSearch manifests") &&
    tokensJson.stress_test?.failure_classes?.join("|") ===
      "template_defect|invalid_input|unsupported|intentional_constraint" &&
    tokensJson.stress_test?.acceptance?.includes("independent QA") &&
    tokensJson.stress_test?.acceptance?.includes("Jamie taste approval"),
  "expected WCAG baseline, full cross-product fixtures, misuse fixtures, failure classes, independent QA, and Jamie approval"
);

const expectedCssJsonPairs = {
  "--bds-color-blue-glow": tokensJson.colors?.blue_glow,
  "--bds-color-orange-glow": tokensJson.colors?.orange_glow,
  "--bds-shadow-soft": tokensJson.shadow?.soft,
  "--bds-shadow-editorial": tokensJson.shadow?.editorial,
  "--bds-motion-fast": tokensJson.motion?.fast,
  "--bds-motion-normal": tokensJson.motion?.normal,
  "--bds-motion-slow": tokensJson.motion?.slow,
  "--bds-ease-out": tokensJson.motion?.ease_out,
  "--bds-icon-linecap": tokensJson.iconography?.linecap,
  "--bds-icon-linejoin": tokensJson.iconography?.linejoin
};

for (const [token, value] of Object.entries(expectedCssJsonPairs)) {
  addCheck(
    "token json coverage " + token,
    typeof value === "string" && tokensCss.includes(token + ": " + value + ";"),
    "expected " + token + " in brand-tokens.css to match brand-tokens.json value " + value
  );
}

const legacyColorAliases = [
  "--jsc-charcoal",
  "--jsc-sage",
  "--jsc-ink-blue",
  "--jsc-warm-off-white",
  "--jsc-white"
];

for (const token of legacyColorAliases) {
  addCheck(
    "legacy alias removed " + token,
    !tokensCss.includes(token + ":"),
    "did not expect stale token alias " + token + " in brand-tokens.css"
  );
}

const expectedFontFamilies = {
  display: 'Newsreader, "Iowan Old Style", Georgia, serif',
  sans: 'Geist, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
};

for (const [role, family] of Object.entries(expectedFontFamilies)) {
  addCheck(
    "token json typography family " + role,
    tokensJson.typography?.families?.[role] === family,
    "expected typography.families." + role + " to be " + family
  );
}

for (const role of ["display_xl", "display_lg", "heading_1", "heading_2", "heading_3", "body_lg", "body_md", "body_sm", "meta", "code"]) {
  const value = tokensJson.typography?.roles?.[role];
  addCheck(
    "token json typography role " + role,
    value && ["family", "size", "line_height", "weight", "letter_spacing"].every((key) => key in value),
    "expected typography.roles." + role + " to define family, size, line_height, weight, and letter_spacing"
  );
}

addCheck(
  "font licences are portable",
  tokensJson.typography?.licenses?.newsreader?.spdx === "OFL-1.1" &&
    tokensJson.typography?.licenses?.geist?.spdx === "OFL-1.1",
  "expected Newsreader and Geist to declare OFL-1.1 licence metadata"
);

const expectedSpacing = {
  "000": "0px",
  "050": "4px",
  "100": "8px",
  "150": "12px",
  "200": "16px",
  "300": "24px",
  "400": "32px",
  "600": "48px",
  "800": "64px",
  "1200": "96px",
  "1600": "128px"
};

addCheck(
  "spacing uses a 4px base unit",
  tokensJson.spacing?.base_unit === "4px",
  "expected spacing.base_unit to be 4px"
);

for (const [step, value] of Object.entries(expectedSpacing)) {
  addCheck(
    "token json spacing primitive " + step,
    tokensJson.spacing?.primitives?.[step] === value,
    "expected spacing.primitives." + step + " to be " + value
  );
}

for (const role of ["icon_text_gap", "control_gap", "content_gap", "cluster_gap", "card_padding", "section_gap", "page_gutter", "section_padding", "hero_padding"]) {
  addCheck(
    "token json spacing role " + role,
    typeof tokensJson.spacing?.roles?.[role] === "string",
    "expected spacing.roles." + role + " to be defined"
  );
}

const expectedIconSizes = { xs: "16px", sm: "20px", md: "24px", lg: "32px", xl: "48px" };
for (const [size, value] of Object.entries(expectedIconSizes)) {
  addCheck(
    "token json icon size " + size,
    tokensJson.iconography?.sizes?.[size] === value,
    "expected iconography.sizes." + size + " to be " + value
  );
}

addCheck(
  "iconography uses the approved outline grammar",
  tokensJson.iconography?.grid === "24px" &&
    tokensJson.iconography?.style === "outline" &&
    tokensJson.iconography?.fill === "none" &&
    tokensJson.iconography?.stroke?.small === "1.5" &&
    tokensJson.iconography?.stroke?.default === "1.75" &&
    tokensJson.iconography?.stroke?.large === "2",
  "expected a 24px outline grid with no fill and 1.5/1.75/2 stroke tiers"
);

const requiredColorRoles = {
  "editorial.canvas": "portfolio_bg",
  "editorial.surface": "portfolio_surface",
  "editorial.text": "portfolio_ink",
  "technical.canvas": "brainwav_bg",
  "technical.surface": "brainwav_surface",
  "technical.text": "brainwav_text",
  "accent.evidence_on_dark": "blue",
  "accent.evidence_on_light": "blue_ink",
  "accent.inspection_on_dark": "orange",
  "accent.inspection_on_light": "orange_ink"
};

for (const [pathName, expected] of Object.entries(requiredColorRoles)) {
  const [group, role] = pathName.split(".");
  addCheck(
    "token json color role " + pathName,
    tokensJson.color_roles?.[group]?.[role] === expected,
    "expected color_roles." + pathName + " to reference colors." + expected
  );
}

const hexToLuminance = (hex) => {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const isHexColour = (value) => typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value);

const contrastRatio = (foreground, background) => {
  const values = [hexToLuminance(foreground), hexToLuminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

for (const [foregroundKey, backgroundKey] of [
  ["portfolio_text", "portfolio_bg"],
  ["portfolio_muted", "portfolio_bg"],
  ["blue_ink", "portfolio_bg"],
  ["orange_ink", "portfolio_bg"],
  ["success_ink", "portfolio_bg"],
  ["warning_ink", "portfolio_bg"],
  ["error_ink", "portfolio_bg"],
  ["brainwav_text", "brainwav_bg"],
  ["brainwav_muted", "brainwav_bg"],
  ["blue", "brainwav_bg"],
  ["orange", "brainwav_bg"]
]) {
  const foreground = tokensJson.colors?.[foregroundKey];
  const background = tokensJson.colors?.[backgroundKey];
  const hasColours = isHexColour(foreground) && isHexColour(background);
  const ratio = hasColours ? contrastRatio(foreground, background) : 0;
  addCheck(
    "colour contrast " + foregroundKey + " on " + backgroundKey,
    hasColours && ratio >= 4.5,
    "expected " + foregroundKey + " on " + backgroundKey + " to be defined and meet 4.5:1; actual " + ratio.toFixed(2) + ":1"
  );
}

for (const snippet of [
  "version 1.1.0",
  "AI-native DevRel builder",
  "Making AI-assisted developer work inspectable.",
  "Help developers adopt emerging AI tools with confidence.",
  "brAInwav brings together three parts of my story",
  "one continuous `brAInwav` in Geist Semibold",
  "1600 × 900",
  "LIVE PRODUCT CAPTURE",
  "CONCEPT MOCKUP · NOT RUNTIME EVIDENCE",
  "`proof_source_identity`",
  "`design_system_source_commit`",
  "`support` is optional",
  "missing design-system source commit",
  "behavior_proven",
  "When evidence goes stale.",
  "A changed Skill candidate should not inherit proof that no longer belongs to it.",
  "WCAG 2.2 AA",
  "template_defect",
  "Newsreader + Geist + Geist Mono",
  "#2DA8FF",
  "#005F99",
  "#FF7A00",
  "#8F3A00",
  "4px base unit",
  "24px reference grid",
  "The neuron is a brand motif, not a UI icon"
]) {
  addCheck(
    "brand guide documents " + snippet,
    brandGuide.includes(snippet),
    "expected BRAND_GUIDELINES.md to document " + snippet
  );
}

for (const staleSnippet of ["#d8d9d2", "#2f80ff", "#ff7a1a", "#263129", "#172219", '"Iowan Old Style", "Palatino Linotype"']) {
  addCheck(
    "brand guide removes stale value " + staleSnippet,
    !brandGuide.includes(staleSnippet),
    "did not expect BRAND_GUIDELINES.md to retain stale value " + staleSnippet
  );
}

for (const snippet of [
  "single public portfolio front door",
  "Version 1.1.0 of the brAInwav Design System",
  "Making AI-assisted developer work inspectable.",
  "The SkillsBar vertical slice is the first implementation target",
  "not proved by the contract alone"
]) {
  addCheck(
    "README documents " + snippet,
    readme.includes(snippet),
    "expected README.md to document " + snippet
  );
}

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
