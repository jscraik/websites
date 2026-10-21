import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { approvedBannerPathsMatch } from "./lib/social-profile-assets-contract.mjs";

/** Exercise the actual render helper without starting the generator's top-level browser. */
function loadRenderPage(browser) {
  const source = readFileSync(new URL("./generate-social-profile-assets.mjs", import.meta.url), "utf8");
  const start = source.indexOf("async function renderPage(");
  const end = source.indexOf("\nfunction escapeHtml(", start);
  assert.ok(start >= 0 && end > start, "render helper boundaries must exist");
  return runInNewContext(`${source.slice(start, end)}\nrenderPage`, { browser });
}

for (const failureAt of ["newPage", "screenshot", null]) {
  test(`closes only its own context after ${failureAt ?? "successful rendering"}`, async () => {
    const calls = [];
    const failure = new Error("injected rendering failure");
    const page = {
      /** Record document setup without opening a browser page. */
      async setContent() { calls.push("content"); },
      /** Record the font-readiness step of the production render flow. */
      async evaluate() { calls.push("fonts"); },
      /** Inject screenshot failure at the configured boundary. */
      async screenshot() {
        calls.push("screenshot");
        if (failureAt === "screenshot") throw failure;
      }
    };
    const browser = {
      /** Return an owned context fixture with an injectable page-creation failure. */
      async newContext() {
        return {
          /** Return the fixture page or reject before it exists. */
          async newPage() {
            calls.push("page");
            if (failureAt === "newPage") throw failure;
            return page;
          },
          /** Record release of the generator-owned context. */
          async close() { calls.push("context.close"); }
        };
      },
      /** Reject attempts to close the externally owned browser. */
      async close() { assert.fail("runtime-owned browser must remain open"); }
    };
    const render = loadRenderPage(browser);
    const result = render({ width: 100, height: 100, scale: 1, outputPath: "fixture.png", html: "<p>Fixture</p>" });
    if (failureAt) await assert.rejects(result, (error) => error === failure);
    else await result;
    assert.deepEqual(calls, failureAt === "newPage"
      ? ["page", "context.close"]
      : ["page", "content", "fonts", "screenshot", "context.close"]);
  });
}

const valid = {
  source: "src/brand/source/approved/jamie-x-header-1500x500.png",
  output: "public/brand/social/approved/jamie-x-header-1500x500.png",
};

test("accepts the exact approved X banner pair", () => {
  assert.equal(approvedBannerPathsMatch("x", valid), true);
});

test("accepts the exact approved LinkedIn banner pair", () => {
  assert.equal(approvedBannerPathsMatch("linkedin", {
    source: "src/brand/source/approved/jamie-linkedin-background-1584x396.png",
    output: "public/brand/social/approved/jamie-linkedin-background-1584x396.png",
  }), true);
});

test("rejects inherited platform keys", () => {
  assert.equal(approvedBannerPathsMatch("__proto__", {}), false);
});

test("rejects an unapproved filename inside the approved directories", () => {
  assert.equal(approvedBannerPathsMatch("x", {
    source: "src/brand/source/approved/unreviewed.png",
    output: "public/brand/social/approved/unreviewed.png",
  }), false);
});
