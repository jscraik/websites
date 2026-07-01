import { expect, test } from "@playwright/test";
import { coreRoutes, preparePage } from "../helpers/visual";

test.describe("core page visual snapshots", () => {
  for (const route of coreRoutes) {
    test(route.name, async ({ page }, testInfo) => {
      await preparePage(page, route.path);

      await expect(page).toHaveScreenshot(`${route.name}-${testInfo.project.name}.png`, {
        animations: "disabled",
        fullPage: true,
        maxDiffPixelRatio: 0.02
      });
    });
  }
});
