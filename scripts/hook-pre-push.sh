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

base_ref="$(git merge-base HEAD '@{upstream}' 2>/dev/null || git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD main 2>/dev/null || true)"
if [[ -z "$base_ref" ]]; then
	echo "Error: unable to resolve a base ref for pre-push changed-file gates." >&2
	echo "Set an upstream branch or ensure origin/main is available before pushing." >&2
	exit 1
fi

bash ./scripts/run-harness-gate.sh docs-gate --mode required --json

tmp_changed_files="$(mktemp)"
trap 'rm -f "$tmp_changed_files"' EXIT
git diff --name-only --diff-filter=ACMRDT "$base_ref"...HEAD -- > "$tmp_changed_files"
bash ./scripts/check-diagram-freshness.sh --changed-files "$tmp_changed_files"

node ./scripts/validate-operator-contract.mjs
npm run check:git-worktree-authority
npm run validate:fast
npm run check
unset_git_context_env
bash ./scripts/run-package-command.sh npm run build
