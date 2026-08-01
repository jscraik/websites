# Tooling policy

## Package and runtime authority

`package.json` and `package-lock.json` are the source of truth for the
portfolio package. Run repository commands with npm from the repository root;
do not substitute a parent pnpm or harness command contract.

`.mise.toml` defines the managed runtime selection. A trust or cache failure is
an environment result: record it separately from source validation and do not
silently replace the configured runtime.

## Harness fallback

The repository may use the public `@brainwav/coding-harness` package through
`scripts/harness-cli.sh`. The registry fallback is opt-in with
`HARNESS_CLI_ALLOW_NPM_EXEC=1` so normal checks do not unexpectedly download
tooling. Public package resolution must not require an npm authentication
precheck; private registry failures remain explicit command failures.

This portfolio does not define a credential-bearing Codex or 1Password
consumer. If a future workflow needs one, use only the centrally reviewed
exact auth-backed wrapper and its value-blind canary; do not prefix Codex
commands with `CODEX_AUTH_ENVIRONMENT_ID`, pass an ad hoc `--environment`, or
add a broad auth exception. MCP names-only discovery and browser-extension
connectivity are separate evidence lanes from CLI subprocess injection. After
central runtime or rule projections change, restart Desktop and create a fresh
task before relying on the new policy.

## Validation routing

Use the narrowest npm script that proves the change, then widen by risk:

- `npm run validate:operator-contract` for task-entry, worktree, receipt, and
  operator workflow changes.
- `npm run validate:fast` for ordinary source, content, and policy changes.
- `npm run check` for Astro type and integration diagnostics.
- `npm run validate:source` or rendered validation only when affected output
  or browser behavior requires that proof.

## Browser/CDP boundary

Keep source, build, static, and HTML checks inside the managed runtime. When
Chromium reports `bootstrap_check_in` or `Permission denied (1100)`, use the
approved external route documented in
`docs/implementation-notes/jose-parity-guardrail.md`: start a dedicated
disposable Chrome profile on `127.0.0.1:9223`, keep the candidate app on its
HTTP port (normally `127.0.0.1:4323`), and bind
`CHROME_CDP_URL=http://127.0.0.1:9223` to the exact candidate URL before
running `npm run test:jose-parity:cdp`. The app port is not a CDP endpoint.
Never add `--no-sandbox`, reinstall Playwright, widen filesystem roots, host-
execute a dirty checkout, enumerate browser tabs, or reuse an authenticated
profile for a private claim without separate approval. The CDP script closes
its connected Playwright object so the command terminates; it does not make
the in-app browser or an MCP/browser-extension connection equivalent to CLI
authentication or provider credentials.

The built-output render-flow gate supports the same approved endpoint when the
managed Chromium launch is blocked. After building the exact candidate
artifact, run `CHROME_CDP_URL=http://127.0.0.1:9223 node scripts/validate-render-flow.mjs`.
That proves route flow, shell landmarks, overflow, target sizes, and image
dimensions for the served artifact; it does not prove Jose visual parity or
hosted deployment.

The pre-push hook is deliberately limited to the portfolio contract: operator
validation, Git worktree authority, `validate:fast`, `check`, and `build`.
It must not demand the copied full-Harness tooling inventory, a private
environment template, or generic scanners that this npm/Astro project does
not configure. PR readiness remains a separate fail-closed receipt before PR
creation and before merge, where remote ancestry, current-head review state,
review threads, required checks, declared scope, and dirty paths are checked.

Generated receipts, build output, npm caches, and temporary fixtures remain
runtime state unless a repository contract explicitly promotes them to source.

The tracked `.codex/environments/environment.toml` is the project-local
environment projection used by the operator gates. Keep it aligned with the
central Codex environment contract, and treat `.codex/skills/` entries pinned to
external commits as reviewed source rather than generated runtime output.

The projection's setup action runs `npm ci`, installs the pinned `cargo:prek`
tool through mise when available, and then runs `node scripts/setup-git-hooks.js`.
It does not attach, switch, fetch, merge, or fast-forward the requested Git
revision. Its test actions use `npm run test:smoke`, its run actions use `npm run
dev`, and its Codex actions may only advertise helpers that exist under this
repository's `scripts/` directory.
