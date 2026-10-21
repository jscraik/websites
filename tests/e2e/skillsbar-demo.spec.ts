import { expect, test } from "../helpers/test";

test("stage inspection leaves evidence unchanged and refresh preserves selection", async ({ page }) => {
  await page.goto("/demos/skillsbar/");
  await expect(page.getByRole("group", { name: "Nine evidence gates" })).toBeVisible();
  await expect(page.locator("#detail-status")).toHaveCSS("color", "rgb(255, 207, 116)");
  await expect(page.locator(".stage strong")).toHaveText(["Identity", "Validation", "Security", "Eval prep", "Local eval", "Cloud eval", "Staging", "Publication", "Runtime"]);
  const states = await page.locator(".stage-state").allTextContents();
  expect(states).toEqual(["Passed", "Passed", "Review required", "Held", "Unproven", "Unproven", "Unproven", "Unproven", "Unproven"]);
  await page.locator(".stage").nth(8).click();
  await expect(page.locator("#action-title")).toHaveText("Runtime");
  await expect(page.locator("#detail-status")).toHaveCSS("color", "rgb(210, 211, 215)");
  await expect(page.locator("#next-required")).toHaveText("Next required: Security");
  await page.getByRole("button", { name: "Refresh example" }).click();
  await expect(page.locator('.stage[aria-pressed="true"]')).toHaveAttribute("aria-label", /Gate 9/);
  await expect(page.locator(".stage-state")).toHaveText(states);
  await page.locator(".stage").first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#action-title")).toHaveText("Eval prep");
  await page.keyboard.press("End");
  await expect(page.locator("#action-title")).toHaveText("Runtime");
  await page.keyboard.press("Home");
  await expect(page.locator("#action-title")).toHaveText("Identity");
  await expect(page.locator(".stage").first()).toBeFocused();
  await expect(page.locator("#detail-status")).toHaveAttribute("data-status", "Passed");
  await expect(page.locator("#detail-status")).toHaveCSS("color", "oklch(0.8 0.15 150)");
  await page.getByRole("button", { name: "Installed copy found", exact: true }).click();
  await expect(page.locator("#action-title")).toHaveText("Identity");
  await expect(page.locator(".stage-state")).toHaveText(Array(9).fill("Unproven"));
  await expect(page.locator("#registry-state")).toHaveText("Not Linked");
  await expect(page.locator("#copy-command")).toBeHidden();
});

test("command copying handles denial without advancing evidence", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Clipboard denied"); } } }));
  await page.goto("/demos/skillsbar/");
  await page.getByRole("button", { name: "Identity missing", exact: true }).click();
  await page.getByRole("button", { name: "Copy command", exact: true }).click();
  await expect(page.locator("#copy-status")).toContainText("Clipboard unavailable");
  await expect(page.locator("#command-disclosure")).toHaveAttribute("open", "");
  await expect(page.locator("#next-required")).toHaveText("Next required");
  await expect(page.locator(".stage-state").first()).toHaveText("Review required");
});

test("the identity command is copied without an execution request", async ({ page }) => {
  const copied: string[] = [];
  await page.exposeFunction("captureCommand", (value: string) => copied.push(value));
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: (value: string) => (window as unknown as { captureCommand: (text: string) => Promise<void> }).captureCommand(value) } }));
  await page.goto("/demos/skillsbar/");
  await page.getByRole("button", { name: "Identity missing", exact: true }).click();
  await page.getByRole("button", { name: "Copy command", exact: true }).click();
  await expect.poll(() => copied[0]).toBe("./bin/ask sdk start Skills/agent-ops/improve-agent-native --json --robot");
  await expect(page.locator("#copy-status")).toContainText("Nothing has been run");
});
