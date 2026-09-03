import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createStaticServer } from "./static-server.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceMode = process.argv.includes("--source");
const directory = resolve(root, sourceMode ? "src" : "dist");
const portArgument = process.argv.find((value) => value.startsWith("--port="));
const port = Number(portArgument?.split("=")[1] ?? process.env.PORT ?? 4173);
const server = createStaticServer(directory);

server.listen(port, "127.0.0.1", () => {
  console.log(`Fieldcraft blind trial v3: http://127.0.0.1:${port}/`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
