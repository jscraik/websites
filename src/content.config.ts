import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

import { PUBLICATION_STATES } from "./lib/publication-state";

const featuredSchema = z.object({
  eyebrow: z.string(),
  quote: z.string(),
  cta: z.string(),
  previewTitle: z.string(),
  previewMeta: z.string(),
  visual: z.enum(["article", "site", "terminal", "skills"])
}).strict();

const publicationStateSchema = z.enum(PUBLICATION_STATES);

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    subtitle: z.string(),
    date: z.string(),
    order: z.number().int().positive(),
    publicationState: publicationStateSchema,
    isFeatured: z.boolean(),
    href: z.string().startsWith("/").optional(),
    overview: z.string(),
    organization: z.string(),
    work: z.string(),
    role: z.string(),
    tags: z.array(z.string()).min(1),
    tone: z.enum(["paper", "dark", "blue", "peach", "green"]),
    featured: featuredSchema,
    proof: z.object({
      claim: z.string(),
      evidence: z.string(),
      caveat: z.string()
    }).strict(),
    frames: z.array(z.tuple([z.string(), z.string(), z.string()])).min(1)
  }).strict()
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    order: z.number().int().positive(),
    publicationState: publicationStateSchema,
    summary: z.string(),
    href: z.string(),
    featured: z.boolean(),
    proof: z.object({
      claim: z.string(),
      evidence: z.string(),
      caveat: z.string()
    }).strict()
  }).strict()
});

const proof = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/proof" }),
  schema: z.object({
    title: z.string(),
    status: z.enum(["Article", "Build", "Planned"]),
    order: z.number().int().positive(),
    publicationState: publicationStateSchema,
    href: z.string(),
    claim: z.string(),
    evidence: z.string(),
    caveat: z.string(),
    nextState: z.string()
  }).strict()
});

export const collections = { work, blog, proof };
