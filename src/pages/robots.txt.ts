import type { APIContext } from "astro";

/** Emit crawler guidance for the explicitly selected build mode. */
export function GET({ site }: APIContext): Response {
  if (!site) throw new Error("Robots output requires a configured canonical site");
  const preview = import.meta.env.DEV || import.meta.env.MODE === "preview";
  const body = preview
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap.xml", site).href}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
