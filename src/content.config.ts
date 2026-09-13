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

const narrativeSectionSchema = z.object({
  title: z.string(),
  body: z.string()
}).strict();

const listSectionSchema = z.object({
  title: z.string(),
  items: z.array(z.string()).min(1)
}).strict();

const caseStudySchema = z.object({
  problem: narrativeSectionSchema,
  discovery: narrativeSectionSchema,
  constraints: listSectionSchema,
  decisions: listSectionSchema,
  delivery: narrativeSectionSchema,
  correction: narrativeSectionSchema,
  outcome: narrativeSectionSchema,
  roleBoundary: z.object({
    jamie: z.string(),
    codex: z.string()
  }).strict(),
  links: z.array(z.object({
    label: z.string(),
    href: z.string(),
    primary: z.boolean()
  }).strict()).min(1).refine(
    (links) => links.filter((link) => link.primary).length === 1,
    "case study links must contain exactly one primary evidence action"
  )
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
    capture: z.object({
      src: z.string().regex(/^\/products\/[a-z0-9-]+\/[a-z0-9-]+\.(?:png|webp|avif)$/),
      alt: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      caption: z.string().min(1)
    }).strict().optional(),
    featured: featuredSchema,
    proof: z.object({
      claim: z.string(),
      evidence: z.string(),
      caveat: z.string()
    }).strict(),
    frames: z.array(z.tuple([z.string(), z.string(), z.string()])).min(1),
    caseStudy: caseStudySchema.optional()
  }).strict()
});

const blogEntrySchema = z.object({
    title: z.string(),
    date: z.string(),
    order: z.number().int().positive(),
    publicationState: publicationStateSchema,
    category: z.enum(["Deployment note", "Trust note", "Working practice", "Career note"]),
    summary: z.string(),
    href: z.string().startsWith("/").optional(),
    proofLink: z.string().startsWith("/"),
    featured: z.boolean(),
    proof: z.object({
      claim: z.string(),
      evidence: z.string(),
      caveat: z.string()
    }).strict()
  }).strict().superRefine((entry, context) => {
    if (entry.publicationState !== "draft" && !entry.href) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["href"],
        message: "published and unlisted blog entries require a real route"
      });
    }
    if (entry.publicationState === "draft" && entry.href) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["href"],
        message: "draft blog entries must not advertise an unbuilt route"
      });
    }
  });

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: blogEntrySchema
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
