import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const types = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"],
]);

export function createStaticServer(rootDirectory) {
  const root = resolve(rootDirectory);
  return createServer(async (request, response) => {
    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    const requested = pathname === "/" ? "/index.html" : pathname;
    const relative = normalize(decodeURIComponent(requested)).replace(/^[/\\]+/, "");
    const candidate = join(root, relative);

    if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    try {
      const metadata = await stat(candidate);
      const file = metadata.isDirectory() ? join(candidate, "index.html") : candidate;
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": types.get(extname(file)) ?? "application/octet-stream",
      });
      createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });
}
