import assert from "node:assert/strict";
import test from "node:test";
import { hasPrimarySkillsBarLink } from "./lib/design-system-contract.mjs";
import { hasDensityAwareBlogDividers } from "./lib/surface-hairline-contract.mjs";

const validFixture = `
  const links = [{
    href: "/demos/skillsbar/",
    label: "Start with SkillsBar",
    primary: true
  }];
`;

test("binds the primary flag to the SkillsBar route and label", () => {
  assert.equal(hasPrimarySkillsBarLink(validFixture), true);
});

test("rejects a primary flag detached from the SkillsBar route", () => {
  const wrongRoute = validFixture.replace("/demos/skillsbar/", "/now/");
  assert.equal(hasPrimarySkillsBarLink(wrongRoute), false);
});

test("rejects a primary flag detached from the SkillsBar label", () => {
  const wrongLabel = validFixture.replace("Start with SkillsBar", "Read the blog");
  assert.equal(hasPrimarySkillsBarLink(wrongLabel), false);
});

test("keeps primary metadata bound to one link object", () => {
  const splitAcrossObjects = `
    const links = [
      { href: "/demos/skillsbar/", label: "Start with SkillsBar" },
      { href: "/now/", label: "Read the blog", primary: true }
    ];
  `;
  assert.equal(hasPrimarySkillsBarLink(splitAcrossObjects), false);
});

test("ignores commented primary metadata", () => {
  const commentedPrimary = validFixture
    .replace("primary: true", "// primary: true")
    .replace("  }];", "    primary: false\n  }];");
  assert.equal(hasPrimarySkillsBarLink(commentedPrimary), false);
});

test("rejects a primary expression whose runtime value can be false", () => {
  assert.equal(hasPrimarySkillsBarLink(validFixture.replace("primary: true", "primary: true && featureEnabled")), false);
});

test("continues parsing after unrelated line and block comments", () => {
  const commentedFixture = `
    // Unrelated explanation before the data.
    /* Another comment spanning
       multiple lines. */
    ${validFixture}
  `;
  assert.equal(hasPrimarySkillsBarLink(commentedFixture), true);
});

const hairlineCss = `
  :root { --border-hairline: 1px; }
  @media (min-resolution: 2dppx) { :root { --border-hairline: 0.5px; } }
`;
const hairlineBlog = `<style>.draft-links { border-top: var(--border-hairline) solid var(--border-subtle); }</style>`;

test("accepts Blog dividers backed by standard and high-density widths", () => {
  assert.equal(hasDensityAwareBlogDividers(hairlineCss, hairlineBlog), true);
});

test("rejects a hairline without a high-density width", () => {
  assert.equal(hasDensityAwareBlogDividers(hairlineCss.replace("0.5px", "1px"), hairlineBlog), false);
});

test("rejects a Blog divider that bypasses the shared token", () => {
  assert.equal(hasDensityAwareBlogDividers(hairlineCss, hairlineBlog.replace("var(--border-hairline)", "1px")), false);
});
