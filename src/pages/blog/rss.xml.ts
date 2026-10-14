import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { byOrder } from "../../lib/portfolio";

const xmlEscape = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

export async function GET({ site }: APIContext) {
  const canonicalSite = site ?? new URL("https://jscraik.com");
  const articles = (await getCollection("blog"))
    .filter((entry) => entry.data.publicationState === "published")
    .sort(byOrder);

  const items = articles.map((article) => {
    const href = article.data.href;
    if (!href) {
      throw new Error(`Published article ${article.id} is missing href`);
    }
    const url = new URL(href, canonicalSite).href;
    return [
      "<item>",
      `<title>${xmlEscape(article.data.title)}</title>`,
      `<link>${xmlEscape(url)}</link>`,
      `<guid>${xmlEscape(url)}</guid>`,
      `<description>${xmlEscape(article.data.summary)}</description>`,
      `<category>${xmlEscape(article.data.category)}</category>`,
      "</item>"
    ].join("");
  }).join("");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"><channel>',
    "<title>Jamie Scott Craik — software development and AI-assisted work</title>",
    `<link>${xmlEscape(new URL("/blog/", canonicalSite).href)}</link>`,
    "<description>Notes on software projects, developer tools, AI-assisted delivery, and a career switch into technology.</description>",
    items,
    "</channel></rss>"
  ].join("");

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" }
  });
}
