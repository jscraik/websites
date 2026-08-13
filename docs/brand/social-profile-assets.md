# Jamie Social Profile Assets

This asset family applies the brAInwav 1.1.0 visual system to Jamie Scott Craik's personal X and LinkedIn profiles. The source contract is `src/brand/social-profile-assets.json`; `npm run generate:social-assets` renders the PNGs and `npm run validate:social-assets` checks their contract and exact dimensions.

The high-resolution portrait at `src/brand/source/jamie-profile.png` is a generator input, not a website download. The site serves the sized WebP derivatives, while the generated social uploads below remain public so they can be inspected and downloaded directly.

## Required Uploads

| Platform | Profile photo                                           | Current approved banner                                                                        |
| -------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| X        | `public/brand/social/jamie-avatar-x-400x400.png`        | `public/brand/social/approved/jamie-x-header-1500x500.png`                                    |
| LinkedIn | `public/brand/social/jamie-avatar-linkedin-400x400.png` | `public/brand/social/approved/jamie-linkedin-background-1584x396.png`                          |

The `approved/` banner pair is the exact Jamie-reviewed 2026-08-12 upload set. It uses the descriptor `AI Workflows · Agent Skills · Evals`, removes the old DevRel and brAInwav labels from the artwork, and keeps the canonical promise `Making AI-assisted developer work inspectable.` `src/brand/approved-live-banners.json` binds each public file to an identical private source byte-for-byte so later generation work cannot be mistaken for the reviewed live-platform artifact.

The avatar and banner remain separate files. X and LinkedIn supply the circular crop and overlap at runtime; the banner must never contain a second portrait. The lower-left of each banner therefore carries no essential promise or endorsement copy. Preview composites under `public/brand/social/previews/` are conservative inspection fixtures, not platform captures or guarantees of one fixed responsive overlap.

## Composition

Both approved banners retain the same 12-column split as the product-cover and case-study system: five warm editorial columns for Jamie's identity and seven dark technical columns for the promise and inspectable network. The headline is `Making AI-assisted developer work inspectable.` Blue carries the technical network and one orange endpoint signals inspection. The artwork carries no product endorsement or competing wordmark.

Do not add OpenAI or Tessl marks, product screenshots, fake platform controls, URLs, QR codes, CTA buttons, the retired JSC mark, military descriptors, or additional slogans. Platform-rendered profile text supplies the fuller personal context.

## Typography Status

The approved Newsreader + Geist + Geist Mono stack is now self-hosted. The generator embeds the matching variable WOFF2 file from `public/brand/fonts/` into its isolated render document and records each source digest in the generation receipt. The OFL licence texts are kept beside those files. Regenerate every PNG after an admitted font or renderer change; do not treat a locally installed font as delivery evidence.

To restore the reviewed upload pair without invoking the renderer, copy the approved source files byte-for-byte and verify them:

    mkdir -p public/brand/social/approved
    cp src/brand/source/approved/jamie-x-header-1500x500.png public/brand/social/approved/jamie-x-header-1500x500.png
    cp src/brand/source/approved/jamie-linkedin-background-1584x396.png public/brand/social/approved/jamie-linkedin-background-1584x396.png
    cmp src/brand/source/approved/jamie-x-header-1500x500.png public/brand/social/approved/jamie-x-header-1500x500.png
    cmp src/brand/source/approved/jamie-linkedin-background-1584x396.png public/brand/social/approved/jamie-linkedin-background-1584x396.png

This restore path is separate from `npm run generate:social-assets`, which owns the regenerable base set and receipt.

## Regeneration

Run:

    npm run generate:social-assets
    npm run validate:social-assets

The generator also emits the regenerable base set, 2x banner masters under `public/brand/social/masters/`, avatar-aware previews under `public/brand/social/previews/`, and `public/brand/social/social-profile-assets.receipt.json`. The receipt binds the manifest, canonical tokens, avatar source, renderer, any admitted font files, and every generated PNG hash. The current approved live-banner pair is a separate taste-reviewed layer: the validator checks its exact dimensions and byte equality between `src/brand/source/approved/` and `public/brand/social/approved/`. A base-set regeneration must not overwrite or silently supersede those approved files.

On success, generation prints `Generated 8 social-profile assets.` and the receipt path, then validation prints `Social-profile asset validation passed (...)`. A generation failure is owned by the portfolio maintainer responsible for the renderer, manifest, and admitted assets; a validation failure is a release-blocking contract or freshness failure and must be repaired before upload. Install or repair Playwright/browser dependencies when the generator cannot launch its renderer. Regenerate stale PNGs and the receipt when the renderer, manifest, tokens, avatar, or admitted fonts changed. Repair source-digest or output-hash failures by restoring the current inputs and rerunning generation; do not hand-edit generated evidence.
