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
});
