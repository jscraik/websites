import { expect, test } from "@playwright/test";
import { preparePage } from "../helpers/visual";

const gateNames = [
  "Candidate identity", "Mechanical validation", "Security review",
  "Eval preparation", "Local evaluation", "Cloud evaluation", "Tessl staging",
  "Runtime proof", "Registry publication",
];

// These are demo fixtures, not commands to execute or current SDK support claims.
const scenarios = [
  {
    button: "Candidate held", title: "Needs candidate identity", score: "11",
    summary: "1 receipt current · downstream proof held", action: "Candidate identity", index: "01",
    detail: "Build the canonical non-mutating package receipt.", event: "Local candidate selected",
    states: ["Required", "Held", "Held", "Held", "Held", "Held", "Held", "Held", "Held"],
    command: "./bin/ask sdk package build Skills/agent-ops/improve-agent-native/SKILL.md --json --robot",
  },
  {
    button: "Security flagged", title: "Security review is flagged", score: "24",
    summary: "2 receipts current · delivery evidence held", action: "Security review", index: "03",
    detail: "Resolve the candidate-bound risk-mode finding.", event: "Critical-negative fixture detected",
    states: ["Current", "Current", "Flagged", "Held", "Held", "Held", "Held", "Held", "Held"],
    command: "./bin/ask sdk security risk-modes Skills/agent-ops/improve-agent-native/SKILL.md --preview --json --robot",
  },
  {
    button: "Evidence current", title: "Evidence chain is current", score: "100",
    summary: "9 receipts current · release evidence available", action: "Registry publication", index: "09",
    detail: "Inspect the bound publication receipt before promotion.", event: "All nine candidate-bound receipts reconciled",
    states: ["Current", "Current", "Current", "Current", "Current", "Current", "Current", "Current", "Current"],
    command: "./bin/ask sdk release inspect Skills/agent-ops/improve-agent-native/SKILL.md --json --robot",
  },
];

test("demo scenarios expose complete state for pointer, Enter, and Space", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: testInfo.project.name === "chromium-mobile" ? 320 : 1440, height: 1000 });
  const copied: string[] = [];
  await page.exposeFunction("captureFixtureCommand", (command: string) => { copied.push(command); });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: (command: string) => (window as unknown as { captureFixtureCommand: (text: string) => Promise<void> }).captureFixtureCommand(command),
    } });
  });
  await preparePage(page, "/demos/skillsbar/");
  for (const activation of ["pointer", "Enter", "Space"]) {
    for (const scenario of scenarios) {
      const button = page.getByRole("button", { name: scenario.button, exact: true });
      if (activation === "pointer") await button.click();
      else { await button.focus(); await page.keyboard.press(activation); }
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator('.scenario[aria-pressed="true"]')).toHaveCount(1);
      await expect(page.locator("#pipeline-title")).toHaveText(scenario.title);
      await expect(page.locator("#pipeline-summary")).toHaveText(scenario.summary);
      await expect(page.locator("#readiness-score")).toHaveText(scenario.score);
      await expect(page.locator(".readiness")).toHaveAttribute("aria-label", `${scenario.score} out of 100 pipeline readiness`);
      await expect(page.locator("#action-title")).toHaveText(scenario.action);
      await expect(page.locator("#action-index")).toHaveText(scenario.index);
      await expect(page.locator("#action-detail")).toHaveText(scenario.detail);
      await expect(page.locator("#event-entry")).toHaveText(scenario.event);
      await expect(page.locator(".event-log")).toHaveAttribute("aria-live", "polite");
      await expect(page.locator(".gate-copy strong")).toHaveText(gateNames);
      await expect(page.locator(".gate-state")).toHaveText(scenario.states);
      for (const row of await page.locator(".gate").all()) {
        await expect(row).toHaveCSS("display", "grid");
        await expect(row.locator(".gate-copy strong")).toHaveCSS("display", "block");
        await expect(row.locator(".gate-copy > span")).toHaveCSS("display", "block");
      }
      await page.getByRole("button", { name: "Copy command", exact: true }).click();
      await expect.poll(() => copied.at(-1)).toBe(scenario.command);
      await expect(page.getByRole("status")).toHaveText("Command copied");
      await expect(page.getByRole("status")).toHaveClass(/is-visible/);
      await expect(page.locator(".registry-score .score-ring strong")).toHaveText("66");
      await expect(page.locator(".proof-warning")).toContainText("not bound to the current local digest");
    }
  }
  expect(copied).toHaveLength(9);
});

test("demo reports clipboard failure without changing the selected scenario", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: testInfo.project.name === "chromium-mobile" ? 320 : 1440, height: 1000 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: async () => { throw new DOMException("Fixture clipboard denial", "NotAllowedError"); },
    } });
  });
  await preparePage(page, "/demos/skillsbar/");
  await page.getByRole("button", { name: "Security flagged", exact: true }).click();
  await page.getByRole("button", { name: "Copy command", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Clipboard unavailable");
  await expect(page.getByRole("status")).toHaveClass(/is-visible/);
  await expect(page.locator("#pipeline-title")).toHaveText("Security review is flagged");
  await expect(page.locator(".gate-state")).toHaveText(scenarios[1].states);
});

test("demo removes movement when reduced motion is requested", async ({ page }) => {
  const transitionDurations = async () => page.locator("#readiness-fill").evaluate((element) =>
    getComputedStyle(element).transitionDuration
      .split(",")
      .map((duration) => Number.parseFloat(duration) * (duration.trim().endsWith("ms") ? 1 : 1000)),
  );

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await preparePage(page, "/demos/skillsbar/", { stabilize: false });
  expect(Math.max(...await transitionDurations())).toBe(350);

  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(Math.max(...await transitionDurations())).toBeLessThanOrEqual(0.01);

  await page.getByRole("button", { name: "Security flagged", exact: true }).click();
  await expect(page.locator("#readiness-score")).toHaveText("24");
  const movementDurations = await page.locator("#readiness-fill").evaluate((element) =>
    element.getAnimations().map((animation) => Number(animation.effect?.getTiming().duration ?? 0)),
  );
  expect(movementDurations.every((duration) => duration <= 0.01)).toBe(true);
});
