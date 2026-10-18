import type { Page } from "@playwright/test";
import { expect, test } from "../helpers/test";
import AxeBuilder from "@axe-core/playwright";
import { coreRoutes, preparePage } from "../helpers/visual";

const interactiveSelector =
  "a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)";

/** Resolves editorial palette values to the browser's computed color format. */
async function editorialPalette(page: Page) {
  return page.evaluate(() => {
    const reference = document.createElement("span");
    reference.style.setProperty("transition", "none", "important");
    document.body.append(reference);
    /** Resolves a CSS color using the temporary reference element. */
    const color = (value: string) => {
      reference.style.setProperty("color", value, "important");
      return getComputedStyle(reference).color;
    };
    const palette = {
      canvas: color("oklch(0.26777 0.00629 258.359)"),
      surface: color("oklch(0.30779 0.00833 255.562)"),
      muted: color("oklch(0.76794 0.01448 258.352)"),
      blue: color("oklch(0.81015 0.04164 254.072)")
    };
    reference.remove();
    return palette;
  });
}

test.describe("UI polish contracts", () => {
  test("featured article artwork follows the selected content identity", async ({ page }) => {
    await preparePage(page, "/blog/");
    const feature = page.locator(".latest-article");
    await expect(feature).toHaveAttribute("data-article", /.+/);
    const artwork = () => feature.evaluate((element) => getComputedStyle(element, "::before").backgroundImage);
    await feature.evaluate((element) => element.setAttribute("data-article", "when-evidence-goes-stale"));
    await expect.poll(artwork).toContain("/editorial/evidence-outline.svg");
    await feature.evaluate((element) => element.setAttribute("data-article", "why-ai-native-devrel"));
    await expect.poll(artwork).toContain("/editorial/devrel-outline.svg");
    await feature.evaluate((element) => element.setAttribute("data-article", "new-article"));
    await expect.poll(artwork).toContain("/editorial/evidence-outline.svg");
  });
  test("Proof endpoint focus outlines fit inside their scroll region", async ({ page }) => {
    for (const width of [320, 393, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await preparePage(page, "/proof/");
      await page.evaluate(() => document.fonts.ready);
      await page.keyboard.press("Tab");
      expect(await page.locator(".proof-row").count()).toBeGreaterThan(0);
      expect(await page.locator(".proof-row a.proof-card").count()).toBeGreaterThan(0);
      for (const row of await page.locator(".proof-row").all()) {
        const cards = row.locator("a.proof-card");
        if (await cards.count() === 0) continue;
        for (const card of [cards.first(), cards.last()]) {
          await card.focus();
          await card.scrollIntoViewIfNeeded();
          const ring = await card.evaluate((element) => {
            const style = getComputedStyle(element);
            const extent = Number.parseFloat(style.outlineOffset) + Number.parseFloat(style.outlineWidth);
            const box = element.getBoundingClientRect();
            const clip = element.parentElement!.getBoundingClientRect();
            return { visible: element.matches(":focus-visible"), width: Number.parseFloat(style.outlineWidth), fits: box.left - extent >= clip.left - 1 && box.right + extent <= clip.right + 1 && box.top - extent >= clip.top - 1 && box.bottom + extent <= clip.bottom + 1 };
          });
          expect(ring.visible).toBe(true);
          expect(ring.width).toBeGreaterThanOrEqual(2);
          expect(ring.fits, `whole Proof focus outline at ${width}px`).toBe(true);
        }
      }
    }
  });
  test("project headings fit viewport and attribution card gutters", async ({ page }) => {
    for (const width of [320, 393, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const slug of ["skillsbar", "skills-sdk", "cli-proof-series", "brainwav-io", "ai-native-devrel"]) {
        await preparePage(page, `/work/${slug}/`);
        await page.evaluate(() => document.fonts.ready);
        const failures = await page.locator("h1, .case-role-boundary h2").evaluateAll((headings) => headings.flatMap((heading) => {
          const card = heading.closest(".case-role-boundary")?.getBoundingClientRect();
          const left = card ? card.left + 16 : 16;
          const right = card ? card.right - 16 : innerWidth - 16;
          const range = document.createRange();
          range.selectNodeContents(heading);
          return [...range.getClientRects()].filter((r) => r.width && (r.left < left || r.right > right)).map(() => heading.textContent);
        }));
        expect(failures, `${slug} at ${width}px`).toEqual([]);
      }
    }
  });

  test("project outline illustrations fit their cards", async ({ page }) => {
    for (const width of [320, 393, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const slug of ["skills-sdk", "cli-proof-series", "brainwav-io", "ai-native-devrel"]) {
        await preparePage(page, `/work/${slug}/`);
        await page.evaluate(() => document.fonts.ready);
        const art = await page.locator(".case-hero-art .case-outline").evaluate((image: HTMLImageElement) => {
          const box = image.getBoundingClientRect();
          const card = image.parentElement!.getBoundingClientRect();
          return { loaded: image.complete && image.naturalWidth > 0, fits: box.left >= card.left - 1 && box.right <= card.right + 1 && box.bottom <= card.bottom + 1 };
        });
        expect(art, `${slug} at ${width}px`).toEqual({ loaded: true, fits: true });
      }
    }
  });

  test("article text retains mobile gutters without expanding its grid", async ({ page }) => {
    for (const width of [320, 393, 768]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of ["/articles/when-evidence-goes-stale/", "/articles/why-ai-native-devrel/"]) {
        await preparePage(page, route);
        await page.evaluate(() => document.fonts.ready);
        const failures = await page.locator(".article-layout").evaluate((article) => {
          const failures: string[] = [];
          for (const text of article.querySelectorAll("h1,h2,h3,p,li,a")) {
            const range = document.createRange();
            range.selectNodeContents(text);
            for (const bounds of range.getClientRects()) {
              if (bounds.width && (bounds.left < 16 || bounds.right > innerWidth - 16)) {
                failures.push(text.textContent ?? "");
              }
            }
          }
          return failures;
        });
        expect(failures, `${route} at ${width}px`).toEqual([]);
      }
    }
  });

  test("Proof cards fit their scroll region at both endpoints", async ({ page }) => {
    for (const width of [320, 393, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await preparePage(page, "/proof/");
      for (const row of await page.locator(".proof-row").all()) {
        for (const end of [false, true]) {
          await row.evaluate((element, end) => {
            element.scrollLeft = end ? element.scrollWidth : 0;
          }, end);
          const card = end ? row.locator(".proof-card").last() : row.locator(".proof-card").first();
          const contained = await card.evaluate((element) => {
            const card = element.getBoundingClientRect();
            const row = element.parentElement!.getBoundingClientRect();
            return card.left >= row.left - 2 && card.right <= row.right + 2;
          });
          expect(contained, `Proof endpoint at ${width}px`).toBe(true);
        }
      }
    }
  });

  test("Blog sections do not stack legacy margins onto editorial spacing", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [320, 393, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await preparePage(page, "/blog/");
      const spacing = await page.evaluate(() => {
        const latest = document.querySelector(".latest-article")!.getBoundingClientRect();
        const title = document.querySelector(".blog-title-block")!.getBoundingClientRect();
        const list = document.querySelector(".article-list")!.getBoundingClientRect();
        const about = document.querySelector(".blog-about-card")!.getBoundingClientRect();
        const lastArticle = document.querySelector(".blog-list-item:last-child")!.getBoundingClientRect();
        return { beforeList: list.top - Math.max(latest.bottom, title.bottom), beforeAbout: about.top - lastArticle.bottom };
      });
      for (const [section, gap] of Object.entries(spacing)) {
        expect(gap, `${section} at ${width}px`).toBeGreaterThanOrEqual(32);
        expect(gap, `${section} at ${width}px`).toBeLessThanOrEqual(144);
      }
    }
  });

  test("Contact email is reachable in the first viewport", async ({ page }) => {
    for (const width of [320, 393, 768, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await preparePage(page, "/contact/");
      const email = page.locator('.contact-page a[href^="mailto:"]');
      await expect(email).toHaveCount(1);
      await expect(email).toBeVisible();
      const bounds = await email.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(800);
      expect(bounds!.x).toBeGreaterThanOrEqual(16);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width - 16);
      for (let step = 0; step < 30; step++) {
        await page.keyboard.press("Tab");
        if (await email.evaluate((element) => element === document.activeElement)) break;
      }
      await expect(email).toBeFocused();
      expect(await email.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    }
  });

  test("featured proof labels have readable contrast on their artwork", async ({ page }) => {
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await preparePage(page, "/");
      const results = await new AxeBuilder({ page })
        .include(".feature-proof-panel")
        .withRules(["color-contrast"])
        .analyze();
      expect(results.violations, `Featured proof contrast at ${width}px`).toEqual([]);
    }
  });

  test("all Fun Facts descriptions are readable without interaction", async ({ page }) => {
    for (const width of [320, 768, 922, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await preparePage(page, "/now/");
      const descriptions = page.locator(".about-fact-card > span");
      await expect(descriptions).toHaveCount(4);
      for (const description of await descriptions.all()) {
        await expect(description).toBeVisible();
        const geometry = await description.evaluate((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          const card = element.parentElement!.getBoundingClientRect();
          const text = range.getBoundingClientRect();
          return {
            contained: text.left >= card.left && text.right <= card.right && text.bottom <= card.bottom,
            clearOfNextSection: text.bottom < document.querySelector("#skills")!.getBoundingClientRect().top,
          };
        });
        expect(geometry).toEqual({ contained: true, clearOfNextSection: true });
      }
    }
  });

  test("About skills and history retain gutters and separate metadata", async ({ page }) => {
    for (const width of [320, 360, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await preparePage(page, "/now/");
      const failures = await page.evaluate(() => {
        const issues: string[] = [];
        for (const selector of [".about-skills-stack", ".about-history-stack", ".about-web-stack", "#fun-facts .about-card-grid", "#fun-facts .about-band-heading"]) {
          const stack = document.querySelector(selector)!;
          const bounds = stack.getBoundingClientRect();
          if (bounds.left < 16 || bounds.right > innerWidth - 16) issues.push(`${selector} gutter`);
          const walker = document.createTreeWalker(stack, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent?.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(walker.currentNode);
            for (const text of range.getClientRects()) {
              if (text.width && text.height && (text.left < bounds.left - 0.5 || text.right > bounds.right + 0.5)) issues.push(`${selector} text overflow`);
            }
          }
        }
        for (const group of document.querySelectorAll(".history-flex--meta, .history-flex.cc-vertical")) {
          const rectangles = [...group.children].map((child) => child.getBoundingClientRect());
          if (!rectangles.every((rect, index) => index === 0 || rect.left >= rectangles[index - 1].right + 4 || rect.top >= rectangles[index - 1].bottom)) issues.push("metadata separation");
        }
        return issues;
      });
      expect(failures, `About at ${width}px`).toEqual([]);
    }
  });

  test("About intro determines section height and artifact labels stay separate", async ({ page }) => {
    for (const width of [320, 360, 720, 768, 820, 922, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await preparePage(page, "/now/");
      const geometry = await page.evaluate(() => {
        const copy = document.querySelector(".about-copy-block")!.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(document.querySelector(".about-copy p:last-child")!);
        const overlaps = (a: DOMRect, b: DOMRect) => Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
        return {
          width: copy.width,
          end: range.getBoundingClientRect().bottom,
          next: document.querySelector("#fun-facts h2")!.getBoundingClientRect().top,
          sidebarOverlap: [...document.querySelectorAll(".about-sidebar nav, .about-portrait")].some((element) => overlaps(copy, element.getBoundingClientRect())),
          labelOverlap: [...document.querySelectorAll(".about-object")].some((element) => {
            const label = document.createRange();
            label.selectNodeContents(element.querySelector(".about-fact-label")!);
            const artifact = document.createRange();
            artifact.selectNodeContents(element.querySelector(".about-object__artifact")!);
            return overlaps(label.getBoundingClientRect(), artifact.getBoundingClientRect());
          })
        };
      });
      expect(geometry.width).toBeGreaterThanOrEqual(Math.min(320, width - 64));
      expect(geometry.end).toBeLessThan(geometry.next);
      expect(geometry.sidebarOverlap).toBe(false);
      expect(geometry.labelOverlap).toBe(false);
    }
  });

  test("home name keeps its gutter and proof notes stay inside their artwork", async ({ page }) => {
    for (const width of [320, 360, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await preparePage(page, "/");
      await page.mouse.move(width - 1, 0);
      const geometry = await page.evaluate(() => {
        const title = document.querySelector("#home-title")!;
        const titleBounds = title.getBoundingClientRect();
        const lines = [...title.querySelectorAll("span")].map((line) => {
          const range = document.createRange();
          range.selectNodeContents(line);
          return range.getBoundingClientRect().right;
        });
        const panels = [...document.querySelectorAll(".feature-proof-panel, .skillsbar-preview")].map((panel) => {
          const bounds = panel.getBoundingClientRect();
          const artwork = panel.closest(".feature-block-img")!.getBoundingClientRect();
          const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
          let textFits = true;
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent?.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(walker.currentNode);
            for (const text of range.getClientRects()) {
              if (text.width === 0 || text.height === 0) continue;
              textFits &&= text.left >= bounds.left - 0.5 && text.right <= bounds.right + 0.5 &&
                text.top >= bounds.top - 0.5 && text.bottom <= bounds.bottom + 0.5;
            }
          }
          return textFits && bounds.left >= artwork.left && bounds.right <= artwork.right &&
            bounds.top >= artwork.top && bounds.bottom <= artwork.bottom;
        });
        return { left: titleBounds.left, lines, panels };
      });
      expect(geometry.panels).toEqual([true, true, true]);
      const label = await page.locator("#featured-work .section-label span:last-child").boundingBox();
      const firstCard = await page.locator(".feature-block").first().boundingBox();
      expect(label!.y + label!.height).toBeLessThan(firstCard!.y);
      const artwork = page.locator(".skillsbar-artwork");
      expect(await artwork.evaluate((element) => getComputedStyle(element, "::before").content)).toBe("none");
      expect(await artwork.locator(".skillsbar-preview__header span").evaluate((element) => getComputedStyle(element).position)).toBe("static");
      if (width <= 360) {
        for (const right of geometry.lines) expect(right).toBeLessThanOrEqual(width - geometry.left);
      }
    }
  });

  test("footer targets do not overlap at mobile, intermediate, or desktop widths", async ({ page }) => {
    for (const width of [320, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await preparePage(page, "/");
      const overlaps = await page.locator("footer a").evaluateAll((links) => {
        const rectangles = links.map((link) => ({ label: link.getAttribute("aria-label") || link.textContent, rect: link.getBoundingClientRect() }));
        return rectangles.flatMap((left, index) => rectangles.slice(index + 1).filter((right) =>
          Math.min(left.rect.right, right.rect.right) > Math.max(left.rect.left, right.rect.left) &&
          Math.min(left.rect.bottom, right.rect.bottom) > Math.max(left.rect.top, right.rect.top)
        ).map((right) => [left.label, right.label]));
      });
      expect(overlaps, `footer targets at ${width}px`).toEqual([]);
      const navigation = await page.locator(".footer-links").evaluate((nav) => {
        const links = [...nav.querySelectorAll("a")];
        const contentHeight = links.reduce((height, link) => height + link.getBoundingClientRect().height, 0);
        const gap = Number.parseFloat(getComputedStyle(nav).rowGap);
        return { height: nav.getBoundingClientRect().height, upperBound: contentHeight + gap * (links.length - 1) };
      });
      expect(navigation.height, `footer navigation must not stretch at ${width}px`).toBeLessThanOrEqual(navigation.upperBound);
    }
  });

  test("carousel boundary state disables unavailable controls and preserves keyboard movement", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await preparePage(page, "/work/skillsbar/");
    const previous = page.locator("[data-work-prev]");
    const next = page.locator("[data-work-next]");
    const row = page.locator("[data-work-row]");
    await expect(previous).toHaveAttribute("aria-disabled", "true");
    await expect(previous).toBeDisabled();
    await previous.evaluate((element: HTMLButtonElement) => element.click());
    expect(await row.evaluate((element) => element.scrollLeft)).toBe(0);
    await next.focus();
    for (let index = 0; index < 12 && await next.getAttribute("aria-disabled") !== "true"; index += 1) {
      const before = await row.evaluate((element) => element.scrollLeft);
      await page.keyboard.press("Enter");
      await expect.poll(() => row.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before);
      await expect.poll(async () => {
        const atEnd = await row.evaluate((element) => element.scrollLeft >= element.scrollWidth - element.clientWidth - 4);
        return await next.getAttribute("aria-disabled") === String(atEnd);
      }).toBe(true);
    }
    await expect(next).toHaveAttribute("aria-disabled", "true");
    await expect(next).toBeDisabled();
    await expect.poll(() => row.evaluate(async (element) => {
      const positions: number[] = [];
      for (let frame = 0; frame < 5; frame += 1) {
        positions.push(element.scrollLeft);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      return positions.every((position) => position === positions[0]);
    })).toBe(true);
    const end = await row.evaluate((element) => element.scrollLeft);
    await next.evaluate((element: HTMLButtonElement) => element.click());
    expect(await row.evaluate((element) => element.scrollLeft)).toBe(end);
    await expect(previous).toBeEnabled();
    await previous.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => row.evaluate((element) => element.scrollLeft)).toBeLessThan(end);
  });

  test("keyboard focus reveals each proof card inside its scroll container", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await preparePage(page, "/proof/");
    const cards = page.locator(".proof-card");
    for (let index = 0; index < await cards.count(); index += 1) {
      await cards.nth(index).focus();
      await expect.poll(() => cards.nth(index).evaluate((card) => {
        const bounds = card.getBoundingClientRect();
        const container = card.parentElement!.getBoundingClientRect();
        return bounds.left >= container.left - 1 && bounds.right <= container.right + 1;
      })).toBe(true);
    }
  });

  test("SkillsBar shows its labeled native fixture without changing other work art", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await preparePage(page, "/work/skillsbar/");
    const capture = page.locator(".case-product-capture");
    const image = capture.getByRole("img", { name: /Historical native demo fixture/ });
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBe(404);
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalHeight)).toBe(560);
    await expect(image).toHaveAttribute("height", "560");
    await expect(capture.locator("figcaption")).toContainText("not proof for this candidate");
    const bounds = await image.boundingBox();
    expect(bounds!.width).toBeLessThanOrEqual(320);
    await expect(page.locator(".case-hero-art")).toHaveCount(0);

    await preparePage(page, "/work/skills-sdk/");
    await expect(page.locator(".case-product-capture")).toHaveCount(0);
    await expect(page.locator(".case-hero-art")).toBeVisible();
  });

  test("homepage reading links retain 44px targets across breakpoints", async ({ page }) => {
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await preparePage(page, "/");
      const links = page.getByRole("link", { name: /^(Read case study|Keep reading)$/i });
      await expect(links).toHaveCount(3);
      for (const link of await links.all()) {
        const bounds = await link.boundingBox();
        expect(bounds, `${width}px reading link is rendered`).not.toBeNull();
        expect(bounds!.height, `${width}px reading link target height`).toBeGreaterThanOrEqual(44);
        expect(bounds!.width, `${width}px reading link target width`).toBeGreaterThanOrEqual(44);
      }
    }
  });

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
      homeIcon: getComputedStyle(document.querySelector('.site-header .icon-box')!).color,
      footerBackgroundImage: getComputedStyle(document.querySelector(".site-footer")!).backgroundImage,
      footerBackground: getComputedStyle(document.querySelector(".site-footer")!).backgroundColor,
      profileBackground: getComputedStyle(document.querySelector(".site-footer .footer-profile-card")!).backgroundColor,
      socialBackground: getComputedStyle(document.querySelector(".site-footer .footer-social-links a")!).backgroundColor
    }));

    const palette = await editorialPalette(page);
    expect(portfolioShell.activeNav).toBe(palette.muted);
    expect(portfolioShell.homeIcon).toBe(palette.blue);
    expect(portfolioShell.footerBackgroundImage).toBe("none");
    expect(portfolioShell.footerBackground).toBe(palette.canvas);
    expect(portfolioShell.profileBackground).toBe(palette.surface);
    expect(portfolioShell.socialBackground).toBe(palette.surface);

    await preparePage(page, "/demos/skillsbar/");

    const technicalShell = await page.evaluate(() => ({
      footerBackground: getComputedStyle(document.querySelector(".site-footer")!).backgroundColor,
      profileBackground: getComputedStyle(document.querySelector(".site-footer .footer-profile-card")!).backgroundColor,
      socialBackground: getComputedStyle(document.querySelector(".site-footer .footer-social-links a")!).backgroundColor
    }));

    expect(technicalShell.footerBackground).toBe("rgb(11, 15, 23)");
    expect(technicalShell.profileBackground).toBe("rgb(20, 26, 35)");
    expect(technicalShell.socialBackground).toBe("rgb(27, 34, 48)");

    const technicalNav = await page.evaluate(() => {
      const header = document.querySelector(".site-header")!;
      const layer = document.querySelector(".site-header .nav-bg")!;
      const content = document.querySelector(".site-header .nav-flip")!;
      const layerStyle = getComputedStyle(layer);
      const contentStyle = getComputedStyle(content);
      return {
        headerDisplay: getComputedStyle(header).display,
        layerPosition: layerStyle.position,
        layerPointerEvents: layerStyle.pointerEvents,
        layerZIndex: layerStyle.zIndex,
        layerTransformOrigin: layerStyle.transformOrigin,
        contentZIndex: contentStyle.zIndex
      };
    });

    expect(technicalNav.headerDisplay).toBe("none");
    expect(technicalNav.layerPosition).toBe("absolute");
    expect(technicalNav.layerPointerEvents).toBe("none");
    expect(technicalNav.layerZIndex).toBe("0");
    expect(technicalNav.layerTransformOrigin).toBe("0px 0px");
    expect(technicalNav.contentZIndex).toBe("1");
  });

  test("About keeps the charcoal shell and page canvas", async ({ page }) => {
    await page.setViewportSize({ width: 645, height: 964 });
    await preparePage(page, "/now/");

    const shell = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      mainWidth: document.querySelector("main")!.getBoundingClientRect().width,
      headerBackground: getComputedStyle(document.querySelector(".site-header")!).backgroundImage,
      mainBackground: getComputedStyle(document.querySelector("main")!).backgroundImage,
      mainBackgroundColor: getComputedStyle(document.querySelector("main")!).backgroundColor
    }));

    expect(shell.mainWidth).toBe(shell.viewportWidth);
    expect(shell.headerBackground).toBe("none");
    expect(shell.mainBackground).toBe("none");
    expect(shell.mainBackgroundColor).toBe((await editorialPalette(page)).canvas);
  });

  test("portfolio routes share charcoal navigation and footer surfaces", async ({ page }) => {
    const routes = [
      "/",
      "/now/",
      "/blog/",
      "/contact/",
      "/articles/when-evidence-goes-stale/",
      "/articles/why-ai-native-devrel/",
      "/proof/",
      "/work/ai-native-devrel/",
      "/work/brainwav-io/",
      "/work/skillsbar/"
    ];
    let reference:
      | {
          nav: string;
          navInner: string;
          navLayerPointerEvents: string;
          navLayerZIndex: string;
          navLayerTransformOrigin: string;
          navContentZIndex: string;
          footer: string;
          footerProfile: string;
          footerSocial: string;
        }
      | undefined;

    for (const route of routes) {
      await preparePage(page, route);
      const surfaces = await page.evaluate(() => ({
        header: getComputedStyle(document.querySelector(".site-header")!).backgroundImage,
        nav: getComputedStyle(document.querySelector(".site-header .nav-bg")!).backgroundColor,
        navInner: getComputedStyle(document.querySelector(".site-header .nav-inner")!).backgroundColor,
        navLayerPointerEvents: getComputedStyle(document.querySelector(".site-header .nav-bg")!).pointerEvents,
        navLayerZIndex: getComputedStyle(document.querySelector(".site-header .nav-bg")!).zIndex,
        navLayerTransformOrigin: getComputedStyle(document.querySelector(".site-header .nav-bg")!).transformOrigin,
        navContentZIndex: getComputedStyle(document.querySelector(".site-header .nav-flip > a")!).zIndex,
        footer: getComputedStyle(document.querySelector(".site-footer")!).backgroundImage,
        footerProfile: getComputedStyle(document.querySelector(".site-footer .footer-profile-card")!).backgroundColor,
        footerSocial: getComputedStyle(document.querySelector(".site-footer .footer-social-links a")!).backgroundColor
      }));

      const sharedSurfaces = {
        nav: surfaces.nav,
        navInner: surfaces.navInner,
        navLayerPointerEvents: surfaces.navLayerPointerEvents,
        navLayerZIndex: surfaces.navLayerZIndex,
        navLayerTransformOrigin: surfaces.navLayerTransformOrigin,
        navContentZIndex: surfaces.navContentZIndex,
        footer: surfaces.footer,
        footerProfile: surfaces.footerProfile,
        footerSocial: surfaces.footerSocial
      };
      reference ??= sharedSurfaces;
      expect(sharedSurfaces, `${route}: shared navigation and footer surface`).toEqual(reference);
      expect(surfaces.navLayerTransformOrigin, `${route}: nav highlight transform origin`).toBe("0px 0px");
      expect(surfaces.header, `${route}: header surface`).toBe("none");
    }
  });

  test("portfolio route canvases stay neutral beneath the shared shell", async ({ page }) => {
    const routes = [
      "/",
      "/now/",
      "/blog/",
      "/contact/",
      "/articles/when-evidence-goes-stale/",
      "/articles/why-ai-native-devrel/",
      "/proof/",
      "/work/ai-native-devrel/",
      "/work/brainwav-io/",
      "/work/skillsbar/"
    ];

    for (const route of routes) {
      await preparePage(page, route);
      const canvas = await page.evaluate(() => {
        const body = getComputedStyle(document.body);
        const main = getComputedStyle(document.querySelector("main")!);
        const transparent = "rgba(0, 0, 0, 0)";
        return {
          bodyBackgroundImage: body.backgroundImage,
          bodyBackgroundColor: body.backgroundColor,
          mainBackgroundImage: main.backgroundImage,
          mainBackgroundColor: main.backgroundColor,
          effectiveMainBackgroundColor: main.backgroundColor === transparent ? body.backgroundColor : main.backgroundColor
        };
      });

      expect(canvas.bodyBackgroundImage, `${route}: body canvas gradient`).toBe(
        "none"
      );
      expect(canvas.mainBackgroundImage, `${route}: main canvas gradient`).toBe("none");
      expect(canvas.bodyBackgroundColor, `${route}: body canvas color`).toBe((await editorialPalette(page)).canvas);
      expect(canvas.effectiveMainBackgroundColor, `${route}: effective main canvas color`).toBe((await editorialPalette(page)).canvas);
    }
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

        const smallTargets = Array.from(document.querySelectorAll(selector))
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

        const unbalancedHeadings = Array.from(document.querySelectorAll("h1, h2, h3"))
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

  test("interactive focus rings are visible and use the route palette", async ({ page }) => {
    for (const route of coreRoutes) {
      await preparePage(page, route.path);
      const palette = await editorialPalette(page);
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
            color: style.outlineColor,
            outlineStyle: style.outlineStyle,
            outlineWidth: Number.parseFloat(style.outlineWidth)
          };
        });

        expect(focus.outlineStyle, `${route.path}: ${focus.label} focus style`).not.toBe("none");
        expect(focus.outlineWidth, `${route.path}: ${focus.label} focus width`).toBeGreaterThanOrEqual(2);
        expect(focus.neutral || focus.color === palette.blue, `${route.path}: ${focus.label} focus color`).toBe(true);
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

  test("About keeps the editorial composition across responsive boundaries", async ({ page }) => {
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
          copyBottom: copyRect.bottom,
          sidebarX: sidebarRect.x,
          sidebarY: sidebarRect.y,
          titleFontSize: Number.parseFloat(titleStyle.fontSize),
          titleFontFamily: titleStyle.fontFamily,
          spacerDisplay: getComputedStyle(intro.querySelector(".about-hero-spacer")!).display
        };
      });
    };

    const belowBreakpoint = await measureAbout(767, 964);
    expect(belowBreakpoint.columns, "767px About remains one track").toBe(1);
    expect(Math.abs(belowBreakpoint.sidebarX - belowBreakpoint.copyX), "767px About sidebar stays below the copy").toBeLessThan(1);

    const atBreakpoint = await measureAbout(768, 964);
    expect(atBreakpoint.columns, "768px About retains one readable track").toBe(1);
    expect(atBreakpoint.sidebarY, "768px About sidebar follows the complete copy").toBeGreaterThanOrEqual(atBreakpoint.copyBottom);
    expect(atBreakpoint.titleFontSize, "768px About title stays within the display scale").toBeLessThanOrEqual(96);
    expect(atBreakpoint.titleFontFamily, "768px About title uses the editorial serif").toContain("Newsreader");
    expect(atBreakpoint.spacerDisplay, "768px About spacer stays structural and hidden").toBe("none");

    const intermediate = await measureAbout(857, 964);
    expect(intermediate.columns, "857px About keeps one readable track").toBe(1);
    expect(intermediate.sidebarY, "857px About sidebar follows the complete copy").toBeGreaterThanOrEqual(intermediate.copyBottom);
    expect(intermediate.titleFontSize, "857px About title stays within the display scale").toBeLessThanOrEqual(96);
    expect(intermediate.titleFontFamily, "857px About title uses the editorial serif").toContain("Newsreader");
    expect(intermediate.spacerDisplay, "857px About spacer stays structural and hidden").toBe("none");

    const beforeUpperBreakpoint = await measureAbout(921, 964);
    expect(beforeUpperBreakpoint.columns, "921px About keeps one readable track").toBe(1);
    expect(beforeUpperBreakpoint.sidebarY, "921px About sidebar follows the complete copy").toBeGreaterThanOrEqual(beforeUpperBreakpoint.copyBottom);

    const afterUpperBreakpoint = await measureAbout(922, 964);
    expect(afterUpperBreakpoint.columns, "922px About enters the desktop three-track contract").toBe(3);
    expect(afterUpperBreakpoint.sidebarX, "922px About sidebar stays beside the copy").toBeGreaterThan(
      afterUpperBreakpoint.copyX + afterUpperBreakpoint.copyWidth - 1
    );

    const mobile = await measureAbout(390, 844);
    expect(mobile.columns, "390px About remains one track").toBe(1);
    expect(Math.abs(mobile.sidebarX - mobile.copyX), "390px About sidebar returns below the copy").toBeLessThan(1);
    expect(mobile.titleFontSize, "390px About title stays within the display scale").toBeLessThanOrEqual(96);
    expect(mobile.titleFontFamily, "390px About title uses the editorial serif").toContain("Newsreader");

    const desktop = await measureAbout(1440, 1000);
    expect(desktop.titleFontSize, "1440px About title stays within the display scale").toBeLessThanOrEqual(96);
    expect(desktop.titleFontFamily, "1440px About title uses the editorial serif").toContain("Newsreader");
  });
});
