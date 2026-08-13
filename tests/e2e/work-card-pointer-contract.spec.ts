import { expect, test } from "@playwright/test";
import { preparePage } from "../helpers/visual";

test.describe("work-card pointer contract", () => {
  test("reveals a dimming layer and a pointer-following arrow", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Pointer tracking is a fine-pointer contract.");
    await preparePage(page, "/#work");

    const card = page.getByRole("link", { name: /SkillsBar/ }).last();
    const thumbnail = card.locator(".work-thumbnail");
    const cursor = thumbnail.locator("[data-work-card-cursor]");

    await expect(cursor).toHaveCount(1);
    await thumbnail.hover({ position: { x: 40, y: 60 } });
    await expect(thumbnail).toHaveAttribute("data-pointer-active", "true");

    const firstTransform = await cursor.evaluate((element) => getComputedStyle(element).transform);
    await thumbnail.hover({ position: { x: 180, y: 220 } });
    await expect.poll(() => cursor.evaluate((element) => getComputedStyle(element).transform)).not.toBe(firstTransform);

    await page.mouse.move(0, 0);
    await expect(thumbnail).not.toHaveAttribute("data-pointer-active", "true");
  });

  test("keeps reduced-motion pointer feedback centered and immediate", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "Pointer tracking is a fine-pointer contract.");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await preparePage(page, "/#work");

    const thumbnail = page.getByRole("link", { name: /SkillsBar/ }).last().locator(".work-thumbnail");
    const cursor = thumbnail.locator("[data-work-card-cursor]");

    await thumbnail.hover({ position: { x: 40, y: 60 } });

    await expect(cursor).toHaveCSS("--work-cursor-x", "0px");
    await expect(cursor).toHaveCSS("--work-cursor-y", "0px");
    await expect(cursor.locator(".work-thumbnail__arrow")).toHaveCSS("transition-duration", "0s");
  });
});
