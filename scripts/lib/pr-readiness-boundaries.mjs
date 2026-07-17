import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SCOPE_SCHEMA = "portfolio-pr-scope/v1";

export function readChangedFiles(result, options, pr, run, git, gh) {
  const execution = pr
    ? run(gh, ["pr", "diff", String(pr.number), "--repo", result.repo, "--name-only"])
    : run(git, ["diff", "--name-only", `${options.base}...${options.head}`, "--"]);
  if (!execution.ok) {
    result.blockers.push({
      code: "changed_files_unavailable",
      message: "Changed-file scope could not be read",
      evidence: { output: execution.output },
    });
    return [];
  }
  const files = execution.stdout.split(/\r?\n/).map((file) => file.trim()).filter(Boolean);
  result.scope = { ...(result.scope || {}), changed_files: files };
  return files;
}

export function globMatches(file, pattern) {
  if (pattern.endsWith("/")) return file.startsWith(pattern);
  if (!pattern.includes("*") && !pattern.includes("?")) return file === pattern || file.startsWith(`${pattern}/`);
  let expression = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === "*" && pattern[index + 1] === "*") {
      if (pattern[index + 2] === "/") {
        expression += "(?:.*/)?";
        index += 2;
      } else {
        expression += ".*";
        index += 1;
      }
    } else if (character === "*") expression += "[^/]*";
    else if (character === "?") expression += "[^/]";
    else expression += character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`${expression}$`).test(file);
}

export function loadScope(result, options, addBlocker) {
  const scope = {
    allowed_paths: [...options.allowPath],
    excluded_paths: [],
    dirty_allowed_paths: [...options.allowDirty],
    max_files: null,
    manifest: options.scopeFile || null,
  };
  if (options.scopeFile) {
    try {
      const payload = JSON.parse(readFileSync(resolve(options.scopeFile), "utf8"));
      if (payload.schema_version !== SCOPE_SCHEMA) addBlocker(result, "scope_schema_invalid", "Scope manifest has the wrong schema_version");
      if (!Array.isArray(payload.allowed_paths)) addBlocker(result, "scope_allowed_paths_missing", "Scope manifest must define allowed_paths");
      else scope.allowed_paths.push(...payload.allowed_paths);
      if (Array.isArray(payload.excluded_paths)) scope.excluded_paths.push(...payload.excluded_paths);
      if (Array.isArray(payload.dirty_allowed_paths)) scope.dirty_allowed_paths.push(...payload.dirty_allowed_paths);
      if (payload.max_files !== undefined) scope.max_files = payload.max_files;
    } catch (error) {
      addBlocker(result, "scope_manifest_unreadable", `Scope manifest could not be read: ${error.message}`, { path: options.scopeFile });
    }
  }
  if (scope.allowed_paths.length === 0) addBlocker(result, "scope_manifest_missing", "Strict readiness requires an explicit changed-path scope manifest or --allow-path pattern");
  return scope;
}

export function checkScope(result, scope, changedFiles, addBlocker) {
  const excluded = changedFiles.filter((file) => scope.excluded_paths.some((pattern) => globMatches(file, pattern)));
  const unexpected = changedFiles.filter(
    (file) => !excluded.includes(file) && !scope.allowed_paths.some((pattern) => globMatches(file, pattern)),
  );
  result.scope = {
    ...(result.scope || {}),
    manifest: scope.manifest,
    allowed_paths: scope.allowed_paths,
    excluded_paths: scope.excluded_paths,
    unexpected,
    excluded,
    max_files: scope.max_files,
  };
  if (scope.max_files !== null && changedFiles.length > scope.max_files) {
    addBlocker(result, "scope_file_limit_exceeded", `Changed-file count ${changedFiles.length} exceeds max_files ${scope.max_files}`, {
      changed_files: changedFiles.length,
      max_files: scope.max_files,
    });
  }
  if (excluded.length > 0) addBlocker(result, "excluded_paths_changed", "The PR changes paths explicitly excluded by its scope manifest", { paths: excluded });
  if (unexpected.length > 0) addBlocker(result, "scope_paths_unexpected", "The PR changes paths outside its declared scope", { paths: unexpected });
}

function dirtyFiles(result, run, git, addBlocker) {
  const execution = run(git, ["status", "--porcelain=v1", "-z"]);
  if (!execution.ok) {
    addBlocker(result, "dirty_state_unavailable", "Working-tree status could not be read", { output: execution.output });
    return [];
  }
  const entries = execution.stdout.split("\0").filter(Boolean);
  const files = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const status = entry.slice(0, 2);
    files.push(entry.slice(3).split(" -> ").pop());
    if (status.includes("R") || status.includes("C")) {
      const renamedPath = entries[index + 1];
      if (renamedPath) {
        files.push(renamedPath);
        index += 1;
      }
    }
  }
  return files;
}

export function checkDirty(result, scope, run, git, addBlocker) {
  const files = dirtyFiles(result, run, git, addBlocker);
  const unexpected = files.filter((file) => !scope.dirty_allowed_paths.some((pattern) => globMatches(file, pattern)));
  result.dirty_worktree = { files, allowed_paths: scope.dirty_allowed_paths, unexpected };
  if (unexpected.length > 0) addBlocker(result, "dirty_worktree_boundary", "The working tree contains unapproved dirty paths", { paths: unexpected });
}

export function checkAncestry(result, pr, options, defaultBranch, run, git, addBlocker) {
  const base = pr?.baseRefOid || options.base;
  const head = pr?.headRefOid || options.head;
  const localBaseBranch = options.base.startsWith(`${options.remote}/`) ? options.base.slice(options.remote.length + 1) : null;
  const remoteBranch = pr?.baseRefName || localBaseBranch || defaultBranch;
  const remoteExecution = run(git, ["ls-remote", options.remote, `refs/heads/${remoteBranch}`]);
  const line = remoteExecution.stdout.trim().split(/\r?\n/).find(Boolean);
  const remoteSha = line?.split(/\s+/)[0];
  if (!remoteExecution.ok || !/^[0-9a-f]{40}$/.test(remoteSha || "")) {
    addBlocker(result, "remote_ancestry_unavailable", `Remote branch ${options.remote}/${remoteBranch} could not be verified`, {
      command: `${git} ls-remote ${options.remote} refs/heads/${remoteBranch}`,
      output: remoteExecution.output,
    });
  }
  result.ancestry = {
    base,
    head,
    mode: pr ? "hosted" : "local",
    remote: { name: options.remote, branch: remoteBranch, sha: remoteSha || null },
  };
  if (!pr) {
    const baseCheck = run(git, ["rev-parse", "--verify", `${base}^{commit}`]);
    if (!baseCheck.ok) {
      addBlocker(result, "base_ref_missing", `Local base ${base} is unavailable`, { command: `${git} rev-parse --verify ${base}^{commit}` });
      return;
    }
    const localBaseSha = baseCheck.stdout.trim();
    if (remoteSha && localBaseSha !== remoteSha) {
      addBlocker(result, "remote_base_stale", `Local base ${base} is not the current ${options.remote}/${remoteBranch}`, {
        local_base: localBaseSha,
        remote_base: remoteSha,
        remote: options.remote,
        branch: remoteBranch,
      });
    }
  } else if (remoteSha && remoteSha !== pr.baseRefOid) {
    addBlocker(result, "remote_base_stale", `PR base ${pr.baseRefOid} is not the current ${options.remote}/${remoteBranch}`, {
      pr_base: pr.baseRefOid,
      remote_base: remoteSha,
      remote: options.remote,
      branch: remoteBranch,
    });
  }
  for (const [label, sha] of [["base", base], ["head", head]]) {
    const objectCheck = run(git, ["cat-file", "-e", `${sha}^{commit}`]);
    if (!objectCheck.ok) addBlocker(result, `${label}_commit_missing`, `The ${label} commit is not available locally`, { sha });
  }
  const ancestor = run(git, ["merge-base", "--is-ancestor", base, head]);
  if (!ancestor.ok) {
    addBlocker(result, "remote_ancestry_invalid", `${base} is not an ancestor of ${head}`, {
      command: `${git} merge-base --is-ancestor ${base} ${head}`,
      exit_code: ancestor.code,
    });
  } else {
    result.ancestry.ancestor = true;
  }
}

export function checkTrackedHead(result, options, run, git, addBlocker) {
  const upstream = run(git, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"]);
  if (!upstream.ok || !upstream.stdout.trim()) {
    result.ancestry.remote_head = { status: "untracked" };
    return;
  }
  const upstreamRef = upstream.stdout.trim();
  const remoteHead = run(git, ["rev-parse", "--verify", `${upstreamRef}^{commit}`]);
  const localHead = run(git, ["rev-parse", "--verify", `${options.head}^{commit}`]);
  result.ancestry.remote_head = {
    status: remoteHead.ok && localHead.ok ? "tracked" : "unavailable",
    upstream: upstreamRef,
    remote_sha: remoteHead.stdout.trim() || null,
    local_sha: localHead.stdout.trim() || null,
  };
  if (!remoteHead.ok || !localHead.ok) {
    addBlocker(result, "remote_head_unavailable", `Tracked branch head ${upstreamRef} could not be compared`, {
      upstream: upstreamRef,
      remote_output: remoteHead.output,
      local_output: localHead.output,
    });
    return;
  }
  const containsRemote = run(git, ["merge-base", "--is-ancestor", remoteHead.stdout.trim(), localHead.stdout.trim()]);
  if (!containsRemote.ok) {
    addBlocker(result, "remote_head_stale", `Local head ${localHead.stdout.trim()} does not contain current ${upstreamRef}`, {
      upstream: upstreamRef,
      remote_sha: remoteHead.stdout.trim(),
      local_sha: localHead.stdout.trim(),
    });
  }
}

function rulesetApplies(ruleset, branch) {
  if (ruleset.enforcement !== "active" || ruleset.target !== "branch") return false;
  const includes = ruleset.conditions?.ref_name?.include || [];
  return includes.some((pattern) => pattern === "~DEFAULT_BRANCH" || pattern === branch || pattern === `refs/heads/${branch}` || pattern === "*");
}

export function requiredChecks(result, repo, branch, run, gh, commandJson, parseJson, addBlocker) {
  const contexts = [];
  const rulesets = commandJson(result, gh, ["api", "--paginate", `repos/${repo}/rulesets`], "repository rulesets");
  if (Array.isArray(rulesets)) {
    for (const summary of rulesets) {
      const detail = commandJson(result, gh, ["api", `repos/${repo}/rulesets/${summary.id}`], `ruleset ${summary.id}`);
      if (!detail || !rulesetApplies(detail, branch)) continue;
      for (const rule of detail.rules || []) {
        if (rule.type !== "required_status_checks") continue;
        for (const check of rule.parameters?.required_status_checks || []) {
          if (check.context && !contexts.includes(check.context)) contexts.push(check.context);
        }
      }
    }
  }
  if (contexts.length > 0) return { contexts, source: "active repository ruleset" };
  const protection = run(gh, ["api", `repos/${repo}/branches/${branch}/protection`]);
  if (protection.ok) {
    const parsed = parseJson(protection.stdout, `branch protection for ${branch}`);
    const branchContexts = parsed.value?.required_status_checks?.contexts || [];
    if (branchContexts.length > 0) return { contexts: branchContexts, source: "branch protection" };
  }
  addBlocker(result, "required_checks_unconfigured", `No required status checks are configured for protected branch ${branch}`);
  return { contexts: [], source: "none found" };
}
