/* ============================================
   HOME RUN v4.2 — UI & Sound
   Investments, amortization, leaderboard,
   WhatsApp feed, score/100, BANKERX branding,
   Glow CTA, bailout repositioning
   ============================================ */

// === Sound System ===
const Sound = (() => {
  let ctx = null;
  let enabled = true;
  try { enabled = localStorage.getItem('homerun_sound') !== 'off'; } catch (e) {}
  function init() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  }
  function isEnabled() { return enabled; }
  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem('homerun_sound', enabled ? 'on' : 'off'); } catch (e) {}
    return enabled;
  }
  function play(type) {
    if (!ctx || !enabled) return;
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime;
      switch (type) {
        case 'click': o.type='sine'; o.frequency.value=800; g.gain.setValueAtTime(0.08,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.06); o.start(); o.stop(t+0.06); break;
        case 'payment': o.type='sine'; o.frequency.setValueAtTime(523,t); o.frequency.linearRampToValueAtTime(784,t+0.12); g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.25); o.start(); o.stop(t+0.25); break;
        case 'bad_event': o.type='sawtooth'; o.frequency.setValueAtTime(300,t); o.frequency.linearRampToValueAtTime(100,t+0.35); g.gain.setValueAtTime(0.10,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.35); o.start(); o.stop(t+0.35); break;
        case 'good_event': o.type='sine'; o.frequency.setValueAtTime(523,t); o.frequency.setValueAtTime(659,t+0.08); o.frequency.setValueAtTime(784,t+0.16); g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.35); o.start(); o.stop(t+0.35); break;
        case 'achievement': o.type='sine'; [523,659,784,1047].forEach((f,i)=>o.frequency.setValueAtTime(f,t+i*0.1)); g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.5); o.start(); o.stop(t+0.5); break;
        case 'victory': o.type='sine'; [523,659,784,1047,784,1047].forEach((f,i)=>o.frequency.setValueAtTime(f,t+i*0.12)); g.gain.setValueAtTime(0.15,t); g.gain.exponentialRampToValueAtTime(0.001,t+1); o.start(); o.stop(t+1); break;
        case 'fanfare': o.type='triangle'; [523,659,784,1047,1319,1047,1319,1568,2093].forEach((f,i)=>o.frequency.setValueAtTime(f,t+i*0.13)); g.gain.setValueAtTime(0.16,t); g.gain.setValueAtTime(0.16,t+1.0); g.gain.exponentialRampToValueAtTime(0.001,t+1.6); o.start(); o.stop(t+1.6); break;
        case 'gameover': o.type='sawtooth'; o.frequency.setValueAtTime(400,t); o.frequency.linearRampToValueAtTime(80,t+0.7); g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.7); o.start(); o.stop(t+0.7); break;
        case 'warning': o.type='square'; o.frequency.setValueAtTime(200,t); o.frequency.setValueAtTime(250,t+0.15); g.gain.setValueAtTime(0.06,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.3); o.start(); o.stop(t+0.3); break;
        case 'timer': o.type='sine'; o.frequency.value=440; g.gain.setValueAtTime(0.05,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.15); o.start(); o.stop(t+0.15); break;
        case 'timer_urgent': o.type='square'; o.frequency.value=880; g.gain.setValueAtTime(0.08,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.1); o.start(); o.stop(t+0.1); break;
        case 'reveal': o.type='sine'; o.frequency.setValueAtTime(440,t); o.frequency.linearRampToValueAtTime(880,t+0.2); g.gain.setValueAtTime(0.10,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.3); o.start(); o.stop(t+0.3); break;
        case 'bank': o.type='sine'; [440,523,659].forEach((f,i)=>o.frequency.setValueAtTime(f,t+i*0.08)); g.gain.setValueAtTime(0.10,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.35); o.start(); o.stop(t+0.35); break;
      }
    } catch(e) {}
  }
  return { init, play, toggle, isEnabled };
})();

// === v5: Custom iconography — chunky board-game outline SVGs ===
const Icons = (() => {
  const svg = (inner, vb = '0 0 24 24') =>
    `<svg class="hr-icon" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  return {
    house: svg('<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>'),
    dice: svg('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>'),
    bank: svg('<path d="M3.5 9.5 12 4.5l8.5 5"/><path d="M5 10v7M9.5 10v7M14.5 10v7M19 10v7"/><path d="M3.5 19.5h17"/>'),
    scroll: svg('<path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 1-1.7"/><path d="M9 9h7M9 12.5h7M9 16h4.5"/>'),
    trophy: svg('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.5a2.5 2.5 0 0 0 2.6 2.9M16 5.5h2.5a2.5 2.5 0 0 1-2.6 2.9"/><path d="M12 13v3.5M8.5 20h7M10 20v-2h4v2"/>'),
    coin: svg('<circle cx="12" cy="12" r="8.5"/><path d="M10 15.5V8.5h2.4a2.1 2.1 0 0 1 0 4.2H10m3.5 2.8-2-2.8"/>'),
    wave: svg('<path d="M3 9.5c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0"/><path d="M3 15c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0"/>'),
    soundOn: svg('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/><path d="M17.8 7.2a6.6 6.6 0 0 1 0 9.6"/>'),
    soundOff: svg('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="m15.5 9.5 5 5m0-5-5 5"/>'),
    seal: svg('<circle cx="12" cy="10" r="6"/><path d="m9.5 14.5-1.5 6 4-2.3 4 2.3-1.5-6"/><path d="m12 7.2.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z" fill="currentColor" stroke="none"/>'),
  };
})();

// === v4.1: WhatsApp Community Messages ===
const WHATSAPP_MESSAGES = [
  { name: 'Sipho', msg: 'Just paid R45k for a geyser replacement. Homeownership is a scam 😭' },
  { name: 'Thandi', msg: 'My estate agent said the market is hot. Bro the only thing hot is my electricity bill 🔥' },
  { name: 'Dave', msg: 'Body corporate wants R30k special levy. For what?? The lift hasn\'t worked since 2019' },
  { name: 'Priya', msg: 'Sold my car to pay the bond. Now I Uber to work. Big brain moves only 🧠' },
  { name: 'Lebo', msg: 'Load shedding killed my fridge. All my meal prep gone. I\'m eating dry bread tonight' },
  { name: 'Craig', msg: 'Just found out my "fixed rate" adjusts after 2 years. Read the fine print people!!!' },
  { name: 'Nomsa', msg: 'My neighbour\'s tree fell on my wall. Guess who\'s paying? Me. Obviously me.' },
  { name: 'Jason', msg: 'Bank called to offer me a credit card. Brother I can barely afford water' },
  { name: 'Zinhle', msg: 'Rates went up AGAIN. At this point SARB is my landlord' },
  { name: 'Trevor', msg: 'Plumber charged R8k for 20 minutes of work. I\'m in the wrong career' },
  { name: 'Ayesha', msg: 'My tenant ghosted me after 2 months. Left a broken window as a goodbye gift' },
  { name: 'Mandla', msg: 'Finally made an extra payment on the bond!! 🎉 Then my car broke down the next day' },
  { name: 'Kim', msg: 'Insurance rejected my claim because the damage was "pre-existing". It literally happened yesterday' },
  { name: 'Bongani', msg: 'Just saw my amortization schedule. The first 5 years is basically just paying interest 💠' },
  { name: 'Fatima', msg: 'Black Friday got me again. I now own 3 air fryers. Send help.' },
  { name: 'Riaan', msg: 'Told my wife we can\'t afford a holiday. She booked Bali. Pray for me.' },
  { name: 'Lerato', msg: 'My bond repayment just went up R2000/month because of the rate hike. Cool cool cool cool' },
  { name: 'Deepak', msg: 'Put solar panels on the roof. Now I\'m broke but at least I have electricity during loadshedding' },
  { name: 'Michelle', msg: 'Found out my house value went up 15%. Too bad I can\'t eat equity' },
  { name: 'Themba', msg: 'My garden service costs more than my water bill. Why do I have a garden?' },
  { name: 'Anika', msg: 'Just renewed my home insurance. They want R4k/month. For insurance. INSURANCE.' },
  { name: 'Jabulani', msg: 'Invested my bonus in shares. They crashed. Should\'ve just paid the bond 🙄' },
  { name: 'Sarah', msg: 'Transfer costs were R180k. Nobody warned me about this part of adulting' },
  { name: 'Tshepo', msg: 'My property tax went up 12% in one year. Inflation is supposedly 5%. Make it make sense.' },
  { name: 'Lisa', msg: 'Bought a house to stop paying rent. Now I pay a bond, rates, levies, insurance, and maintenance. 🤡' },
  { name: 'Kabelo', msg: 'The bank said I\'m pre-approved!! They didn\'t say pre-approved for suffering' },
  { name: 'Nina', msg: 'My friend rents for R12k. My bond + costs = R28k. But at least I have ✨equity✨' },
  { name: 'Siya', msg: 'Year 3 of homeownership: I now understand why my parents looked stressed all the time' },
  { name: 'Bianca', msg: 'The municipality sent me a R15k water bill. I live alone. I shower every other day.' },
  { name: 'Dumisani', msg: 'Just calculated I\'ll pay R2.1M interest on a R1.5M house. The bank is the real winner here' },
];

// === v4.1: Investment Options ===
const INVESTMENT_OPTIONS = [
  { id: 'money_market', name: 'Money Market Fund', icon: '💵', returnRate: 0.07, risk: 'Low', termYears: 1, desc: 'Safe, liquid. ~7% annual return.' },
  { id: 'rsa_retail', name: 'RSA Retail Bond', icon: '🏳️', returnRate: 0.10, risk: 'Low', termYears: 3, desc: 'Government-backed. ~10% over 3 years.' },
  { id: 'equity_fund', name: 'Equity Fund (JSE)', icon: '📈', returnRate: 0.12, risk: 'Medium', termYears: 3, desc: 'JSE index tracker. ~12% but volatile.' },
  { id: 'property_reit', name: 'Property REIT', icon: '🏢', returnRate: 0.09, risk: 'Medium', termYears: 2, desc: 'Listed property fund. ~9% yield.' },
  { id: 'tax_free', name: 'Tax-Free Savings', icon: '🛡️', returnRate: 0.08, risk: 'Low', termYears: 2, desc: 'Tax-free growth. ~8% annual.' },
];

// === UI Renderer ===
const UI = (() => {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => (root || document).querySelectorAll(sel);
  const app = () => document.getElementById('app');
  const fmt = SA.fmt;
  let usedWhatsappIdxs = []; // track used messages across years

  // v5: Persistent sound on/off toggle — floats over every screen
  function mountSoundToggle() {
    if (document.getElementById('sound-toggle')) return;
    const btn = document.createElement('button');
    btn.id = 'sound-toggle';
    btn.className = 'sound-toggle';
    btn.setAttribute('aria-label', Sound.isEnabled() ? 'Turn sound off' : 'Turn sound on');
    btn.innerHTML = Sound.isEnabled() ? Icons.soundOn : Icons.soundOff;
    btn.addEventListener('click', () => {
      const on = Sound.toggle();
      btn.innerHTML = on ? Icons.soundOn : Icons.soundOff;
      btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
      if (on) { Sound.init(); Sound.play('click'); }
    });
    document.body.appendChild(btn);
  }


  // === v10: How to play ===
  function showHowToPlay(onClose) {
    if (document.querySelector('.howto-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'event-overlay howto-overlay';
    overlay.innerHTML = `<div class="event-card" style="text-align:left;max-width:520px;max-height:85vh;overflow-y:auto;">
      <div class="event-title" style="text-align:center;">How to Play</div>
      <div class="howto-list">
        <div class="howto-item"><span class="howto-icon">🏆</span><span><strong>Goal:</strong> pay off your bond. The earlier you finish, the higher your score — you can settle in full at any time if you have the cash.</span></div>
        <div class="howto-item"><span class="howto-icon">🎲</span><span><strong>Each year:</strong> pick your decisions, make your money moves, then advance. Decision odds improve when your finances are healthy.</span></div>
        <div class="howto-item"><span class="howto-icon">💸</span><span><strong>Pay extra</strong> into the bond whenever you can — it shrinks the balance, your repayment, <em>and</em> your running costs.</span></div>
        <div class="howto-item"><span class="howto-icon">🏦</span><span><strong>Bank cash</strong> for emergencies. Surprises get paid from reserves — with no reserves, they're added to your bond at full interest.</span></div>
        <div class="howto-item"><span class="howto-icon">🌊</span><span><strong>Watch the Financial Health meter.</strong> Sustained high stress — or sinking six months of salary into the red — ends the game.</span></div>
        <div class="howto-item"><span class="howto-icon">🛒</span><span><strong>Life is expensive:</strong> you only keep 3–5% of your salary as savings each year, and running costs add 30–40% on top of your repayment. Plan around it.</span></div>
      </div>
      <button class="btn btn-primary btn-block" id="btn-howto-close" style="margin-top:var(--space-4);">Got It — Let's Play</button>
    </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#btn-howto-close').addEventListener('click', () => {
      Sound.play('click');
      overlay.remove();
      if (onClose) onClose();
    });
  }

  function mountHelpButton(onClick) {
    if (document.getElementById('help-toggle')) return;
    const btn = document.createElement('button');
    btn.id = 'help-toggle';
    btn.className = 'sound-toggle help-toggle';
    btn.setAttribute('aria-label', 'How to play');
    btn.textContent = '?';
    btn.addEventListener('click', () => { Sound.play('click'); onClick(); });
    document.body.appendChild(btn);
  }

  // === v10: Share my score ===
  function shareScore(state, btn) {
    const rating = Engine.getScoreRating(state.score);
    const won = state.phase === 'won';
    // Use the real URL wherever the game is deployed; fall back to bankerx.org
    // for odd contexts (file://, sandboxed previews).
    let gameUrl = 'https://www.bankerx.org/';
    try {
      if (location.protocol === 'http:' || location.protocol === 'https:') {
        gameUrl = location.origin + location.pathname;
      }
    } catch (e) {}
    const text = won
      ? `I scored ${state.score}/100 (${rating.label}) on HOME RUN 🏠 — paid off my bond in ${state.currentYear} years. Can you beat me? ${gameUrl}`
      : `I scored ${state.score}/100 on HOME RUN 🏠 — the home loan got me in year ${state.currentYear}. Think you can do better? ${gameUrl}`;
    const done = () => {
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    };
    if (navigator.share) {
      navigator.share({ text, url: gameUrl }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {});
    }
  }

  function confetti(count = 120, frames = 180) {
    const c = document.createElement('canvas');
    c.id = 'confetti-canvas';
    c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:200;';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const p = Array.from({length:count}, () => ({
      x: Math.random()*c.width, y: -20-Math.random()*200,
      vx: (Math.random()-0.5)*6, vy: 2+Math.random()*4,
      s: 4+Math.random()*6, rot: Math.random()*360, rs: (Math.random()-0.5)*10,
      col: ['#D9B44A','#57BE74','#F5EEDD','#E15B4D','#6FB5E8'][Math.floor(Math.random()*5)],
    }));
    let f = 0;
    (function draw() {
      ctx.clearRect(0,0,c.width,c.height);
      p.forEach(q => { q.x+=q.vx; q.y+=q.vy; q.vy+=0.05; q.rot+=q.rs;
        ctx.save(); ctx.translate(q.x,q.y); ctx.rotate(q.rot*Math.PI/180);
        ctx.fillStyle=q.col; ctx.fillRect(-q.s/2,-q.s/2,q.s,q.s*0.6); ctx.restore(); });
      if (++f < frames) requestAnimationFrame(draw); else c.remove();
    })();
  }

  // === UNDERWATER METER ===
  function renderUnderwaterMeter(level) {
    const label = level >= 80 ? 'DROWNING' : level >= 60 ? 'Struggling' : level >= 40 ? 'Treading Water' : level >= 20 ? 'Comfortable' : 'Dry Land';
    const color = level >= 80 ? 'var(--color-danger)' : level >= 60 ? 'var(--color-orange)' : level >= 40 ? 'var(--color-warning)' : level >= 20 ? 'var(--color-info)' : 'var(--color-primary)';
    return `
      <div class="underwater-meter">
        <div class="underwater-header">
          <span class="label">${Icons.wave} Financial Health</span>
          <span class="value" style="color:${color};font-size:13px;">${label} (${Math.round(level)}%)</span>
        </div>
        <div class="underwater-bar">
          <div class="underwater-water" style="height:${level}%;background:${color};">
            ${level >= 50 ? '<div class="underwater-waves"></div>' : ''}
          </div>
          <div class="underwater-person" style="bottom:${100 - level}%;">
            ${level >= 80 ? '😵' : level >= 60 ? '😰' : level >= 40 ? '😐' : level >= 20 ? '🙂' : '😎'}
          </div>
          <div class="underwater-marks">
            <span style="bottom:80%;" class="mark-line"></span>
            <span style="bottom:60%;" class="mark-line"></span>
            <span style="bottom:40%;" class="mark-line"></span>
            <span style="bottom:20%;" class="mark-line"></span>
          </div>
        </div>
      </div>
    `;
  }

  // === MAIN GAME SCREEN (v4) ===
  function renderGame(state, callbacks) {
    const pctPaid = Math.max(0, (1 - state.balance / state.originalBondAmount) * 100);
    const remaining = Engine.getRemainingEstimate(state);
    const calYear = state.startYear + state.currentYear;
    const yearLabel = state.currentYear > 0 ? `Year ${state.currentYear} (${calYear})` : 'Ready';
    const affordability = Engine.getAffordabilityRating(state.affordabilityRatio);

    app().innerHTML = `
      <div class="game-screen">
        <div class="game-header">
          <div class="logo">${Icons.house} HOME RUN</div>
          <div class="row gap-3">
            <span class="month-badge">${yearLabel}</span>
          </div>
        </div>

        <!-- Balance + Underwater -->
        <div class="game-top-grid">
          <div class="panel panel-glow-green balance-display">
            <div class="balance-label">Outstanding Bond</div>
            <div class="balance-amount" id="balance-num">${fmt(state.balance)}</div>
            <div class="progress-bar" style="max-width:100%;margin:0 auto var(--space-3);">
              <div class="progress-fill" style="width:${pctPaid}%;background:var(--color-primary);"></div>
            </div>
            <div class="row gap-3" style="justify-content:center;flex-wrap:wrap;">
              <span class="badge badge-green">${pctPaid.toFixed(1)}% paid</span>
              ${state.currentYear > 0 ? `<span class="badge badge-amber">~${remaining} years left</span>` : ''}
            </div>
            ${state.currentYear > 0 ? (() => {
              const amort = Engine.calcYearAmortization(state.balance, state.interestRate, state.loanTermMonths, state.currentYear);
              return `<div class="amort-breakdown">
                <span class="amort-item"><span class="label">Capital</span> <span class="text-green">${fmt(amort.principal)}</span></span>
                <span class="amort-divider">·</span>
                <span class="amort-item"><span class="label">Interest</span> <span class="text-red">${fmt(amort.interest)}</span></span>
              </div>`;
            })() : ''}
          </div>
          ${renderUnderwaterMeter(state.underwaterLevel)}
        </div>

        <!-- Stats -->
        <div class="stat-grid" style="margin-bottom:var(--space-4);">
          <div class="stat-card">
            <span class="label">Cash Reserve</span>
            <span class="value ${state.cashOnHand < 0 ? 'text-red' : state.cashOnHand < state.minPayment ? 'text-amber' : 'text-green'}">${fmt(state.cashOnHand)}</span>
          </div>
          <div class="stat-card">
            <span class="label">Bond Repayment</span>
            <span class="value">${fmt(state.minPayment)}/mo</span>
          </div>
          <div class="stat-card">
            <span class="label">Net Salary</span>
            <span class="value">${fmt(state.monthlyNetSalary)}/mo</span>
          </div>
          <div class="stat-card">
            <span class="label">Interest Rate</span>
            <span class="value text-amber">${state.interestRate.toFixed(2)}%</span>
          </div>
          <div class="stat-card">
            <span class="label">Affordability</span>
            <span class="value" style="color:${affordability.color};">${affordability.label}</span>
          </div>
          <div class="stat-card">
            <span class="label">Equity</span>
            <span class="value">${fmt(state.equity)}</span>
          </div>
        </div>

        <!-- True cost breakdown -->
        <details class="costs-details" style="margin-bottom:var(--space-4);">
          <summary class="heading-sm" style="cursor:pointer;padding:var(--space-3) 0;">True Cost of Ownership — ${fmt(state.minPayment + state.ownershipCosts.total)}/month</summary>
          <p class="text-muted" style="font-size:13px;margin-bottom:var(--space-3);line-height:1.55;">
            Owning costs more than the repayment. Running costs — municipal rates, electricity, water,
            levies, insurance, and maintenance — can add roughly 30–40% on top of your bond payment
            (for this home: ~${Math.round(state.runningCostRate * 100)}%).
          </p>
          <div class="stat-grid" style="grid-template-columns:repeat(2,1fr);">
            <div class="stat-card"><span class="label">Bond Repayment</span><span class="value">${fmt(state.minPayment)}</span></div>
            <div class="stat-card"><span class="label">Running Costs (rates, electricity, water, levies, insurance)</span><span class="value text-amber">${fmt(state.ownershipCosts.total)}</span></div>
            <div class="stat-card"><span class="label">True Ownership Cost</span><span class="value text-gold">${fmt(state.minPayment + state.ownershipCosts.total)}</span></div>
            <div class="stat-card"><span class="label">Living Expenses (separate)</span><span class="value">${fmt(state.monthlyLivingExpenses)}</span></div>
          </div>
        </details>

        <!-- Action panel with tabs -->
        <div class="action-panel" style="margin-bottom:var(--space-4);">
          <div class="action-tabs">
            <button class="action-tab active" data-tab="decide">${Icons.dice} Decisions</button>
            <button class="action-tab" data-tab="history">${Icons.scroll} History</button>
            <button class="action-tab" data-tab="awards">${Icons.trophy} Awards</button>
          </div>
          <div class="action-content" id="tab-content">
            ${renderDecideTab(state)}
          </div>
        </div>

        <div class="row-between" style="padding:var(--space-2) 0;">
          <span class="label">Score: <strong class="text-gold">${state.score}/100</strong></span>
          <span class="label">Year ${state.currentYear} of ${state.loanTermYears}${state.loanExtensions > 0 ? ` (+${state.loanExtensions * 5}y)` : ''}</span>
        </div>

        <div class="bankerx-signup">
          <a href="https://www.bankerx.org/join" target="_blank" rel="noopener">📧 Join the BANKERX community</a>
        </div>
      </div>
    `;

    // Wire tabs
    $$('.action-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.action-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        Sound.play('click');
        const content = $('#tab-content');
        switch (tab.dataset.tab) {
          case 'decide': content.innerHTML = renderDecideTab(state); wireDecideTab(state, callbacks); break;
          case 'history': content.innerHTML = renderHistoryTab(state); break;
          case 'awards': content.innerHTML = renderAwardsTab(state); break;
        }
      });
    });

    wireDecideTab(state, callbacks);
  }

  // v4.1: Get unique WhatsApp messages for this year
  function getWhatsappMessages(count = 3) {
    if (usedWhatsappIdxs.length >= WHATSAPP_MESSAGES.length - count) {
      usedWhatsappIdxs = []; // Reset when nearly exhausted
    }
    const available = WHATSAPP_MESSAGES.map((m, i) => ({ ...m, _idx: i })).filter(m => !usedWhatsappIdxs.includes(m._idx));
    const picks = [];
    for (let i = 0; i < Math.min(count, available.length); i++) {
      const idx = Math.floor(Math.random() * available.length);
      picks.push(available.splice(idx, 1)[0]);
    }
    picks.forEach(p => usedWhatsappIdxs.push(p._idx));
    return picks;
  }

  // v4: Decision tab — highlight to select, no amounts shown
  function renderDecideTab(state) {
    const decisions = state.decisionsThisYear;
    const anyChosen = decisions.some(d => d.chosen);
    const whatsappMsgs = getWhatsappMessages(3);
    return `
      <div class="stack gap-3" id="decide-tab">
        <p style="font-size:14px;color:var(--color-text-muted);">
          Choose your moves for this year. Tap a decision to select it — outcomes are revealed at year-end.
          You can skip all decisions too.
        </p>
        <div class="decision-grid">
          ${decisions.map((d, i) => `
            <button class="decision-btn ${d.chosen ? 'chosen' : ''}" data-idx="${i}">
              <span class="decision-icon">${d.icon}</span>
              <span class="decision-label">${d.label}</span>
              ${d.chosen ? '<span class="decision-check">✓ Selected</span>' : '<span class="decision-hint">Tap to select</span>'}
            </button>
          `).join('')}
        </div>
        ${state.streakExtraPayments >= 2 ? `<div class="badge badge-green" style="align-self:flex-start;">🔥 ${state.streakExtraPayments} year streak</div>` : ''}
        ${state.underwaterLevel >= 60 ? `<div class="badge badge-red" style="align-self:flex-start;">⚠️ Financial stress high — consider banking cash</div>` : ''}

        <!-- v6: Money moves — merged from the old Banking tab -->
        <div class="money-moves" style="margin-top:var(--space-3);">
          <div class="heading-sm" style="margin-bottom:var(--space-2);">Money Moves</div>
          <div class="stat-grid" style="grid-template-columns:repeat(2,1fr);margin-bottom:var(--space-3);">
            <div class="stat-card">
              <span class="label">Surplus Cash</span>
              <span class="value ${state.cashOnHand > 0 ? 'text-green' : 'text-red'}">${fmt(Math.max(0, state.cashOnHand))}</span>
            </div>
            <div class="stat-card">
              <span class="label">Banked Reserve</span>
              <span class="value ${state.bankedCash > 0 ? 'text-blue' : 'text-muted'}">${fmt(state.bankedCash)}</span>
            </div>
          </div>
          ${state.cashOnHand >= 1000 && state.balance > 0 ? `
            <div class="panel money-move-panel" style="padding:var(--space-3);margin-bottom:var(--space-3);">
              <div class="heading-sm" style="margin-bottom:var(--space-1);">Pay Extra Into the Bond</div>
              <p class="text-muted" style="font-size:13px;margin-bottom:var(--space-2);">Use surplus cash to cut the balance — this shrinks your repayment and the interest you'll ever pay.</p>
              <div class="slider-group">
                <div class="slider-header">
                  <label class="label">Extra payment</label>
                  <span class="value" id="extra-cash-display">${fmt(Math.min(Math.round(state.cashOnHand * 0.5), state.balance))}</span>
                </div>
                <input type="range" class="slider" id="extra-cash-slider"
                  min="0" max="${Math.min(Math.floor(state.cashOnHand), Math.ceil(state.balance))}" step="1000"
                  value="${Math.min(Math.round(state.cashOnHand * 0.5), Math.ceil(state.balance))}">
              </div>
              <button class="btn btn-cream btn-sm btn-block" id="btn-pay-extra-cash" style="margin-top:var(--space-2);">Pay Into Bond</button>
              ${state.cashOnHand >= state.balance ? `
                <button class="btn btn-primary btn-sm btn-block" id="btn-settle-bond" style="margin-top:var(--space-2);">Settle the Bond in Full — ${fmt(Math.ceil(state.balance))}</button>
                <p class="tip" style="margin-top:var(--space-1);text-align:center;">You have enough cash to pay this off completely and end the game now.</p>
              ` : ''}
            </div>
          ` : ''}
          ${state.cashOnHand >= 1000 ? `
            <div class="panel money-move-panel" style="padding:var(--space-3);margin-bottom:var(--space-3);">
              <div class="heading-sm" style="margin-bottom:var(--space-1);">Bank Cash for Emergencies</div>
              <p class="text-muted" style="font-size:13px;margin-bottom:var(--space-2);">Reserves cover surprises in cash — without them, emergencies get borrowed onto your bond.</p>
              <div class="slider-group">
                <div class="slider-header">
                  <label class="label">Amount to bank</label>
                  <span class="value" id="bank-amount-display">${fmt(Math.round(state.cashOnHand * 0.5))}</span>
                </div>
                <input type="range" class="slider" id="bank-amount-slider"
                  min="0" max="${Math.floor(state.cashOnHand)}" step="1000"
                  value="${Math.round(state.cashOnHand * 0.5)}">
              </div>
              <button class="btn btn-cream btn-sm btn-block" id="btn-bank-cash" style="margin-top:var(--space-2);">Bank This Amount</button>
            </div>
          ` : ''}
          ${state.currentYear > 0 && state.currentYear % 3 === 0 && state.cashOnHand >= 10000 ? `
            <div class="panel money-move-panel" style="padding:var(--space-3);margin-bottom:var(--space-3);">
              <div class="heading-sm" style="margin-bottom:var(--space-1);">Invest Excess Cash</div>
              <p class="text-muted" style="font-size:13px;margin-bottom:var(--space-3);">Invests half your surplus. Funds are locked until maturity — they can't help in an emergency.</p>
              <div class="investment-grid">
                ${INVESTMENT_OPTIONS.map(inv => `
                  <button class="invest-btn" data-inv="${inv.id}">
                    <span class="invest-icon">${inv.icon}</span>
                    <span class="invest-name">${inv.name}</span>
                    <span class="invest-detail">${inv.desc}</span>
                    <span class="invest-meta">${inv.risk} risk · ${inv.termYears}yr term</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${state.investments && state.investments.length > 0 ? `
            <div style="margin-bottom:var(--space-3);">
              <div class="heading-sm" style="margin-bottom:var(--space-2);">Active Investments</div>
              ${state.investments.map(inv => `
                <div class="stat-card" style="margin-bottom:var(--space-2);">
                  <span class="label">${inv.name}</span>
                  <span class="value">${fmt(inv.amount)} · Matures year ${inv.yearInvested + inv.termYears}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <button class="btn btn-primary btn-lg btn-block btn-cta" id="btn-next-year" style="margin-top:var(--space-2);">Advance to Next Year!</button>

        ${state.underwaterLevel >= 50 || state.cashOnHand < 0 ? `
          <div class="panel bailout-panel" style="margin-top:var(--space-3);">
            <div class="heading-sm" style="margin-bottom:var(--space-2);">🆘 Struggling? Bailout Options</div>
            <p class="text-muted" style="font-size:13px;margin-bottom:var(--space-3);">These add to your mortgage — use only as a last resort.</p>
            <div class="row gap-3" style="flex-wrap:wrap;">
              <button class="btn btn-danger btn-sm" id="btn-borrow">Borrow ${fmt(state.monthlyNetSalary * 3)} from bank</button>
              <button class="btn btn-danger btn-sm" id="btn-extend">Extend loan by 5 years</button>
            </div>
          </div>
        ` : ''}
        
        <div class="whatsapp-feed">
          <div class="whatsapp-header">💬 Community WhatsApp</div>
          ${whatsappMsgs.map(m => `
            <div class="whatsapp-msg">
              <span class="whatsapp-name">${m.name}:</span>
              <span class="whatsapp-text">${m.msg}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function wireDecideTab(state, callbacks) {
    $$('.decision-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.play('click');
        const idx = parseInt(btn.dataset.idx);
        // Toggle selection
        state.decisionsThisYear[idx].chosen = !state.decisionsThisYear[idx].chosen;
        callbacks.onDecisionToggle(idx);
      });
    });
    $('#btn-next-year')?.addEventListener('click', () => {
      Sound.play('payment');
      callbacks.onNextYear();
    });
    // Bailout buttons (now inside decide tab)
    $('#btn-borrow')?.addEventListener('click', () => { Sound.play('bad_event'); callbacks.onBorrow(Math.round(state.monthlyNetSalary * 3)); });
    $('#btn-extend')?.addEventListener('click', () => { Sound.play('bad_event'); callbacks.onExtend(5); });

    // v6: Money moves (merged from old Banking tab)
    const extraSlider = $('#extra-cash-slider');
    if (extraSlider) {
      extraSlider.addEventListener('input', () => {
        $('#extra-cash-display').textContent = fmt(parseInt(extraSlider.value));
      });
      $('#btn-pay-extra-cash')?.addEventListener('click', () => {
        let amt = parseInt(extraSlider.value);
        // Slider steps can land just short of the exact balance — snap to full payoff
        if (amt > 0 && state.balance - amt < 1000) amt = Math.ceil(state.balance);
        if (amt > 0) callbacks.onPayExtra(amt);
      });
      $('#btn-settle-bond')?.addEventListener('click', () => {
        callbacks.onPayExtra(Math.ceil(state.balance));
      });
    }
    const bankSlider = $('#bank-amount-slider');
    if (bankSlider) {
      bankSlider.addEventListener('input', () => {
        $('#bank-amount-display').textContent = fmt(parseInt(bankSlider.value));
      });
      $('#btn-bank-cash')?.addEventListener('click', () => {
        const amt = Math.min(parseInt(bankSlider.value), Math.floor(state.cashOnHand));
        if (amt > 0) callbacks.onBankCash(amt);
      });
    }
    $$('.invest-btn').forEach(btn => {
      btn.addEventListener('click', () => { callbacks.onInvest(btn.dataset.inv); });
    });
  }

  function renderHistoryTab(state) {
    const logs = [...state.yearLog].reverse().slice(0, 15);
    return `<div class="timeline">${logs.length === 0 ? '<p class="text-muted" style="font-size:14px;">No years completed yet.</p>' : ''}
      ${logs.map(l => {
        return `<div class="timeline-item">
          <span class="timeline-month">Year ${l.year} (${l.calendarYear})</span>
          <span class="timeline-text">
            Principal: ${fmt(l.principal)} ${l.extra > 0 ? `<span class="text-green">(+${fmt(l.extra)} extra)</span>` : ''}
            <br><span class="text-muted" style="font-size:12px;">Interest: ${fmt(l.interest)} | Costs: ${fmt(l.ownership)} | 🌊 ${l.underwater}%</span>
            ${l.bankedCash > 0 ? `<br><span class="text-blue" style="font-size:11px;">🏦 Banked: ${fmt(l.bankedCash)}</span>` : ''}
          </span>
          <span class="timeline-amount">${fmt(l.balance)}</span>
        </div>`;
      }).join('')}</div>`;
  }

  function renderAwardsTab(state) {
    return `<div class="stack gap-3">
      ${state.achievements.length === 0 ? '<p class="text-muted" style="font-size:14px;">No achievements yet. Keep playing.</p>' : ''}
      ${state.achievements.map(a => `
        <div class="row gap-3" style="padding:var(--space-2) 0;border-bottom:1px solid var(--color-border);">
          <span style="font-size:24px;">${a.icon}</span>
          <div><div style="font-weight:600;font-size:14px;">${a.title}</div><div class="text-muted" style="font-size:13px;">${a.desc}</div></div>
        </div>
      `).join('')}</div>`;
  }

  // === EVENT OVERLAY ===
  function showEvent(event, onDismiss) {
    Sound.play(event.type === 'bad' ? 'bad_event' : event.type === 'good' ? 'good_event' : 'click');
    const overlay = document.createElement('div');
    overlay.className = 'event-overlay';
    const typeClass = event.type === 'bad' ? 'bad' : event.type === 'good' ? 'good' : 'neutral';

    if (event.choices) {
      overlay.innerHTML = `<div class="event-card">
        <div class="event-icon ${typeClass}">${event.icon}</div>
        <div class="event-title">${event.title}</div>
        <div class="event-desc">${event.desc}</div>
        ${!event.revealAfter ? `<div class="event-impact">${event.impactText}</div>` : ''}
        <div class="event-choices">${event.choices.map((c, i) => `
          <button class="btn ${i === 0 ? 'btn-primary' : 'btn-outline'} btn-block" data-choice="${i}">${c.label}</button>
        `).join('')}</div>
      </div>`;
      overlay.querySelectorAll('[data-choice]').forEach(btn => {
        btn.addEventListener('click', () => { Sound.play('click'); overlay.remove(); onDismiss(event.choices[parseInt(btn.dataset.choice)].apply); });
      });
    } else {
      overlay.innerHTML = `<div class="event-card">
        <div class="event-icon ${typeClass}">${event.icon}</div>
        <div class="event-title">${event.title}</div>
        <div class="event-desc">${event.desc}</div>
        <div class="event-impact ${event.type === 'bad' ? 'text-red' : 'text-green'}">${event.impactText}</div>
        <button class="btn ${event.type === 'bad' ? 'btn-danger' : 'btn-primary'} btn-lg btn-block" id="btn-dismiss">${event.type === 'bad' ? 'Deal With It' : 'Nice!'}</button>
      </div>`;
      overlay.querySelector('#btn-dismiss').addEventListener('click', () => { Sound.play('click'); overlay.remove(); onDismiss(event); });
    }
    document.body.appendChild(overlay);
  }

  // === TIMED EVENT — v4: SMOOTH countdown, no flash/re-render ===
  function showTimedEvent(event, onChoice) {
    Sound.play('warning');
    const overlay = document.createElement('div');
    overlay.className = 'event-overlay timed-overlay';
    let timeLeft = event.timerSeconds;
    let chosen = false;

    overlay.innerHTML = `<div class="event-card timed-card">
      <div class="timer-ring-wrapper">
        <svg class="timer-svg" viewBox="0 0 100 100">
          <circle class="timer-bg" cx="50" cy="50" r="44" />
          <circle class="timer-progress" cx="50" cy="50" r="44" 
            stroke-dasharray="${2 * Math.PI * 44}" 
            stroke-dashoffset="0" />
        </svg>
        <span class="timer-text">${timeLeft}s</span>
      </div>
      <div class="event-icon neutral">${event.icon}</div>
      <div class="event-title">${event.title}</div>
      <div class="event-desc">${event.desc}</div>
      ${event.impactText && !event.revealAfter ? `<div class="event-impact">${event.impactText}</div>` : ''}
      <div class="event-choices timed-choices">${event.choices.map((c, i) => `
        <button class="btn ${i === 0 ? 'btn-primary' : 'btn-outline'} btn-block" data-choice="${i}">${c.label}</button>
      `).join('')}</div>
    </div>`;

    const progressCircle = overlay.querySelector('.timer-progress');
    const timerText = overlay.querySelector('.timer-text');
    const circumference = 2 * Math.PI * 44;

    // Wire choices
    overlay.querySelectorAll('[data-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (chosen) return;
        chosen = true;
        Sound.play('click');
        overlay.remove();
        onChoice(parseInt(btn.dataset.choice));
      });
    });

    document.body.appendChild(overlay);

    // Smooth countdown — just update text + ring offset, NO DOM re-render
    const startTime = Date.now();
    const totalMs = event.timerSeconds * 1000;

    function tick() {
      if (chosen) return;
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalMs - elapsed);
      const seconds = Math.ceil(remaining / 1000);
      const progress = elapsed / totalMs;

      // Update ring
      progressCircle.style.strokeDashoffset = (progress * circumference).toString();
      
      // Update text
      timerText.textContent = `${seconds}s`;
      if (seconds <= 3) {
        timerText.classList.add('urgent');
        progressCircle.style.stroke = 'var(--color-danger)';
      }

      if (remaining <= 0) {
        if (!chosen) {
          chosen = true;
          overlay.remove();
          onChoice(event.defaultChoice);
        }
        return;
      }

      // Sound cues
      if (seconds <= 3 && Math.abs(remaining - seconds * 1000) < 60) {
        Sound.play('timer_urgent');
      } else if (Math.abs(remaining - seconds * 1000) < 60 && seconds <= 7) {
        Sound.play('timer');
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // === v4: YEAR-END SUMMARY — reveals decision outcomes ===
  function showYearEndSummary(state, outcomes, onContinue) {
    Sound.play('reveal');
    const overlay = document.createElement('div');
    overlay.className = 'event-overlay';

    const netImpact = outcomes.reduce((sum, o) => {
      let impact = 0;
      if (o.impact.cashImpact) impact += o.impact.cashImpact;
      if (o.impact.salaryImpact) impact += o.impact.salaryImpact * 12;
      if (o.impact.monthlyCostIncrease) impact -= o.impact.monthlyCostIncrease * 12;
      return sum + impact;
    }, 0);

    overlay.innerHTML = `<div class="event-card year-end-card">
      <div class="event-icon neutral">📊</div>
      <div class="event-title">Year ${state.currentYear} — Decision Outcomes</div>
      <div class="year-end-results">
        ${state.lifestyleAbsorbed > 0 ? `
          <div class="year-end-item">
            <div class="year-end-item-header"><span>🛒 Cost of living</span></div>
            <div class="year-end-item-desc">Day-to-day life — groceries, transport, school fees, the unexpected — absorbed ${fmt(state.lifestyleAbsorbed)} of this year's surplus. Real reserves grow slowly.</div>
          </div>
        ` : ''}
        ${outcomes.length === 0 ? '<p class="text-muted" style="font-size:14px;">You didn\'t make any decisions this year.</p>' : ''}
        ${outcomes.map(o => `
          <div class="year-end-item ${o.isPositive ? 'positive' : 'negative'}">
            <div class="year-end-item-header">
              <span>${o.icon} ${o.label}</span>
              <span class="${o.isPositive ? 'text-green' : 'text-red'}">${o.isPositive ? '✓ Positive' : '✗ Negative'}</span>
            </div>
            <div class="year-end-item-desc">${o.description}</div>
            <div class="year-end-item-impact ${o.isPositive ? 'text-green' : 'text-red'}">
              ${formatImpact(o.impact)}
            </div>
          </div>
        `).join('')}
      </div>
      ${outcomes.length > 0 ? `
        <div class="year-end-net ${netImpact >= 0 ? 'positive' : 'negative'}">
          <span>Net Financial Impact</span>
          <span class="${netImpact >= 0 ? 'text-green' : 'text-red'}" style="font-weight:700;font-size:1.1rem;">${netImpact >= 0 ? '+' : ''}${fmt(netImpact)}</span>
        </div>
      ` : ''}
      <button class="btn btn-primary btn-lg btn-block" id="btn-continue-year">Continue</button>
    </div>`;

    overlay.querySelector('#btn-continue-year').addEventListener('click', () => {
      Sound.play('click');
      overlay.remove();
      onContinue();
    });

    document.body.appendChild(overlay);
  }

  function formatImpact(impact) {
    const parts = [];
    if (impact.cashImpact) parts.push(`${impact.cashImpact >= 0 ? '+' : ''}${fmt(impact.cashImpact)} cash`);
    if (impact.salaryImpact) parts.push(`${impact.salaryImpact >= 0 ? '+' : ''}${fmt(impact.salaryImpact)}/mo salary`);
    if (impact.monthlyCostIncrease) parts.push(`${impact.monthlyCostIncrease >= 0 ? '+' : ''}${fmt(impact.monthlyCostIncrease)}/mo costs`);
    return parts.join(' | ') || 'No financial impact';
  }

  // === v4: BANK EXTENSION OFFER ===
  function showBondExtensionOffer(state, onChoice) {
    Sound.play('bank');
    const overlay = document.createElement('div');
    overlay.className = 'event-overlay';
    const newPayment = Math.round(Engine.calcMonthlyPayment(state.balance, state.interestRate, (state.loanTermMonths - state.currentYear * 12 + 60) / 12));
    const saving = state.minPayment - newPayment;

    overlay.innerHTML = `<div class="event-card">
      <div class="event-icon neutral">🏦</div>
      <div class="event-title">Bank Offer: Extend Your Bond</div>
      <div class="event-desc">
        Your bank noticed you might benefit from extending your bond by 5 years. 
        Lower monthly payments, but you'll pay more interest overall.
      </div>
      <div class="stat-grid" style="grid-template-columns:repeat(2,1fr);margin:var(--space-3) 0;">
        <div class="stat-card"><span class="label">Current Payment</span><span class="value">${fmt(state.minPayment)}/mo</span></div>
        <div class="stat-card"><span class="label">New Payment</span><span class="value text-green">${fmt(newPayment)}/mo</span></div>
        <div class="stat-card"><span class="label">Monthly Saving</span><span class="value text-green">${fmt(saving)}/mo</span></div>
        <div class="stat-card"><span class="label">Extra Interest</span><span class="value text-red">+${fmt(Math.round(saving * 60 * 0.6))}</span></div>
      </div>
      <div class="event-choices">
        <button class="btn btn-primary btn-block" data-choice="accept">Accept Extension</button>
        <button class="btn btn-outline btn-block" data-choice="decline">Decline — Keep Current Term</button>
      </div>
    </div>`;

    overlay.querySelector('[data-choice="accept"]').addEventListener('click', () => {
      Sound.play('click');
      overlay.remove();
      onChoice(true);
    });
    overlay.querySelector('[data-choice="decline"]').addEventListener('click', () => {
      Sound.play('click');
      overlay.remove();
      onChoice(false);
    });

    document.body.appendChild(overlay);
  }

  function showAchievement(a) {
    Sound.play('achievement');
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--color-surface-2);border:1px solid var(--color-gold);border-radius:var(--radius-lg);padding:var(--space-3) var(--space-5);display:flex;align-items:center;gap:var(--space-3);z-index:150;animation:slideUp 400ms ease;box-shadow:0 0 30px rgba(217,180,74,0.25);font-family:var(--font-body);';
    t.innerHTML = `<span style="font-size:28px;">${a.icon}</span><div><div style="font-weight:700;font-size:14px;color:var(--color-gold);">Achievement Unlocked</div><div style="font-size:13px;color:var(--color-text);">${a.title}</div></div>`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  // === VICTORY ===
  // v5: Shared score report — itemized breakdown + coaching
  function renderScoreReport(state) {
    const bd = Engine.getScoreBreakdown(state);
    return `
      <div class="score-report" style="max-width:460px;width:100%;text-align:left;">
        <h3 class="heading-sm" style="margin-bottom:var(--space-3);">Why you scored ${state.score}/100</h3>
        <div class="score-lines">
          ${bd.items.map(it => `
            <div class="score-line ${it.base ? 'base' : it.penalty ? 'penalty' : it.pts > 0 ? 'plus' : 'minus'}">
              <span>${it.label}</span>
              <span class="score-line-pts">${it.penalty ? '×0.3' : (it.pts > 0 ? '+' : '') + it.pts}</span>
            </div>
          `).join('')}
          <div class="score-line total"><span>Final score</span><span class="score-line-pts">${bd.total}/100</span></div>
        </div>
        ${bd.strengths.length > 0 ? `
          <h3 class="heading-sm" style="margin:var(--space-4) 0 var(--space-2);">What you did well</h3>
          <div class="coach-list coach-good">${bd.strengths.map(s => `<div class="coach-item">${s}</div>`).join('')}</div>
        ` : ''}
        ${bd.improvements.length > 0 ? `
          <h3 class="heading-sm" style="margin:var(--space-4) 0 var(--space-2);">Where you could improve</h3>
          <div class="coach-list coach-improve">${bd.improvements.map(s => `<div class="coach-item">${s}</div>`).join('')}</div>
        ` : ''}
      </div>
    `;
  }

  function renderDisclaimer() {
    return `
      <p class="disclaimer-note" style="max-width:460px;">
        Home Run is an interactive learning simulation. All amounts, rates, and outcomes are illustrative
        estimates — nothing here is financial, legal, or tax advice. For real property decisions,
        speak to a registered financial adviser.
      </p>
    `;
  }

  function renderVictory(state, onRestart) {
    const yearsSaved = Math.max(0, state.loanTermYears - state.currentYear);
    const earlySettlement = yearsSaved > 0;
    if (earlySettlement) {
      Sound.play('fanfare');
      confetti(260, 240);
      setTimeout(() => confetti(180, 200), 800);
    } else {
      Sound.play('victory');
      confetti();
    }
    const rating = Engine.getScoreRating(state.score);
    
    // Mock leaderboard
    const leaderboard = [
      { name: 'Financial Guru', score: 92, years: 12 },
      { name: 'Smart Saver', score: 78, years: 16 },
      { name: 'You', score: state.score, years: state.currentYear, isPlayer: true },
      { name: 'Average Joe', score: 52, years: 20 },
      { name: 'Debt Lover', score: 31, years: 25 },
    ].sort((a, b) => b.score - a.score);

    app().innerHTML = `
      <div class="victory-screen">
        <div class="victory-icon">🏆</div>
        <h1 class="heading-xl">HOME <span class="text-green">RUN!</span></h1>
        ${earlySettlement ? `<div class="badge badge-amber" style="border-color:var(--color-gold);color:var(--color-gold);background:var(--color-gold-glow);font-size:13px;padding:4px 12px;">Early Settlement — ${yearsSaved} year${yearsSaved === 1 ? '' : 's'} ahead of schedule</div>` : ''}
        <p class="text-muted" style="max-width:400px;">
          Bond paid off in ${state.currentYear} years${earlySettlement ? `, ${yearsSaved} year${yearsSaved === 1 ? '' : 's'} before your ${state.loanTermYears}-year term` : ''}.
        </p>
        
        <div class="score-rating-ring" style="--score-color:${rating.color};">
          <div class="score-ring-value">${state.score}</div>
          <div class="score-ring-label">/100</div>
          <div class="score-ring-rating" style="color:${rating.color};">${rating.emoji} ${rating.label}</div>
        </div>
        
        <div class="score-grid">
          <div class="score-item"><div class="label">Price Discount</div><div class="value-lg text-green">${state.discountPct.toFixed(1)}%</div></div>
          <div class="score-item"><div class="label">Interest Saved (price)</div><div class="value-lg text-green">${fmt(state.interestSavedFromPrice)}</div></div>
          <div class="score-item"><div class="label">Interest Saved (rate)</div><div class="value-lg text-green">${fmt(state.interestSavedFromRate)}</div></div>
          <div class="score-item"><div class="label">Total Interest Paid</div><div class="value-lg text-red">${fmt(state.totalInterestPaid)}</div></div>
          <div class="score-item"><div class="label">Ownership & Living Costs</div><div class="value-lg text-amber">${fmt(state.totalOwnershipCostsPaid)}</div></div>
          <div class="score-item"><div class="label">Property Value</div><div class="value-lg">${fmt(state.propertyValue)}</div></div>
          <div class="score-item"><div class="label">Events Survived</div><div class="value-lg">${state.events.length}</div></div>
          <div class="score-item"><div class="label">Investments Returns</div><div class="value-lg text-green">${fmt(state.totalInvestmentReturns || 0)}</div></div>
        </div>
        
        ${state.totalBorrowed > 0 ? `<p class="text-red" style="font-size:14px;">You borrowed ${fmt(state.totalBorrowed)} from the bank during your journey.</p> ` : ''}
        
        ${renderScoreReport(state)}
        
        <div class="leaderboard" style="max-width:420px;width:100%;">
          <h3 class="heading-sm" style="margin-bottom:var(--space-1);text-align:left;">Benchmarks</h3>
          <p class="tip" style="margin-bottom:var(--space-3);text-align:left;">Example scores for comparison — not real players.</p>
          ${leaderboard.map((p, i) => `
            <div class="leaderboard-row ${p.isPlayer ? 'is-player' : ''}">
              <span class="leaderboard-rank">#${i+1}</span>
              <span class="leaderboard-name">${p.name}</span>
              <span class="leaderboard-score">${p.score}/100</span>
              <span class="leaderboard-years">${p.years}yr</span>
            </div>
          `).join('')}
        </div>
        
        ${state.achievements.length > 0 ? `<div style="max-width:420px;width:100%;"><h3 class="heading-sm" style="margin-bottom:var(--space-3);text-align:left;">Achievements (${state.achievements.length})</h3>
          <div class="stack gap-2">${state.achievements.map(a => `<div class="row gap-2" style="font-size:14px;"><span>${a.icon}</span><span style="font-weight:600;">${a.title}</span></div>`).join('')}</div></div>` : ''}
        
        <div class="bankerx-signup bankerx-glow" style="margin-top:var(--space-4);">
          <a href="https://www.bankerx.org/join" target="_blank" rel="noopener">📧 Join the BANKERX community</a>
        </div>
        <div class="row gap-3" style="margin-top:var(--space-3);flex-wrap:wrap;justify-content:center;">
          <button class="btn btn-primary btn-lg" id="btn-restart">Play Again</button>
          <button class="btn btn-outline btn-lg" id="btn-share">Share My Score</button>
        </div>
        ${renderDisclaimer()}
        <div class="powered-by-footer">
          Engineered by <a href="https://www.bankerx.org/" target="_blank" rel="noopener">BANKERX</a> <span class="text-faint">· v10</span>
        </div>
      </div>
    `;
    $('#btn-restart').addEventListener('click', () => { Sound.play('click'); onRestart(); });
    $('#btn-share')?.addEventListener('click', (e) => { Sound.play('click'); shareScore(state, e.currentTarget); });
  }

  // === GAME OVER ===
  function renderGameOver(state, onRestart) {
    Sound.play('gameover');
    const reason = state.lossReason === 'underwater' 
      ? 'You were financially underwater for too long. The bank has flagged your account.'
      : 'You ran out of money. The bank has begun repossession proceedings.';
    const rating = Engine.getScoreRating(state.score);
    
    // Leaderboard with player score
    const leaderboard = [
      { name: 'Financial Guru', score: 92, years: 12 },
      { name: 'Smart Saver', score: 78, years: 16 },
      { name: 'You', score: state.score, years: state.currentYear, isPlayer: true },
      { name: 'Average Joe', score: 52, years: 20 },
      { name: 'Debt Lover', score: 31, years: 25 },
    ].sort((a, b) => b.score - a.score);

    app().innerHTML = `
      <div class="gameover-screen">
        <div class="gameover-icon">💸</div>
        <h1 class="heading-xl">Game <span class="text-red">Over</span></h1>
        <p class="text-muted" style="max-width:400px;">${reason}</p>
        <p style="font-size:14px;max-width:400px;color:var(--color-text-muted);line-height:1.6;">
          Qualifying does not mean affordability. The true cost of home ownership extends beyond loan repayments. The extras add up!!
        </p>
        
        <div class="score-rating-ring" style="--score-color:${rating.color};">
          <div class="score-ring-value">${state.score}</div>
          <div class="score-ring-label">/100</div>
          <div class="score-ring-rating" style="color:${rating.color};">${rating.emoji} ${rating.label}</div>
        </div>
        
        <div class="score-grid">
          <div class="score-item"><div class="label">Survived</div><div class="value-lg">${state.currentYear} years</div></div>
          <div class="score-item"><div class="label">Balance Left</div><div class="value-lg text-red">${fmt(state.balance)}</div></div>
          <div class="score-item"><div class="label">Final Underwater</div><div class="value-lg text-red">${state.underwaterLevel}%</div></div>
          <div class="score-item"><div class="label">Property Value</div><div class="value-lg">${fmt(state.propertyValue)}</div></div>
        </div>
        
        ${renderScoreReport(state)}
        
        <div class="leaderboard" style="max-width:420px;width:100%;">
          <h3 class="heading-sm" style="margin-bottom:var(--space-1);text-align:left;">Benchmarks</h3>
          <p class="tip" style="margin-bottom:var(--space-3);text-align:left;">Example scores for comparison — not real players.</p>
          ${leaderboard.map((p, i) => `
            <div class="leaderboard-row ${p.isPlayer ? 'is-player' : ''}">
              <span class="leaderboard-rank">#${i+1}</span>
              <span class="leaderboard-name">${p.name}</span>
              <span class="leaderboard-score">${p.score}/100</span>
              <span class="leaderboard-years">${p.years}yr</span>
            </div>
          `).join('')}
        </div>
        
        <div class="bankerx-signup bankerx-glow" style="margin-top:var(--space-4);">
          <a href="https://www.bankerx.org/join" target="_blank" rel="noopener">📧 Join the BANKERX community</a>
        </div>
        <div class="row gap-3" style="margin-top:var(--space-3);flex-wrap:wrap;justify-content:center;">
          <button class="btn btn-danger btn-lg" id="btn-restart">Try Again</button>
          <button class="btn btn-outline btn-lg" id="btn-share">Share My Score</button>
        </div>
        ${renderDisclaimer()}
        <div class="powered-by-footer">
          Engineered by <a href="https://www.bankerx.org/" target="_blank" rel="noopener">BANKERX</a> <span class="text-faint">· v10</span>
        </div>
      </div>
    `;
    $('#btn-restart').addEventListener('click', () => { Sound.play('click'); onRestart(); });
    $('#btn-share')?.addEventListener('click', (e) => { Sound.play('click'); shareScore(state, e.currentTarget); });
  }

  // === v4.1: DROWNING POPUP — "bet you wish you rented huh?" ===
  function showRentPopup(onDismiss) {
    Sound.play('warning');
    const overlay = document.createElement('div');
    overlay.className = 'event-overlay rent-popup-overlay';
    overlay.innerHTML = `<div class="event-card rent-popup-card">
      <div class="event-icon bad" style="font-size:40px;">🏠💦</div>
      <div class="event-title" style="font-size:1.4rem;">Bet you wish you rented, huh?</div>
      <div class="event-desc" style="font-size:15px;line-height:1.7;">
        Your debt is piling up. The bond feels like a ball and chain. 
        Maybe a cozy rental with zero maintenance stress sounds pretty good right now...
      </div>
      <div style="padding:var(--space-3);background:var(--color-surface-2);border-radius:var(--radius-md);margin-bottom:var(--space-4);font-size:14px;color:var(--color-text-muted);">
        💡 Remember: equity is built over time. Stay the course and make smart decisions.
      </div>
      <button class="btn btn-primary btn-lg btn-block" id="btn-dismiss-rent">💪 I'm staying!</button>
    </div>`;
    overlay.querySelector('#btn-dismiss-rent').addEventListener('click', () => {
      Sound.play('click');
      overlay.remove();
      if (onDismiss) onDismiss();
    });
    document.body.appendChild(overlay);
  }

  return { renderGame, renderVictory, renderGameOver, showEvent, showTimedEvent, showYearEndSummary, showBondExtensionOffer, showAchievement, showRentPopup, mountSoundToggle, mountHelpButton, showHowToPlay };
})();
