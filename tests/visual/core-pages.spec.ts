import { expect, test } from "../helpers/test";
import { coreRoutes, preparePage } from "../helpers/visual";

test.describe("core page visual snapshots", () => {
  for (const route of coreRoutes) {
    test(route.name, async ({ page }, testInfo) => {
      await preparePage(page, route.path, { stabilize: false });
      // Compare the fully loaded page, not viewport-dependent lazy placeholders.
      await page.locator("img").evaluateAll(async (images) => {
        for (const image of images) image.loading = "eager";
        await Promise.all(images.map((image) => image.decode()));
      });
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(() => page.locator(".skip-link").evaluate((link) => link.getBoundingClientRect().bottom))
        .toBeLessThanOrEqual(0);
      await page.addStyleTag({ content: ".skip-link { visibility: hidden !important; }" });

      await expect(page).toHaveScreenshot(`${route.name}-${testInfo.project.name}.png`, {
        animations: "disabled",
        fullPage: true,
        scale: "css",
        maxDiffPixelRatio: 0.02
      });
    });
  }
});
