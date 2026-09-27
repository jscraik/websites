import { afterEach, describe, expect, it, vi } from "vitest";
import { initPullquoteStacks } from "./pullquote-stack";

class FakeElement {
  dataset: Record<string, string> = {};
  textContent = "";
  parent: FakeElement | null = null;
  children = new Map<string, FakeElement>();
  collections = new Map<string, FakeElement[]>();
  listeners = new Map<string, Array<() => Promise<void> | void>>();

  closest() { return this.parent; }
  querySelector(selector: string) { return this.children.get(selector) ?? null; }
  querySelectorAll(selector: string) { return this.collections.get(selector) ?? []; }
  addEventListener(name: string, listener: () => Promise<void> | void) {
    this.listeners.set(name, [...(this.listeners.get(name) ?? []), listener]);
  }
  async fire(name: string) {
    for (const listener of this.listeners.get(name) ?? []) await listener();
  }
}

function makeStack(figure: string, quoteText: string) {
  const stack = new FakeElement();
  const status = new FakeElement();
  const figureElement = new FakeElement();
  const quote = new FakeElement();
  const button = new FakeElement();
  const label = new FakeElement();
  quote.textContent = quoteText;
  label.textContent = "Copy";
  button.dataset.copyLabel = `${figure} pullquote and article link`;
  button.parent = figureElement;
  figureElement.children.set("[data-pullquote]", quote);
  button.children.set("span", label);
  stack.children.set("[data-copy-status]", status);
  stack.collections.set("[data-copy-pullquote]", [button]);
  return { stack, status, button, label };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("initPullquoteStacks", () => {
  it("copies and announces feedback only in the clicked stack", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const listeners = new Map<string, () => void>();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    vi.stubGlobal("window", {
      location: { href: "https://jscraik.com/article/" },
      setTimeout,
      clearTimeout,
      addEventListener: (name: string, listener: () => void) => listeners.set(name, listener)
    });
    const first = makeStack("Fig 1.1", "First quote");
    const second = makeStack("Fig 2.1", "Second quote");
    const root = new FakeElement();
    root.collections.set(".pullquote-stack", [first.stack, second.stack]);

    initPullquoteStacks(root as unknown as ParentNode);
    await first.button.fire("click");

    expect(writeText).toHaveBeenCalledWith("First quote\n\nhttps://jscraik.com/article/");
    expect(first.status.textContent).toBe("Copied Fig 1.1 pullquote and article link.");
    expect(first.label.textContent).toBe("Copied");
    expect(second.status.textContent).toBe("");
    expect(second.label.textContent).toBe("Copy");

    vi.advanceTimersByTime(1000);
    await second.button.fire("click");
    expect(second.status.textContent).toBe("Copied Fig 2.1 pullquote and article link.");

    vi.advanceTimersByTime(1400);
    expect(first.status.textContent).toBe("");
    expect(first.label.textContent).toBe("Copy");
    expect(second.status.textContent).toBe("Copied Fig 2.1 pullquote and article link.");
    vi.advanceTimersByTime(1000);
    expect(second.status.textContent).toBe("");
    expect(listeners.has("pagehide")).toBe(true);
  });

  it("reports clipboard failure and does not register duplicate click handlers", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    vi.stubGlobal("window", {
      location: { href: "https://jscraik.com/article/" },
      setTimeout,
      clearTimeout,
      addEventListener: vi.fn()
    });
    const item = makeStack("Fig 1.1", "First quote");
    const root = new FakeElement();
    root.collections.set(".pullquote-stack", [item.stack]);

    initPullquoteStacks(root as unknown as ParentNode);
    initPullquoteStacks(root as unknown as ParentNode);
    await item.button.fire("click");

    expect(item.button.listeners.get("click")).toHaveLength(1);
    expect(item.label.textContent).toBe("Copy unavailable");
    expect(item.status.textContent).toContain("Select the pullquote and article URL manually.");
  });
});
