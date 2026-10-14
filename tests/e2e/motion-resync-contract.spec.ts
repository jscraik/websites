import { expect, test } from "@playwright/test";
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

test("resizing resynchronizes the navigation highlight with current hover", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Navigation hover requires a fine pointer.");
  await preparePage(page, "/");
  const target = page.locator(".nav-flip").first();
  const highlight = page.locator(".nav-bg");
  await target.hover();
  await expect(highlight).toHaveAttribute("data-active", "true");
  await page.setViewportSize({ width: 1200, height: 1000 });
  await expect.poll(() => highlight.evaluate(element => {
    const hovered = document.querySelector(".nav-flip:hover");
    if (!hovered) return !element.hasAttribute("data-active") && element.parentElement?.classList.contains("nav-inner");
    const actual = element.getBoundingClientRect();
    const expected = hovered.getBoundingClientRect();
    return element.parentElement === hovered && element.getAttribute("data-active") === "true"
      && Math.abs(actual.x - expected.x) < 1 && Math.abs(actual.y - expected.y) < 1
      && Math.abs(actual.width - expected.width) < 1 && Math.abs(actual.height - expected.height) < 1;
  })).toBe(true);
});
