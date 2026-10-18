import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync("src/lib/portfolio.ts", "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    isolatedModules: true
  },
  fileName: "src/lib/portfolio.ts"
}).outputText;
const module = { exports: {} };
vm.runInNewContext(transpiled, { module, exports: module.exports }, {
  filename: "src/lib/portfolio.ts"
});
const { byOrder, featuredWorkCards, proofWorkCards, workRoute } = module.exports;

// Functions evaluated in the isolated VM return arrays from that VM's realm.
// Normalize assertion values so this fixture tests portfolio behavior rather
// than JavaScript realm identity.
const nativeValue = (value) => JSON.parse(JSON.stringify(value));

function workEntry(id, data) {
  return {
    id,
    data: {
      date: "Current",
      featured: {
        cta: "Read",
        eyebrow: "Work",
        previewMeta: "Meta",
        previewTitle: "Preview",
        quote: "Quote",
        visual: "site"
      },
      frames: [["A", "B", "C"], ["D", "E", "F"], ["G", "H", "I"], ["J", "K", "L"]],
      isFeatured: false,
      order: 1,
      publicationState: "published",
      shortTitle: id,
      subtitle: "Subtitle",
      tags: ["One", "Two", "Three", "Four"],
      title: id,
      tone: "paper",
      ...data
    }
  };
}

function proofEntry(id, data) {
  return {
    id,
    data: {
      claim: "Claim",
      href: "/proof/",
      order: 1,
      publicationState: "published",
      status: "Planned",
      title: id,
      ...data
    }
  };
}

assert.equal(workRoute({ id: "cli-proof-series", data: {} }), "/work/cli-proof-series/");
assert.equal(
  workRoute({ id: "skillsbar", data: { href: "/demos/skillsbar/" } }),
  "/demos/skillsbar/"
);
assert.equal(byOrder(workEntry("b", { order: 2 }), workEntry("a", { order: 1 })), 1);
assert.deepEqual(nativeValue(featuredWorkCards([])), []);
assert.deepEqual(nativeValue(proofWorkCards([], [])), []);
const routedSkill = proofWorkCards([workEntry("skills-sdk", { href: "/custom-sdk/" })], [])[0];
assert.equal(routedSkill.href, "/custom-sdk/");
assert.equal(routedSkill.illustration, "skills-sdk");
assert.equal(proofWorkCards([workEntry("new-project", {})], [])[0].illustration, "proof");

const featuredCards = featuredWorkCards([
  workEntry("later", { isFeatured: true, order: 2, title: "Later" }),
  workEntry("earlier", { isFeatured: true, order: 1, title: "Earlier" }),
  workEntry("draft", { isFeatured: true, order: 0, publicationState: "draft", title: "Draft" }),
  workEntry("plain", { isFeatured: false, order: 3, title: "Plain" })
]);
assert.deepEqual(nativeValue(featuredCards.map((card) => card.title)), ["Earlier", "Later"]);
assert.equal(featuredCards[0].frames.length, 4);

const malformedFeatured = featuredWorkCards([
  workEntry("no-frames", { frames: undefined, isFeatured: true, order: 1, title: "No frames" })
]);
assert.deepEqual(nativeValue(malformedFeatured[0].frames), []);

const proofCards = proofWorkCards(
  [
    workEntry("second", { order: 2, shortTitle: "Second" }),
    workEntry("first", { order: 1, shortTitle: "First" }),
    workEntry("draft", { order: 3, publicationState: "draft", shortTitle: "Draft" })
  ],
  [proofEntry("other-proof", { order: 1 })]
);
assert.deepEqual(nativeValue(proofCards.map((card) => card.title)), ["First", "Second"]);
assert.equal(proofCards[0].tags.length, 4);

const withAgentSkills = proofWorkCards(
  [workEntry("work", { order: 1, shortTitle: "Work" })],
  [proofEntry("agent-skills-notes", { claim: "From content", order: 1, status: "Planned", title: "Agent skills notes" })]
);
assert.deepEqual(nativeValue(withAgentSkills.map((card) => card.title)), ["Work", "Agent skills notes"]);
assert.equal(withAgentSkills[1].summary, "From content");
assert.equal(withAgentSkills[1].index, 2);

const withoutDraftProof = proofWorkCards(
  [workEntry("work", { order: 1, shortTitle: "Work" })],
  [proofEntry("agent-skills-notes", { publicationState: "draft", title: "Hidden draft" })]
);
assert.deepEqual(nativeValue(withoutDraftProof.map((card) => card.title)), ["Work"]);

console.log("Portfolio helper tests passed.");
