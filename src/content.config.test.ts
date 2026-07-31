import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { PUBLICATION_STATES } from "./lib/publication-state";

describe("portfolio content publication contract", () => {
  it("binds every collection to the shared publication-state vocabulary", () => {
    const source = readFileSync(new URL("./content.config.ts", import.meta.url), "utf8");

    expect(PUBLICATION_STATES).toEqual(["draft", "unlisted", "published"]);
    expect(source).toContain("const publicationStateSchema = z.enum(PUBLICATION_STATES)");
    expect(source.match(/publicationState: publicationStateSchema/g)).toHaveLength(3);
  });

  it("keeps direct work routes local", () => {
    const source = readFileSync(new URL("./content.config.ts", import.meta.url), "utf8");

    expect(source).toContain('href: z.string().startsWith("/").optional()');
  });
});
