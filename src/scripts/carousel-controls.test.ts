import { afterEach, describe, expect, it, vi } from "vitest";
import { initCarouselControls } from "./carousel-controls";

class FakeElement {
  ownerDocument?: { activeElement: FakeElement | null };
  focus = vi.fn(() => { if (this.ownerDocument) this.ownerDocument.activeElement = this; });
  dataset: Record<string, string> = {};
  hidden = true;
  disabled = false;
  style = { transform: "" };
  scrollWidth = 0;
  clientWidth = 0;
  scrollLeft = 0;
  offsetLeft = 0;
  getBoundingClientRect() { return { left: this.offsetLeft - (this.parent?.scrollLeft ?? 0), width: this.clientWidth }; }
  scrollBy = vi.fn();
  parent: FakeElement | null = null;
  children = new Map<string, FakeElement>();
  collections = new Map<string, FakeElement[]>();
  attributes = new Map<string, string>();
  listeners = new Map<string, Array<(event: { detail: number }) => void>>();

  closest() { return this.parent; }
  querySelector(selector: string) { return this.children.get(selector) ?? null; }
  querySelectorAll(selector: string) { return this.collections.get(selector) ?? []; }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  getAttribute(name: string) { return this.attributes.get(name) ?? null; }
  addEventListener(name: string, listener: (event: { detail: number }) => void) {
    this.listeners.set(name, [...(this.listeners.get(name) ?? []), listener]);
  }
  fire(name: string, detail = 1) { for (const listener of this.listeners.get(name) ?? []) listener({ detail }); }
}

function makeCarousel(scrollWidth = 1000) {
  const section = new FakeElement();
  const controls = new FakeElement();
  const row = new FakeElement();
  const previous = new FakeElement();
  const next = new FakeElement();
  const progress = new FakeElement();
  controls.parent = section;
  row.scrollWidth = scrollWidth;
  row.clientWidth = 400;
  section.children.set("[data-work-row]", row);
  controls.children.set("[data-work-prev]", previous);
  controls.children.set("[data-work-next]", next);
  controls.children.set("[data-work-progress]", progress);
  return { controls, row, previous, next, progress };
}

afterEach(() => vi.unstubAllGlobals());

describe("initCarouselControls", () => {
  it("centres selection and advances one project rather than a viewport page", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: true }), addEventListener: vi.fn() });
    const carousel = makeCarousel();
    const cards = [100, 350, 600].map((offset) => {
      const card = new FakeElement();
      card.offsetLeft = offset;
      card.clientWidth = 200;
      card.parent = carousel.row;
      return card;
    });
    carousel.row.collections.set(".work-mini-card", cards);
    const root = new FakeElement();
    root.collections.set("[data-work-carousel]", [carousel.controls]);
    initCarouselControls(root as unknown as ParentNode);
    expect(carousel.row.scrollLeft).toBe(250);
    expect(cards.map(card => card.dataset.active)).toEqual(["false", "true", "false"]);
    carousel.next.fire("click", 0);
    expect(carousel.row.scrollBy).toHaveBeenCalledWith({ left: 250, behavior: "auto" });
    carousel.row.scrollLeft = 500;
    carousel.row.fire("scroll");
    expect(cards.map(card => card.dataset.active)).toEqual(["false", "false", "true"]);
  });
  it("keeps focus on an available control when an endpoint disables the current one", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: true }), addEventListener: vi.fn() });
    const carousel = makeCarousel();
    const doc = { activeElement: carousel.next as FakeElement | null };
    for (const element of [carousel.controls, carousel.next, carousel.previous]) element.ownerDocument = doc;
    const root = new FakeElement();
    root.collections.set("[data-work-carousel]", [carousel.controls]);
    initCarouselControls(root as unknown as ParentNode);
    carousel.row.scrollLeft = 600;
    carousel.row.fire("scroll");
    expect(carousel.next.disabled).toBe(true);
    expect(doc.activeElement).toBe(carousel.previous);
    carousel.row.scrollLeft = 0;
    carousel.row.fire("scroll");
    expect(carousel.previous.disabled).toBe(true);
    expect(doc.activeElement).toBe(carousel.next);
  });
  it("keeps each carousel's buttons and progress bound to its own row", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }), addEventListener: vi.fn() });
    const first = makeCarousel();
    const second = makeCarousel(1400);
    const root = new FakeElement();
    root.collections.set("[data-work-carousel]", [first.controls, second.controls]);

    initCarouselControls(root as unknown as ParentNode);

    expect(first.controls.hidden).toBe(false);
    expect(first.previous.disabled).toBe(true);
    expect(first.next.disabled).toBe(false);
    expect(first.previous.getAttribute("aria-disabled")).toBe("true");
    expect(first.next.getAttribute("aria-disabled")).toBe("false");
    first.next.fire("click");
    expect(first.row.scrollBy).toHaveBeenCalledWith({ left: 288, behavior: "smooth" });
    expect(second.row.scrollBy).not.toHaveBeenCalled();

    second.row.scrollLeft = 1000;
    second.row.fire("scroll");
    expect(second.next.disabled).toBe(true);
    expect(second.next.getAttribute("aria-disabled")).toBe("true");
    expect(second.progress.style.transform).toBe("scaleX(1)");
    expect(first.next.getAttribute("aria-disabled")).toBe("false");
    second.next.fire("click");
    expect(second.row.scrollBy).not.toHaveBeenCalled();

    second.row.scrollLeft = 500;
    second.row.fire("scroll");
    expect(second.previous.disabled).toBe(false);
    expect(second.next.disabled).toBe(false);
  });

  it("hides a non-scrollable carousel and avoids duplicate listeners", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: true }), addEventListener: vi.fn() });
    const carousel = makeCarousel(410);
    const root = new FakeElement();
    root.collections.set("[data-work-carousel]", [carousel.controls]);

    initCarouselControls(root as unknown as ParentNode);
    initCarouselControls(root as unknown as ParentNode);

    expect(carousel.controls.hidden).toBe(true);
    expect(carousel.next.listeners.get("click")).toHaveLength(1);
    carousel.row.scrollWidth = 1000;
    carousel.row.fire("scroll");
    carousel.next.fire("click");
    expect(carousel.row.scrollBy).toHaveBeenCalledWith({ left: 288, behavior: "auto" });
  });

  it("scrolls immediately when a carousel button is keyboard-activated", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }), addEventListener: vi.fn() });
    const carousel = makeCarousel();
    const root = new FakeElement();
    root.collections.set("[data-work-carousel]", [carousel.controls]);

    initCarouselControls(root as unknown as ParentNode);
    carousel.next.fire("click", 0);

    expect(carousel.row.scrollBy).toHaveBeenCalledWith({ left: 288, behavior: "auto" });
  });
});
