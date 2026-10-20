import { expect, test } from "../helpers/test";

test.describe("navigation without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("About, browser Back, and the primary project remain reachable", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-work-row] .work-mini-card').first()).toHaveAttribute("data-active", "true");
    await expect(page.locator('[data-work-row] .work-mini-card').first().locator(".tag-row")).toHaveCSS("visibility", "visible");
    const start = page.locator('[data-primary-start="true"]');
    await expect(start).toHaveAttribute("href", "/demos/skillsbar/");

    await page.locator('.site-header a[href="/now/"]').first().click();
    await expect(page).toHaveURL(/\/now\/$/);
    await expect(page.locator("main h1")).toBeVisible();

    await page.goBack({ waitUntil: "commit" });
    await expect(start).toBeVisible();
    await expect.poll(() => start.evaluate(element => {
      for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor.getAnimations().some(animation => animation.playState === "running")) return false;
      }
      return true;
    })).toBe(true);
    await start.click();
    await expect(page).toHaveURL(/\/demos\/skillsbar\/$/);
    await expect(page.locator("main h1")).toBeVisible();
    const fallback = page.locator(".scenario-fallback");
    await expect(fallback).toBeVisible();
    await expect(page.locator(".stage-state")).toHaveText(["Passed", "Passed", "Review required", "Held", "Unproven", "Unproven", "Unproven", "Unproven", "Unproven"]);
    await expect(page.locator(".stage-symbol").nth(3)).toHaveText("Ⅱ");
    await expect(fallback.locator("dt")).toHaveText([
      "Security review required",
      "Identity missing",
      "Installed copy found",
    ]);

    await page.goBack({ waitUntil: "commit" });
    await page.locator('main a[href="/work/skillsbar/"]').first().click();
    await expect(page).toHaveURL(/\/work\/skillsbar\/$/);
    await expect(page.locator("main h1")).toContainText("SkillsBar");

    await page.locator('main a[href="/demos/skillsbar/"]').first().click();
    await expect(page).toHaveURL(/\/demos\/skillsbar\/$/);
    await expect(page.locator("main h1")).toBeVisible();
  });
});
