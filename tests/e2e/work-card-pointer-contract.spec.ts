import { expect, test, type Locator } from "@playwright/test";
import { preparePage } from "../helpers/visual";

async function waitForTransformToSettle(locator: Locator) {
  let previous = "";
  let stableSamples = 0;
  await expect.poll(async () => {
    const current = await locator.evaluate((element) => getComputedStyle(element).transform);
    stableSamples = current !== "none" && current === previous ? stableSamples + 1 : 0;
    previous = current;
    return stableSamples;
  }).toBeGreaterThanOrEqual(2);
}

test.describe("work-card pointer contract", () => {
  test("reveals a dimming layer and a pointer-following arrow", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Pointer tracking is a fine-pointer contract.");
    await preparePage(page, "/#work");

    const thumbnail = page.locator(".work-thumbnail:has([data-work-card-cursor])").first();
    const cursor = thumbnail.locator("[data-work-card-cursor]");

    await expect(cursor).toHaveCount(1);
    await thumbnail.hover({ position: { x: 40, y: 60 } });
    await expect(thumbnail).toHaveAttribute("data-pointer-active", "true");

    await waitForTransformToSettle(cursor);
    const firstTransform = await cursor.evaluate((element) => getComputedStyle(element).transform);
    await thumbnail.hover({ position: { x: 180, y: 220 } });
    await waitForTransformToSettle(cursor);
    await expect(cursor).not.toHaveCSS("transform", firstTransform);

    await page.mouse.move(0, 0);
    await expect(thumbnail).not.toHaveAttribute("data-pointer-active", "true");
  });

  test("keeps reduced-motion pointer feedback centered and immediate", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Pointer tracking is a fine-pointer contract.");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await preparePage(page, "/#work");

    const thumbnail = page.locator(".work-thumbnail:has([data-work-card-cursor])").first();
    const cursor = thumbnail.locator("[data-work-card-cursor]");

    await thumbnail.hover({ position: { x: 40, y: 60 } });

    await expect(thumbnail).toHaveAttribute("data-pointer-active", "true");
    await expect(cursor).toHaveCSS("--work-cursor-x", "0px");
    await expect(cursor).toHaveCSS("--work-cursor-y", "0px");
    await expect(cursor.locator(".work-thumbnail__arrow")).toHaveCSS("transition-property", "none");
  });
});
