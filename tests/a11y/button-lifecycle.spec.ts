import { expect, test } from "../helpers/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const originalMatchMedia = window.matchMedia.bind(window);
    const pointerQuery = "(hover: hover) and (pointer: fine)";
    const pointer = originalMatchMedia(pointerQuery);
    let fine = true;
    Object.defineProperty(pointer, "matches", { get: () => fine });
    window.matchMedia = (query) => query === pointerQuery ? pointer : originalMatchMedia(query);
    window.addEventListener("test:coarse-pointer", () => {
      fine = false;
      pointer.dispatchEvent(new Event("change"));
    });
  });
  await page.goto("/");
  await expect(page.locator("[data-animated-button]").first()).toHaveAttribute("data-button-ready", "true");
});

test("losing fine-pointer capability restores a hovered button", async ({ page }) => {
  const button = page.locator("[data-animated-button]").first();
  await button.dispatchEvent("mouseenter");
  await expect(button).toHaveAttribute("data-active", "true");
  await page.evaluate(() => window.dispatchEvent(new Event("test:coarse-pointer")));
  await expect(button).not.toHaveAttribute("data-active");
  await expect(button.locator(":scope > [data-button-fill]")).toHaveCount(1);
  expect(await button.locator("[data-button-fill]").evaluate((fill) => fill.getAnimations().length)).toBe(0);
});

test("pagehide resets the fill and a restored page can activate again", async ({ page }) => {
  const button = page.locator("[data-animated-button]").first();
  await button.dispatchEvent("mouseenter");
  await expect(button).toHaveAttribute("data-active", "true");
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })));
  await expect(button).not.toHaveAttribute("data-active");
  await expect(button.locator(":scope > [data-button-fill]")).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
  await button.dispatchEvent("mouseenter");
  await expect(button).toHaveAttribute("data-active", "true");
  await button.dispatchEvent("mouseleave");
  await expect(button.locator(":scope > [data-button-fill]")).toHaveCount(1);
});
