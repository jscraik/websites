import type { CollectionEntry } from "astro:content";

export type WorkEntry = CollectionEntry<"work">;
export type ProofEntry = CollectionEntry<"proof">;

export type WorkCard = {
  title: string;
  eyebrow: string;
  summary: string;
  index: number;
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
      frames: entry.data.frames.slice(0, 3),
      ...entry.data.featured
    }));
}

export function proofWorkCards(workEntries: WorkEntry[], proofEntries: ProofEntry[]): WorkCard[] {
  return [
    ...workEntries.map((entry, index) => ({
      title: entry.data.shortTitle,
      eyebrow: entry.data.date,
      summary: entry.data.subtitle,
      index: index + 1,
      tags: entry.data.tags.slice(0, 3),
      tone: entry.data.tone,
      href: workRoute(entry)
    })),
    ...proofEntries
      .filter((entry) => entry.id === "agent-skills-notes")
      .map((entry) => ({
        title: entry.data.title,
        eyebrow: entry.data.status,
        summary: entry.data.claim,
        index: workEntries.length + 1,
        tags: ["Reusable", "Practice"],
        tone: "green",
        href: "/proof/"
      }))
  ];
}
