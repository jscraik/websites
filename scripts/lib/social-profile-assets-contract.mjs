const APPROVED_BANNERS = {
  x: {
    source: "src/brand/source/approved/jamie-x-header-1500x500.png",
    output: "public/brand/social/approved/jamie-x-header-1500x500.png",
  },
  linkedin: {
    source: "src/brand/source/approved/jamie-linkedin-background-1584x396.png",
    output: "public/brand/social/approved/jamie-linkedin-background-1584x396.png",
  },
};

export function approvedBannerPathsMatch(platform, specification) {
  if (!Object.hasOwn(APPROVED_BANNERS, platform)) return false;
  const expected = APPROVED_BANNERS[platform];
  return Boolean(expected && specification?.source === expected.source && specification?.output === expected.output);
}
