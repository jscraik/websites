import { expect, test } from "@playwright/test";
import { preparePage } from "../helpers/visual";

test.describe("portfolio interface contracts", () => {
  test("pullquote copy buttons copy the quote and current article URL", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            document.documentElement.dataset.copiedPullquote = value;
          }
        }
      });
    });

    await preparePage(page, "/articles/why-ai-native-devrel/");

    const button = page.getByRole("button", {
      name: "Copy Fig 1.1 pullquote and article link"
    });
    await button.click();

    await expect(button).toHaveText("Copied");
    await expect(page.locator("[data-copy-status]")).toHaveText(
      "Copied Fig 1.1 pullquote and article link."
    );

    const copied = await page.locator("html").getAttribute("data-copied-pullquote");
    expect(copied).toBe(
      `Capability is not trust. Developer education has to carry the proof.\n\n${page.url()}`
    );
  });

  test("pullquote copy buttons explain when the clipboard is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error("clipboard unavailable");
          }
        }
      });
    });

    await preparePage(page, "/articles/why-ai-native-devrel/");

    const button = page.getByRole("button", {
      name: "Copy Fig 1.2 pullquote and article link"
    });
    await button.click();

    await expect(button).toHaveText("Copy unavailable");
    await expect(page.locator("[data-copy-status]")).toHaveText(
      "Copy unavailable. Select the pullquote and article URL manually."
    );
  });

  test("the home page exposes one explicit first-visit route and truthful entry motion", async ({ page }) => {
    await preparePage(page, "/");

    const primaryRoute = page.getByRole("link", { name: "Start with SkillsBar" });
    await expect(primaryRoute).toHaveAttribute("href", "/demos/skillsbar/");
    await expect(primaryRoute).toHaveAttribute("data-primary-start", "true");
    await expect(page.locator("[data-reveal]")).toHaveCount(0);
    await expect(page.locator("[data-entry]")).toHaveCount(7);

    const animationName = await page.locator("[data-entry]").first().evaluate((element) =>
      getComputedStyle(element).animationName
    );
    expect(animationName).toBe("page-entry-rise");
  });

  test("entry motion is disabled when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await preparePage(page, "/");

    const animationNames = await page.locator("[data-entry]").evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).animationName)
    );
    expect(animationNames).toEqual(["none", "none", "none", "none", "none", "none", "none"]);
  });

  test("the shared nav highlight follows fine-pointer hover", async ({ page }) => {
    await preparePage(page, "/");

    const nav = page.locator(".site-header .nav-inner");
    const highlight = nav.locator(".nav-bg");
    const workTarget = nav.locator(".nav-flip").filter({ hasText: "Work" });
    const initialTransform = await highlight.evaluate((element) => getComputedStyle(element).transform);

    const supportsFinePointer = await page.evaluate(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    test.skip(!supportsFinePointer, "pointer highlight is only available for fine-pointer projects");

    await workTarget.hover();
    await expect(highlight).toHaveAttribute("data-active", "true");
    const pointerTransform = await highlight.evaluate((element) => {
      const style = getComputedStyle(element);
      return { transform: style.transform, transitionProperty: style.transitionProperty };
    });

    expect(pointerTransform.transform).not.toBe(initialTransform);
    expect(pointerTransform.transitionProperty).toBe("transform");
  });

  test("the shared nav highlight follows keyboard focus", async ({ page }) => {
    await preparePage(page, "/");

    const nav = page.locator(".site-header .nav-inner");
    const highlight = nav.locator(".nav-bg");
    const aboutLink = nav.getByRole("link", { name: "About" });
    const initialTransform = await highlight.evaluate((element) => getComputedStyle(element).transform);

    await aboutLink.focus();
    await expect(highlight).toHaveAttribute("data-active", "true");
    const focusTransform = await highlight.evaluate((element) => getComputedStyle(element).transform);
    expect(focusTransform).not.toBe(initialTransform);

    await aboutLink.blur();
    await expect(highlight).not.toHaveAttribute("data-active");
  });

  test("the shared nav highlight remains still when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await preparePage(page, "/now/");

    const nav = page.locator(".site-header .nav-inner");
    const highlight = nav.locator(".nav-bg");
    await nav.locator(".nav-flip").filter({ hasText: "Work" }).hover();

    await expect(highlight).not.toHaveAttribute("data-active");
    const style = await highlight.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { transform: computed.transform, transitionProperty: computed.transitionProperty };
    });

    expect(style.transform).toBe("none");
    expect(style.transitionProperty).toBe("none");
  });

  test("the shared layout publishes canonical and share-text metadata", async ({ page }) => {
    await preparePage(page, "/articles/why-ai-native-devrel/");

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      "href",
      "https://jscraik.com/articles/why-ai-native-devrel/"
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "https://jscraik.com/articles/why-ai-native-devrel/"
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary"
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      "Why AI-Native DevRel | brAInwav"
    );
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
      "content",
      "Jamie Scott Craik on AI-native DevRel, trust, evaluation, and visible proof."
    );
  });
});
