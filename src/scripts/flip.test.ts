import { describe, expect, it } from "vitest";
import { getFlipTransform } from "./flip";

describe("getFlipTransform", () => {
  it("rejects zero-sized or non-finite rectangles", () => {
    expect(getFlipTransform({ left: 0, top: 0, width: 0, height: 10 }, { left: 0, top: 0, width: 10, height: 10 })).toBeNull();
    expect(getFlipTransform({ left: 0, top: 0, width: Number.NaN, height: 10 }, { left: 0, top: 0, width: 10, height: 10 })).toBeNull();
  });

  it("calculates inverse translation and scale", () => {
    expect(getFlipTransform({ left: 20, top: 30, width: 200, height: 100 }, { left: 10, top: 10, width: 100, height: 50 })).toBe(
      "translate3d(10px, 20px, 0) scale(2, 2)",
    );
  });
});
