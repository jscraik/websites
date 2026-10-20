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
    const cards = Array.from(workRow.querySelectorAll<HTMLElement>(".work-mini-card"));

    const updateActiveCard = () => {
      const centre = workRow.getBoundingClientRect().left + workRow.clientWidth / 2;
      let active = cards[0];
      let nearest = Infinity;
      for (const card of cards) {
        const bounds = card.getBoundingClientRect();
        const distance = Math.abs(bounds.left + bounds.width / 2 - centre);
        if (distance < nearest) { nearest = distance; active = card; }
      }
      for (const card of cards) card.dataset.active = String(card === active);
    };

    const updateControls = () => {
      if (cards.length) updateActiveCard();
      const maxScroll = workRow.scrollWidth - workRow.clientWidth;
      if (maxScroll <= 24) {
        controls.hidden = true;
        return;
      }

      controls.hidden = false;
      const focusedControl = controls.ownerDocument?.activeElement;
      const ratio = workRow.scrollLeft / maxScroll;
      progress.style.transform = `scaleX(${Math.max(0.18, Math.min(1, ratio || 0.18))})`;
      previousButton.disabled = workRow.scrollLeft <= 4;
      previousButton.setAttribute("aria-disabled", String(previousButton.disabled));
      nextButton.disabled = workRow.scrollLeft >= maxScroll - 4;
      nextButton.setAttribute("aria-disabled", String(nextButton.disabled));
      if (focusedControl === nextButton && nextButton.disabled && !previousButton.disabled) {
        previousButton.focus({ preventScroll: true });
      } else if (focusedControl === previousButton && previousButton.disabled && !nextButton.disabled) {
        nextButton.focus({ preventScroll: true });
      }
    };

    const scrollCards = (direction: number, keyboardActivated: boolean) => {
      const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : Math.max(288, workRow.clientWidth * 0.72);
      workRow.scrollBy({
        left: direction * step,
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
    if (cards.length > 1) {
      workRow.scrollLeft = cards[Math.floor(cards.length / 2)].offsetLeft - cards[0].offsetLeft;
    }
    updateControls();
  });
}
