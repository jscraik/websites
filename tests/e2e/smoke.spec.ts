import { expect, test } from "@playwright/test";
import { coreRoutes, preparePage } from "../helpers/visual";

test.describe("page smoke", () => {
  for (const route of coreRoutes) {
    test(route.name, async ({ page }) => {
      await preparePage(page, route.path);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});
