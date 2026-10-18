import { expect, test } from "../helpers/test";
import AxeBuilder from "@axe-core/playwright";
import { coreRoutes, preparePage } from "../helpers/visual";

test.describe("accessibility smoke", () => {
  for (const route of coreRoutes) {
    test(route.name, async ({ page }) => {
      await preparePage(page, route.path);

      const { violations } = await new AxeBuilder({ page })
        .analyze();

      expect(violations).toEqual([]);
    });
  }
});
