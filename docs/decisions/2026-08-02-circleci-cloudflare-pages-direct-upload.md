# CircleCI-controlled Cloudflare Pages Direct Upload

## Status

Accepted — 2026-08-02.

## Context

The portfolio is a static Astro site whose canonical public front door is
`jscraik.com`. CircleCI is the repository's active CI provider, while Cloudflare
Pages is the selected hosting surface. The repository already produces a
static `dist/` artifact, but the CircleCI configuration referenced three npm
scripts that did not exist: `audit`, `audit:strict`, and `test:ci`.

The deployment path must keep pull-request validation separate from production
publication. It must also keep Cloudflare credentials out of Git and bind a
deployment to the exact commit that CircleCI checked out and built.

## Decision

Use **CircleCI-controlled Cloudflare Pages Direct Upload**:

- The `pages-production` workflow runs only for the `main` branch and ignores
  tags.
- Its `publish-pages` job runs `npm ci`, executes `npm run validate:source`,
  checks that `dist/` exists, and uploads that artifact with Wrangler.
- The job uses the restricted CircleCI context
  `cloudflare-pages-production`. That context must provide
  `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and
  `CLOUDFLARE_PAGES_PROJECT`; values are never stored in source or echoed.
- Wrangler is invoked at the repository-pinned version (`4.69.0`) and receives
  `--branch=main` plus the checked-out Git SHA as `--commit-hash` metadata.
- The existing `pr-pipeline` and `security-scan` workflows remain validation
  workflows and do not publish.
- The missing CircleCI command contracts are repaired in `package.json`:
  `test:ci` delegates to the repository's route smoke test, `audit` checks
  runtime dependencies, and `audit:strict` applies a high-severity threshold to
  runtime dependencies. Snyk remains a separate report-only dependency lane.

Before the first production run, the Cloudflare Pages project must exist, have
`main` as its production branch, and be associated with `jscraik.com` through
Cloudflare's Pages custom-domain flow. This decision does not perform that
account, DNS, or hosted-state setup.

## Consequences

- A pull request cannot publish a production Pages deployment accidentally.
- The uploaded artifact is source- and build-bound to the CircleCI checkout.
- A missing or mis-scoped CircleCI context fails the publish job before an
  upload is attempted.
- Content availability remains a build-time publication decision; this route
  does not add runtime feature flags, a CMS, or a second hosting surface.
- Direct Upload is a deliberate Pages project choice. Moving that project to
  Cloudflare Git integration later would require a new Pages project, according
  to Cloudflare's current Direct Upload documentation.

## Operator setup outside Git

Configure the `cloudflare-pages-production` CircleCI context with:

1. `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account containing the Pages
   project.
2. `CLOUDFLARE_API_TOKEN` — a least-privilege token with Cloudflare Pages Edit
   permission for that account.
3. `CLOUDFLARE_PAGES_PROJECT` — the existing Pages project name.

Associate the Pages project with `jscraik.com` in Cloudflare's Pages dashboard.
Do not add these values to `.circleci/config.yml`, `.env` files, or the Git
history.

## Validation

- `npm run test:ci`
- `npm run audit`
- `npm run audit:strict`
- `ASTRO_TELEMETRY_DISABLED=1 npm run validate:source`
- `git diff --check`

These checks prove local command and artifact contracts only. They do not prove
CircleCI context configuration, a successful hosted upload, custom-domain DNS,
or public reachability.

## References

- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare Pages Direct Upload with continuous integration](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
