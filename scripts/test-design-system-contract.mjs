import assert from "node:assert/strict";
import test from "node:test";
import { hasPrimarySkillsProofLink } from "./lib/design-system-contract.mjs";
import { hasDensityAwareBlogDividers } from "./lib/surface-hairline-contract.mjs";

const validFixture = `
  const links = [{
    href: "/demos/skillsbar/",
    label: "Explore the interactive demo",
    primary: true
  }];
`;

test("binds the primary flag to the SkillsProof route and label", () => {
  assert.equal(hasPrimarySkillsProofLink(validFixture), true);
});

test("rejects a primary flag detached from the SkillsProof route", () => {
  const wrongRoute = validFixture.replace("/demos/skillsbar/", "/now/");
  assert.equal(hasPrimarySkillsProofLink(wrongRoute), false);
});

test("rejects a primary flag detached from the SkillsProof label", () => {
  const wrongLabel = validFixture.replace("Explore the interactive demo", "Read the blog");
  assert.equal(hasPrimarySkillsProofLink(wrongLabel), false);
});

test("keeps primary metadata bound to one link object", () => {
  const splitAcrossObjects = `
    const links = [
      { href: "/demos/skillsbar/", label: "Explore the interactive demo" },
      { href: "/now/", label: "Read the blog", primary: true }
    ];
  `;
  assert.equal(hasPrimarySkillsProofLink(splitAcrossObjects), false);
});

test("ignores commented primary metadata", () => {
  const commentedPrimary = validFixture
    .replace("primary: true", "// primary: true")
    .replace("  }];", "    primary: false\n  }];");
  assert.equal(hasPrimarySkillsProofLink(commentedPrimary), false);
});

test("rejects a primary expression whose runtime value can be false", () => {
  assert.equal(hasPrimarySkillsProofLink(validFixture.replace("primary: true", "primary: true && featureEnabled")), false);
});

test("continues parsing after unrelated line and block comments", () => {
  const commentedFixture = `
    // Unrelated explanation before the data.
    /* Another comment spanning
       multiple lines. */
    ${validFixture}
  `;
  assert.equal(hasPrimarySkillsProofLink(commentedFixture), true);
});

const hairlineCss = `
  :root { --border-hairline: 1px; }
  @media (min-resolution: 2dppx) { :root { --border-hairline: 0.5px; } }
`;
const hairlineBlog = `<style>
  .draft-links { border-top: var(--border-hairline) solid var(--border-subtle); border-bottom: var(--border-hairline) solid var(--border-subtle); }
  .blog-list-item { border-top: var(--border-hairline) solid var(--border-subtle); }
  .blog-list-item:last-child { border-bottom: var(--border-hairline) solid var(--border-subtle); }
  .article-list h2 { border-bottom: var(--border-hairline) solid var(--border-subtle); }
  .blog-index .draft-links span:first-of-type { border-top: var(--border-hairline) solid var(--border-subtle); }
  .blog-index .draft-links span:last-of-type { border-bottom: var(--border-hairline) solid var(--border-subtle); }
  .blog-list-item > a { border-bottom: 1px solid currentcolor; }
  @media (max-width: 640px) { .blog-list-item { border-top: 0; border-bottom: 0; } }
</style>`;

test("accepts Blog dividers backed by standard and high-density widths", () => {
  assert.equal(hasDensityAwareBlogDividers(hairlineCss, hairlineBlog), true);
});

test("rejects a hairline without a high-density width", () => {
  assert.equal(hasDensityAwareBlogDividers(hairlineCss.replace("0.5px", "1px"), hairlineBlog), false);
});

test("rejects a Blog divider that bypasses the shared token", () => {
  assert.equal(hasDensityAwareBlogDividers(hairlineCss, hairlineBlog.replace("var(--border-hairline)", "1px")), false);
});

test("rejects a mixed token and literal Blog divider at a breakpoint", () => {
  const mixed = hairlineBlog.replace(
    ".blog-index .draft-links span:last-of-type { border-bottom: var(--border-hairline)",
    ".blog-index .draft-links span:last-of-type { border-bottom: 1px",
  );
  assert.equal(hasDensityAwareBlogDividers(hairlineCss, mixed), false);
});

test("rejects a missing Blog divider while allowing link underlines", () => {
  const missing = hairlineBlog.replace(
    ".article-list h2 { border-bottom: var(--border-hairline) solid var(--border-subtle); }",
    ".article-list h2 { color: currentcolor; }",
  );
  assert.equal(hasDensityAwareBlogDividers(hairlineCss, missing), false);
  assert.equal(hasDensityAwareBlogDividers(hairlineCss, hairlineBlog), true);
});
