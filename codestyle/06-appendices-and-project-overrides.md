# Appendices and Project Overrides

## Table of Contents
- [Appendix A — EU AI Act (dates for governance)](#appendix-a--eu-ai-act-dates-for-governance)
- [Appendix B — Waivers (Uniform Model)](#appendix-b--waivers-uniform-model)
- [Project-Specific Style Rules](#project-specific-style-rules)

## Appendix A — EU AI Act (dates for governance)

* Act in force: 1 Aug 2024
* GPAI/foundation-model obligations applicable: 2 Aug 2025
* Most provisions fully applicable: 2 Aug 2026

---

## Appendix B — Waivers (Uniform Model)

Any waiver across ESLint, Vale, Semgrep, Clippy, and CI checks MUST include these fields unless a command contract defines a tool-specific override schema:

* Rule ID or section
* Reason
* Tracking ticket
* Expiry or ADR reference

Expired waivers MUST fail CI.

For diff-budget overrides (runtime-enforced shape):

* `approvedBy`: person approving the override
* `reason`: reason for the override
* `timestamp`: timestamp of approval

Example waiver file:

```yaml
# .codestyle-waiver.yml
waivers:
  - ruleId: "eslint:no-console"
    reason: "CLI tool requires console output for user feedback"
    trackingTicket: "JSC-123"
    expiry: "2026-06-30"

  - ruleId: "vale:Google.FirstPerson"
    reason: "User-facing docs require first-person voice per product guidelines"
    trackingTicket: "JSC-456"
    adrReference: "docs/adr/0042-documentation-voice.md"

diffBudgetOverrides:
  - approvedBy: "tech-lead@example.com"
    reason: "Emergency hotfix for production incident INC-789"
    timestamp: "2026-04-19T10:30:00Z"
```

---

<!-- PROJECT-SPECIFIC: START -->

## Project-Specific Style Rules

> Add project-specific linting, formatting, or architectural rules here. This section is NOT overwritten when upgrading the governance pack.

### Astro HTML/CSS Anti-Patterns

Astro work in this repository MUST stay HTML-first, scoped-CSS-first, and JavaScript-light. Static display components MUST remain server-rendered unless browser-side interactivity is required and documented.

- Use semantic HTML first. Generic `div` or `span` elements MUST NOT replace `main`, `section`, `article`, `nav`, `header`, `footer`, `button`, `a`, `ul`, `li`, `figure`, or heading elements when those elements describe the content.
- Use `<a>` for navigation and `<button type="button">` for actions. Clickable `div` or `span` elements, fake button roles, and inline event handlers are forbidden.
- Heading levels MUST describe the document outline. Use CSS, not skipped heading levels, for visual size.
- Every image MUST have intentional alt text. Decorative images use `alt=""` and SHOULD be hidden from assistive technology when appropriate.
- Use Astro scoped component styles by default. Component-level `is:global` styles are forbidden; tokens, resets, base typography, and intentional global utilities belong in shared CSS.
- `client:*` hydration directives are forbidden in static Astro surfaces. If browser interactivity is genuinely required, split that behavior into a deliberately reviewed interactive component before adding hydration.
- Prefer static Astro components over React, Vue, or Svelte components when no browser interactivity is needed.
- Use design tokens for color, spacing, typography, radius, shadow, motion, and z-index. One-off hard-coded values require a concrete visual reason.
- Use normal document flow, grid, or flex for layout. Absolute positioning is reserved for badges, overlays, decorative marks, and deliberate art direction.
- Avoid large fixed heights for content sections. Prefer intrinsic sizing, `min-block-size`, and padding.
- Keep selectors low-specificity and readable; scoped Astro CSS removes the need for defensive selector chains.
- `!important` is forbidden. Fix the cascade or use a more explicit scoped selector.
- `transition: all` is forbidden. Transition only named properties and respect `prefers-reduced-motion`.
- Start responsive design from the mobile/default layout. Use the repo breakpoint scale rather than one-off pixel breakpoints.
- Do not hide layout bugs with `overflow-x: hidden`; fix the overflowing element.

`npm run validate:astro-anti-patterns` is the deterministic guardrail for the high-confidence subset of these rules. It is intentionally strict so prototype regressions fail until the source is fixed.

### Site Quality Validation Ladder

- `npm run validate:fast` MUST cover ordinary Astro, CSS, design-system, content-source, portfolio-content, page-surface, and prototype-polish edits.
- `npm run validate:source` MUST cover route output, Astro type checks, built HTML semantics, and smoke behavior.
- `npm run validate:rendered` MUST cover viewport flow, JavaScript budget, accessibility, and visual regression behavior.
- `npm run validate:site` is the broad pre-release gate and MUST keep local validation separate from hosted CI, external review, and deployment truth.
- Validators intentionally fail on prototype drift. Agents should fix the source rather than weakening the check.

### Architectural Boundaries

- Portfolio source uses shared tokens in `src/styles/brand-tokens.css` and `src/styles/global.css`, with component/page-level scoped styles for local presentation.
- Styling-system mixing is allowed only when the boundary is explicit: global CSS for tokens, reset, base layout primitives, and site-wide utilities; Astro scoped styles for component-local presentation.

<!-- PROJECT-SPECIFIC: END -->
