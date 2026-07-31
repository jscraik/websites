import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/lib/portfolio.ts", "utf8")
  .replace(/^import type .*\n/gm, "")
  .replace(/export type WorkEntry = .*\n/g, "")
  .replace(/export type ProofEntry = .*\n/g, "")
  .replace(/export type WorkCard = \{[\s\S]*?\};\n\n/, "")
  .replace(/const byOrder = <[^>]+>\(/, "const byOrder = (")
  .replace(/\(([^()]*):\s*[^,()]+,\s*([^()]*):\s*[^,()]+\)\s*=>/g, "($1, $2) =>")
  .replace(/function workRoute\(entry: Pick<WorkEntry, "id" \| "data">\)/, "function workRoute(entry)")
  .replace(/function featuredWorkCards\(workEntries: WorkEntry\[\]\)/, "function featuredWorkCards(workEntries)")
  .replace(/function proofWorkCards\(workEntries: WorkEntry\[\], proofEntries: ProofEntry\[\]\): WorkCard\[\]/, "function proofWorkCards(workEntries, proofEntries)")
  .replace(/export const /g, "const ")
  .replace(/export function /g, "function ");

const { byOrder, featuredWorkCards, proofWorkCards, workRoute } = new Function(
  source + "\nreturn { byOrder, featuredWorkCards, proofWorkCards, workRoute };"
)();

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
assert.deepEqual(featuredWorkCards([]), []);
assert.deepEqual(proofWorkCards([], []), []);

const featuredCards = featuredWorkCards([
  workEntry("later", { isFeatured: true, order: 2, title: "Later" }),
  workEntry("earlier", { isFeatured: true, order: 1, title: "Earlier" }),
  workEntry("draft", { isFeatured: true, order: 0, publicationState: "draft", title: "Draft" }),
  workEntry("plain", { isFeatured: false, order: 3, title: "Plain" })
]);
assert.deepEqual(featuredCards.map((card) => card.title), ["Earlier", "Later"]);
assert.equal(featuredCards[0].frames.length, 4);

const malformedFeatured = featuredWorkCards([
  workEntry("no-frames", { frames: undefined, isFeatured: true, order: 1, title: "No frames" })
]);
assert.deepEqual(malformedFeatured[0].frames, []);

const proofCards = proofWorkCards(
  [
    workEntry("second", { order: 2, shortTitle: "Second" }),
    workEntry("first", { order: 1, shortTitle: "First" }),
    workEntry("draft", { order: 3, publicationState: "draft", shortTitle: "Draft" })
  ],
  [proofEntry("other-proof", { order: 1 })]
);
assert.deepEqual(proofCards.map((card) => card.title), ["First", "Second"]);
assert.equal(proofCards[0].tags.length, 4);

const withAgentSkills = proofWorkCards(
  [workEntry("work", { order: 1, shortTitle: "Work" })],
  [proofEntry("agent-skills-notes", { claim: "From content", order: 1, status: "Planned", title: "Agent skills notes" })]
);
assert.deepEqual(withAgentSkills.map((card) => card.title), ["Work", "Agent skills notes"]);
assert.equal(withAgentSkills[1].summary, "From content");
assert.equal(withAgentSkills[1].index, 2);

const withoutDraftProof = proofWorkCards(
  [workEntry("work", { order: 1, shortTitle: "Work" })],
  [proofEntry("agent-skills-notes", { publicationState: "draft", title: "Hidden draft" })]
);
assert.deepEqual(withoutDraftProof.map((card) => card.title), ["Work"]);

console.log("Portfolio helper tests passed.");
