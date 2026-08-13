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
