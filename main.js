/* ============================================
   HOME RUN v11 — Main Game Loop
   Year-end reveal, cash banking, bond extensions,
   decision toggle, investments, drowning popup
   ============================================ */

(function () {
  const GAME_VERSION = 'v11';
  const SAVE_KEY = 'homerun_save_v11';
  let state = null;
  let setupCtx = {};

  // === v10: Save / resume ===
  function saveGame() {
    if (!state || state.phase !== 'playing') return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ v: GAME_VERSION, prime: SA.PRIME_RATE, state }));
    } catch (e) {}
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.v !== GAME_VERSION || !data.state || data.state.phase !== 'playing') return null;
      return data;
    } catch (e) { return null; }
  }
  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  }
  function resumeGame(saved) {
    Sound.init();
    UI.mountSoundToggle();
    UI.mountHelpButton(() => UI.showHowToPlay());
    if (saved.prime) SA.setPrimeRate(saved.prime);
    state = saved.state;
    renderCurrentState();
  }

  function startGame() {
    Sound.init();
    UI.mountSoundToggle();
    state = null;
    setupCtx = {};
    Phases.renderIntro(document.getElementById('app'), onIntroComplete);
    // Offer to resume a game in progress
    const saved = loadSave();
    if (saved) {
      const app = document.getElementById('app');
      const banner = document.createElement('div');
      banner.className = 'panel resume-banner';
      banner.innerHTML = `
        <div class="row-between gap-3" style="flex-wrap:wrap;">
          <div>
            <div class="heading-sm">Game in progress</div>
            <div style="font-size:14px;">Year ${saved.state.currentYear} — bond balance ${SA.fmt(saved.state.balance)}</div>
          </div>
          <div class="row gap-2">
            <button class="btn btn-primary btn-sm" id="btn-resume-save">Resume</button>
            <button class="btn btn-outline btn-sm" id="btn-discard-save">Discard</button>
          </div>
        </div>`;
      app.prepend(banner);
      banner.querySelector('#btn-resume-save').addEventListener('click', () => { Sound.play('click'); resumeGame(saved); });
      banner.querySelector('#btn-discard-save').addEventListener('click', () => { Sound.play('click'); clearSave(); banner.remove(); });
    }
  }

  function onIntroComplete(ctx) {
    setupCtx = ctx;
    Phases.renderPriceNegotiation(document.getElementById('app'), setupCtx, onPriceNegotiated);
  }

  function onPriceNegotiated(ctx) {
    setupCtx = ctx;
    Phases.renderRateNegotiation(document.getElementById('app'), setupCtx, onRateNegotiated);
  }

  function onRateNegotiated(ctx) {
    setupCtx = ctx;
    Phases.renderBudgetAllocation(document.getElementById('app'), setupCtx, onBudgetAllocated);
  }

  function onBudgetAllocated(ctx) {
    setupCtx = ctx;
    Phases.renderTermSelection(document.getElementById('app'), setupCtx, onTermSelected);
  }

  function onTermSelected(ctx) {
    setupCtx = ctx;
    state = Engine.createGameState({
      finalPrice: ctx.finalPrice,
      originalPrice: ctx.originalPrice,
      discountPct: ctx.discountPct,
      lendingRate: ctx.lendingRate,
      deposit: ctx.deposit,
      loanTerm: ctx.loanTerm,
      netSalary: ctx.netSalary,
      budgetAllocations: ctx.budgetAllocations,
      savings: ctx.savings,
      remainingSavings: ctx.remainingSavings,
      addedToLoan: ctx.addedToLoan,
    });

    // Generate first year's decisions
    state.decisionsThisYear = GameEvents.getYearlyDecisions(state, 4);
    UI.mountHelpButton(() => UI.showHowToPlay());
    renderCurrentState();
    // v10: how-to-play on the first ever game (reopen any time via the ? button)
    let seen = false;
    try { seen = localStorage.getItem('homerun_seen_howto') === 'yes'; } catch (e) {}
    if (!seen) {
      UI.showHowToPlay();
      try { localStorage.setItem('homerun_seen_howto', 'yes'); } catch (e) {}
    }
  }

  function renderCurrentState() {
    if (!state) return;
    if (state.phase === 'won') { clearSave(); UI.renderVictory(state, startGame); return; }
    if (state.phase === 'lost') { clearSave(); UI.renderGameOver(state, startGame); return; }
    saveGame();
    UI.renderGame(state, {
      onDecisionToggle: handleDecisionToggle,
      onNextYear: handleNextYear,
      onBankCash: handleBankCash,
      onPayExtra: handlePayExtra,
      onBorrow: handleBorrow,
      onExtend: handleExtend,
      onInvest: handleInvest,
    });
  }

  function handleDecisionToggle(idx) {
    if (!state) return;
    // Already toggled in state.decisionsThisYear by the UI
    renderCurrentState();
  }

  function handleBankCash(amount) {
    if (!state) return;
    Engine.bankCash(state, amount);
    Sound.play('bank');
    renderCurrentState();
  }

  function handlePayExtra(amount) {
    if (!state) return;
    Engine.payExtraFromCash(state, amount);
    Sound.play('payment');
    if (state.phase === 'won') Engine.checkAchievements(state);
    updateScore();
    renderCurrentState();
  }

  function handleNextYear() {
    if (!state || state.phase !== 'playing') return;

    // Step 1: Process the year (income, expenses, mortgage)
    Engine.processYear(state, 0); // No extra payment during year processing
    const newAchievements = Engine.checkAchievements(state);
    updateScore();

    if (state.underwaterLevel >= 70) Sound.play('warning');

    // Step 2: If game ended, stop here
    if (state.phase !== 'playing') {
      newAchievements.forEach((a, i) => setTimeout(() => UI.showAchievement(a), i * 800));
      renderCurrentState();
      return;
    }

    // Step 3: Resolve decision outcomes and show year-end summary
    const outcomes = Engine.resolveDecisions(state);
    
    // Show year-end summary with decision outcomes
    UI.showYearEndSummary(state, outcomes, () => {
      // Step 4: After year-end summary, check for events
      afterYearEnd(newAchievements);
    });
  }

  function afterYearEnd(newAchievements) {
    // Reset decisions for next year
    state.decisionsThisYear = GameEvents.getYearlyDecisions(state, 4);
    state.decisionOutcomes = [];
    
    // v4.1: Process investment returns
    Engine.processInvestments(state);
    
    // v4.1: Drowning popup — once per game when underwater >= 70
    if (state.underwaterLevel >= 70 && !state.shownRentPopup) {
      state.shownRentPopup = true;
      UI.showRentPopup(() => {
        continueAfterYearEnd(newAchievements);
      });
      return;
    }
    
    continueAfterYearEnd(newAchievements);
  }
  
  function continueAfterYearEnd(newAchievements) {
    // Check for bond extension offer (v4)
    if (GameEvents.shouldOfferExtension(state)) {
      UI.showBondExtensionOffer(state, (accepted) => {
        if (accepted) {
          Engine.extendLoan(state, 5);
          Sound.play('bank');
        }
        // Then continue to events
        checkForEvents(newAchievements);
      });
      return;
    }

    checkForEvents(newAchievements);
  }

  function checkForEvents(newAchievements) {
    // Check for timed event first
    if (GameEvents.shouldTriggerTimedEvent(state)) {
      const timedEvent = GameEvents.getTimedEvent(state);
      if (timedEvent) {
        state.events.push(timedEvent);
        state.yearsSinceTimedEvent = 0;
        renderCurrentState();
        setTimeout(() => {
          UI.showTimedEvent(timedEvent, (choiceIdx) => {
            const chosen = timedEvent.choices[choiceIdx];
            if (chosen.apply._lumpSum) {
              state.balance = Math.max(0, state.balance - chosen.apply._lumpSum);
              state.totalExtraPaid += chosen.apply._lumpSum;
              state.totalPrincipalPaid += chosen.apply._lumpSum;
            }
            Engine.applyEvent(state, chosen.apply);
            triggerRegularEvent(newAchievements);
          });
        }, 400);
        return;
      }
    }

    triggerRegularEvent(newAchievements);
  }

  function triggerRegularEvent(newAchievements) {
    if (GameEvents.shouldTriggerYearly(state)) {
      const event = GameEvents.getEvent(state);
      if (event) {
        state.events.push(event);

        // v4: Check if this is an emergency (ownershipCostSpike) and player has no banked cash
        if (event.ownershipCostSpike && event.ownershipCostSpike > 0) {
          const emergencyResult = handleEmergencyEvent(event);
          renderCurrentState();
          setTimeout(() => {
            showEmergencyResult(event, emergencyResult, () => {
              newAchievements.forEach((a, i) => setTimeout(() => UI.showAchievement(a), (i + 1) * 800));
              renderCurrentState();
            });
          }, 300);
          return;
        }

        renderCurrentState();
        setTimeout(() => {
          UI.showEvent(event, (result) => {
            if (event.choices) {
              if (result._lumpSum) {
                state.balance = Math.max(0, state.balance - result._lumpSum);
                state.totalExtraPaid += result._lumpSum;
                state.totalPrincipalPaid += result._lumpSum;
              }
              Engine.applyEvent(state, result);
            } else {
              Engine.applyEvent(state, event);
            }
            newAchievements.forEach((a, i) => setTimeout(() => UI.showAchievement(a), (i + 1) * 800));
            renderCurrentState();
          });
        }, 300);
        return;
      }
    }

    newAchievements.forEach((a, i) => setTimeout(() => UI.showAchievement(a), i * 800));
    renderCurrentState();
  }

  // v4: Handle emergency events with banking system
  function handleEmergencyEvent(event) {
    const cost = event.ownershipCostSpike;
    if (state.bankedCash >= cost) {
      // Covered by banked cash
      state.bankedCash -= cost;
      // Don't apply the ownershipCostSpike since we paid from bank
      // But we still need to apply other impacts
      const modifiedEvent = { ...event, ownershipCostSpike: 0 };
      Engine.applyEvent(state, modifiedEvent);
      return { method: 'banked', cost, borrowed: 0 };
    } else if (state.bankedCash > 0) {
      // Partially covered
      const fromBank = state.bankedCash;
      const shortfall = cost - fromBank;
      state.bankedCash = 0;
      Engine.applyEvent(state, event);
      // Borrow the shortfall
      Engine.borrowFromBank(state, shortfall);
      return { method: 'partial', cost, fromBanked: fromBank, borrowed: shortfall };
    } else {
      // No banked cash — must borrow everything
      Engine.applyEvent(state, event);
      Engine.borrowFromBank(state, cost);
      return { method: 'borrowed', cost, borrowed: cost };
    }
  }

  function showEmergencyResult(event, result, onDone) {
    Sound.play(result.method === 'banked' ? 'bank' : 'bad_event');
    const overlay = document.createElement('div');
    overlay.className = 'event-overlay';
    const typeClass = result.method === 'banked' ? 'good' : 'bad';

    let resultHtml;
    if (result.method === 'banked') {
      resultHtml = `
        <div class="event-impact text-green">
          Emergency covered by your banked cash!<br>
          -${SA.fmt(result.cost)} from banked reserves
        </div>
      `;
    } else if (result.method === 'partial') {
      resultHtml = `
        <div class="event-impact text-amber">
          Banked cash covered ${SA.fmt(result.fromBanked)}.<br>
          Had to borrow ${SA.fmt(result.borrowed)} — added to your bond.
        </div>
      `;
    } else {
      resultHtml = `
        <div class="event-impact text-red">
          No banked cash available!<br>
          Borrowed ${SA.fmt(result.borrowed)} from the bank — added to your bond.
        </div>
      `;
    }

    overlay.innerHTML = `<div class="event-card">
      <div class="event-icon ${typeClass}">${event.icon}</div>
      <div class="event-title">${event.title}</div>
      <div class="event-desc">${typeof event.desc === 'function' ? event.desc(state) : event.desc}</div>
      <div class="event-impact">${event.impactText}</div>
      ${resultHtml}
      <button class="btn ${result.method === 'banked' ? 'btn-primary' : 'btn-danger'} btn-lg btn-block" id="btn-dismiss-emergency">
        ${result.method === 'banked' ? 'Covered!' : 'Deal With It'}
      </button>
    </div>`;

    overlay.querySelector('#btn-dismiss-emergency').addEventListener('click', () => {
      Sound.play('click');
      overlay.remove();
      onDone();
    });
    document.body.appendChild(overlay);
  }

  function handleBorrow(amount) {
    if (!state) return;
    Engine.borrowFromBank(state, amount);
    Sound.play('bad_event');
    updateScore();
    renderCurrentState();
  }

  function handleExtend(years) {
    if (!state) return;
    Engine.extendLoan(state, years);
    Sound.play('bad_event');
    updateScore();
    renderCurrentState();
  }

  // v4.1: Investment handler
  function handleInvest(invId) {
    if (!state) return;
    const invOption = [  
      { id: 'money_market', name: 'Money Market Fund', returnRate: 0.07, risk: 'Low', termYears: 1 },
      { id: 'rsa_retail', name: 'RSA Retail Bond', returnRate: 0.10, risk: 'Low', termYears: 3 },
      { id: 'equity_fund', name: 'Equity Fund (JSE)', returnRate: 0.12, risk: 'Medium', termYears: 3 },
      { id: 'property_reit', name: 'Property REIT', returnRate: 0.09, risk: 'Medium', termYears: 2 },
      { id: 'tax_free', name: 'Tax-Free Savings', returnRate: 0.08, risk: 'Low', termYears: 2 },
    ].find(o => o.id === invId);
    if (!invOption) return;
    
    const investAmount = Math.min(Math.round(state.cashOnHand * 0.5), state.cashOnHand);
    if (investAmount < 5000) return;
    
    state.cashOnHand -= investAmount;
    state.investments.push({
      ...invOption,
      amount: investAmount,
      yearInvested: state.currentYear,
    });
    Sound.play('bank');
    renderCurrentState();
  }

  function updateScore() {
    // v4.1: Use Engine.calculateScore for a proper 0-100 score
    state.score = Engine.calculateScore(state);
  }

  // Testing hooks
  window.getGameState = () => state;
  window.render_game_to_text = () => {
    if (!state) return JSON.stringify({ phase: 'setup' });
    return JSON.stringify({
      phase: state.phase, year: state.currentYear, balance: Math.round(state.balance),
      cash: Math.round(state.cashOnHand), rate: state.interestRate, minPay: Math.round(state.minPayment),
      salary: state.monthlyNetSalary, underwater: state.underwaterLevel, equity: Math.round(state.equity),
      score: state.score, events: state.events.length, achievements: state.achievements.length,
      affordability: state.affordabilityRatio?.toFixed(1), surplus: Math.round(state.monthlySurplus || 0),
      discountPct: state.discountPct, negotiatedRate: state.negotiatedRate,
      totalBorrowed: state.totalBorrowed, loanExtensions: state.loanExtensions,
      bankedCash: state.bankedCash, decisionsChosen: state.decisionsThisYear?.filter(d => d.chosen).length || 0,
    });
  };

  startGame();
})();
