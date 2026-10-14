/** Bind copy feedback to its own stack, including when several stacks share a page. */
export function initPullquoteStacks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".pullquote-stack").forEach((stack) => {
    if (stack.dataset.copyReady === "true") return;

    const status = stack.querySelector<HTMLElement>("[data-copy-status]");
    const buttons = stack.querySelectorAll<HTMLButtonElement>("[data-copy-pullquote]");
    if (!status || buttons.length === 0) return;

    stack.dataset.copyReady = "true";
    let resetTimer: number | undefined;
    let activeLabel: HTMLElement | null = null;

    const clearFeedback = () => {
      window.clearTimeout(resetTimer);
      resetTimer = undefined;
      if (activeLabel) activeLabel.textContent = "Copy";
      activeLabel = null;
      status.textContent = "";
    };

    const setFeedback = (labelText: HTMLElement | null, buttonText: string, statusText: string) => {
      clearFeedback();
      activeLabel = labelText;
      if (activeLabel) activeLabel.textContent = buttonText;
      status.textContent = statusText;
      resetTimer = window.setTimeout(clearFeedback, 2400);
    };

    buttons.forEach((button) => {
      const label = button.dataset.copyLabel ?? "pullquote and article link";
      const labelText = button.querySelector<HTMLElement>("span");

      button.addEventListener("click", async () => {
        const quote = button.closest(".pullquote-wrap")?.querySelector("[data-pullquote]")?.textContent?.trim();
        if (!quote) return;

        try {
          if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
          await navigator.clipboard.writeText(`${quote}\n\n${window.location.href}`);
          setFeedback(labelText, "Copied", `Copied ${label}.`);
        } catch {
          setFeedback(labelText, "Copy unavailable", "Copy unavailable. Select the pullquote and article URL manually.");
        }
      });
    });

    window.addEventListener("pagehide", clearFeedback, { once: true });
  });
}
