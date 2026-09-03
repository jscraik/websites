(() => {
  'use strict';

  const deck = document.querySelector('.deck');
  const scenes = [...document.querySelectorAll('.scene')];
  const chapterButtons = [...document.querySelectorAll('[data-chapter]')];
  const pagerButtons = [...document.querySelectorAll('[data-pager]')];
  const stage = document.querySelector('.stage-layer');
  const rail = document.querySelector('.practice-rail');
  const dialog = document.querySelector('.workflow-modal');
  const approve = document.querySelector('.approve');
  const runPanel = document.querySelector('.run-panel');
  const runResult = document.querySelector('.run-result');
  const closeButton = dialog.querySelector('[data-scene-region="modal-close"]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const chapterMap = [-1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 5, 5];
  const collisionPairs = {
    1: [['copy', 'stage'], ['copy', 'company-row']],
    2: [['statement', 'stage'], ['statement', 'company-row']],
    3: [['statement', 'stage'], ['stage', 'closing']],
    4: [['statement', 'stages'], ['stages', 'closing']],
    5: [['statement', 'commercial-world'], ['statement', 'technical-world'], ['commercial-world', 'fde-node'], ['fde-node', 'technical-world']],
    6: [['copy', 'cards'], ['cards', 'instruction'], ['cards', 'label']],
    7: [['diagram', 'exception'], ['diagram', 'evidence-rail'], ['evidence-rail', 'closing']],
    8: [['statement', 'phase-rail'], ['phase-rail', 'run-panel'], ['run-panel', 'approval']],
    9: [['statement', 'chain'], ['chain', 'closing']],
    10: [['copy', 'context-column'], ['copy', 'findings-column'], ['copy', 'artifact-column'], ['context-column', 'findings-column'], ['findings-column', 'artifact-column'], ['artifact-column', 'bottom-rail']],
    11: [['root', 'branches'], ['branches', 'closing']],
    12: [['evaluation-table', 'report'], ['evaluation-table', 'legend'], ['report', 'bottom-rail']],
    13: [['architecture', 'principles'], ['principles', 'closing']],
    14: [['loop', 'statement'], ['statement', 'prompt']],
    15: [['copy', 'timeline'], ['instruction', 'timeline'], ['timeline', 'project-note'], ['case-study', 'project-note'], ['project-note', 'project-tags']],
    16: [['copy', 'calendar'], ['calendar', 'system-rail'], ['system-rail', 'project-tags']],
    17: [['copy', 'calendar'], ['calendar', 'system-rail'], ['system-rail', 'project-tags']],
    18: [['copy', 'calendar'], ['calendar', 'system-rail'], ['system-rail', 'project-tags']],
    19: [['copy', 'calendar'], ['calendar', 'system-rail'], ['system-rail', 'project-tags']]
  };
  const headingBounds = {
    0: [89.6, 158.8, 1100.8, 395.1], 1: [89.6, 119.6, 619.5, 117.1], 2: [217.6, 105.2, 844.8, 175.7], 3: [301, 185.3, 678, 94.7], 4: [89.6, 220.9, 788.5, 117.1], 5: [208, 118.5, 864, 80.6], 6: [89.6, 98, 1100.8, 117.1], 7: [89.6, 98, 901.1, 175.7], 8: [240, 163.9, 800, 95.8], 9: [353.8, 245, 572.4, 58.6], 10: [89.6, 96, 1100.8, 58.6], 11: [189.4, 98, 901.1, 117.1], 12: [89.6, 96, 1100.8, 58.6], 13: [89.6, 96, 1100.8, 117.1], 14: [161.3, 413.5, 957.4, 117.1], 15: [89.6, 107.5, 1100.8, 58.6], 16: [89.6, 101.9, 1100.8, 46.1], 17: [89.6, 101.9, 1100.8, 46.1], 18: [89.6, 101.9, 1100.8, 92.3], 19: [89.6, 101.9, 1100.8, 46.1]
  };
  const modalData = {
    1: { tag: 'Step 01 · The trigger', title: '“An email arrives”', punch: 'Sounds like a clean trigger. It’s a swamp.', points: ['It arrives from 40+ senders and no two are formatted alike — data in the body, in a PDF, in a screenshot, or buried in a forwarded thread six replies deep.', 'Half of them are exceptions in disguise: “same as last time,” “ignore the second attachment,” “Sarah already signed off on this one.”', 'There’s no consistent subject line, so the routing logic — what’s urgent, what’s a duplicate, what to drop — lives entirely in one person’s head.'], closing: 'Before a line of code gets written, someone has to sit next to the person who reads these all day and learn the 30 unwritten rules for what actually counts. That discovery IS the job.' },
    2: { tag: 'Step 02 · Re-keyed by hand', title: '“Copied into a spreadsheet”', punch: 'Which spreadsheet? There are four.', points: ['One is the “real” one, two are stale, and one is a personal copy on someone’s desktop that quietly disagrees with the rest.', 'Columns drift — a field someone added in March silently broke three downstream formulas that nobody owns anymore.', 'It’s re-keyed by hand, so a typo doesn’t throw an error — it just becomes the new source of truth.', '“Data validation” is a shared belief, not a rule the file actually enforces.'], closing: 'The spreadsheet is a database, a workflow engine, and an audit log all wearing a grid costume. You have to reverse-engineer all three before you can safely replace any of them.' },
    3: { tag: 'Step 03 · Tribal knowledge', title: '“Checked in an internal system”', punch: 'The system that has no API.', points: ['Login is behind a VPN, the UI hasn’t changed since 2009, and there is no export button.', 'The field labeled “Status” means five different things depending on who set it and when.', 'The real check is tribal: “you just have to know that region 4 always needs a second look.”', 'The one person who understands the edge cases is retiring in eight months.'], closing: 'The knowledge isn’t in the system — it’s in the operator. An FDE’s job is to capture it into something durable before it walks out the door for good.' },
    4: { tag: 'Step 04 · Waits on a reply', title: '“Approved in Slack”', punch: 'An approval with no paper trail.', points: ['“Approval” might be a 👍 in a DM, an “lgtm” in a thread, or a verbal yes in a huddle — sometimes all three, sometimes none.', 'The approver is out half the time, and the escalation rule (“ping Dave if it’s over $50k”) is unwritten and inconsistently followed.', 'There’s no record of who approved what, when, or on what basis — until an auditor asks, and then it’s a very bad week.'], closing: 'Turning a thumbs-up into an auditable control — who, what, when, on what evidence — is most of what risk and compliance teams actually care about. That’s not a Slack bot; that’s design.' },
    5: { tag: 'Step 05 · Where automation goes to die', title: '“Entered into the ERP”', punch: 'Forty required fields and a prayer.', points: ['The ERP demands ~40 fields. The email gave you six. The other 34 come from memory, lookup tables, and “just leave it blank, it usually works.”', 'The mapping rules are undocumented, and some values need transformation that nobody ever wrote down.', 'Errors don’t surface now — they show up days later in a reconciliation report someone reads on Fridays. Maybe.'], closing: 'The last step is where “simple automation” quietly falls apart. Getting it right means modeling every rule the ERP silently assumes — the ones no one can even tell you until it breaks.' }
  };

  let currentIndex = 0;
  let focusedInvoker = null;
  let runTimers = [];
  let wheelLock = null;
  let completeMonth = false;

  function currentScene() { return scenes[currentIndex]; }
  function setHidden(element, hidden) {
    element.dataset.stateHidden = String(hidden);
    element.setAttribute('aria-hidden', String(hidden));
  }
  function cancelRun() { runTimers.forEach(window.clearTimeout); runTimers = []; }
  function scheduleRun(callback, milliseconds) { runTimers.push(window.setTimeout(callback, milliseconds)); }
  function resetRun() {
    cancelRun();
    runPanel.classList.remove('run-active', 'run-approved');
    runResult.dataset.stateHidden = 'true';
    approve.disabled = false;
    setHidden(approve, true);
  }
  function startRun() {
    resetRun();
    if (reducedMotion.matches) {
      runPanel.classList.add('run-active', 'run-approved');
      runResult.dataset.stateHidden = 'false';
      approve.disabled = true;
      return;
    }
    scheduleRun(() => currentIndex === 8 && runPanel.classList.add('document-incoming'), 1500);
    scheduleRun(() => currentIndex === 8 && runPanel.classList.add('document-landed'), 2850);
    scheduleRun(() => currentIndex === 8 && runPanel.classList.add('run-active'), 3500);
    scheduleRun(() => currentIndex === 8 && runPanel.classList.add('agent-drafting'), 4400);
    scheduleRun(() => currentIndex === 8 && runPanel.classList.add('agent-checking'), 5100);
    scheduleRun(() => currentIndex === 8 && runPanel.classList.add('agent-ready'), 5800);
    scheduleRun(() => { if (currentIndex === 8) setHidden(approve, false); }, 6500);
  }
  function approveRun() {
    if (currentIndex !== 8 || approve.disabled) return;
    approve.disabled = true;
    setHidden(approve, true);
    runPanel.classList.add('run-approved');
    scheduleRun(() => currentIndex === 8 && runPanel.classList.add('posting'), 450);
    scheduleRun(() => { if (currentIndex === 8) runResult.dataset.stateHidden = 'false'; }, 1300);
    scheduleRun(() => { if (currentIndex === 8) goTo(9, 'deployment-complete'); }, 2900);
  }
  function syncPersistentLayers() {
    const stageSlot = currentScene().querySelector('.stage-slot');
    if (stageSlot) {
      stageSlot.append(stage);
      setHidden(stage, false);
    } else {
      document.body.append(stage);
      setHidden(stage, true);
    }
    const railSlot = currentScene().querySelector('.rail-slot');
    const railVisible = currentIndex >= 10 && currentIndex <= 13 && window.innerWidth > 960;
    if (railSlot) {
      railSlot.append(rail);
      rail.classList.remove('floating');
    } else {
      deck.append(rail);
      rail.classList.toggle('floating', railVisible);
    }
    setHidden(rail, !railVisible);
    [...rail.children].forEach((item, index) => {
      const isActive = (currentIndex < 12 && index === 0) || (currentIndex === 12 && index === 1) || (currentIndex === 13 && index === 2);
      item.setAttribute('aria-current', String(isActive));
    });
  }
  function syncShell() {
    const isDark = currentScene().classList.contains('dark');
    document.body.classList.toggle('dark-active', isDark);
    chapterButtons.forEach((button, index) => button.setAttribute('aria-current', String(chapterMap[currentIndex] === index)));
    pagerButtons[0].disabled = currentIndex === 0;
    pagerButtons[1].disabled = currentIndex === 19 && completeMonth;
    pagerButtons[1].setAttribute('aria-label', currentIndex === 19 && !completeMonth ? 'Show complete month' : 'Next section');
  }
  function syncSceneState() {
    scenes.forEach((scene, index) => scene.toggleAttribute('data-active', index === currentIndex));
    const completeCalendar = document.querySelector('.complete-month-calendar');
    setHidden(completeCalendar, !(currentIndex === 19 && completeMonth));
    scenes[19].classList.toggle('complete-month', currentIndex === 19 && completeMonth);
    syncShell();
    syncPersistentLayers();
    if (currentIndex === 8) startRun(); else resetRun();
  }
  function goTo(index, reason = 'navigation') {
    if (dialog.open) return;
    const target = Math.max(0, Math.min(19, index));
    if (currentIndex === 19 && target < 19 && completeMonth) completeMonth = false;
    if (target === 19 && currentIndex === 19 && reason === 'pager-next' && !completeMonth) {
      completeMonth = true;
      currentScene().classList.add('complete-month');
      syncSceneState();
      return;
    }
    currentScene().classList.remove('complete-month');
    currentIndex = target;
    const behavior = window.innerWidth > 960 && !reducedMotion.matches ? 'smooth' : 'auto';
    scenes[currentIndex].scrollIntoView({ behavior, block: 'start' });
    syncSceneState();
  }
  function openModal(number, invoker) {
    const data = modalData[number];
    if (!data) return;
    focusedInvoker = invoker;
    dialog.querySelector('[data-scene-region="modal-tag"]').textContent = data.tag;
    dialog.querySelector('[data-scene-region="modal-title"]').textContent = data.title;
    dialog.querySelector('[data-scene-region="modal-punch"]').textContent = data.punch;
    const bullets = dialog.querySelector('[data-scene-region="modal-bullets"]');
    bullets.replaceChildren(...data.points.map((point) => { const item = document.createElement('li'); item.textContent = point; return item; }));
    dialog.querySelector('[data-scene-region="modal-closing"]').textContent = data.closing;
    dialog.dataset.stateHidden = 'false';
    dialog.showModal();
    closeButton.focus();
  }
  function closeModal() {
    if (!dialog.open) return;
    dialog.close();
    dialog.dataset.stateHidden = 'true';
    focusedInvoker?.focus();
    focusedInvoker = null;
  }
  function isInteractiveTarget(target) { return target instanceof Element && Boolean(target.closest('button, input, textarea, select')); }
  function handleKeydown(event) {
    if (dialog.open || isInteractiveTarget(event.target)) return;
    const advanceKeys = ['ArrowDown', 'PageDown', ' '];
    if (advanceKeys.includes(event.key)) { event.preventDefault(); goTo(currentIndex + 1, 'keyboard'); }
    if (['ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); goTo(currentIndex - 1, 'keyboard'); }
    if (event.key === 'Home') { event.preventDefault(); goTo(0, 'keyboard'); }
    if (event.key === 'End') { event.preventDefault(); goTo(19, 'keyboard'); }
  }
  function handleWheel(event) {
    if (window.innerWidth <= 960 || dialog.open || Math.abs(event.deltaY) < 10) return;
    event.preventDefault();
    if (wheelLock) {
      window.clearTimeout(wheelLock);
      wheelLock = window.setTimeout(() => { wheelLock = null; }, 360);
      return;
    }
    wheelLock = window.setTimeout(() => { wheelLock = null; }, 360);
    goTo(currentIndex + (event.deltaY > 0 ? 1 : -1), 'wheel');
  }
  function observeScenes() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= .6) {
          const nextIndex = Number(entry.target.dataset.sceneIndex);
          if (nextIndex !== currentIndex) { currentScene().classList.remove('complete-month'); currentIndex = nextIndex; completeMonth = false; syncSceneState(); }
        }
      });
    }, { root: deck, threshold: [0, .6] });
    scenes.forEach((scene) => observer.observe(scene));
  }
  function rectArea(a, b) {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return width * height;
  }
  async function validateRenderedScene() {
    await document.fonts.ready;
    const scene = currentScene();
    const heading = scene.querySelector('h1, h2');
    const canvas = scene.querySelector('.scene-canvas').getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    const expected = headingBounds[currentIndex];
    const actual = [headingRect.left - canvas.left, headingRect.top - canvas.top, headingRect.width, headingRect.height];
    const pairs = collisionPairs[currentIndex] || [];
    const collisionResults = pairs.map(([first, second]) => {
      const a = scene.querySelector(`[data-scene-region="${first}"]`);
      const b = scene.querySelector(`[data-scene-region="${second}"]`);
      return { pair: [first, second], area: a && b ? rectArea(a.getBoundingClientRect(), b.getBoundingClientRect()) : null };
    });
    const range = document.createRange();
    range.selectNodeContents(heading);
    const lineBoxes = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
    return {
      activeSection: currentIndex,
      heading: { actual, expected, tolerancePx: 3, lineBoxes: lineBoxes.length, computed: getComputedStyle(heading).font },
      horizontalOverflow: { document: document.documentElement.scrollWidth === document.documentElement.clientWidth, scene: scene.scrollWidth === scene.clientWidth },
      collisions: collisionResults,
      hiddenLayers: [...document.querySelectorAll('[data-state-hidden="true"]')].map((element) => ({ region: element.dataset.sceneRegion || element.className, tabindex: element.getAttribute('tabindex'), pointerEvents: getComputedStyle(element).pointerEvents })),
      fixedShell: { header: document.querySelector('.shell-header').getBoundingClientRect().toJSON(), pager: document.querySelector('.pager').getBoundingClientRect().toJSON() }
    };
  }

  chapterButtons.forEach((button) => button.addEventListener('click', () => goTo(Number(button.dataset.chapter), 'chapter')));
  pagerButtons.forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.pager === 'next') {
      if (currentIndex === 19 && !completeMonth) goTo(19, 'pager-next'); else goTo(currentIndex + 1, 'pager-next');
    } else if (currentIndex === 19 && completeMonth) { completeMonth = false; currentScene().classList.remove('complete-month'); syncSceneState(); } else goTo(currentIndex - 1, 'pager-previous');
  }));
  document.querySelectorAll('[data-modal]').forEach((button) => button.addEventListener('click', () => openModal(Number(button.dataset.modal), button)));
  approve.addEventListener('click', approveRun);
  closeButton.addEventListener('click', closeModal);
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeModal(); });
  document.addEventListener('keydown', handleKeydown);
  deck.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('resize', syncSceneState);
  reducedMotion.addEventListener('change', () => { if (currentIndex === 8) startRun(); });
  observeScenes();
  syncSceneState();
  window.__fieldcraftValidateScene = validateRenderedScene;
})();
