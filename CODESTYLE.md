# CODESTYLE.md

## Purpose

This file is the codestyle front door for the `codex/` subtree.
Use it to locate the right standards module quickly.

Detailed standards are split under [codestyle/README.md](./codestyle/README.md).

## Table of Contents

- [Baselines](#baselines)
- [Toolchain configuration](#toolchain-configuration)
- [Engineering judgement coverage](#engineering-judgement-coverage)
- [Command scope](#command-scope)
- [Codestyle modules](#codestyle-modules)
- [Enforcement model](#enforcement-model)
- [How to use this pack](#how-to-use-this-pack)

## Baselines

- JS/TS toolchain: Node >= 24, pnpm 10, Biome, Node syntax checks, TypeScript where present, and Vitest/Node test runners where configured.
- Docs: markdownlint for broad Markdown linting; Vale only when `.vale.ini` is present.
- Python: Ruff, Pyright, pytest.
- Rust: rustfmt, Clippy, cargo test.
- Shell: Bash and Zsh scripts with explicit invocation contracts.
- Config/data: JSON, YAML, TOML, plist/XML, KDL, `.env` files, lockfiles, and generated manifests.
- Diagrams/assets: Mermaid (`.mmd` and fenced diagrams), static HTML, SVG/PNG/WebP assets, signatures, and checksums.
- Security/policy: Semgrep, policy guards, supply-chain tooling.
- Node baseline: `>=24.0.0`, from the parent [`package.json`](../../package.json). Keep this project contract rather than copying a generic upstream “current” or LTS label; the runtime manager may install a newer compatible release.
- TypeScript baseline: >= 5.9 (when TS is used).
- Rust baseline: 2024 edition (rustc >= 1.85).
- Security advisories override baselines: patch immediately when a baseline dependency has a published fix.

## Toolchain configuration

- [`../../.mise.toml`](../../.mise.toml) is the canonical runtime and managed-CLI pin surface for this repository.
- Parent [`package.json`](../../package.json), its `packageManager` field, and [`../../pnpm-lock.yaml`](../../pnpm-lock.yaml) are the canonical package-manager and dependency-lock surfaces.
- [`../../biome.json`](../../biome.json) is the canonical Biome formatter, assist, and style-lint configuration; use it through `pnpm lint`.
- When managed runtimes or CLIs change, keep the runtime config, package contract, environment checks, and operator instructions aligned. Do not update a prose baseline without reconciling the executable contract.

## Engineering judgement coverage

- Treat language, configuration, architecture, testing, security, observability, CI/CD, accessibility, and AI-agent safety as review vocabulary tied to executable gates.
- Eliminate untrusted or dynamic data at a declared boundary: parsers, schemas, API adapters, DTOs, configuration loaders, CLI argument parsing, storage decoders, migration importers, and test fixtures. Do not use generic shape probes to move unvalidated data further into application logic.
- Treat each language's validation surface as the source of truth for domain
  contracts: identifiers use branded or nominal types, measured values use
  validated unit-bearing value types, and related types are composed rather
  than manually mirrored. Language examples are in
  [codestyle/07-python.md](./codestyle/07-python.md) and
  [codestyle/08-typescript.md](./codestyle/08-typescript.md); Swift's
  validating nominal value type owns that contract as described in
  [codestyle/12-swift.md](./codestyle/12-swift.md).
- When feedback or a defect reveals a transferable principle, search the relevant sibling implementations and tests before closeout. Fix the shared pattern where justified, or record why nearby cases intentionally differ.

## Command scope

- `parent repo root` means the Git root for this repository.
- `codex subtree root` means the `codex/` directory inside the parent repo root.
- Package-manager commands (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm run test:deep`) run from the parent repo root.
- Codex-subtree scripts run from the codex subtree root unless explicitly written with a `codex/` prefix.
- Equivalent path forms are acceptable only when the working directory is explicit in validation evidence:
  - `Command: (cwd=<parent repo root>) bash codex/scripts/verify-work.sh --fast -> pass (...)`
  - `Command: (cwd=<codex subtree root>) bash scripts/verify-work.sh --fast -> pass (...)`

## Codestyle modules

- [codestyle/01-foundations.md](./codestyle/01-foundations.md)
- [codestyle/02-javascript-ui.md](./codestyle/02-javascript-ui.md)
- [codestyle/03-rust-tauri.md](./codestyle/03-rust-tauri.md)
- [codestyle/04-docs-config-and-release.md](./codestyle/04-docs-config-and-release.md)
- [codestyle/05-quality-security-ops.md](./codestyle/05-quality-security-ops.md)
- [codestyle/06-appendices-and-project-overrides.md](./codestyle/06-appendices-and-project-overrides.md)
- [codestyle/07-python.md](./codestyle/07-python.md)
- [codestyle/08-typescript.md](./codestyle/08-typescript.md)
- [codestyle/09-web.md](./codestyle/09-web.md)
- [codestyle/10-shell-bash-zsh.md](./codestyle/10-shell-bash-zsh.md)
- [codestyle/11-package-managers-pnpm-npm.md](./codestyle/11-package-managers-pnpm-npm.md)
- [codestyle/12-swift.md](./codestyle/12-swift.md)
- [codestyle/13-git-workflow.md](./codestyle/13-git-workflow.md)
- [codestyle/14-patterns.md](./codestyle/14-patterns.md)
- [codestyle/15-performance.md](./codestyle/15-performance.md)
- [codestyle/16-security.md](./codestyle/16-security.md)
- [codestyle/17-testing.md](./codestyle/17-testing.md)
- [codestyle/18-code-review.md](./codestyle/18-code-review.md)
- [codestyle/19-development-workflow.md](./codestyle/19-development-workflow.md)
- [codestyle/20-go.md](./codestyle/20-go.md)
- [codestyle/21-artifact-formats.md](./codestyle/21-artifact-formats.md)

## Enforcement model

- Rules in this pack use RFC2119 language (`MUST`, `MUST NOT`, `SHOULD`) and are normative unless an explicit waiver exists.
- Waivers MUST include: rule ID or section, reason, tracking ticket, and expiry or ADR reference.
- Validation evidence MUST use exact command text and explicit outcomes:
  - `Command: <exact command> -> pass|fail|blocked (<reason>)`
- Contract checks for this repository (run from repository root):
  - Commands are expected from the active instruction scope and MUST record `cwd` when scope could be ambiguous.
  - From the parent repo root, use `bash codex/scripts/...` or `./codex/scripts/...` for codex-subtree validators.
  - From the codex subtree root, use `bash scripts/...` for codex-subtree validators.
  - `pnpm lint` (parent repo root)
  - `pnpm typecheck` (parent repo root)
  - `pnpm test` (parent repo root)
  - `bash scripts/verify-work.sh --fast` (codex subtree root) or `bash codex/scripts/verify-work.sh --fast` (parent repo root)
  - Workflow trigger: `$validation-contract-check` (required for changes to `codex/instructions/**`)

## How to use this pack

1. Start at this file.
2. Open only the module that matches the task surface.
3. Keep project-specific override content in `06-appendices-and-project-overrides.md`.
4. When changing standards, update the module first, then confirm this index still matches.
