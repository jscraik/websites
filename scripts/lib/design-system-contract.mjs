export function extractStartLinkRecords(source) {
  return [...source.matchAll(/\{\s*href:\s*"([^"]+)"[\s\S]*?label:\s*"([^"]+)"[\s\S]*?primary:\s*true\s*\}/g)].map(
    ([, href, label]) => ({ href, label })
  );
}

export function hasPrimarySkillsBarLink(source) {
  return extractStartLinkRecords(source).some(
    ({ href, label }) => href === "/demos/skillsbar/" && label === "Start with SkillsBar"
  );
}
