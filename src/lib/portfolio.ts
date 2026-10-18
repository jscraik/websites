import type { CollectionEntry } from "astro:content";

/** A work collection entry with its validated portfolio metadata. */
export type WorkEntry = CollectionEntry<"work">;
/** A proof collection entry with its validated evidence metadata. */
export type ProofEntry = CollectionEntry<"proof">;

export const workIllustrations: Record<string, string> = {
  "skillsbar": "skillsbar",
  "skills-sdk": "skills-sdk",
  "cli-proof-series": "cli",
  "brainwav-io": "proof",
  "ai-native-devrel": "devrel"
};

/** Display data shared by work and proof cards in the portfolio grid. */
export type WorkCard = {
  title: string;
  eyebrow: string;
  summary: string;
  index: number;
  tags: string[];
  tone: string;
  href: string;
  illustration: string;
};

/** Compares collection entries by ascending metadata order. */
export const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

/** Returns an entry's destination override or its default work detail route. */
export function workRoute(entry: Pick<WorkEntry, "id" | "data">) {
  return entry.data.href ?? "/work/" + entry.id + "/";
}

/**
 * Builds ordered, published featured cards without mutating the input.
 * Artwork follows the entry ID, with proof artwork as the fallback.
 */
export function featuredWorkCards(workEntries: WorkEntry[]) {
  return workEntries
    .slice()
    .sort(byOrder)
    .filter((entry) => entry.data.publicationState === "published")
    .filter((entry) => entry.data.isFeatured)
    .map((entry) => ({
      title: entry.data.title,
      href: workRoute(entry),
      frames: entry.data.frames ?? [],
      ...entry.data.featured,
      illustration: workIllustrations[entry.id] ?? "proof"
    }));
}

/**
 * Builds ordered, published work cards, followed by published agent skills notes.
 * Assigns one-based indices and entry-specific artwork without mutating inputs.
 */
export function proofWorkCards(workEntries: WorkEntry[], proofEntries: ProofEntry[]): WorkCard[] {
  const sortedWorkEntries = workEntries
    .slice()
    .sort(byOrder)
    .filter((entry) => entry.data.publicationState === "published");

  return [
    ...sortedWorkEntries.map((entry, index) => ({
      title: entry.data.shortTitle,
      eyebrow: entry.data.date,
      summary: entry.data.subtitle,
      index: index + 1,
      tags: entry.data.tags ?? [],
      tone: entry.data.tone,
      href: workRoute(entry),
      illustration: workIllustrations[entry.id] ?? "proof"
    })),
    ...proofEntries
      .slice()
      .sort(byOrder)
      .filter((entry) => entry.data.publicationState === "published")
      .filter((entry) => entry.id === "agent-skills-notes")
      .map((entry) => ({
        title: entry.data.title,
        eyebrow: entry.data.status,
        summary: entry.data.claim,
        index: sortedWorkEntries.length + 1,
        tags: ["Reusable", "Practice"],
        tone: "green",
        href: "/proof/",
        illustration: "proof"
      }))
  ];
}
