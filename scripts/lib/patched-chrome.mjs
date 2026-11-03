// Security floor for CVE-2026-118306/118331/118348/118344; not a latest-version claim.
export const MINIMUM_CHROME_VERSION = "156.0.8078.73";
export const chromeLaunchOptions = Object.freeze({
  channel: "chrome", headless: true, chromiumSandbox: true
});

/** Reject unknown or older browser builds before creating any page or context. */
export function assertPatchedChrome(version) {
  if (typeof version !== "string" || !/^\d+\.\d+\.\d+\.\d+$/.test(version)) {
    throw new Error("Chrome security check blocked: unknown browser version.");
  }
  const actual = version.split(".").map(Number);
  const minimum = MINIMUM_CHROME_VERSION.split(".").map(Number);
  const difference = actual.findIndex((part, index) => part !== minimum[index]);
  if (actual.some((part) => !Number.isSafeInteger(part)) ||
      (difference !== -1 && actual[difference] < minimum[difference])) {
    throw new Error(`Chrome security check blocked: requires ${MINIMUM_CHROME_VERSION} or newer.`);
  }
}

/** Launch installed stable Chrome with its sandbox; never fall back to bundled Chromium. */
export async function launchPatchedChrome(chromium) {
  const browser = await chromium.launch(chromeLaunchOptions);
  try {
    assertPatchedChrome(browser.version());
    return browser;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/** Attach only to an owner-approved disposable loopback CDP browser, without default-context access. */
export async function connectPatchedChrome(chromium, endpoint) {
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error("Chrome CDP check blocked: invalid endpoint.");
  }
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      !url.port || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Chrome CDP check blocked: requires an approved loopback HTTP endpoint.");
  }
  const browser = await chromium.connectOverCDP(url.href, { noDefaults: true, timeout: 10_000 });
  // On rejection, leave the runtime owner's browser untouched; the caller must stop.
  assertPatchedChrome(browser.version());
  return browser;
}
