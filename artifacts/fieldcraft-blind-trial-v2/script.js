(() => {
  const deck = document.querySelector('#deck');
  const sections = [...document.querySelectorAll('.section')];
  const chapterButtons = [...document.querySelectorAll('[data-go]')];
  const prev = document.querySelector('#prev');
  const next = document.querySelector('#next');
  const stage = document.querySelector('.persistent-stage');
  const calendar = document.querySelector('.calendar-layer');
  const rail = document.querySelector('.rail');
  const dialog = document.querySelector('#workflow-dialog');
  const closeButton = document.querySelector('#modal-close');
  const approve = document.querySelector('#approve');
  const runSection = sections[8];
  const chapterMap = [-1,0,0,0,0,1,1,1,1,1,2,2,3,4,4,5,5,5,5,5];
  let current = 0;
  let finalComplete = false;
  let animationFrame = 0;
  let transitionTarget = null;
  let wheelTimer = 0;
  let wheelLocked = false;
  let runTimers = [];
  let invoker = null;

  const weeks = [
    { title: 'DAYS 1–7', subtitle: 'Build the agent', days: [
      ['Agent loop','prompt → model → response → next step, until the task completes or a max-step limit hits'],
      ['Tool use','one API call + one web search — the agent decides when to call them'],
      ['Guardrails','input validation · max-step limit · output filtering'],
      ['Context & memory','context window by default; external memory only when state must outlive the run'],
      ['Audit trail','log every prompt, response, tool call, result, error, and timestamp'],
      ['Real workflow','run it on one process that used to be manual — tie it to a portfolio project'],
      ['Checkpoint','a working agent with tools, guardrails, deliberate memory, and a full audit trail']
    ]},
    { title: 'DAYS 8–14', subtitle: 'Make it production-ready', days: [
      ['Structured outputs','a defined JSON schema, not free-form text'],['Schema validation','validate every response; retry or escalate when the structure is invalid'],['Failure modes','missing data · malformed responses · dead APIs · timeouts · duplicates · partial completion'],['Checkpointing','save state every few steps: task, actions, tool results, pending work, errors'],['Resume','stop the agent deliberately; restart it from the last checkpoint'],['Failure handling','explicit behavior for tool failure, bad output, incomplete state, unsafe continuation'],['Checkpoint','a resumable agent with structured outputs, state recovery, and explicit failure behavior']
    ]},
    { title: 'DAYS 15–21', subtitle: 'Measure and optimize', days: [
      ['Retry logic','exponential backoff on every external call: 1s · 2s · 4s · 8s · cap at 16s'],['Failure categories','missing context · wrong tool · wrong record · invalid output · unsafe action · timeout'],['Golden dataset','20 real queries with hand-labeled ideal outputs — normal, edge, ambiguous, high-risk'],['Run evals','correctness · format · tool selection · required steps · escalation behavior'],['Optimize cost','cheaper models for simple subtasks · caching · token limits · cost per query'],['Multi-agent','only when decomposition helps: one plans → several execute → one synthesizes'],['Checkpoint','an evaluated agent with known failure modes, measured cost, and a golden dataset']
    ]},
    { title: 'DAYS 22–30', subtitle: 'Communicate and defend', days: [
      ['The pain point','who does the work, what takes time, where errors occur, what it costs'],['Why AI belongs','why not just software · what stays human · where autonomy stops'],['Architecture','stack, tools, models, data, memory, guardrails — and why each exists'],['Iterations','what v1 got wrong, what failed, what changed, how it improved'],['The evals','dataset, pass rate, failure categories, thresholds, open risks'],['Economics','time saved, errors reduced, risk, revenue, cost per query'],['Rehearse: engineer','architecture, decisions, failures, tradeoffs'],['Rehearse: VP','problem, outcome, evidence, risk — plain language'],['Final checkpoint','a complete FDE case study for engineers and executives alike']
    ]}
  ];

  const dayMarkup = (week, weekIndex) => week.days.map((day, dayIndex) => {
    const number = weeks.slice(0, weekIndex).reduce((sum, item) => sum + item.days.length, 0) + dayIndex + 1;
    return `<div class="day"><i>${number}</i><div><b>${day[0]}</b><p>${day[1]}</p></div></div>`;
  }).join('');

  calendar.innerHTML = `<div class="calendar-grid">${weeks.map((week, index) => `<section class="calendar-week"><header><b>${week.title}</b><span>${week.subtitle}</span></header>${dayMarkup(week,index)}</section>`).join('')}</div>`;
  document.querySelectorAll('.mobile-days').forEach((container) => {
    const week = Number(container.dataset.week);
    container.innerHTML = week === 0
      ? '<p>A COMPLETE FDE CASE STUDY</p><p>20 cases → agent runs → pass / fail evidence → failure categories → cost per run</p><p>THE SYSTEM — EVERY WEEK ADDS CAPABILITY TO THE SAME BUILD</p><p>THE PORTFOLIO — WHAT YOU LEAVE WITH</p><p>agent loop; two tools; guardrails; deliberate memory; audit trail; structured outputs; schema validation; checkpointed state; resume after failure; explicit failure paths; retries + backoff; failure taxonomy; golden dataset; eval suite; cost per query; workflow audit; system architecture; evaluation report; deployment controls; business case.</p>'
      : dayMarkup(weeks[week - 1], week - 1);
  });

  const modalData = [
    {tag:'Step 01 · The trigger',title:'“An email arrives”',punch:'Sounds like a clean trigger. It’s a swamp.',points:['It arrives from 40+ senders and no two are formatted alike — data in the body, in a PDF, in a screenshot, or buried in a forwarded thread six replies deep.','Half of them are exceptions in disguise: “same as last time,” “ignore the second attachment,” “Sarah already signed off on this one.”','There’s no consistent subject line, so the routing logic — what’s urgent, what’s a duplicate, what to drop — lives entirely in one person’s head.'],closing:'Before a line of code gets written, someone has to sit next to the person who reads these all day and learn the 30 unwritten rules for what actually counts. That discovery IS the job.'},
    {tag:'Step 02 · Re-keyed by hand',title:'“Copied into a spreadsheet”',punch:'Which spreadsheet? There are four.',points:['One is the “real” one, two are stale, and one is a personal copy on someone’s desktop that quietly disagrees with the rest.','Columns drift — a field someone added in March silently broke three downstream formulas that nobody owns anymore.','It’s re-keyed by hand, so a typo doesn’t throw an error — it just becomes the new source of truth.','“Data validation” is a shared belief, not a rule the file actually enforces.'],closing:'The spreadsheet is a database, a workflow engine, and an audit log all wearing a grid costume. You have to reverse-engineer all three before you can safely replace any of them.'},
    {tag:'Step 03 · Tribal knowledge',title:'“Checked in an internal system”',punch:'The system that has no API.',points:['Login is behind a VPN, the UI hasn’t changed since 2009, and there is no export button.','The field labeled “Status” means five different things depending on who set it and when.','The real check is tribal: “you just have to know that region 4 always needs a second look.”','The one person who understands the edge cases is retiring in eight months.'],closing:'The knowledge isn’t in the system — it’s in the operator. An FDE’s job is to capture it into something durable before it walks out the door for good.'},
    {tag:'Step 04 · Waits on a reply',title:'“Approved in Slack”',punch:'An approval with no paper trail.',points:['“Approval” might be a 👍 in a DM, an “lgtm” in a thread, or a verbal yes in a huddle — sometimes all three, sometimes none.','The approver is out half the time, and the escalation rule (“ping Dave if it’s over $50k”) is unwritten and inconsistently followed.','There’s no record of who approved what, when, or on what basis — until an auditor asks, and then it’s a very bad week.'],closing:'Turning a thumbs-up into an auditable control — who, what, when, on what evidence — is most of what risk and compliance teams actually care about. That’s not a Slack bot; that’s design.'},
    {tag:'Step 05 · Where automation goes to die',title:'“Entered into the ERP”',punch:'Forty required fields and a prayer.',points:['The ERP demands ~40 fields. The email gave you six. The other 34 come from memory, lookup tables, and “just leave it blank, it usually works.”','The mapping rules are undocumented, and some values need transformation that nobody ever wrote down.','Errors don’t surface now — they show up days later in a reconciliation report someone reads on Fridays. Maybe.'],closing:'The last step is where “simple automation” quietly falls apart. Getting it right means modeling every rule the ERP silently assumes — the ones no one can even tell you until it breaks.'}
  ];

  function openModal(index, button) {
    const data = modalData[index];
    invoker = button;
    document.querySelector('#modal-tag').textContent = data.tag;
    document.querySelector('#modal-title').textContent = data.title;
    document.querySelector('#modal-punch').textContent = data.punch;
    document.querySelector('#modal-points').innerHTML = data.points.map(point => `<li>${point}</li>`).join('');
    document.querySelector('#modal-closing').textContent = data.closing;
    dialog.showModal();
    closeButton.focus();
  }
  function closeModal() { dialog.close(); invoker?.focus(); }
  document.querySelectorAll('[data-modal]').forEach(button => button.addEventListener('click', () => openModal(Number(button.dataset.modal), button)));
  closeButton.addEventListener('click', closeModal);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeModal(); });

  function clearRun() {
    runTimers.forEach(clearTimeout); runTimers = [];
    runSection.classList.remove('ingested','phase1','phase2','waiting','complete');
    document.querySelector('.run-log').innerHTML = '';
    document.querySelectorAll('.phases span').forEach(span => span.classList.remove('active'));
  }
  const logLines = ['document received · invoice_0417.pdf','intake · fields parsed, no duplicates found','agent · pulling the matching PO from the ERP','agent · cross-checking contract terms','agent · drafting the record','paused — waiting for human approval','approved · by you, just now','posting to the ERP — no re-keying','record posted · evidence log complete'];
  function addLogs(count) { document.querySelector('.run-log').innerHTML = logLines.slice(0,count).map(line => `<li>${line}</li>`).join(''); }
  function later(fn, delay) { runTimers.push(setTimeout(fn, delay)); }
  function startRun() {
    clearRun();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      runSection.classList.add('ingested','phase1','phase2','complete'); addLogs(9);
      document.querySelectorAll('.phases span').forEach(span => span.classList.add('active')); return;
    }
    later(() => runSection.classList.add('ingested'),1500);
    later(() => addLogs(1),2850);
    later(() => { runSection.classList.add('phase1'); document.querySelectorAll('.phases span')[0].classList.add('active'); addLogs(2); },3500);
    later(() => { runSection.classList.add('phase2'); document.querySelectorAll('.phases span')[1].classList.add('active'); addLogs(3); },4400);
    later(() => addLogs(4),5100); later(() => addLogs(5),5800);
    later(() => { runSection.classList.add('waiting'); document.querySelectorAll('.phases span')[2].classList.add('active'); addLogs(6); },6500);
  }
  approve.addEventListener('click', () => {
    if (!runSection.classList.contains('waiting')) return;
    runSection.classList.remove('waiting'); addLogs(7);
    later(() => { document.querySelectorAll('.phases span')[3].classList.add('active'); addLogs(8); },450);
    later(() => { runSection.classList.add('complete'); addLogs(9); },1300);
    later(() => { if (current === 8) goTo(9); },2900);
  });

  function updateShell(index) {
    sections.forEach((section, i) => section.classList.toggle('active', i === index));
    const dark = [4,8,9].includes(index);
    document.body.classList.toggle('is-dark', dark);
    chapterButtons.forEach((button, i) => button.classList.toggle('active', chapterMap[index] === i));
    prev.disabled = index === 0;
    next.disabled = index === 19 && finalComplete;
    stage.className = `persistent-stage${index >= 1 && index <= 3 ? ` visible stage-${index}` : ''}`;
    rail.style.display = index >= 10 && index <= 13 ? 'flex' : '';
    [...rail.children].forEach((item, i) => item.classList.toggle('active', (index <= 11 ? 0 : index === 12 ? 1 : 2) === i));
    calendar.className = `calendar-layer${index >= 15 ? ' visible' : ''}${index >= 16 ? ` focus-${index - 15}` : ''}`;
    document.querySelectorAll('.calendar-week').forEach((week, i) => week.classList.toggle('complete', finalComplete || (index >= 16 && i < index - 15)));
    document.querySelector('.final').classList.toggle('month-complete', finalComplete);
    if (index === 8) startRun(); else clearRun();
  }

  function animateTo(target) {
    cancelAnimationFrame(animationFrame);
    transitionTarget = target;
    const start = deck.scrollTop, end = sections[target].offsetTop, started = performance.now();
    const tick = now => {
      const progress = Math.min(1,(now-started)/450);
      const eased = progress < .5 ? 2*progress*progress : 1-Math.pow(-2*progress+2,2)/2;
      deck.scrollTop = start + (end-start)*eased;
      if (progress < 1 && transitionTarget === target) animationFrame = requestAnimationFrame(tick);
      else transitionTarget = null;
    };
    animationFrame = requestAnimationFrame(tick);
  }
  function goTo(target) {
    target = Math.max(0,Math.min(19,target));
    if (target === 19 && current === 19 && !finalComplete) { finalComplete = true; updateShell(19); return; }
    if (target < 19 && finalComplete) finalComplete = false;
    current = target; updateShell(current);
    if (innerWidth > 960) animateTo(current); else sections[current].scrollIntoView({behavior:'smooth'});
  }
  function back() {
    if (current === 19 && finalComplete) { finalComplete = false; updateShell(19); return; }
    goTo(current - 1);
  }
  function forward() { goTo(current === 19 ? 19 : current + 1); }
  prev.addEventListener('click', back); next.addEventListener('click', forward);
  chapterButtons.forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.go))));

  deck.addEventListener('wheel', event => {
    if (innerWidth <= 960 || dialog.open || Math.abs(event.deltaY) < 10) return;
    event.preventDefault();
    clearTimeout(wheelTimer); wheelTimer = setTimeout(() => wheelLocked = false,360);
    if (wheelLocked) return; wheelLocked = true; event.deltaY > 0 ? forward() : back();
  },{passive:false});
  document.addEventListener('keydown', event => {
    if (dialog.open || /INPUT|TEXTAREA/.test(event.target.tagName)) return;
    if (event.code === 'Space' && event.target.matches('button')) return;
    if (['ArrowDown','PageDown','Space'].includes(event.code)) { event.preventDefault(); forward(); }
    if (['ArrowUp','PageUp'].includes(event.code)) { event.preventDefault(); back(); }
    if (event.code === 'Home') { event.preventDefault(); goTo(0); }
    if (event.code === 'End') { event.preventDefault(); goTo(19); }
  });

  const observer = new IntersectionObserver(entries => {
    if (transitionTarget !== null) return;
    entries.forEach(entry => { if (entry.intersectionRatio >= .6) { current = Number(entry.target.dataset.index); updateShell(current); } });
  },{root:deck,threshold:[0,.6]});
  sections.forEach(section => observer.observe(section));
  updateShell(0);
})();
