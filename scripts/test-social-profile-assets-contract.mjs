import assert from "node:assert/strict";
import test from "node:test";
import { approvedBannerPathsMatch } from "./lib/social-profile-assets-contract.mjs";

const valid = {
  source: "src/brand/source/approved/jamie-x-header-1500x500.png",
  output: "public/brand/social/approved/jamie-x-header-1500x500.png",
};

test("accepts the exact approved X banner pair", () => {
  assert.equal(approvedBannerPathsMatch("x", valid), true);
});

test("rejects an unapproved filename inside the approved directories", () => {
  assert.equal(approvedBannerPathsMatch("x", {
    source: "src/brand/source/approved/unreviewed.png",
    output: "public/brand/social/approved/unreviewed.png",
  }), false);
});
