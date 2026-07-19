#!/usr/bin/env bash
set -euo pipefail

# Report untracked paths that a target revision would overwrite without
# changing the checkout, index, stash, or remote state.
usage() {
	cat <<'USAGE'
Usage: scripts/preflight-branch-transition.sh [options]

Detect untracked files in the current checkout that would be overwritten by a
checkout, merge, or fast-forward to a target revision.

Options:
  --target <ref>          Target revision (default: origin/main)
  --format <text|json>    Output format (default: text)
  -h, --help              Show this help text
USAGE
}

target="origin/main"
format="text"

while (( $# > 0 )); do
	case "$1" in
		--target)
			[[ -n "${2:-}" && "${2:-}" != -* ]] || { echo "[branch-transition] --target requires a ref" >&2; exit 2; }
			target="$2"
			shift 2
			;;
		--format)
			[[ "${2:-}" == "text" || "${2:-}" == "json" ]] || { echo "[branch-transition] --format must be text or json" >&2; exit 2; }
			format="$2"
			shift 2
			;;
		-h|--help)
			usage
			exit 0
			;;
		*)
			echo "[branch-transition] unknown option: $1" >&2
			usage >&2
			exit 2
			;;
	esac
done

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
	echo "[branch-transition] not inside a git worktree" >&2
	exit 2
}

cd "$repo_root"
target_oid="$(git rev-parse --verify --quiet "${target}^{commit}")" || {
	echo "[branch-transition] target is not a commit: $target" >&2
	exit 2
}

target_paths=()
while IFS= read -r -d '' path; do
	target_paths+=("$path")
done < <(git ls-tree -r -z --name-only "$target_oid")

collisions=()
collision_count=0
while IFS= read -r -d '' path; do
	for target_path in "${target_paths[@]}"; do
		if [[ "$path" == "$target_path" ]]; then
			collisions+=("$path")
			collision_count=$((collision_count + 1))
			break
		fi
	done
done < <(git ls-files --others --exclude-standard -z)

status="pass"
exit_code=0
if (( collision_count > 0 )); then
	status="blocked"
	exit_code=1
fi

if [[ "$format" == "json" ]]; then
	if (( collision_count > 0 )); then
		node - "$target" "$target_oid" "$status" "${collisions[@]}" <<'NODE'
const [, , target, targetOid, status, ...paths] = process.argv;
console.log(JSON.stringify({
  schemaVersion: "branch-transition-preflight/v1",
  status,
  target,
  targetOid,
  collisions: paths.map((path) => ({ path, kind: "untracked_overwrite" })),
}));
NODE
	else
		node - "$target" "$target_oid" "$status" <<'NODE'
const [, , target, targetOid, status] = process.argv;
console.log(JSON.stringify({
  schemaVersion: "branch-transition-preflight/v1",
  status,
  target,
  targetOid,
  collisions: [],
}));
NODE
	fi
else
	echo "[branch-transition] target: $target ($target_oid)"
	if [[ "$status" == "pass" ]]; then
		echo "[branch-transition] pass: no untracked overwrite collisions"
	else
		echo "[branch-transition] blocked: target would overwrite untracked paths" >&2
		printf '  %s\n' "${collisions[@]}" >&2
		echo "[branch-transition] preserve these paths; do not delete, stash, or overwrite them without explicit ownership." >&2
	fi
fi

exit "$exit_code"
