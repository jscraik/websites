# Jamie Social Profile Assets

This asset family applies the brAInwav 1.1.0 visual system to Jamie Scott Craik's personal X and LinkedIn profiles. The source contract is `src/brand/social-profile-assets.json`; `npm run generate:social-assets` renders the PNGs and `npm run validate:social-assets` checks their contract and exact dimensions.

## Required Uploads

| Platform | Profile photo | Banner |
| --- | --- | --- |
| X | `public/brand/social/jamie-avatar-x-400x400.png` | `public/brand/social/jamie-x-header-1500x500.png` |
| LinkedIn | `public/brand/social/jamie-avatar-linkedin-400x400.png` | `public/brand/social/jamie-linkedin-background-1584x396.png` |

The avatar and banner remain separate files. X and LinkedIn supply the circular crop and overlap at runtime; the banner must never contain a second portrait. The lower-left of each banner therefore carries no essential promise or endorsement copy. Preview composites under `public/brand/social/previews/` are conservative inspection fixtures, not platform captures or guarantees of one fixed responsive overlap.

## Composition

Both banners use the same 12-column split as the product-cover and case-study system: five warm editorial columns for Jamie's identity and seven dark technical columns for the promise and brAInwav signal. The headline is `Making AI-assisted developer work inspectable.` Blue carries the technical neuron/wave; one orange endpoint signals inspection; the brAInwav endorsement stays small.

Do not add OpenAI or Tessl marks, product screenshots, fake platform controls, URLs, QR codes, CTA buttons, the retired JSC mark, military descriptors, or additional slogans. Platform-rendered profile text supplies the fuller personal context.

## Typography Status

The approved stack remains Newsreader + Geist + Geist Mono. The official self-hosted font files have not yet been admitted to this repo, so the current generator uses manifest-locked fallback stacks and deliberately omits the official family names from rendered CSS. A developer's locally installed Newsreader or Geist files therefore cannot silently change the pixels. The generator switches a family to its official face only when the matching `public/brand/fonts/newsreader-variable.woff2`, `public/brand/fonts/geist-variable.woff2`, or `public/brand/fonts/geist-mono-variable.woff2` file is present and embedded. Regenerate every PNG after those official files and their OFL licences are added; do not treat the present fallback rendering as evidence that the font-delivery requirement is satisfied.

## Regeneration

Run:

    npm run generate:social-assets
    npm run validate:social-assets

The generator also emits 2x banner masters under `public/brand/social/masters/`, avatar-aware previews under `public/brand/social/previews/`, and `public/brand/social/social-profile-assets.receipt.json`. The receipt binds the manifest, canonical tokens, avatar source, renderer, any admitted font files, and every generated PNG hash. Copy and palette values are rendered from those bound sources rather than duplicated in the renderer, and the validator reconciles the complete `tokens.social_profile` projection to the owning manifest. Generated dimensions, the 5/7 split, source freshness, output freshness, and source/avatar separation are enforced by the validator; visual taste and live platform cropping still require rendered inspection.

On success, generation prints `Generated 8 social-profile assets.` and the receipt path, then validation prints `Social-profile asset validation passed (...)`. A generation failure is owned by the portfolio maintainer responsible for the renderer, manifest, and admitted assets; a validation failure is a release-blocking contract or freshness failure and must be repaired before upload. Install or repair Playwright/browser dependencies when the generator cannot launch its renderer. Regenerate stale PNGs and the receipt when the renderer, manifest, tokens, avatar, or admitted fonts changed. Repair source-digest or output-hash failures by restoring the current inputs and rerunning generation; do not hand-edit generated evidence.
