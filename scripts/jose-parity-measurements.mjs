const DEFAULT_CANVAS_RGB = [255, 255, 255];

export function resolveEffectiveBackgroundRgb(backgroundLayers, canvasRgb = DEFAULT_CANVAS_RGB) {
  let foreground = [0, 0, 0, 0];

  for (const layer of backgroundLayers) {
    foreground = composite(foreground, parseCssColor(layer));
    if (foreground[3] >= 1) break;
  }

  const painted = composite(foreground, [...canvasRgb, 1]);
  return painted.slice(0, 3).map((channel) => Math.round(channel));
}

export function maskPixelRegions(pixels, width, height, regions) {
  for (const region of regions) {
    const left = clamp(Math.floor(region.x), 0, width);
    const top = clamp(Math.floor(region.y), 0, height);
    const right = clamp(Math.ceil(region.x + region.width), 0, width);
    const bottom = clamp(Math.ceil(region.y + region.height), 0, height);

    for (let y = top; y < bottom; y += 1) {
      for (let x = left; x < right; x += 1) {
        const offset = (y * width + x) * 4;
        pixels[offset] = 0;
        pixels[offset + 1] = 0;
        pixels[offset + 2] = 0;
        pixels[offset + 3] = 0;
      }
    }
  }

  return pixels;
}

function parseCssColor(value) {
  const channels = value.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (channels.length < 3) return [0, 0, 0, 0];
  if (value.startsWith("color(srgb")) {
    return [channels[0] * 255, channels[1] * 255, channels[2] * 255, channels[3] ?? 1];
  }
  return [channels[0], channels[1], channels[2], channels[3] ?? 1];
}

function composite(foreground, background) {
  const foregroundAlpha = clamp(foreground[3], 0, 1);
  const backgroundAlpha = clamp(background[3], 0, 1);
  const alpha = foregroundAlpha + backgroundAlpha * (1 - foregroundAlpha);
  if (alpha === 0) return [0, 0, 0, 0];

  return [
    (foreground[0] * foregroundAlpha + background[0] * backgroundAlpha * (1 - foregroundAlpha)) / alpha,
    (foreground[1] * foregroundAlpha + background[1] * backgroundAlpha * (1 - foregroundAlpha)) / alpha,
    (foreground[2] * foregroundAlpha + background[2] * backgroundAlpha * (1 - foregroundAlpha)) / alpha,
    alpha,
  ];
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}
