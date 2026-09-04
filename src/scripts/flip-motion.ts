export const joseFlipDuration = 400;
export const joseFlipEasing = "cubic-bezier(0.165, 0.84, 0.44, 1)";

type FlipOptions = {
  animate?: boolean;
  prepend?: boolean;
};

export const moveLayerWithFlip = (
  layer: HTMLElement,
  destination: HTMLElement,
  { animate = true, prepend = true }: FlipOptions = {},
) => {
  const first = layer.getBoundingClientRect();
  layer.getAnimations().forEach((animation) => animation.cancel());

  if (prepend) {
    destination.prepend(layer);
  } else {
    destination.append(layer);
  }

  if (!animate) return;

  const last = layer.getBoundingClientRect();
  if (first.width === 0 || first.height === 0 || last.width === 0 || last.height === 0) return;

  layer.animate(
    [
      {
        transform: `translate3d(${first.left - last.left}px, ${first.top - last.top}px, 0) scale(${first.width / last.width}, ${first.height / last.height})`,
        transformOrigin: "top left",
      },
      { transform: "none", transformOrigin: "top left" },
    ],
    {
      duration: joseFlipDuration,
      easing: joseFlipEasing,
      fill: "none",
    },
  );
};
