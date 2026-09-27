import { expect, test } from "@playwright/test";
import { coreRoutes, preparePage } from "../helpers/visual";

test.describe("core page visual snapshots", () => {
  for (const route of coreRoutes) {
    test(route.name, async ({ page }, testInfo) => {
      await preparePage(page, route.path, { stabilize: false });
      const footerImage = page.locator(".site-footer img");
      await footerImage.scrollIntoViewIfNeeded();
      await footerImage.evaluate(async (image) => {
        if (image instanceof HTMLImageElement) await image.decode();
      });

      const screenshot = await page.screenshot({ animations: "disabled", fullPage: true });
      expect(screenshot).toMatchSnapshot(`${route.name}-${testInfo.project.name}.png`, {
        maxDiffPixelRatio: 0.02
      });
    });
  }
});
