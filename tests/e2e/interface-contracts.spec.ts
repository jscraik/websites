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

  test("the shared nav highlight adopts the hovered target geometry", async ({ page }) => {
    await preparePage(page, "/");

    const nav = page.locator(".site-header .nav-inner");
    const highlight = nav.locator(".nav-bg");
    const homeTarget = nav.locator(".nav-flip").first();
    const supportsFinePointer = await page.evaluate(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    test.skip(!supportsFinePointer, "pointer highlight is only available for fine-pointer projects");

    await homeTarget.hover();
    await expect(highlight).toHaveAttribute("data-active", "true");
    const animationTiming = await highlight.evaluate((element) => {
      const timing = element.getAnimations()[0]?.effect?.getTiming();
      return timing ? { duration: timing.duration, easing: timing.easing } : null;
    });
    expect(animationTiming).toEqual({
      duration: 400,
      easing: "cubic-bezier(0.165, 0.84, 0.44, 1)"
    });
    await page.waitForTimeout(450);

    const [highlightBox, targetBox] = await Promise.all([highlight.boundingBox(), homeTarget.boundingBox()]);
    expect(highlightBox).not.toBeNull();
    expect(targetBox).not.toBeNull();
    expect(highlightBox!.x).toBeCloseTo(targetBox!.x, 0);
    expect(highlightBox!.y).toBeCloseTo(targetBox!.y, 0);
    expect(highlightBox!.width).toBeCloseTo(targetBox!.width, 0);
    expect(highlightBox!.height).toBeCloseTo(targetBox!.height, 0);

    const homeStyle = await homeTarget.evaluate((element) => {
      const highlight = element.querySelector<HTMLElement>(".nav-bg");
      const link = element.querySelector<HTMLElement>("a");
      return {
        highlightRadius: highlight ? Number.parseFloat(getComputedStyle(highlight).borderRadius) : 0,
        highlightZIndex: highlight ? getComputedStyle(highlight).zIndex : "missing",
        linkTransform: link ? getComputedStyle(link).transform : "missing",
        linkZIndex: link ? getComputedStyle(link).zIndex : "missing"
      };
    });
    expect(homeStyle.highlightRadius).toBeGreaterThanOrEqual(targetBox!.height / 2);
    expect(homeStyle.highlightZIndex).toBe("0");
    expect(homeStyle.linkTransform).toBe("none");
    expect(homeStyle.linkZIndex).toBe("1");
  });

  test("the shared nav highlight persists while the pointer crosses a nav gap", async ({ page }) => {
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

    await workTarget.locator("a").evaluate((link) =>
      link.addEventListener("click", (event) => event.preventDefault(), { once: true }),
    );
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

    await expect(highlight).toHaveAttribute("data-active", "true");
    const style = await highlight.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        transform: computed.transform,
        parentText: element.parentElement?.textContent?.trim(),
        animations: element.getAnimations().length
      };
    });

    expect(style.transform).toBe("none");
    expect(style.parentText).toBe("Work");
    expect(style.animations).toBe(0);
  });

  test("the homepage keeps Jose-derived tablet geometry at the first fold", async ({ page }) => {
    await page.setViewportSize({ width: 805, height: 964 });
    await preparePage(page, "/");

    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector(selector);
        if (!(element instanceof HTMLElement)) return null;
        const bounds = element.getBoundingClientRect();
        return {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height
        };
      };

      const title = document.querySelector(".home-hero h1");
      return {
        nav: rect(".site-header .nav-inner"),
        title: rect(".home-hero h1"),
        firstProject: rect("#featured-work .feature-block"),
        titleFontSize: title ? Number.parseFloat(getComputedStyle(title).fontSize) : 0
      };
    });

    expect(geometry.nav).not.toBeNull();
    expect(geometry.nav!.width / 805).toBeGreaterThan(0.76);
    expect(geometry.nav!.width / 805).toBeLessThan(0.8);
    expect(geometry.nav!.y).toBeGreaterThanOrEqual(28);
    expect(geometry.nav!.y).toBeLessThanOrEqual(31);

    expect(geometry.title).not.toBeNull();
    expect(geometry.title!.height).toBeLessThan(70);
    expect(geometry.title!.x).toBeGreaterThanOrEqual(87);
    expect(geometry.title!.x).toBeLessThanOrEqual(91);
    expect(geometry.title!.width).toBeGreaterThanOrEqual(624);
    expect(geometry.title!.width).toBeLessThanOrEqual(632);
    expect(geometry.title!.y).toBeGreaterThanOrEqual(175);
    expect(geometry.title!.y).toBeLessThanOrEqual(185);
    expect(geometry.titleFontSize).toBeGreaterThanOrEqual(64);
    expect(geometry.titleFontSize).toBeLessThanOrEqual(68);

    expect(geometry.firstProject).not.toBeNull();
    expect(geometry.firstProject!.width / 805).toBeGreaterThan(0.92);
    expect(geometry.firstProject!.height).toBeGreaterThanOrEqual(940);
    expect(geometry.firstProject!.height).toBeLessThanOrEqual(970);
    expect(geometry.firstProject!.y).toBeGreaterThanOrEqual(770);
    expect(geometry.firstProject!.y).toBeLessThanOrEqual(815);
  });

  test("the homepage keeps Jose-derived desktop surface and first-fold geometry", async ({ page }) => {
    await page.setViewportSize({ width: 1292, height: 964 });
    await preparePage(page, "/");

    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector(selector);
        if (!(element instanceof HTMLElement)) return null;
        const bounds = element.getBoundingClientRect();
        return {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height
        };
      };

      const title = document.querySelector(".home-hero h1");
      const body = getComputedStyle(document.body);
      const siteHeader = document.querySelector(".site-header");
      const heroHeader = document.querySelector(".header-inner");
      return {
        nav: rect(".site-header .nav-inner"),
        heroHeader: rect(".header-inner"),
        title: rect(".home-hero h1"),
        intro: rect(".home-hero__intro"),
        featuredWork: rect("#featured-work"),
        titleFontSize: title ? Number.parseFloat(getComputedStyle(title).fontSize) : 0,
        bodyBackgroundImage: body.backgroundImage,
        siteHeaderBackgroundImage: siteHeader ? getComputedStyle(siteHeader).backgroundImage : "",
        heroHeaderBackgroundImage: heroHeader ? getComputedStyle(heroHeader).backgroundImage : ""
      };
    });

    expect(geometry.nav).not.toBeNull();
    expect(geometry.nav!.x).toBeGreaterThanOrEqual(244);
    expect(geometry.nav!.x).toBeLessThanOrEqual(247);
    expect(geometry.nav!.width).toBeGreaterThanOrEqual(800);
    expect(geometry.nav!.width).toBeLessThanOrEqual(804);
    expect(geometry.nav!.y).toBeGreaterThanOrEqual(30);
    expect(geometry.nav!.y).toBeLessThanOrEqual(33);

    expect(geometry.heroHeader).not.toBeNull();
    expect(geometry.heroHeader!.x).toBe(0);
    expect(geometry.heroHeader!.width).toBe(1292);

    expect(geometry.title).not.toBeNull();
    expect(geometry.title!.x).toBeGreaterThanOrEqual(243);
    expect(geometry.title!.x).toBeLessThanOrEqual(247);
    expect(geometry.title!.y).toBeGreaterThanOrEqual(212);
    expect(geometry.title!.y).toBeLessThanOrEqual(220);
    expect(geometry.titleFontSize).toBeGreaterThanOrEqual(101);
    expect(geometry.titleFontSize).toBeLessThanOrEqual(105);

    expect(geometry.intro).not.toBeNull();
    expect(geometry.intro!.width).toBeGreaterThanOrEqual(411);
    expect(geometry.intro!.width).toBeLessThanOrEqual(414);

    expect(geometry.featuredWork).not.toBeNull();
    expect(geometry.featuredWork!.y).toBeGreaterThanOrEqual(875);
    expect(geometry.featuredWork!.y).toBeLessThanOrEqual(887);

    expect(geometry.bodyBackgroundImage).toContain("linear-gradient");
    expect(geometry.siteHeaderBackgroundImage).toBe("none");
    expect(geometry.heroHeaderBackgroundImage).toBe("none");
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
