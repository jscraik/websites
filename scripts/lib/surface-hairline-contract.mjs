export function hasDensityAwareBlogDividers(globalCss, blogPage) {
  const baseWidth = /:root\s*\{[^}]*--border-hairline:\s*1px\s*;/s.test(globalCss);
  const retinaWidth = /@media\s*\(min-resolution:\s*2dppx\)\s*\{\s*:root\s*\{[^}]*--border-hairline:\s*0\.5px\s*;/s.test(globalCss);
  const expectedDividers = new Map([
    [".draft-links", ["top", "bottom"]],
    [".blog-list-item", ["top"]],
    [".blog-list-item:last-child", ["bottom"]],
    [".article-list h2", ["bottom"]],
    [".blog-index .draft-links span:first-of-type", ["top"]],
    [".blog-index .draft-links span:last-of-type", ["bottom"]],
  ]);
  const seen = new Set();
  const css = blogPage.replace(/<\/?style[^>]*>/g, "");
  for (const [, selectorText, declarations] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = selectorText.trim();
    if (!expectedDividers.has(selector)) continue;
    for (const [, side, value] of declarations.matchAll(/border-(top|bottom):\s*([^;]+);/g)) {
      const key = `${selector}:${side}`;
      if (value.trim() === "0") continue;
      if (!expectedDividers.get(selector).includes(side) ||
          value.trim() !== "var(--border-hairline) solid var(--border-subtle)") return false;
      seen.add(key);
    }
  }

  return baseWidth && retinaWidth && [...expectedDividers].every(([selector, sides]) =>
    sides.every((side) => seen.has(`${selector}:${side}`)));
}
