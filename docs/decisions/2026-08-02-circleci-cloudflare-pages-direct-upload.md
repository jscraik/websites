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
- The `pr-pipeline` workflow remains the validation authority. Its
  `publish-pages` job is restricted to `main` and requires the applicable
  source, audit, security, and dependency jobs to finish successfully before
  it can publish. Pull-request-only metadata gates are excluded from the
  `main` path, so a branch push cannot satisfy a production publication by
  accident.
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

**Owners**: The portfolio maintainer owns the repository and CircleCI workflow
contract. The Cloudflare account owner owns the Pages project, account token,
and `jscraik.com` custom-domain/DNS association. A CircleCI project
administrator or designated DevOps operator owns the restricted context and
should make the following setup changes without committing any secret values.

Configure the `cloudflare-pages-production` CircleCI context with:

1. `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account containing the Pages
   project.
2. `CLOUDFLARE_API_TOKEN` — a least-privilege token with Cloudflare Pages Edit
   permission for that account.
3. `CLOUDFLARE_PAGES_PROJECT` — the existing Pages project name.

Associate the Pages project with `jscraik.com` in Cloudflare's Pages dashboard.
Do not add these values to `.circleci/config.yml`, `.env` files, or the Git
history.

After setup, the CircleCI administrator should confirm that the context is
attached to the project and that all three variable names are present. A
missing variable must fail the `publish-pages` job before Wrangler is invoked;
add the missing value to the restricted context and rerun the `main` workflow.
An invalid or over-scoped API token must be revoked, replaced with a
least-privilege Pages Edit token, and rerun—never print the token in a job log.
If the Pages project is absent, create it with Direct Upload and set `main` as
its production branch before retrying. If custom-domain association fails,
correct the Pages custom-domain/DNS record in Cloudflare, then rerun the
hosted publication only after the domain reports active.

**Operator actions when issues occur**:

- **Missing context variables**: Access CircleCI organization settings, navigate
  to the `cloudflare-pages-production` context, and add the missing environment
  variables. Escalate to the Cloudflare account administrator if account ID or
  project name is unknown.
- **Invalid API token**: Regenerate a Cloudflare API token with Cloudflare Pages
  Edit permission, update the `CLOUDFLARE_API_TOKEN` value in the CircleCI
  context, and retry the failed job.
- **Pages project absent**: Create the Cloudflare Pages project using Direct
  Upload mode, set `main` as the production branch, and update the
  `CLOUDFLARE_PAGES_PROJECT` context variable with the project name.
- **Custom-domain setup fails**: In the Cloudflare Pages dashboard, navigate to
  the project's custom domain settings, add `jscraik.com`, and verify the DNS
  CNAME record points to the Pages project. Escalate to the DNS administrator if
  DNS changes are restricted.

## Validation

- `npm run test:ci` — **Expected**: Exit code 0, successful route smoke test.
- `npm run audit` — **Expected**: Exit code 0, no runtime vulnerabilities.
- `npm run audit:strict` — **Expected**: Exit code 0, no high-severity runtime
  vulnerabilities.
- `ASTRO_TELEMETRY_DISABLED=1 npm run validate:source` — **Expected**: Exit code
  0, successful static build with `dist/` artifact present.
- `git diff --check` — **Expected**: Exit code 0, no trailing whitespace or
  conflict markers.
- CircleCI `pr-pipeline` on `main` — **Expected**: required validation jobs
  finish green, then `publish-pages` uploads the exact checked-out SHA using the
  restricted context.

These checks prove local command and artifact contracts only. They do not prove
CircleCI context configuration, a successful hosted upload, custom-domain DNS,
or public reachability.

## References

- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare Pages Direct Upload with continuous integration](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
