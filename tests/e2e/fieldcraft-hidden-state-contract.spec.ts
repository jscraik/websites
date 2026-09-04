import { expect, test } from "@playwright/test";

test("distinguishes display-none and opacity-only hidden controls", async ({ page }) => {
  await page.setContent(`
    <section>
      <button id="display-none" data-state-hidden="true" style="display:none">Hidden</button>
      <div style="display:none"><button id="ancestor-hidden" data-state-hidden="true">Hidden ancestor</button></div>
      <button id="opacity-only" data-state-hidden="true" style="opacity:0">Transparent</button>
    </section>
  `);

  const states = await page.locator("[data-state-hidden=true]").evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      const rendered =
        style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
      const keyboardReachable =
        rendered && !element.closest("[inert]") && !element.hidden && element.matches("button:not([disabled])");
      return {
        id: element.id,
        violation:
          (Number(style.opacity) > 0 && rendered) ||
          (rendered && style.pointerEvents !== "none") ||
          keyboardReachable,
      };
    }),
  );

  expect(states).toEqual([
    { id: "display-none", violation: false },
    { id: "ancestor-hidden", violation: false },
    { id: "opacity-only", violation: true },
  ]);
});
