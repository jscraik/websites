# Portfolio refinement delivery

## Scope and dirty-file triage

This consolidates the user-approved portfolio refinements for PR 47. The release
mode is Portfolio: coherent presentation, readable content and inspectable work.
Merge, production publication, branch deletion and worktree deletion are outside
this delivery request.

| Paths | Disposition | Reason |
| --- | --- | --- |
| `src/components/`, `src/layouts/`, `src/pages/`, `src/styles/` | Include changed files | Approved navigation, footer, featured cards, About, Blog and case-study presentation |
| `src/content/work/` | Include changed entries | Project labels and demo-first links |
| `src/scripts/carousel-controls*` | Include | Preserve keyboard focus when a carousel endpoint disables a control |
| `public/brand/`, `public/personal/` | Include supplied derivatives | JSC identity and approved personal photographs; originals remain unchanged |
| `public/editorial/`, `public/favicon.svg` | Include changed assets | Project-specific illustrations, article cover and simple tab icon |
| `scripts/`, `tests/` | Include changed contracts and snapshots | Reflect static navigation, current portrait source and approved page composition |
| `docs/agents/00-architecture-bootstrap.md` | Include | Record static navigation architecture |
| `.playwright-tmp/`, browser profiles and generated reports | Exclude | Local execution evidence, not site source |

The existing secondary release worktree is retained without branch movement or
cleanup. No dependencies, lockfile or product-demo styling changes are intended.

## Behaviour and content

- Navigation uses native links with a static background and consistent destinations.
- Featured project cards use natural content heights, dark captions and readable
  headings. SkillsBar's preview remains inside its media container on phones.
- About orders introduction, Fun facts, Skills, Work history and On the web.
  EVOLVE is live display text with the supplied career narrative, followed by
  detailed project, study and availability information.
- Blog uses a heading and drafts at left, latest article at right, followed by
  published articles and a compact author portrait.
- Long-form copy uses 20px on wider screens and 18px on phones. Personal image
  panels share rounded geometry; case-study artwork has no pale outer rim.
- Public personal images are optimised derivatives. The flower export was made
  from a decoded Quick Look preview of the supplied HEIC, not its full-resolution
  original. The article cover is a conceptual illustration, not a product capture.

## Review and proof boundaries

An independent `codex review --uncommitted` completed on 20 October 2026 with:
"No actionable regressions were identified in the staged, unstaged, or untracked
changes." It verified source validation, Astro diagnostics, build and generated
route checks. Its browser lane was blocked by its Playwright server startup;
the coordinator owns the separate disposable-Chrome rendered checks.

Current local validation and any remaining failure are recorded in the PR body.
The first concurrent render-flow attempt observed transient blank routes during
another build; its subsequent sequential run passed. Earlier visual mismatches
were replaced only for inspected, intentionally changed surfaces. Stored Jose
references inform structure; this change makes no exact visual-parity claim.

Hosted checks and reviews on the prior head do not qualify the new candidate.
CodeRabbit's prior response reported a review-capacity limit, while the prior
Codex summary reported no findings. Neither establishes current-head clearance.
Production, physical-device and screen-reader acceptance remain untested.

## Consolidated validation

- `npm run validate:source`: pass.
- `npm run codestyle:validate`: pass; zero Astro errors or warnings.
- `CHROME_CDP_URL=http://127.0.0.1:9223 PLAYWRIGHT_BASE_URL=http://127.0.0.1:4336 npm run validate:rendered`: pass;
  14 routes at four viewports, 101 accessibility tests and one intentional skip,
  and 26 visual comparisons.
- `npm exec -- vitest run src/scripts/carousel-controls.test.ts`: pass;
  10 tests across the three selected Vitest files.
- The focus-ring test passed three desktop and three mobile repetitions after
  waiting for the carousel's asynchronous disable/focus transition. The test
  still requires an enabled control to be active and have a visible outline.
- `CHROME_CDP_URL=http://127.0.0.1:9223 PLAYWRIGHT_BASE_URL=http://127.0.0.1:4336 npm run test:e2e`: blocked for tests that import
  Playwright directly instead of the existing CDP fixture: the managed Chromium
  headless-shell executable is absent. The directly imported tests cannot use
  the approved external browser;
  no browser installation, sandbox bypass or fixture-wide refactor was made.
- `CHROME_CDP_URL=http://127.0.0.1:9223 PLAYWRIGHT_BASE_URL=http://127.0.0.1:4336 npm exec -- playwright test tests/e2e/interface-contracts.spec.ts tests/e2e/motion-resync-contract.spec.ts`: pass;
  15 tests and one intentional mobile pointer skip. The legacy full-height
  artwork expectation now verifies the approved separate artwork and caption
  rows, their shared width and their exact non-overlapping combined height.
- `git diff --check`: pass.
