---
schema_version: 1
purpose: Project-specific agent knowledge base — repo-scoped fixes and gotchas.
scope: This repo only.
update_policy: |
  Append after any bug, tool failure, or extra-effort fix that is specific to this repository.
  Universal fixes belong in ~/.codex/instructions/Learnings.md.
  Do not delete entries; append only.
  Format: **YYYY-MM-DD [Agent]:** `problem → fix`
---

# Learnings

## Table of Contents

- [Scope](#scope)
- [Format](#format)

Repo-specific agent knowledge base. Append-only.

## Scope

This repository only.

## Format

Use `**YYYY-MM-DD [Agent]:** problem -> fix`.

**2026-07-06 [Codex]:** Blog UI fixes regressed into stacked global CSS overrides after screenshot steering -> for route-specific visual parity issues, make the route own its layout in the page/component first, then delete or bypass stale global experiments instead of adding another cascade patch.
