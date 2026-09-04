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
      `Capability is not trust. The path to adoption has to carry the proof.\n\n${page.url()}`
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

    const primaryRoute = page.getByRole("link", { name: "Read the SkillsBar case study" });
    await expect(primaryRoute).toHaveAttribute("href", "/work/skillsbar/");
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

    const supportsFinePointer = await page.evaluate(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    test.skip(!supportsFinePointer, "pointer highlight is only available for fine-pointer projects");

    await workTarget.hover();
    await expect
      .poll(() => highlight.evaluate((element) => {
        const timing = element.getAnimations()[0]?.effect?.getTiming();
        return {
          parentText: element.parentElement?.textContent?.trim(),
          duration: timing?.duration,
          easing: timing?.easing
        };
      }))
      .toEqual({ parentText: "Work", duration: 400, easing: "cubic-bezier(0.165, 0.84, 0.44, 1)" });
    await expect(highlight).toHaveAttribute("data-active", "true");
  });

  test("the shared nav highlight holds through a gap and returns when leaving the nav", async ({ page }) => {
    await preparePage(page, "/");

    const nav = page.locator(".site-header .nav-inner");
    const highlight = nav.locator(".nav-bg");
    const workTarget = nav.locator(".nav-flip").filter({ hasText: "Work" });
    const aboutTarget = nav.locator(".nav-flip").filter({ hasText: "About" });
    const supportsFinePointer = await page.evaluate(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    test.skip(!supportsFinePointer, "pointer highlight is only available for fine-pointer projects");

    const workBox = await workTarget.boundingBox();
    const aboutBox = await aboutTarget.boundingBox();
    if (!workBox || !aboutBox || aboutBox.x <= workBox.x + workBox.width) {
      test.skip(true, "the current navigation has no measurable gap between Work and About");
      return;
    }

    await workTarget.hover();
    await expect(highlight).toHaveAttribute("data-active", "true");

    const gapX = workBox.x + workBox.width + (aboutBox.x - (workBox.x + workBox.width)) / 2;
    const navBox = await nav.boundingBox();
    if (!navBox) {
      test.skip(true, "navigation bounds are unavailable");
      return;
    }
    await page.mouse.move(gapX, navBox.y + navBox.height / 2);

    await expect(highlight).toHaveAttribute("data-active", "true");
    expect(await highlight.evaluate((element) => element.parentElement?.textContent?.trim())).toBe("Work");

    await page.mouse.move(navBox.x, navBox.y + navBox.height + 24);
    await expect(highlight).not.toHaveAttribute("data-active");
    expect(await highlight.evaluate((element) => element.parentElement?.classList.contains("nav-inner"))).toBe(true);
  });

  test("the shared nav highlight follows pointer hover after a pointer click", async ({ page }) => {
    await preparePage(page, "/");

    const nav = page.locator(".site-header .nav-inner");
    const highlight = nav.locator(".nav-bg");
    const workTarget = nav.locator(".nav-flip").filter({ hasText: "Work" });
    const contactTarget = nav.locator(".nav-flip").filter({ hasText: "Contact" });
    const supportsFinePointer = await page.evaluate(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    test.skip(!supportsFinePointer, "pointer highlight is only available for fine-pointer projects");

    await workTarget.click();
    expect(await highlight.evaluate((element) => element.parentElement?.textContent?.trim())).toBe("Work");

    await contactTarget.hover();
    await expect(highlight).toHaveAttribute("data-active", "true");
    expect(await highlight.evaluate((element) => element.parentElement?.textContent?.trim())).toBe("Contact");
  });

  test("keyboard focus stays explicit without triggering pointer movement", async ({ page }) => {
    await preparePage(page, "/");

    const nav = page.locator(".site-header .nav-inner");
    const highlight = nav.locator(".nav-bg");
    const aboutLink = nav.getByRole("link", { name: "About" });

    await aboutLink.focus();
    await expect(highlight).not.toHaveAttribute("data-active");
    expect(await highlight.evaluate((element) => element.parentElement?.classList.contains("nav-inner"))).toBe(true);
    await expect(aboutLink).toBeFocused();
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
      return {
        transform: computed.transform,
        parentIsNav: element.parentElement?.classList.contains("nav-inner"),
        animations: element.getAnimations().length
      };
    });

    expect(style.transform).toBe("none");
    expect(style.parentIsNav).toBe(true);
    expect(style.animations).toBe(0);
  });

  test("case-study buttons transfer their existing background to the arrow", async ({ page }) => {
    await page.addInitScript(() => {
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (keyframes, options) {
        const animation = animate.call(this, keyframes, options);
        if (this instanceof HTMLElement && this.classList.contains("small-button__bg")) {
          const timing = animation.effect?.getTiming();
          this.dataset.testAnimationDuration = String(timing?.duration ?? "");
          this.dataset.testAnimationEasing = timing?.easing ?? "";
        }
        return animation;
      };
    });
    await preparePage(page, "/");


    const button = page.locator(".feature-block .small-button").first();
    const background = button.locator(".small-button__bg");
    const supportsFinePointer = await page.evaluate(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    test.skip(!supportsFinePointer, "button background transfer is only available for fine-pointer projects");


    await button.hover();
    await expect
      .poll(() =>
        background.evaluate((element) => ({
          parentIsArrow: element.parentElement?.classList.contains("small-button__arrow"),
          duration: Number(element.dataset.testAnimationDuration),
          easing: element.dataset.testAnimationEasing
        }))
      )
      .toEqual({
        parentIsArrow: true,
        duration: 400,
        easing: "cubic-bezier(0.165, 0.84, 0.44, 1)"
      });
    await expect(button).toHaveAttribute("data-flip-active", "true");

    const box = await button.boundingBox();
    if (!box) throw new Error("case-study button bounds are unavailable");
    await page.mouse.move(box.x, box.y - 24);
    await expect(button).not.toHaveAttribute("data-flip-active");
    expect(await background.evaluate((element) => element.parentElement?.classList.contains("small-button"))).toBe(true);
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
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
      "href",
      "/blog/rss.xml"
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      "Capability Is Not Trust | brAInwav"
    );
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
      "content",
      "Jamie Scott Craik on the gap between AI capability, trustworthy adoption, evaluation, and visible proof."
    );
  });

  test("editorial routes keep the route rhythm and critical font hints", async ({ page }) => {
    const routeExpectations = [
      { path: "/", selector: ".home-hero__body" },
      { path: "/now/", selector: ".about-copy p" },
      { path: "/blog/", selector: ".latest-article p:not(.eyebrow, .article-date)" },
      { path: "/contact/", selector: ".contact-panel > p" },
      { path: "/proof/", selector: ".proof-index header > p" },
      { path: "/articles/why-ai-native-devrel/", selector: ".lede" },
      { path: "/work/ai-native-devrel/", selector: ".case-work-header > p" },
      { path: "/work/brainwav-io/", selector: ".case-work-header > p" }
    ];

    for (const route of routeExpectations) {
      await preparePage(page, route.path);

      const contract = await page.evaluate((selector) => {
        const copy = document.querySelector(selector);
        const style = copy ? getComputedStyle(copy) : null;
        const preloads = Array.from(document.querySelectorAll('link[rel="preload"][as="font"]'))
          .map((link) => link.getAttribute("href"))
          .filter((href): href is string => Boolean(href));

        return {
          copyFound: Boolean(copy),
          textWrap: style?.textWrap ?? "",
          preloads
        };
      }, route.selector);

      expect(contract.copyFound, `${route.path}: editorial copy selector`).toBe(true);
      expect(contract.textWrap, `${route.path}: editorial copy wrapping`).toBe("pretty");
      expect(contract.preloads, `${route.path}: critical font preloads`).toEqual([
        "/brand/fonts/geist-variable.woff2",
        "/brand/fonts/newsreader-variable.woff2"
      ]);
    }

    await preparePage(page, "/articles/why-ai-native-devrel/");
    const articleGap = await page.locator(".article-layout").evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).rowGap)
    );
    expect(articleGap, "article masthead-to-body rhythm").toBeGreaterThan(0);
  });
});
