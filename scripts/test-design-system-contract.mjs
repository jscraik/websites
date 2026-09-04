import assert from "node:assert/strict";
import test from "node:test";
import { hasPrimarySkillsBarLink } from "./lib/design-system-contract.mjs";

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
