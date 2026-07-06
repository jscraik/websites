import type { CollectionEntry } from "astro:content";

export type WorkEntry = CollectionEntry<"work">;
export type ProofEntry = CollectionEntry<"proof">;

export type WorkCard = {
  title: string;
  tags: string[];
  tone: string;
  href: string;
};

export const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export function workRoute(entry: Pick<WorkEntry, "id">) {
  return "/work/" + entry.id + "/";
}

export function featuredWorkCards(workEntries: WorkEntry[]) {
  return workEntries
    .filter((entry) => entry.data.isFeatured)
    .map((entry) => ({
      title: entry.data.title,
      href: workRoute(entry),
      ...entry.data.featured
    }));
}

export function proofWorkCards(workEntries: WorkEntry[], proofEntries: ProofEntry[]): WorkCard[] {
  return [
    ...workEntries.map((entry) => ({
      title: entry.data.shortTitle,
      tags: entry.data.tags.slice(0, 3),
      tone: entry.data.tone,
      href: workRoute(entry)
    })),
    ...proofEntries
      .filter((entry) => entry.id === "agent-skills-notes")
      .map(() => ({
        title: "Agent Skills",
        tags: ["Reusable", "Practice"],
        tone: "green",
        href: "/proof/"
      }))
  ];
}
