import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createStaticServer } from "./static-server.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const server = createStaticServer(resolve(root, "dist"));
await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  for (const [path, contentType] of [["/", "text/html"], ["/style.css", "text/css"], ["/app.js", "text/javascript"]]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, `${path} returns 200`);
    assert.match(response.headers.get("content-type") ?? "", new RegExp(contentType), `${path} content type`);
    assert.equal((await response.text()).length > 100, true, `${path} has substantive content`);
  }
  const favicon = await fetch(`${baseUrl}/favicon.ico`);
  assert.equal(favicon.status, 200, "/favicon.ico fallback returns 200");
  console.log("Local HTTP runtime smoke: PASS");
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}
