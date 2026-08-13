import { expect, test } from "@playwright/test";
import { preparePage } from "../helpers/visual";

test.describe("animated CTA contract", () => {
  test("moves the shared fill from the button into the arrow on hover", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Hover transfer is a fine-pointer contract.");
    await preparePage(page, "/");

    const button = page.getByRole("link", { name: "Explore SkillsBar" });
    const fill = button.locator("[data-button-fill]");

    await expect(fill).toHaveCount(1);
    await expect(fill.locator("xpath=..")).toHaveClass(/(^|\s)small-button(\s|$)/);

    await button.hover();

    await expect(button).toHaveAttribute("data-active", "true");
    await expect(fill.locator("xpath=..")).toHaveClass(/small-button__arrow/);

    await page.mouse.move(0, 0);

    await expect(button).not.toHaveAttribute("data-active", "true");
    await expect(fill.locator("xpath=..")).toHaveClass(/(^|\s)small-button(\s|$)/);
  });

  test("keeps reduced-motion interaction immediate", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Hover transfer is a fine-pointer contract.");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await preparePage(page, "/");

    const button = page.getByRole("link", { name: "Explore SkillsBar" });
    await button.hover();

    const animationCount = await button.locator("[data-button-fill]").evaluate((fill) =>
      fill.getAnimations().length
    );
    expect(animationCount).toBe(0);
  });
});
