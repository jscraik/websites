import assert from "node:assert/strict";
import test from "node:test";
import { assertPatchedChrome, launchPatchedChrome, connectPatchedChrome } from "./lib/patched-chrome.mjs";

for (const version of ["156.0.8078.73", "156.0.8078.74", "156.0.8079.0", "157.0.0.0"]) {
  test(`accepts patched Chrome ${version}`, () => assert.doesNotThrow(() => assertPatchedChrome(version)));
}
for (const version of ["149.0.7827.55", "156.0.8078.4", "156.0.8078.72", "156.0.8077.99", "", null, "Chrome/156.0.8078.74", "156.0.8078.74-beta"]) {
  test(`blocks old or unknown Chrome ${version}`, () => assert.throws(() => assertPatchedChrome(version), /blocked/));
}

test("launches installed sandboxed Chrome without an executable or bundled fallback", async () => {
  const browser = { version: () => "156.0.8078.74" };
  const result = await launchPatchedChrome({ launch: async (options) => {
    assert.deepEqual(options, { channel: "chrome", headless: true, chromiumSandbox: true });
    return browser;
  } });
  assert.equal(result, browser);
});

test("closes an old locally owned browser before returning it to a caller", async () => {
  let closed = 0;
  await assert.rejects(launchPatchedChrome({ launch: async () => ({
    version: () => "156.0.8078.4", close: async () => { closed++; }
  }) }), /blocked/);
  assert.equal(closed, 1);
});

test("missing Chrome or sandbox failure propagates without retry or fallback", async () => {
  let calls = 0;
  await assert.rejects(launchPatchedChrome({ launch: async () => {
    calls++; throw new Error("sandbox unavailable");
  } }), /sandbox unavailable/);
  assert.equal(calls, 1);
});

test("attaches with noDefaults and never enumerates or closes runtime-owned contexts", async () => {
  const browser = {
    version: () => "156.0.8078.74",
    contexts: () => assert.fail("must not enumerate contexts"),
    close: () => assert.fail("must not close external Chrome")
  };
  assert.equal(await connectPatchedChrome({ connectOverCDP: async (endpoint, options) => {
    assert.equal(endpoint, "http://127.0.0.1:9223/");
    assert.deepEqual(options, { noDefaults: true, timeout: 10_000 });
    return browser;
  } }, "http://127.0.0.1:9223"), browser);
});

test("rejects old CDP browsers without changing the runtime owner's browser", async () => {
  await assert.rejects(connectPatchedChrome({ connectOverCDP: async () => ({
    version: () => "156.0.8078.4", close: () => assert.fail("owner browser must survive")
  }) }, "http://127.0.0.1:9223"), /blocked/);
});

for (const endpoint of ["not-a-url-secret", "http://example.com:9223", "http://127.0.0.1:9223/json", "http://user:secret@localhost:9223", "ws://localhost:9223", "http://localhost:9223/?token=secret"]) {
  test("rejects unapproved CDP endpoint before connecting", async () => {
    await assert.rejects(connectPatchedChrome({ connectOverCDP: () => assert.fail("must not connect") }, endpoint), (error) => {
      assert.match(error.message, /blocked/);
      assert.doesNotMatch(error.message, /secret/);
      return true;
    });
  });
}
