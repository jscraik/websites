import { test as base, expect, chromium } from "@playwright/test";

// The runtime owner supplies a disposable Chrome profile for managed environments.
// Never connect this fixture to an authenticated browser profile.
const endpoint = process.env.CHROME_CDP_URL;
export const test = endpoint ? base.extend({
  browser: [async ({}, use) => {
    const browser = await chromium.connectOverCDP(endpoint, { noDefaults: true });
    try {
      await use(browser);
    } finally {
      await browser.close();
    }
  }, { scope: "worker" }]
}) : base;

export { expect };
