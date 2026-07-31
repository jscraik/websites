# Stored-reference stability for Jose parity

Status: Accepted

Date: 2026-07-31

## Context

Jose Ocando's portfolio is the structural design influence for Jamie's portfolio. The repository already stores a dated reference bundle, while the public Jose site can change independently. Treating the live site as an automatically updating authority would make unrelated upstream changes redefine Jamie's visual regression contract.

The About parity lane also compared personal content pixels and sampled transparent elements as black. The false-black sample obscured a real canvas-token mismatch and made the intended Jose palette mapping appear unavailable.

## Decision

Adopt Stored-reference stability. The bundle under `docs/reference/jose-ocando/` is the canonical authority for composition, rhythm, hierarchy, density, and responsive behavior until an explicit review approves a refreshed bundle.

Use the current live Jose site as advisory evidence only. Preserve Jamie's copy and imagery as identity decisions while mapping the editorial neutral palette to the stored Jose reference. Resolve sampled colors through painted ancestor layers and enforce the mapped page canvas. Mask Fun Facts identity-content pixels while retaining explicit geometry assertions and the existing pixel budgets.

## Consequences

- A live-site change cannot silently rewrite Jamie's expected design behavior.
- Refreshing the stored bundle is a deliberate, reviewable contract change.
- The portfolio page canvas maps to Jose neutral-03 `#D5D6D0` through the canonical `portfolio_bg` token.
- Fun Facts may use Jamie-specific content without weakening its structural checks.
- A current-live parity run remains useful drift evidence but does not prove or redefine the stored contract.
- Mobile About heading and work-history alignment remain separate implementation decisions.

## Validation

- `npm run test:jose-parity-measurements`
- `npm run validate:jose-claim-boundary`
- `npm run validate:page-surfaces`
- `npm run validate:fast`
