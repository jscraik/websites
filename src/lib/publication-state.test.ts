import { describe, expect, it } from "vitest";

import { PUBLICATION_STATES } from "./publication-state";

describe("publication states", () => {
  it("keeps the public visibility vocabulary stable", () => {
    expect(PUBLICATION_STATES).toEqual(["draft", "unlisted", "published"]);
  });
});
