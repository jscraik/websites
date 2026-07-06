import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const featuredSchema = z.object({
  eyebrow: z.string(),
  quote: z.string(),
  cta: z.string(),
  previewTitle: z.string(),
  previewMeta: z.string(),
  visual: z.enum(["article", "site", "terminal", "skills"])
});

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    subtitle: z.string(),
    date: z.string(),
    order: z.number().int().positive(),
    isFeatured: z.boolean(),
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
    }),
    frames: z.array(z.tuple([z.string(), z.string(), z.string()])).min(1)
  })
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    order: z.number().int().positive(),
    summary: z.string(),
    href: z.string(),
    featured: z.boolean(),
    proof: z.object({
      claim: z.string(),
      evidence: z.string(),
      caveat: z.string()
    })
  })
});

const proof = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/proof" }),
  schema: z.object({
    title: z.string(),
    status: z.enum(["Article", "Build", "Planned"]),
    order: z.number().int().positive(),
    href: z.string(),
    claim: z.string(),
    evidence: z.string(),
    caveat: z.string(),
    nextState: z.string()
  })
});

export const collections = { work, blog, proof };
