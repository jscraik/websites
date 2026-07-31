import { expect, test } from "@playwright/test";
import { coreRoutes, preparePage } from "../helpers/visual";

const interactiveSelector =
  "a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)";

test.describe("UI polish contracts", () => {
  test("skip link moves focus to the shared main landmark", async ({ page }) => {
    await preparePage(page, "/");

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await skipLink.press("Enter");

    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("dark surfaces retain their own heading color", async ({ page }) => {
    await preparePage(page, "/demos/skillsbar/");

    const colors = await page.locator("#demo-title").evaluate((heading) => {
      const reference = document.createElement("span");
      reference.style.color = "var(--skillsbar-ink)";
      document.body.append(reference);

      const actual = getComputedStyle(heading).color;
      const expected = getComputedStyle(reference).color;
      reference.remove();

      return { actual, expected };
    });

    expect(colors.actual).toBe(colors.expected);
  });

  test("shared shell keeps portfolio and technical surface themes", async ({ page }) => {
    await preparePage(page, "/now/");

    const portfolioShell = await page.evaluate(() => ({
      activeNav: getComputedStyle(document.querySelector('.site-header .nav-link[aria-current="page"]')!).color,
      footerBackground: getComputedStyle(document.querySelector(".site-footer")!).backgroundColor
    }));

    expect(portfolioShell.activeNav).toBe("rgb(79, 86, 77)");
    expect(portfolioShell.footerBackground).toBe("rgb(213, 214, 208)");

    await preparePage(page, "/demos/skillsbar/");

    const technicalShell = await page.evaluate(() => ({
      footerBackground: getComputedStyle(document.querySelector(".site-footer")!).backgroundColor,
      profileBackground: getComputedStyle(document.querySelector(".site-footer .footer-profile-card")!).backgroundColor,
      socialBackground: getComputedStyle(document.querySelector(".site-footer .footer-social-links a")!).backgroundColor
    }));

    expect(technicalShell.footerBackground).toBe("rgb(11, 15, 23)");
    expect(technicalShell.profileBackground).toBe("rgb(20, 26, 35)");
    expect(technicalShell.socialBackground).toBe("rgb(27, 34, 48)");
  });

  test("About keeps the stored full-bleed neutral gradient", async ({ page }) => {
    await page.setViewportSize({ width: 645, height: 964 });
    await preparePage(page, "/now/");

    const shell = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      mainWidth: document.querySelector("main")!.getBoundingClientRect().width,
      headerBackground: getComputedStyle(document.querySelector(".site-header")!).backgroundImage,
      mainBackground: getComputedStyle(document.querySelector("main")!).backgroundImage
    }));

    expect(shell.mainWidth).toBe(shell.viewportWidth);
    expect(shell.headerBackground).toBe("linear-gradient(rgb(251, 250, 245), rgb(213, 214, 208))");
    expect(shell.mainBackground).toBe("linear-gradient(rgb(251, 250, 245), rgb(213, 214, 208))");
  });

  test("contact portrait preserves its square source ratio", async ({ page }) => {
    await page.setViewportSize({ width: 1151, height: 964 });
    await preparePage(page, "/contact/");

    const image = await page.locator(".contact-photo").evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        objectFit: style.objectFit,
        aspectRatio: style.aspectRatio
      };
    });

    expect(Math.abs(image.width - image.height)).toBeLessThanOrEqual(1);
    expect(image.objectFit).toBe("cover");
    expect(image.aspectRatio).toBe("1 / 1");
  });

  test("portfolio images carry the surface outline treatment", async ({ page }) => {
    const imageRoutes = [
      ...coreRoutes,
      { name: "work-brainwav-io", path: "/work/brainwav-io/" }
    ];

    for (const route of imageRoutes) {
      await preparePage(page, route.path);

      const imageStyles = await page.locator("img").evaluateAll((images) => {
        const expectedColor = document.body.classList.contains("skillsbar-demo")
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)";

        return images.map((image) => {
          const style = getComputedStyle(image);
          return {
            outlineColor: style.outlineColor,
            outlineOffset: style.outlineOffset,
            outlineStyle: style.outlineStyle,
            outlineWidth: style.outlineWidth,
            expectedColor
          };
        });
      });

      expect(imageStyles, `${route.path}: image surface outlines`).not.toEqual([]);
      for (const style of imageStyles) {
        expect(style.outlineStyle, `${route.path}: image outline style`).toBe("solid");
        expect(style.outlineWidth, `${route.path}: image outline width`).toBe("1px");
        expect(style.outlineOffset, `${route.path}: image outline offset`).toBe("-1px");
        expect(style.outlineColor, `${route.path}: image outline color`).toBe(style.expectedColor);
      }
    }
  });

  test("core routes preserve target size and typography floors", async ({ page }, testInfo) => {
    const minimumTarget = testInfo.project.name.includes("mobile") ? 44 : 40;

    for (const route of coreRoutes) {
      await preparePage(page, route.path);

      const audit = await page.evaluate(({ selector, minimum }) => {
        const isVisible = (element: Element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        };
        const labelFor = (element: Element) =>
          (element.getAttribute("aria-label") || element.textContent || element.tagName)
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 80);
        const effectiveTargetSize = (element: Element) => {
          const rect = element.getBoundingClientRect();
          let width = rect.width;
          let height = rect.height;

          for (const pseudo of ["::before", "::after"]) {
            const style = getComputedStyle(element, pseudo);
            if (
              style.content === "none" ||
              style.content === "normal" ||
              style.display === "none" ||
              style.position !== "absolute"
            ) {
              continue;
            }

            const negativeInset = (value: string) => {
              const parsed = Number.parseFloat(value);
              return Number.isFinite(parsed) && parsed < 0 ? Math.abs(parsed) : 0;
            };
            width = Math.max(width, rect.width + negativeInset(style.left) + negativeInset(style.right));
            height = Math.max(height, rect.height + negativeInset(style.top) + negativeInset(style.bottom));
          }

          return { height, width };
        };

        const smallTargets = [...document.querySelectorAll(selector)]
          .filter(isVisible)
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const effective = effectiveTargetSize(element);
            return {
              label: labelFor(element),
              visualWidth: Math.round(rect.width),
              visualHeight: Math.round(rect.height),
              width: Math.round(effective.width),
              height: Math.round(effective.height)
            };
          })
          .filter(({ width, height }) => width < minimum || height < minimum);

        const unbalancedHeadings = [...document.querySelectorAll("h1, h2, h3")]
          .filter(isVisible)
          .filter((heading) => getComputedStyle(heading).textWrap !== "balance")
          .map(labelFor);

        return {
          fontSmoothing: getComputedStyle(document.body).getPropertyValue("-webkit-font-smoothing"),
          smallTargets,
          unbalancedHeadings
        };
      }, { selector: interactiveSelector, minimum: minimumTarget });

      expect(audit.fontSmoothing, `${route.path} font smoothing`).toBe("antialiased");
      expect(audit.smallTargets, `${route.path} targets below ${minimumTarget}px`).toEqual([]);
      expect(audit.unbalancedHeadings, `${route.path} unbalanced headings`).toEqual([]);
    }
  });

  test("interactive focus rings are visible and neutral", async ({ page }) => {
    for (const route of coreRoutes) {
      await preparePage(page, route.path);
      const controls = page.locator(
        `:is(.site-header, .demo-nav, main, .site-footer) ${interactiveSelector}`
      );

      for (let index = 0; index < await controls.count(); index += 1) {
        const control = controls.nth(index);
        if (!(await control.isVisible())) continue;
        if (await control.evaluate((element) => element.getRootNode() instanceof ShadowRoot)) continue;

        await control.focus();
        const focus = await control.evaluate((element) => {
          const style = getComputedStyle(element);
          const channels = style.outlineColor.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
          const neutral = channels.length === 3 && Math.max(...channels) - Math.min(...channels) <= 32;
          return {
            label: (element.getAttribute("aria-label") || element.textContent || element.tagName)
              .trim()
              .replace(/\s+/g, " ")
              .slice(0, 80),
            neutral,
            outlineStyle: style.outlineStyle,
            outlineWidth: Number.parseFloat(style.outlineWidth)
          };
        });

        expect(focus.outlineStyle, `${route.path}: ${focus.label} focus style`).not.toBe("none");
        expect(focus.outlineWidth, `${route.path}: ${focus.label} focus width`).toBeGreaterThanOrEqual(2);
        expect(focus.neutral, `${route.path}: ${focus.label} focus color`).toBe(true);
      }
    }
  });

  test("proof scrollers are keyboard reachable", async ({ page }) => {
    await preparePage(page, "/proof/");

    const inaccessibleRows = await page.locator(".proof-row").evaluateAll((rows) =>
      rows
        .map((row, index) => ({
          index,
          reachable:
            row.matches("[tabindex]:not([tabindex='-1'])") ||
            row.querySelector("a[href], button, input, select, textarea") !== null
        }))
        .filter(({ reachable }) => !reachable)
    );

    expect(inaccessibleRows).toEqual([]);
  });

  test("article proof cards stack after the body on mobile", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("mobile"), "mobile stacking contract");
    await preparePage(page, "/articles/why-ai-native-devrel/");

    const [body, sidebar] = await Promise.all([
      page.locator(".article-body").boundingBox(),
      page.locator(".article-sidebar").boundingBox()
    ]);

    expect(body).not.toBeNull();
    expect(sidebar).not.toBeNull();
    expect(body!.y + body!.height, "article body must end before proof cards begin").toBeLessThanOrEqual(
      sidebar!.y
    );
  });

  test("About keeps the reference composition across responsive boundaries", async ({ page }) => {
    const measureAbout = async (width: number, height: number) => {
      await page.setViewportSize({ width, height });
      await preparePage(page, "/now/");
      return page.locator(".about-intro").evaluate((intro) => {
        const copy = intro.querySelector<HTMLElement>(".about-copy-block");
        const sidebar = intro.querySelector<HTMLElement>(".about-sidebar");
        const title = intro.querySelector<HTMLElement>("#about-title");
        if (!copy || !sidebar || !title) throw new Error("About intro structure is incomplete");

        const copyRect = copy.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();
        const style = getComputedStyle(intro);
        const titleStyle = getComputedStyle(title);

        return {
          columns: style.gridTemplateColumns.split(" ").filter(Boolean).length,
          copyX: copyRect.x,
          copyWidth: copyRect.width,
          sidebarX: sidebarRect.x,
          sidebarY: sidebarRect.y,
          titleFontSize: Number.parseFloat(titleStyle.fontSize),
          titleFontFamily: titleStyle.fontFamily,
          spacerDisplay: getComputedStyle(intro.querySelector(".about-hero-spacer")!).display
        };
      });
    };

    const intermediate = await measureAbout(857, 964);
    expect(intermediate.columns, "857px About keeps two tracks").toBe(2);
    expect(intermediate.sidebarX, "857px About sidebar stays beside the copy").toBeGreaterThan(
      intermediate.copyX + intermediate.copyWidth - 1
    );
    expect(intermediate.sidebarY, "857px About sidebar starts near the intro").toBeLessThan(240);
    expect(intermediate.titleFontSize, "857px About title stays a compact route label").toBeLessThanOrEqual(24);
    expect(intermediate.titleFontFamily, "857px About title uses the sans contract").toContain("Geist");
    expect(intermediate.spacerDisplay, "857px About spacer stays structural and hidden").toBe("none");

    const mobile = await measureAbout(390, 844);
    expect(mobile.columns, "390px About remains one track").toBe(1);
    expect(Math.abs(mobile.sidebarX - mobile.copyX), "390px About sidebar returns below the copy").toBeLessThan(1);
    expect(mobile.titleFontSize, "390px About title remains a compact route label").toBeLessThanOrEqual(24);
    expect(mobile.titleFontFamily, "390px About title keeps the sans contract").toContain("Geist");

    const desktop = await measureAbout(1440, 1000);
    expect(desktop.titleFontSize, "1440px About title remains a compact route label").toBeLessThanOrEqual(24);
    expect(desktop.titleFontFamily, "1440px About title keeps the sans contract").toContain("Geist");
  });
});
