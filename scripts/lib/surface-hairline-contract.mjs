export function hasDensityAwareBlogDividers(globalCss, blogPage) {
  const baseWidth = /:root\s*\{[^}]*--border-hairline:\s*1px\s*;/s.test(globalCss);
  const retinaWidth = /@media\s*\(min-resolution:\s*2dppx\)\s*\{\s*:root\s*\{[^}]*--border-hairline:\s*0\.5px\s*;/s.test(globalCss);
  const blogUsesToken = /border-top:\s*var\(--border-hairline\)\s+solid\s+var\(--border-subtle\)\s*;/s.test(blogPage);

  return baseWidth && retinaWidth && blogUsesToken;
}
