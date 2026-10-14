import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { workRoute } from "../lib/portfolio";

/** List static pages and published project routes for crawler discovery. */
export async function GET({ site }: APIContext): Promise<Response> {
  if (!site) throw new Error("Sitemap requires a configured canonical site");
  const pages = Object.keys(import.meta.glob("./**/*.astro"));
  const routes = pages
    .filter((page) => !page.includes("[") && page !== "./404.astro")
    .map((page) => page.replace(/^\.\//, "/").replace(/(?:index)?\.astro$/, "/").replace(/\/+/g, "/"));
  const projects = (await getCollection("work"))
    .filter((entry) => entry.data.publicationState === "published")
    .map(workRoute);
  const locations = [...new Set([...routes, ...projects])].sort();
  const urls = import.meta.env.MODE === "preview" ? [] : locations;
  const body = urls.map((route) => {
    const location = new URL(route, site).href.replaceAll("&", "&amp;");
    return `<url><loc>${location}</loc></url>`;
  }).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}
