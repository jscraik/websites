import { test as base, expect, chromium } from "@playwright/test";
import { launchPatchedChrome, connectPatchedChrome } from "../../scripts/lib/patched-chrome.mjs";

// Only the runtime owner may supply a disposable Chrome profile; never attach an authenticated one.
const endpoint = process.env.CHROME_CDP_URL;
export const test = base.extend({
  browser: [async ({ headless }, use) => {
    const browser = endpoint
      ? await connectPatchedChrome(chromium, endpoint)
      : await launchPatchedChrome(chromium, { headless });
    try {
      await use(browser);
    } finally {
      // Test contexts are owned by Playwright; worker exit disconnects external CDP.
      if (!endpoint) await browser.close();
    }
  }, { scope: "worker" }]
});

export { expect };
export type { Page, Locator } from "@playwright/test";
