import { describe, expect, it } from "vitest";

import {
  featuredWorkCards,
  proofWorkCards,
  workRoute,
  type ProofEntry,
  type WorkEntry
} from "./portfolio";

function workEntry(
  id: string,
  overrides: Partial<WorkEntry["data"]> = {}
): WorkEntry {
  return {
    id,
    data: {
      title: id,
      shortTitle: id,
      subtitle: "Subtitle",
      order: 1,
      publicationState: "published",
      isFeatured: true,
      featured: {
        ctaLabel: "Open",
        previewSummary: "Summary",
        previewTitle: "Preview",
        quote: "Quote",
        quoteLabel: "Label",
        visual: "article"
      },
      ...overrides
    }
  } as WorkEntry;
}

function proofEntry(
  id: string,
  overrides: Partial<ProofEntry["data"]> = {}
): ProofEntry {
  return {
    id,
    data: {
      title: id,
      order: 1,
      publicationState: "published",
      status: "Planned",
      summary: "Summary",
      href: "/proof/",
      ...overrides
    }
  } as ProofEntry;
}

describe("portfolio publication helpers", () => {
  it("prefers a declared direct route", () => {
    expect(workRoute(workEntry("skillsbar", { href: "/demos/skillsbar/" }))).toBe(
      "/demos/skillsbar/"
    );
    expect(workRoute(workEntry("case-study"))).toBe("/work/case-study/");
  });

  it("keeps draft work out of featured cards", () => {
    const cards = featuredWorkCards([
      workEntry("published", { order: 2 }),
      workEntry("draft", { order: 1, publicationState: "draft" })
    ]);

    expect(cards.map((card) => card.title)).toEqual(["published"]);
  });

  it("keeps draft work and proof out of the public work rail", () => {
    const cards = proofWorkCards(
      [
        workEntry("published", { order: 1 }),
        workEntry("draft", { order: 2, publicationState: "draft" })
      ],
      [
        proofEntry("agent-skills-notes", { title: "Published proof" }),
        proofEntry("agent-skills-notes", {
          order: 2,
          publicationState: "draft",
          title: "Draft proof"
        })
      ]
    );

    expect(cards.map((card) => card.title)).toEqual(["published", "Published proof"]);
  });
});
