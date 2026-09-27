/** Initialize each work carousel from its own controls and nearest card row. */
export function initCarouselControls(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-work-carousel]").forEach((controls) => {
    if (controls.dataset.carouselReady === "true") return;

    const section = controls.closest(".work-carousel");
    const workRow = section?.querySelector<HTMLElement>("[data-work-row]");
    const previousButton = controls.querySelector<HTMLButtonElement>("[data-work-prev]");
    const nextButton = controls.querySelector<HTMLButtonElement>("[data-work-next]");
    const progress = controls.querySelector<HTMLElement>("[data-work-progress]");
    if (!workRow || !previousButton || !nextButton || !progress) return;

    controls.dataset.carouselReady = "true";

    const updateControls = () => {
      const maxScroll = workRow.scrollWidth - workRow.clientWidth;
      if (maxScroll <= 24) {
        controls.hidden = true;
        return;
      }

      controls.hidden = false;
      const ratio = workRow.scrollLeft / maxScroll;
      progress.style.transform = `scaleX(${Math.max(0.18, Math.min(1, ratio || 0.18))})`;
      previousButton.disabled = workRow.scrollLeft <= 4;
      previousButton.setAttribute("aria-disabled", String(previousButton.disabled));
      nextButton.disabled = workRow.scrollLeft >= maxScroll - 4;
      nextButton.setAttribute("aria-disabled", String(nextButton.disabled));
    };

    const scrollCards = (direction: number, keyboardActivated: boolean) => {
      workRow.scrollBy({
        left: direction * Math.max(288, workRow.clientWidth * 0.72),
        behavior: keyboardActivated || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    };

    previousButton.addEventListener("click", (event) => {
      if (!previousButton.disabled) scrollCards(-1, event.detail === 0);
    });
    nextButton.addEventListener("click", (event) => {
      if (!nextButton.disabled) scrollCards(1, event.detail === 0);
    });
    workRow.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    window.addEventListener("load", updateControls);
    updateControls();
  });
}
