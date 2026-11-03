import { launchPatchedChrome, MINIMUM_CHROME_VERSION } from "./lib/patched-chrome.mjs";
import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";

const cdpEndpoint = process.env.CHROME_CDP_URL ?? process.env.CDP_ENDPOINT;
const tmpDir = process.env.TMPDIR ?? process.cwd() + "/.playwright-tmp";
const pwCacheDir = process.env.PWTEST_CACHE_DIR ?? ".playwright-cache";

mkdirSync(tmpDir, { recursive: true });
mkdirSync(pwCacheDir, { recursive: true });

if (cdpEndpoint) {
  run("node", ["scripts/jose-parity-cdp.mjs"], {
    ...process.env,
    CHROME_CDP_URL: cdpEndpoint,
    TMPDIR: tmpDir,
    PWTEST_CACHE_DIR: pwCacheDir,
  });
}

const launchCheck = await checkManagedChromiumLaunch();
if (!launchCheck.ok) {
  console.error(renderManagedChromiumBlocker(launchCheck.error));
  process.exit(2);
}

run("playwright", ["test", "tests/screenshots"], {
  ...process.env,
  TMPDIR: tmpDir,
  PWTEST_CACHE_DIR: pwCacheDir,
});

// chromium.launch is restricted to installed sandboxed Chrome by launchPatchedChrome.
async function checkManagedChromiumLaunch() {
  let browser;
  try {
    browser = await launchPatchedChrome(chromium);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/** Explain version rejections before offering launch-environment recovery guidance. */
function renderManagedChromiumBlocker(error) {
  const message = error?.stack ?? String(error);
  if (message.includes("Chrome security check blocked")) {
    return [
      "Jose parity cannot use the installed Chrome because it failed the security version check.",
      "",
      `Update Google Chrome to ${MINIMUM_CHROME_VERSION} or newer, then run this command again.`,
      "",
      "Original browser security error:",
      message,
    ].join("\n");
  }
  const failureClass = message.includes("MachPortRendezvousServer") || message.includes("bootstrap_check_in")
    ? "managed macOS sandbox / Chromium Mach bootstrap blocker"
    : "managed Chromium launch blocker";

  return [
    "Jose parity cannot use the managed Playwright Chromium launch path in this context.",
    "",
    "Failure class: " + failureClass,
    "",
    "The repo can read/write the Playwright cache and temp/profile directories, but Chromium did not reach browser readiness when launched from this managed process.",
    "workspace-net or filesystem grants can help with network, local binding, cache, and profile access, but they cannot grant Chromium the host process entitlement needed for this macOS Mach bootstrap registration.",
    "",
    "Use the approved Portfolio CDP attach lane instead:",
    "  Start the dedicated disposable Chrome profile from normal Terminal:",
    "    profile_dir=\"$(mktemp -d \\\"${TMPDIR:-/tmp}/portfolio-chrome-cdp.XXXXXX\\\")\"",
    "    /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9223 --user-data-dir=\"$profile_dir\" --no-first-run",
    "",
    "  Then run this repo command:",
    "    CHROME_CDP_URL=http://127.0.0.1:9223 REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity",
    "",
    "The explicit CDP script remains available as:",
    "    CHROME_CDP_URL=http://127.0.0.1:9223 REFERENCE_BASE_URL=https://www.joseocando.com CANDIDATE_BASE_URL=<local-url> npm run test:jose-parity:cdp",
    "",
    "Original Playwright launch error:",
    message,
  ].join("\n");
}

function run(command, args, env) {
  const result = spawnSync(command, args, {
    env,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    console.error(result.error.stack ?? result.error);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}
