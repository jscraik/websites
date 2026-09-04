export interface FlipRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const isUsableRect = (rect: FlipRect) =>
  Number.isFinite(rect.left) &&
  Number.isFinite(rect.top) &&
  Number.isFinite(rect.width) &&
  Number.isFinite(rect.height) &&
  rect.width > 0 &&
  rect.height > 0;

/** Return the inverse transform needed to animate `to` from the old `from` box. */
export function getFlipTransform(from: FlipRect, to: FlipRect): string | null {
  if (!isUsableRect(from) || !isUsableRect(to)) return null;

  return `translate3d(${from.left - to.left}px, ${from.top - to.top}px, 0) scale(${from.width / to.width}, ${from.height / to.height})`;
}
