import { expect, test } from "../helpers/test";
import { preparePage } from "../helpers/visual";

test.describe("portfolio interface contracts", () => {
  test("SkillsBar artwork and caption fill separate rows without overlap", async ({ page }) => {
    await preparePage(page, "/");

    const panel = page.locator(".feature-block-img--skills");
    const artwork = panel.locator(".skillsbar-artwork");
    const caption = panel.locator(".feature-proof-panel");
    const [panelBox, artworkBox, captionBox] = await Promise.all([panel.boundingBox(), artwork.boundingBox(), caption.boundingBox()]);
    expect(panelBox).not.toBeNull();
    expect(artworkBox).not.toBeNull();
    expect(captionBox).not.toBeNull();
    expect(artworkBox!.y).toBeCloseTo(panelBox!.y, 0);
    expect(artworkBox!.width).toBeCloseTo(panelBox!.width, 0);
    expect(captionBox!.y).toBeCloseTo(artworkBox!.y + artworkBox!.height, 0);
    expect(artworkBox!.height + captionBox!.height).toBeCloseTo(panelBox!.height, 0);
  });

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

    const primaryRoute = page.getByRole("link", { name: "Try SkillsBar Explore the interactive demo" });
    await expect(primaryRoute).toHaveAttribute("href", "/demos/skillsbar/");
    await expect(primaryRoute).toHaveAttribute("data-primary-start", "true");
    await expect(page.locator('a[data-primary-start][href="/work/skillsbar/"]')).toHaveCount(0);
    await expect(page.locator("[data-reveal]")).toHaveCount(0);
    await expect(page.locator(".home-hero[data-entry]")).toHaveCount(1);
    await expect(page.locator("#featured-work .feature-block[data-entry]")).toHaveCount(2);
    await expect(page.locator("#work[data-entry]")).toHaveCount(1);
    await expect(page.locator(".blog-preview[data-entry]")).toHaveCount(1);
    await expect(page.locator("[data-entry]")).toHaveCount(5);

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
    expect(animationNames).toEqual(["none", "none", "none", "none", "none"]);
  });

  // Static navigation, heading hierarchy and responsive geometry are covered by
  // tests/a11y/home-navigation.spec.ts after the approved homepage review.

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
      "summary_large_image"
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content", "https://jscraik.com/jamie-profile-640.webp"
    );
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      "content", "Portrait of Jamie Scott Craik"
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
      { path: "/contact/", selector: ".contact-page > div > p:not(.eyebrow)" },
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
        "/brand/fonts/geist-mono-variable.woff2",
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
