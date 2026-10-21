import { expect, test } from "../helpers/test";

test("About contribution chart follows Evolve and scrolls without widening the page", async ({ page }) => {
  for (const width of [320, 390, 853, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/now/");
    const section = page.locator(".about-contributions");
    expect(await section.evaluate(element => element.previousElementSibling?.classList.contains("about-evolve"))).toBe(true);
    const chart = section.getByRole("region", { name: "GitHub contribution chart, 2023 to 2026" });
    await chart.scrollIntoViewIfNeeded();
    await chart.locator("img").evaluate((image: HTMLImageElement) => image.decode());
    expect(await chart.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(2024);
    await expect(section.getByRole("link", { name: "Open the full graphic" })).toHaveAttribute("href", "/personal/jscraik-github-contributions.png");
    await expect(section).toContainText("A static snapshot");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    if (width <= 390) {
      await chart.focus();
      await page.keyboard.press("ArrowRight");
      await expect.poll(() => chart.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
    }
  }
});

test("personal image cards preserve their subjects and adapt to the viewport", async ({ page }) => {
  for (const width of [390, 853, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/now/#fun-facts");
    await page.evaluate(() => document.fonts.ready);
    const images = page.locator(".about-photo-card img");
    await expect(images).toHaveCount(4);
    await images.evaluateAll(async (items) => {
      for (const image of items) image.loading = "eager";
      await Promise.all(items.map((image) => image.decode()));
    });
    await expect(page.locator(".about-photo-card h3")).toHaveText(["British Army", "The helmet that saved my life", "Grumpy Grinch", "Macro photography"]);
    const [first, second] = await page.locator(".about-photo-media").evaluateAll((items) => items.map((item) => { const box = item.getBoundingClientRect(); return { y: box.y, width: box.width, height: box.height }; }));
    expect(first.width / first.height).toBeCloseTo(4 / 3, 1);
    if (width > 640) expect(Math.abs(first.y - second.y)).toBeLessThan(2);
    else expect(second.y).toBeGreaterThan(first.y + first.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
  await page.goto("/");
  await expect(page.locator(".blog-preview__image")).toHaveAttribute("href", "/articles/when-evidence-goes-stale/");
  await expect(page.locator(".blog-preview__image img")).toHaveAttribute("alt", /Evidence belongs to Candidate A/);
});

test("footer groups identity and links without excess spacing or overlap", async ({ page }) => {
  for (const width of [390, 853, 1440]) {
    await page.setViewportSize({ width, height: 867 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const footer = page.locator(".site-footer");
    await footer.scrollIntoViewIfNeeded();
    const card = (await footer.locator(".footer-profile-card").boundingBox())!;
    const links = (await footer.locator(".footer-links").boundingBox())!;
    const social = (await footer.locator(".footer-social-links").boundingBox())!;
    if (width <= 640) {
      expect(links.y - card.y - card.height).toBeGreaterThanOrEqual(16);
      expect(links.y - card.y - card.height).toBeLessThanOrEqual(32);
      expect(social.y).toBeGreaterThanOrEqual(links.y + links.height);
    } else if (width <= 1024) {
      expect(Math.abs(card.y + card.height / 2 - social.y - social.height / 2)).toBeLessThan(2);
      expect(card.x + card.width).toBeLessThan(social.x);
      expect(links.y).toBeGreaterThanOrEqual(card.y + card.height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});

test("visitors reach published work and hiring information before secondary content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto("/now/");
  await expect(page.locator(".about-copy")).toContainText("June 2027");
  await expect(page.locator(".about-copy")).toContainText("University Campus North Lincolnshire");
  expect(await page.locator("main > section[id]").evaluateAll((sections) => sections.map((section) => section.id))).toEqual(["fun-facts", "skills", "current-focus", "on-the-web"]);
  await page.goto("/blog/");
  for (const width of [320, 390, 791, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.locator("#blog-title").evaluate(e => { const range = document.createRange(); range.selectNodeContents(e); return range.getClientRects().length; })).toBe(1);
  }
  await expect(page.locator("#blog-title")).toHaveText("Blog");
  await expect(page.locator(".blog-title-block .draft-links")).toBeVisible();
  await page.goto("/proof/");
  await expect(page.locator("a.proof-project")).toHaveCount(5);
  await expect(page.locator("a.proof-project img")).toHaveCount(5);
  for (let iteration = 0; iteration < 3; iteration++) {
    await page.getByRole("link", { name: "Explore SkillsProof", exact: true }).click();
    await expect(page.locator("h1")).toHaveText("SkillsProof");
    await expect(page.getByRole("link", { name: "Try the interactive demo" })).toHaveAttribute("href", "/demos/skillsbar/");
    await page.getByRole("link", { name: "Home", exact: true }).first().click();
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".site-header .nav-bg")).toHaveCSS("transform", "none");
    await page.goto("/proof/");
  }
});

test("homepage leads with the work and navigation stays stable through page changes", async ({ page }) => {
  for (const width of [390, 791, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("h1")).toHaveText("I build software and developer tools with practical AI.");
    await expect(page.locator(".home-hero__identity")).toHaveText("Jamie Scott Craik");
    await expect(page.locator(".start-links__copy strong")).toHaveText(["View my background", "Try SkillsProof", "Read the latest article"]);
    await expect(page.getByRole("link", { name: "Read the latest article Lessons from building the tools" })).toHaveAttribute("href", "/articles/when-evidence-goes-stale/");
    const background = page.locator(".site-header .nav-bg");
    const original = await background.boundingBox();
    for (const label of ["Work", "About", "Blog", "Contact"]) {
      await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: label, exact: true }).hover();
      expect(await background.boundingBox()).toEqual(original);
      expect(await background.evaluate((element) => element.getAnimations().length)).toBe(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    const title = await page.locator("h1").boundingBox();
    expect(title!.x).toBeGreaterThanOrEqual(15);
    expect(title!.x + title!.width).toBeLessThanOrEqual(width - 15);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(background).toHaveCSS("transform", "none");
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Contact", exact: true })).toHaveAttribute("href", "mailto:jscraik@brainwav.io");
  await expect(page.locator('.footer-links').getByRole("link", { name: "Contact", exact: true })).toHaveAttribute("href", "mailto:jscraik@brainwav.io");
  for (const [label, path] of [["Work", "/proof/"], ["About", "/now/"], ["Blog", "/blog/"]]) {
    const link = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: label, exact: true });
    await expect(link).toHaveAttribute("href", path);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    await page.goBack({ waitUntil: "commit" });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".site-header .nav-bg")).toHaveCSS("transform", "none");
  }
});
