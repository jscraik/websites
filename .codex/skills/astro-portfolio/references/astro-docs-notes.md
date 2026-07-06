# Astro Docs Notes

Use this reference when Astro behavior is version-sensitive or when deciding the right source shape for routes, layouts, content collections, assets, and build validation.

## Context7 Retrieval

Resolved library:

- `/withastro/docs` from `ctx7 library astro "Astro project structure pages layouts content collections actions assets build"`.

Useful refresh commands:

```bash
ctx7 docs /withastro/docs "Astro project structure src/pages src/layouts public assets styles build command"
ctx7 docs /withastro/docs "Astro pages routing layouts Astro.props components frontmatter best practices"
ctx7 docs /withastro/docs "Astro content collections defineCollection getCollection render schema blog work pages"
```

## Current Docs Findings

- Astro projects conventionally keep static assets in `public/`, source code in `src/`, route files in `src/pages/`, layouts in `src/layouts/`, components in `src/components/`, styles in `src/styles/`, and collection config in `src/content.config.ts`.
- `src/` is Astro's processed source area; Astro optimizes and bundles source files for the generated site, unlike static `public/` files.
- `npm run build` compiles the project into deploy-ready static assets in `dist/` and is the local production-build proof for this repo.
- Astro layouts receive data through `Astro.props`; Markdown layouts can read `frontmatter` and render page content through `<slot />`.
- Astro Content Collections use `defineCollection`, loaders such as `glob()` or `file()`, and schemas from `astro/zod`.
- Pages can list collection entries with `getCollection("collectionName")`; collection references are available through `reference()` for relationships between content types.

## Apply In This Repo

- Keep route code under `src/pages/` and shared page chrome under `src/layouts/BaseLayout.astro`, `src/components/`, and `src/styles/global.css`.
- Treat `src/data/work.ts` and inline article arrays as transitional file-backed content until the site content model stabilizes.
- Prefer `src/content.config.ts` plus content collections for durable blog, work, and proof content once migration begins.
- Refresh Context7 before using an Astro API not already present in this repo.

## Source URLs

- https://github.com/withastro/docs/blob/main/src/content/docs/en/basics/project-structure.mdx
- https://github.com/withastro/docs/blob/main/src/content/docs/en/basics/layouts.mdx
- https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/content-collections.mdx
- https://github.com/withastro/docs/blob/main/src/content/docs/en/develop-and-build.mdx
