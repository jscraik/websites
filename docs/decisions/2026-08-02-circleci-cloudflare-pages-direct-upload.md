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

- The `pr-pipeline` workflow's `publish-pages` job runs only for the `main`
  branch and ignores tags.
- Its `publish-pages` job runs `npm ci`, executes `npm run validate:source`,
  checks that `dist/` exists, and uploads that artifact with Wrangler.
- The job uses the restricted CircleCI context
  `cloudflare-pages-production`. That context must provide
  `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and
  `CLOUDFLARE_PAGES_PROJECT`; values are never stored in source or echoed.
- Wrangler is invoked at the repository-pinned version (`4.69.0`) and receives
  `--branch=main` plus the checked-out Git SHA as `--commit-hash` metadata.
- Before upload, the job plans a `portfolio-production` release for the
  checked-out SHA. After upload, it marks the release running and requires the
  public homepage to return HTTP 200. The `release-portfolio` job then listens
  for the named `website_uptime` failure signal for 15 minutes.
- Automatic rollback remains disabled. A CircleCI release version is a Git SHA;
  Cloudflare's rollback API requires a Pages deployment ID. Do not enable
  automatic rollback until the mapping and rollback path have been verified.
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
- The homepage check establishes that the public URL returned HTTP 200 from
  the CI runner; it does not prove that the response is the newly uploaded
  commit or that every route works.
- CircleCI succeeds when the validation window closes without a matching
  failure. A silent or disconnected monitor is therefore not evidence of a
  healthy release. Verify webhook delivery during an active validation window
  before relying on this signal.
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

Configure the uptime monitor to send a failure webhook to CircleCI with
`component_name` set to `portfolio`, `env` set to `production`,
`signal_name` set to `website_uptime`, and `status` set to `firing`. The
webhook must use the CircleCI validation secret as a bearer token. Keep the
secret in 1Password and the monitor's encrypted secret store, and rotate it
before the expiry shown in CircleCI. Select an alert interval shorter than
the 15-minute validation window, including reminders while an outage persists.
Send a test alert during a controlled active validation window and confirm that
it appears under the matching release check; an HTTP response alone does not
prove the event matched a release.

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
- **A release fails after upload**: The new Pages deployment may still be live.
  Inspect Cloudflare Pages and, if needed, manually roll back to a verified
  earlier production deployment. A failed CircleCI status does not itself
  revert Cloudflare.
- **No monitoring events appear**: Check the secret expiry, webhook delivery,
  component, environment, project and signal names. A release that passes with
  no matching events has not proved the monitoring connection.

## Validation

- `npm run test:ci` — **Expected**: Exit code 0, successful route smoke test.
- `npm run audit` — **Expected**: Exit code 0, no runtime vulnerabilities.
- `npm run audit:strict` — **Expected**: Exit code 0, no high-severity runtime
  vulnerabilities.
- `ASTRO_TELEMETRY_DISABLED=1 npm run validate:source` — **Expected**: Exit code
  0, successful static build with `dist/` artifact present.
- `git diff --check` — **Expected**: Exit code 0, no trailing whitespace or
  conflict markers.
- `npm run test:operator-workflow-contract` — **Expected**: Exit code 0, with
  publication prerequisites, release routing, and simulated failure paths
  passing.
- CircleCI `pr-pipeline` on `main` — **Expected**: required validation jobs
  finish green, then `publish-pages` uploads the exact checked-out SHA using the
  restricted context.

These checks prove local command and artifact contracts only. They do not prove
CircleCI context configuration, a successful hosted upload, custom-domain DNS,
matching webhook delivery during an active release, or a working rollback.

## References

- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare Pages Direct Upload with continuous integration](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
