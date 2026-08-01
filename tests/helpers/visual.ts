import type { Page } from "@playwright/test";

export const stableScreenshotStyle = `
  *,
  *::before,
  *::after {
    animation-duration: 0.001s !important;
    animation-delay: 0s !important;
    transition-duration: 0.001s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
`;

export async function preparePage(page: Page, path: string) {
  const response = await page.goto(path);
  if (!response || !response.ok()) {
    throw new Error(`Failed to load ${path}: ${response?.status() ?? "no response"}`);
  }
  await page.addStyleTag({ content: stableScreenshotStyle });
}

export const coreRoutes = [
  { name: "home", path: "/" },
  { name: "about", path: "/now/" },
  { name: "blog", path: "/blog/" },
  { name: "contact", path: "/contact/" },
  { name: "skillsbar-demo", path: "/demos/skillsbar/" },
  { name: "article-ai-native-devrel", path: "/articles/why-ai-native-devrel/" },
  { name: "proof", path: "/proof/" },
  { name: "work-ai-native-devrel", path: "/work/ai-native-devrel/" },
  { name: "work-brainwav-io", path: "/work/brainwav-io/" }
] as const;
