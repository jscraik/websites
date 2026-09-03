const deck = document.querySelector("#deck");
const sections = [...document.querySelectorAll(".scene")];
const chapterButtons = [...document.querySelectorAll("[data-chapter]")];
const previousButton = document.querySelector("[data-direction='previous']");
const nextButton = document.querySelector("[data-direction='next']");
const openingStage = document.querySelector(".opening-stage");
const calendarViewport = document.querySelector(".calendar-viewport");
const calendarWeeks = document.querySelector(".calendar");
const completeMonth = document.querySelector(".complete-month");
const finalWeekCopy = document.querySelector(".final-copy");
const sectionRail = document.querySelector(".section-rail");
const dialog = document.querySelector(".workflow-dialog");
const closeButton = dialog.querySelector("[data-close-modal]");
const approveButton = document.querySelector(".approve");
const result = document.querySelector(".run-result");
const runLogs = [...document.querySelectorAll("[data-log]")];
const runPhases = [...document.querySelectorAll(".run-phases li")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const chapterMap = [-1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 5, 5];
const modalContent = [
  {
    tag: "Step 01 · The trigger",
    title: "“An email arrives”",
    punch: "Sounds like a clean trigger. It’s a swamp.",
    points: [
      "It arrives from 40+ senders and no two are formatted alike — data in the body, in a PDF, in a screenshot, or buried in a forwarded thread six replies deep.",
      "Half of them are exceptions in disguise: “same as last time,” “ignore the second attachment,” “Sarah already signed off on this one.”",
      "There’s no consistent subject line, so the routing logic — what’s urgent, what’s a duplicate, what to drop — lives entirely in one person’s head.",
    ],
    why: "Before a line of code gets written, someone has to sit next to the person who reads these all day and learn the 30 unwritten rules for what actually counts. That discovery IS the job.",
  },
  {
    tag: "Step 02 · Re-keyed by hand",
    title: "“Copied into a spreadsheet”",
    punch: "Which spreadsheet? There are four.",
    points: [
      "One is the “real” one, two are stale, and one is a personal copy on someone’s desktop that quietly disagrees with the rest.",
      "Columns drift — a field someone added in March silently broke three downstream formulas that nobody owns anymore.",
      "It’s re-keyed by hand, so a typo doesn’t throw an error — it just becomes the new source of truth.",
      "“Data validation” is a shared belief, not a rule the file actually enforces.",
    ],
    why: "The spreadsheet is a database, a workflow engine, and an audit log all wearing a grid costume. You have to reverse-engineer all three before you can safely replace any of them.",
  },
  {
    tag: "Step 03 · Tribal knowledge",
    title: "“Checked in an internal system”",
    punch: "The system that has no API.",
    points: [
      "Login is behind a VPN, the UI hasn’t changed since 2009, and there is no export button.",
      "The field labeled “Status” means five different things depending on who set it and when.",
      "The real check is tribal: “you just have to know that region 4 always needs a second look.”",
      "The one person who understands the edge cases is retiring in eight months.",
    ],
    why: "The knowledge isn’t in the system — it’s in the operator. An FDE’s job is to capture it into something durable before it walks out the door for good.",
  },
  {
    tag: "Step 04 · Waits on a reply",
    title: "“Approved in Slack”",
    punch: "An approval with no paper trail.",
    points: [
      "“Approval” might be a 👍 in a DM, an “lgtm” in a thread, or a verbal yes in a huddle — sometimes all three, sometimes none.",
      "The approver is out half the time, and the escalation rule (“ping Dave if it’s over $50k”) is unwritten and inconsistently followed.",
      "There’s no record of who approved what, when, or on what basis — until an auditor asks, and then it’s a very bad week.",
    ],
    why: "Turning a thumbs-up into an auditable control — who, what, when, on what evidence — is most of what risk and compliance teams actually care about. That’s not a Slack bot; that’s design.",
  },
  {
    tag: "Step 05 · Where automation goes to die",
    title: "“Entered into the ERP”",
    punch: "Forty required fields and a prayer.",
    points: [
      "The ERP demands ~40 fields. The email gave you six. The other 34 come from memory, lookup tables, and “just leave it blank, it usually works.”",
      "The mapping rules are undocumented, and some values need transformation that nobody ever wrote down.",
      "Errors don’t surface now — they show up days later in a reconciliation report someone reads on Fridays. Maybe.",
    ],
    why: "The last step is where “simple automation” quietly falls apart. Getting it right means modeling every rule the ERP silently assumes — the ones no one can even tell you until it breaks.",
  },
];

let currentSection = 0;
let finalComplete = false;
let activeAnimation = null;
let wheelLocked = false;
let wheelUnlockTimer = null;
let modalInvoker = null;
let deploymentTimers = [];
let deploymentState = "initial";

function setHidden(element, hidden) {
  if (!element) return;
  element.setAttribute("data-state-hidden", hidden ? "true" : "false");
  element.setAttribute("aria-hidden", hidden ? "true" : "false");
  if (element instanceof HTMLButtonElement) {
    element.tabIndex = hidden ? -1 : 0;
  }
}

function setActiveChapter() {
  const activeChapter = chapterMap[currentSection];
  chapterButtons.forEach((button, index) => {
    if (index === activeChapter) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
}

function updateRail() {
  const visible = currentSection >= 10 && currentSection <= 13;
  setHidden(sectionRail, !visible);
  if (!visible) return;
  const key = currentSection <= 11 ? "audit" : currentSection === 12 ? "evals" : "deployment";
  sectionRail.querySelectorAll("[data-rail]").forEach((item) => item.classList.toggle("active", item.dataset.rail === key));
}

function updateCalendar() {
  const visible = currentSection >= 15 && currentSection <= 19;
  setHidden(calendarViewport, !visible);
  if (!visible) {
    setHidden(calendarWeeks, true);
    setHidden(completeMonth, true);
    return;
  }
  const state = currentSection === 15 ? "intro" : finalComplete ? "complete" : `week-${currentSection - 15}`;
  document.body.dataset.roadmapState = state;
  setHidden(calendarWeeks, finalComplete);
  setHidden(completeMonth, !finalComplete);
  setHidden(finalWeekCopy, finalComplete);
}

function updatePager() {
  previousButton.disabled = currentSection === 0;
  nextButton.disabled = currentSection === 19 && finalComplete;
}

function clearDeploymentTimers() {
  deploymentTimers.forEach(window.clearTimeout);
  deploymentTimers = [];
}

function resetDeployment() {
  clearDeploymentTimers();
  deploymentState = "initial";
  runLogs.forEach((item) => item.classList.remove("visible"));
  runPhases.forEach((item) => item.classList.remove("active", "complete"));
  setHidden(approveButton, true);
  setHidden(result, true);
}

function showLog(index) {
  runLogs[index]?.classList.add("visible");
}

function setPhase(index) {
  runPhases.forEach((phase, phaseIndex) => {
    phase.classList.toggle("complete", phaseIndex < index);
    phase.classList.toggle("active", phaseIndex === index);
  });
}

function scheduleDeployment(delay, action) {
  deploymentTimers.push(window.setTimeout(action, delay));
}

function showPostedState() {
  clearDeploymentTimers();
  deploymentState = "posted";
  runLogs.forEach((_, index) => showLog(index));
  runPhases.forEach((phase) => phase.classList.add("complete"));
  setHidden(approveButton, true);
  setHidden(result, false);
}

function beginDeployment() {
  resetDeployment();
  if (reduceMotion.matches) {
    showPostedState();
    return;
  }
  scheduleDeployment(1500, () => { deploymentState = "document"; showLog(0); });
  scheduleDeployment(2850, () => { deploymentState = "ingested"; showLog(1); });
  scheduleDeployment(3500, () => { deploymentState = "intake"; setPhase(0); showLog(2); });
  scheduleDeployment(4400, () => { deploymentState = "drafting"; setPhase(1); });
  scheduleDeployment(5100, () => showLog(3));
  scheduleDeployment(5800, () => showLog(4));
  scheduleDeployment(6500, () => {
    deploymentState = "waiting-for-approval";
    setPhase(2);
    showLog(5);
    setHidden(approveButton, false);
  });
}

function approveDeployment() {
  if (deploymentState !== "waiting-for-approval") return;
  clearDeploymentTimers();
  deploymentState = "approved";
  setHidden(approveButton, true);
  showLog(6);
  scheduleDeployment(450, () => {
    deploymentState = "posting";
    setPhase(3);
    showLog(7);
  });
  scheduleDeployment(1300, () => {
    deploymentState = "posted";
    runPhases.forEach((phase) => phase.classList.add("complete"));
    showLog(8);
    setHidden(result, false);
  });
  scheduleDeployment(2900, () => {
    if (currentSection === 8) goTo(9);
  });
}

function updateActive(index) {
  const previous = currentSection;
  currentSection = Math.max(0, Math.min(sections.length - 1, index));
  document.body.dataset.section = String(currentSection);
  document.body.classList.toggle("is-dark", sections[currentSection].dataset.dark === "true");
  sections.forEach((section, sectionIndex) => section.classList.toggle("is-active", sectionIndex === currentSection));
  setHidden(openingStage, currentSection < 1 || currentSection > 3);
  setActiveChapter();
  updateRail();
  updateCalendar();
  updatePager();

  if (previous === 8 && currentSection !== 8) resetDeployment();
  if (currentSection === 8 && previous !== 8) beginDeployment();
}

function easeInOutQuad(progress) {
  return progress < .5 ? 2 * progress * progress : 1 - ((-2 * progress + 2) ** 2) / 2;
}

function goTo(index, options = {}) {
  const targetIndex = Math.max(0, Math.min(sections.length - 1, index));
  const target = sections[targetIndex].offsetTop;
  updateActive(targetIndex);

  if (activeAnimation) cancelAnimationFrame(activeAnimation.frame);
  activeAnimation = null;

  if (options.immediate || window.innerWidth <= 960 || reduceMotion.matches) {
    deck.scrollTo({ top: target, behavior: options.immediate ? "instant" : "smooth" });
    return;
  }

  const start = deck.scrollTop;
  const startedAt = performance.now();
  const animation = { frame: 0 };
  activeAnimation = animation;

  const tick = (now) => {
    if (activeAnimation !== animation) return;
    const progress = Math.min(1, (now - startedAt) / 450);
    deck.scrollTop = start + (target - start) * easeInOutQuad(progress);
    if (progress < 1) animation.frame = requestAnimationFrame(tick);
    else activeAnimation = null;
  };
  animation.frame = requestAnimationFrame(tick);
}

function next() {
  if (currentSection === 19) {
    if (!finalComplete) {
      finalComplete = true;
      updateCalendar();
      updatePager();
    }
    return;
  }
  goTo(currentSection + 1);
}

function previous() {
  if (currentSection === 19 && finalComplete) {
    finalComplete = false;
    updateCalendar();
    updatePager();
    return;
  }
  goTo(currentSection - 1);
}

function openModal(step, invoker) {
  const content = modalContent[step];
  if (!content) return;
  modalInvoker = invoker;
  dialog.querySelector(".modal-tag").textContent = content.tag;
  dialog.querySelector("#modal-title").textContent = content.title;
  dialog.querySelector(".modal-punch").textContent = content.punch;
  dialog.querySelector(".modal-points").replaceChildren(...content.points.map((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    return item;
  }));
  dialog.querySelector(".modal-why").textContent = content.why;
  setHidden(dialog, false);
  dialog.showModal();
  closeButton.focus();
}

function closeModal() {
  if (!dialog.open) return;
  dialog.close();
  setHidden(dialog, true);
  modalInvoker?.focus();
}

chapterButtons.forEach((button) => button.addEventListener("click", () => goTo(Number(button.dataset.chapter))));
previousButton.addEventListener("click", previous);
nextButton.addEventListener("click", next);
approveButton.addEventListener("click", approveDeployment);
closeButton.addEventListener("click", closeModal);

document.querySelectorAll("[data-modal-step]").forEach((button) => {
  button.addEventListener("click", () => openModal(Number(button.dataset.modalStep), button));
});

dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeModal();
});

deck.addEventListener("wheel", (event) => {
  if (window.innerWidth <= 960 || dialog.open || Math.abs(event.deltaY) < 10) return;
  event.preventDefault();
  window.clearTimeout(wheelUnlockTimer);
  wheelUnlockTimer = window.setTimeout(() => { wheelLocked = false; }, 360);
  if (wheelLocked) return;
  wheelLocked = true;
  if (event.deltaY > 0) next();
  else previous();
}, { passive: false });

window.addEventListener("keydown", (event) => {
  if (dialog.open) return;
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
  if (event.code === "Space" && target instanceof HTMLButtonElement) return;

  if (["ArrowDown", "PageDown", "Space"].includes(event.code)) {
    event.preventDefault();
    next();
  } else if (["ArrowUp", "PageUp"].includes(event.code)) {
    event.preventDefault();
    previous();
  } else if (event.code === "Home") {
    event.preventDefault();
    goTo(0);
  } else if (event.code === "End") {
    event.preventDefault();
    goTo(19);
  }
});

const observer = new IntersectionObserver((entries) => {
  const active = entries.find((entry) => entry.intersectionRatio >= .6);
  if (active) updateActive(Number(active.target.dataset.index));
}, { root: deck, threshold: [0, .6] });

sections.forEach((section) => observer.observe(section));
reduceMotion.addEventListener("change", () => {
  if (currentSection === 8) beginDeployment();
});

window.__fieldcraft = {
  getState: () => ({
    activeSection: currentSection,
    deploymentState,
    finalComplete,
    modalOpen: dialog.open,
    visibleStateKeys: [...document.querySelectorAll("[data-state-key][data-state-hidden='false']")].map((element) => element.dataset.stateKey),
  }),
  goTo: (index, options = { immediate: true }) => goTo(index, options),
  next,
  previous,
  openModal: (index) => openModal(index, document.querySelector(`[data-modal-step='${index}']`)),
  closeModal,
  test: {
    resetDeployment,
    showPostedState,
  },
};

updateActive(0);
