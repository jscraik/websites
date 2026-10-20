import { expect, test } from "../helpers/test";
import { preparePage } from "../helpers/visual";

test("pointer cancellation clears and recenters work feedback", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Pointer cancellation feedback requires a fine pointer.");
  await preparePage(page, "/#work");
  const thumbnail = page.locator(".work-thumbnail:has([data-work-card-cursor])").first();
  const cursor = thumbnail.locator("[data-work-card-cursor]");
  await thumbnail.hover({ position: { x: 40, y: 60 } });
  await expect(thumbnail).toHaveAttribute("data-pointer-active", "true");
  await expect.poll(() => cursor.evaluate(element =>
    Math.abs(Number.parseFloat(getComputedStyle(element).getPropertyValue("--work-cursor-x")))
  )).toBeGreaterThan(1);
  await thumbnail.dispatchEvent("pointercancel", { pointerType: "mouse" });
  await expect(thumbnail).not.toHaveAttribute("data-pointer-active");
  for (const property of ["--work-cursor-x", "--work-cursor-y"]) {
    await expect.poll(() => cursor.evaluate((element, name) =>
      Math.abs(Number.parseFloat(getComputedStyle(element).getPropertyValue(name))), property
    )).toBeLessThanOrEqual(0.08);
  }
});
