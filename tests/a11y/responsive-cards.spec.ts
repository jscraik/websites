import { expect, test } from "../helpers/test";

test("Blog author layout follows its slot rather than the desktop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/blog/");
  const slot = page.locator(".blog-about-slot");
  const portrait = slot.locator("img");
  const copy = slot.locator(".blog-author-copy");
  for (const width of [340, 800, 340]) {
    await slot.evaluate((element, size) => { element.style.inlineSize = `${size}px`; }, width);
    const imageBox = (await portrait.boundingBox())!;
    const copyBox = (await copy.boundingBox())!;
    if (width < 576) expect(copyBox.y).toBeGreaterThanOrEqual(imageBox.y + imageBox.height);
    else {
      expect(Math.abs(imageBox.y - copyBox.y)).toBeLessThan(1);
      expect(copyBox.x).toBeGreaterThan(imageBox.x + imageBox.width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("Proof cards share content rows and adapt to a narrow slot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/proof/");
  await page.evaluate(() => document.fonts.ready);
  const projects = page.getByRole("region", { name: "Published projects" });
  await projects.locator("h2").first().evaluate(element => {
    element.textContent = "A much longer project title that wraps across several lines";
  });
  for (const selector of ["h2", "p:not(.proof-project__role)", ".proof-project__role", ".proof-project__cta"]) {
    const tops = await projects.locator(`.proof-project > ${selector}`).evaluateAll(elements => elements.slice(0, 3).map(element => element.getBoundingClientRect().top));
    expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1);
  }
  const notes = page.getByRole("region", { name: "Featured proof" });
  for (const label of ["Evidence", "Caveat", "Next state"]) {
    const tops = await notes.locator("dt").filter({ hasText: label }).evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top));
    expect(tops.length).toBe(2);
    expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1);
  }
  await page.locator(".proof-index").evaluate(element => { element.style.inlineSize = "340px"; });
  const [first, second] = await projects.locator(".proof-project").evaluateAll(elements => elements.slice(0, 2).map(element => {
    const box = element.getBoundingClientRect();
    return { x: box.x, y: box.y, bottom: box.bottom };
  }));
  expect(Math.abs(first.x - second.x)).toBeLessThan(1);
  expect(second.y).toBeGreaterThanOrEqual(first.bottom);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
