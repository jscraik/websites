#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

unset_git_context_env() {
	local git_env_name
	while IFS= read -r git_env_name; do
		[[ -n "$git_env_name" ]] && unset "$git_env_name"
	done < <(compgen -v GIT_)
}

bash ./scripts/check-validation-locks.sh

bash ./scripts/run-harness-gate.sh docs-gate --mode required --json

node ./scripts/validate-operator-contract.mjs
npm run check:git-worktree-authority
npm run validate:fast
npm run check
unset_git_context_env
bash ./scripts/run-package-command.sh npm run build
