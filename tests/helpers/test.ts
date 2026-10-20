import { test as base, expect, chromium } from "@playwright/test";

// The runtime owner supplies a disposable Chrome profile for managed environments.
// Never connect this fixture to an authenticated browser profile.
const endpoint = process.env.CHROME_CDP_URL;
export const test = endpoint ? base.extend({
  browser: [async ({}, use) => {
    const browser = await chromium.connectOverCDP(endpoint, { noDefaults: true });
    // Playwright owns each test context; the external runtime owner owns Chrome.
    // Worker exit disconnects CDP without issuing Browser.close to that process.
    await use(browser);
  }, { scope: "worker" }]
}) : base;

export { expect };
