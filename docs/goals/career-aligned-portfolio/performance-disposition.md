# Retained production performance disposition

Candidate: `7fd6a76b…`; existing six raw reports in
`.playwright-tmp/portfolio-font-trial.4N9oEp/lighthouse-{0,1,2,3,4,5}.json`.
No new audit or product change was performed for this diagnosis.

## Fourteen error assertions

| Group | Evidence | Disposition |
| --- | --- | --- |
| Six unused-CSS errors | All identify `BaseLayout.CKahxD7B.css`, 35,944 transfer bytes; estimated unused bytes are 19,508 Home, 25,239 About, 26,709 Blog, 29,127 Proof, 28,314 article, 25,620 work. Estimated LCP savings 150–300ms. | Genuine shared-delivery optimization candidate, not proof those rules are globally dead. Source `BaseLayout.astro` imports global, shell and route-rhythm CSS on every route. Preserve required rules and first establish which route-specific rules can move without changing cascade/order. |
| Six network-tree errors | Longest observed chains 13/12/30/23/21/12ms; every report estimates zero LCP savings. Chains contain document → stylesheet and navigation module → shared FLIP helper. Preloaded fonts are no longer descendants. | Binary structural audit limitation as a severity signal; not evidence of a measured slow chain. Installed trace engine sets failure for path length ≥2 without a duration threshold; adapter maps failure to score zero. Do not remove shared behavior, inline all CSS, or preload everything solely to turn this score green. The preset remains failed, not waived. |
| Two image-delivery errors | Same 71,610-byte 640px WebP on About/Blog; estimated savings 20,449/20,410 bytes. About estimates 150ms LCP saving, Blog zero. | Real compression opportunity with an unproven quality trade-off. Existing portrait source and prior accepted visuals are retained. No documented current encoder/quality recipe exists; do not invent a destructive recompression or substitute an unrelated portrait. A separately evaluated derivative would need source provenance, dimensions and independent visual comparison before replacement. |

The current repository contract is `lighthouserc.json`: recommended preset plus
explicit performance/accessibility/best-practices/SEO category thresholds. Passing
the category thresholds does not override failed preset assertions. The configured
launch flag `--no-sandbox` conflicts with the active browser policy; only the
approved existing-CDP artifact route was used. This configuration was not changed.

## Narrowest justified next action

### September 8 route inventory

Scratch split executed: `node .playwright-tmp/probe-about-css-split.mjs` -> pass.
Source SHA-256 `40369d9836fc0b191c3998ba64f7b6890493707da47be7c26be3ccd66763372f`.
The conservative prototype excludes mixed lists and functional selectors. It
identifies 209 rules in 38 interleaved runs; removal preserves every remaining
rule's exact text, order and at-rule ancestry (asserted). Source gzip changes
40,524 → 36,853 bytes, a 3,671-byte reduction. The report is retained at
`.playwright-tmp/about-css-split-report.json`.

Decision: do not promote a single appended About stylesheet. It cannot reproduce
those 38 insertion positions, and this prototype has not proven computed cascade
equivalence. Nor does source gzip establish built-bundle/Lighthouse savings.
Generating separate full/reduced global bundles would introduce a new build
mechanism; that is not justified merely to harvest this preliminary estimate.
The original accepted CSS remains intact. This closes the proposed simple split
experiment with a negative implementation decision, not a performance-gate pass.

PostCSS inspection of current `global.css` found the following candidate groups
where every selector arm contains the named class prefix. These are an inventory
filter, not a safe extraction algorithm or a proof of exclusive ownership:

| Prefix | Rules | Source bytes | Standalone gzip bytes |
| --- | ---: | ---: | ---: |
| `about-` | 293 | 44,857 | 6,491 |
| `contact-` | 21 | 3,436 | 1,041 |
| `article-` | 68 | 9,771 | 2,333 |
| `case-` | 111 | 14,395 | 2,964 |
| `proof-` | 25 | 4,043 | 1,344 |

Standalone gzip totals are not additive and do not predict bundled transfer
savings. A parse5 traversal of all 13 retained production HTML documents found
`about-` classes only in `now/index.html` (32 distinct classes). The route already
imports `src/styles/about.css`, so an existing ownership surface is available.

However, About rules are interleaved with shared selector lists at lines 2059,
2365, 3046, 3205, 6457, 6873 and later accessibility overrides. For example,
`.about-copy p` shares declarations with article and case-study copy; moving only
the 293 filtered rules to the end could change the cascade on About. Therefore
no extraction or deletion was made from this inventory. The next proving step
is an order-preserving split prototype in scratch: retain shared rules in place,
preserve at-rule ancestry, then compare ordered applicable declarations on About
and compressed output on a non-About route before touching production source.

The first prefix-counter command had an overescaped pattern and reported zero;
it was rejected as invalid evidence and corrected. The table is from the corrected
PostCSS inventory. Existing accepted production files remain unchanged.

Read-only inventory of route-specific blocks in `src/styles/global.css` and their
actual selectors/consumers across all 13 generated routes. Start with one fully
route-scoped block whose owner and cascade position are unambiguous. Measure its
compressed contribution before proposing extraction into that route's stylesheet.
Do not derive deletions from a single page's Lighthouse coverage.

If extraction is justified, its proof must preserve selector/declaration order
for the affected route, exclude it from unrelated route output, pass source and
focused rendered contracts, and compare a new immutable artifact to the retained
one. Only then run a paired affected-route audit; preserve the accepted artifact
until evidence supports replacement. No implementation is justified yet by this
inventory-free diagnosis alone.

## Independent manual blockers

- Native 200% browser zoom: native app-control route timed out; viewport resizing
  and CDP scale emulation are not equivalent proof. C03/C06/D02 remain partial.
- Assistive technology: no working screen-reader operation route has been
  established. Axe/keyboard passes do not substitute for it.
- Public-safe CV: source selection is resolved, but reviewed public wording and
  privacy approval have not been supplied. Do not publish the original.

Bounded typography screenshot review is complete; no typography recapture or
exhaustive-device requirement is introduced here. LinkedIn content availability
and no-JS interaction/bfcache limits remain separately recorded in the board.

Validation: existing raw reports parsed successfully; installed
`NetworkDependencyTree.js` and `insight-audit.js` inspected for the scoring path.
`git diff --check` -> pass. The performance skill guided evidence-selected work
and preservation of accepted behavior; this record does not certify a passing
performance preset.

## September 13 portrait derivative

The original 640×640 WebP was regenerated from the tracked
`src/brand/source/jamie-profile.png` with
`cwebp -quiet -q 76 -m 6 -resize 640 640`. The output is 40,742 bytes with
SHA-256 `48abdba4e14a4346fe12e1050cf5c4115659942d22f948eb9dff976e604129eb`,
down from 71,610 bytes (30,868 bytes / 43.1%). Independent native-resolution
inspection accepted face and beard detail, glasses, hat lettering, gradients,
and background artifacts with no actionable degradation.

`npm run validate:source` passes with 13 generated routes and zero Astro errors.
`npm run validate:render-flow:artifact` remains blocked because the managed
runtime has no installed Playwright Chromium; repository policy forbids
installing or substituting a browser for this lane. The prior two image-delivery
assertions therefore remain open until a paired audit on the new artifact proves
their disposition. No claim is made that the complete recommended preset passes.
