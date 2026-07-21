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

package_script_exists() {
	local script_name="$1"
	bash ./scripts/run-package-command.sh node -e 'const fs = require("node:fs"); const script = process.argv[1]; const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")); process.exit(pkg.scripts && Object.prototype.hasOwnProperty.call(pkg.scripts, script) ? 0 : 1);' "$script_name"
}

run_optional_package_script() {
	local script_name="$1"
	shift
	if package_script_exists "$script_name"; then
		"$@"
	else
		echo "Skipping optional package script ${script_name}; package.json does not define it."
	fi
}

bash ./scripts/check-hook-critical-config-sync.sh
make codestyle-parity
unset_git_context_env
bash ./scripts/validate-codestyle.sh --fast
run_optional_package_script "secrets:staged" bash ./scripts/run-package-command.sh npm run secrets:staged
run_optional_package_script "docs:style:changed" bash ./scripts/run-package-command.sh npm run docs:style:changed
make related-tests-staged
