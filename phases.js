/* ============================================
   HOME RUN v4 — Setup Phases
   Rebranded intro, auto savings = 6x salary,
   affordability rating, seller always rejects first
   ============================================ */

const Phases = (() => {
  const fmt = SA.fmt;

  // ==========================================
  // PHASE 0: PLAYER PROFILE — v4: new intro, auto savings
  // ==========================================
  function renderIntro(container, onNext) {
    let netSalary = 40000;
    let targetProperty = 1500000;

    function getAffordability() {
      const bondAmount = targetProperty * 0.9;
      const monthlyPayment = Engine.calcMonthlyPayment(bondAmount, SA.PRIME_RATE, 20);
      const ratio = monthlyPayment / netSalary * 100;
      return Engine.getAffordabilityRating(ratio);
    }

    function render() {
      const savings = netSalary * 1; // v8: 1 month of net salary — thin, realistic reserves
      const affordability = getAffordability();
      const bondAmount = targetProperty * 0.9;
      const monthlyPayment = Engine.calcMonthlyPayment(bondAmount, SA.PRIME_RATE, 20);

      container.innerHTML = `
        <div class="phase-screen">
          <div class="phase-hero">
            <div class="bankerx-presents">BANKERX presents</div>
            <div class="hero-icon">🏠</div>
            <h1 class="heading-xl">HOME<br><span class="text-green">RUN</span></h1>
            <p class="subtitle" style="font-size:1.1rem;font-weight:600;color:var(--color-primary);margin-top:var(--space-2);">
              Congrats!! You're about to buy a new home
            </p>
            <p class="subtitle">An interactive home ownership simulation. Navigate the full journey of buying a home in South Africa — negotiate, budget, and survive the yearly grind of home ownership.</p>
          </div>
          <div class="panel phase-content">
            <h3 class="heading-md">Set Up Your Profile</h3>

            <!-- Net Salary Slider -->
            <div class="slider-group" style="margin-bottom:var(--space-4);">
              <div class="slider-header">
                <label class="label">Monthly Salary (after tax)</label>
                <span class="value-lg" id="salary-display">${fmt(netSalary)}</span>
              </div>
              <input type="range" class="slider" id="salary-slider" 
                min="5000" max="150000" step="2500" value="${netSalary}">
              <div class="row-between" style="font-size:12px;color:var(--color-text-faint);">
                <span>R 5,000</span>
                <span>R 150,000</span>
              </div>
            </div>

            <!-- Auto Savings Display (v4: not adjustable) -->
            <div class="panel" style="background:var(--color-surface-2);padding:var(--space-3);margin-bottom:var(--space-4);">
              <div class="row-between">
                <span class="label">Total Savings (1 month salary)</span>
                <span class="value-lg text-green" id="savings-display">${fmt(savings)}</span>
              </div>
              <p class="tip" style="margin-top:var(--space-1);">Your savings are set to 1 month of net salary — most buyers start with thin reserves. Costs you can't cover get added to your bond.</p>
            </div>

            <!-- Target Property Slider -->
            <div class="slider-group" style="margin-bottom:var(--space-4);">
              <div class="slider-header">
                <label class="label">Target Property Value</label>
                <span class="value-lg" id="property-display">${fmt(targetProperty)}</span>
              </div>
              <input type="range" class="slider" id="property-slider" 
                min="500000" max="5000000" step="50000" value="${targetProperty}">
              <div class="row-between" style="font-size:12px;color:var(--color-text-faint);">
                <span>R 500k</span>
                <span>R 5M</span>
              </div>
            </div>

            <!-- v6: Adjustable prime rate -->
            <div class="slider-group" style="margin-bottom:var(--space-4);">
              <div class="slider-header">
                <label class="label">Prime Rate (SARB — adjustable)</label>
                <span class="value-lg" id="prime-display">${SA.PRIME_RATE.toFixed(2)}%</span>
              </div>
              <input type="range" class="slider" id="prime-slider" 
                min="7" max="15" step="0.25" value="${SA.PRIME_RATE}">
              <div class="row-between" style="font-size:12px;color:var(--color-text-faint);">
                <span>7.00%</span>
                <span>15.00%</span>
              </div>
              <p class="tip" style="margin-top:var(--space-1);">The prime lending rate changes over time — set it to match today's rate.</p>
            </div>

            <!-- Affordability Rating (v4: replaces DTI) -->
            <div class="panel" style="background:var(--color-surface-2);padding:var(--space-3);margin-bottom:var(--space-4);border-left:3px solid ${affordability.color};">
              <div class="row-between" style="margin-bottom:var(--space-1);">
                <span class="heading-sm" style="text-transform:none;font-size:14px;">Affordability Rating</span>
                <span class="value" style="color:${affordability.color};font-size:1rem;">${affordability.label}</span>
              </div>
              <div class="progress-bar" style="height:8px;margin-bottom:var(--space-2);">
                <div class="progress-fill" style="width:${Math.min(100, (monthlyPayment / netSalary * 100) / 50 * 100)}%;background:${affordability.color};"></div>
              </div>
              <p class="text-muted" style="font-size:13px;">
                Est. bond payment: <strong>${fmt(monthlyPayment)}/mo</strong> 
                (${(monthlyPayment / netSalary * 100).toFixed(0)}% of salary)
              </p>
            </div>

            ${affordability.level === 'danger' ? `
              <div class="warning-banner warning-red" style="margin-bottom:var(--space-4);">
                ⚠️ Banks will likely decline this loan. Increase your salary or lower the property value.
              </div>
            ` : affordability.level === 'warning' ? `
              <div class="warning-banner warning-red" style="margin-bottom:var(--space-4);">
                ⚠️ This will be extremely tight. One bad event could sink you.
              </div>
            ` : ''}

            <button class="btn btn-primary btn-lg btn-block" id="btn-begin">Begin the Journey</button>
            <p class="disclaimer-note" style="margin-top:var(--space-3);">
              Home Run is an interactive learning simulation. All amounts, rates, and outcomes are illustrative
              estimates — nothing here is financial, legal, or tax advice. For real property decisions,
              speak to a registered financial adviser.
            </p>
          </div>
          <div class="powered-by-footer">
            Engineered by <a href="https://www.bankerx.org/" target="_blank" rel="noopener">BANKERX</a> <span class="text-faint">· v10</span>
          </div>
        </div>
      `;

      container.querySelector('#salary-slider').addEventListener('input', (e) => {
        netSalary = parseInt(e.target.value);
        render();
      });
      container.querySelector('#property-slider').addEventListener('input', (e) => {
        targetProperty = parseInt(e.target.value);
        render();
      });
      container.querySelector('#prime-slider').addEventListener('input', (e) => {
        SA.setPrimeRate(parseFloat(e.target.value));
        render();
      });
      container.querySelector('#btn-begin').addEventListener('click', () => {
        Sound.play('click');
        onNext({
          netSalary,
          savings: netSalary * 1,
          originalPrice: targetProperty,
        });
      });
    }

    render();
  }

  // ==========================================
  // PHASE 1: PRICE NEGOTIATION — v4: seller ALWAYS rejects first offer
  // ==========================================
  function renderPriceNegotiation(container, ctx, onNext) {
    let askingPrice = ctx.originalPrice;
    let sellerNum = 1;
    let currentOffer = askingPrice;
    let round = 0;
    const maxRounds = 5;
    let sellerMood = 50;
    let dealDone = false;
    let finalPrice = askingPrice;
    let messages = [];
    let sellerMinAccept = askingPrice * (0.85 + Math.random() * 0.05);
    let firstOfferMade = false; // v4: track first offer

    function newSeller() {
      sellerNum++;
      askingPrice = Math.round(ctx.originalPrice * (0.97 + Math.random() * 0.06));
      askingPrice = Math.round(askingPrice / 10000) * 10000;
      sellerMinAccept = askingPrice * (0.85 + Math.random() * 0.05);
      currentOffer = askingPrice;
      round = 0;
      sellerMood = 50;
      dealDone = false;
      firstOfferMade = false;
      messages = [{ from: 'seller', text: `"Welcome! I'm seller #${sellerNum}. This property is listed at ${fmt(askingPrice)}."` }];
    }

    function sellerResponse(offerPct) {
      const discount = (1 - offerPct) * 100;
      if (discount > 20) return { text: `"That's insulting. I have other buyers interested."`, moodChange: -30 };
      if (discount > 15) return { text: `"Far too low. The property is priced fairly."`, moodChange: -15 };
      if (discount > 10) return { text: `"Hmm, getting closer. But I can't go that low."`, moodChange: -5 };
      if (discount > 5) return { text: `"That's a reasonable starting point. Let me think..."`, moodChange: 5 };
      return { text: `"Now that's a serious offer. I think we can work something out."`, moodChange: 15 };
    }

    function render() {
      const moodColor = sellerMood > 60 ? 'text-green' : sellerMood > 30 ? 'text-amber' : 'text-red';
      const moodLabel = sellerMood > 60 ? 'Receptive' : sellerMood > 30 ? 'Cautious' : 'Hostile';
      const moodPct = Math.max(0, Math.min(100, sellerMood));

      container.innerHTML = `
        <div class="phase-screen">
          <div class="phase-header">
            <span class="badge badge-blue">Phase 1 of 4</span>
            <h2 class="heading-lg">Negotiate the Price</h2>
            <p class="text-muted" style="font-size:14px;">
              Property listed at <strong>${fmt(askingPrice)}</strong> (Seller #${sellerNum}). 
              Push too hard and they walk — but you'll find another seller. Sweet spot: 10-15% below asking.
            </p>
          </div>
          <div class="panel phase-content">
            <div class="row-between" style="margin-bottom:var(--space-3);">
              <div>
                <span class="label">Seller's Mood</span>
                <div class="row gap-2" style="margin-top:4px;"><span class="value ${moodColor}">${moodLabel}</span></div>
              </div>
              <div style="text-align:right;"><span class="label">Round ${Math.min(round + 1, maxRounds)} of ${maxRounds}</span></div>
            </div>
            <div class="progress-bar" style="height:8px;margin-bottom:var(--space-4);">
              <div class="progress-fill" style="width:${moodPct}%;background:${sellerMood > 60 ? 'var(--color-primary)' : sellerMood > 30 ? 'var(--color-warning)' : 'var(--color-danger)'};">
              </div>
            </div>
            <div class="chat-log" id="chat-log">
              ${messages.map(m => `
                <div class="chat-bubble ${m.from}">
                  <div class="chat-who">${m.from === 'you' ? '🧑 You' : '🏠 Seller'}</div>
                  <div class="chat-text">${m.text}</div>
                </div>
              `).join('')}
            </div>
            ${dealDone ? `
              <div class="result-panel panel-glow-green" style="text-align:center;padding:var(--space-5);">
                <div style="font-size:32px;margin-bottom:var(--space-2);">🤝</div>
                <div class="heading-md">Deal Accepted!</div>
                <div class="value-lg text-green" style="margin:var(--space-2) 0;">${fmt(finalPrice)}</div>
                <div class="text-muted" style="font-size:14px;">
                  ${((1 - finalPrice / ctx.originalPrice) * 100).toFixed(1)}% discount — saving ${fmt(ctx.originalPrice - finalPrice)}
                </div>
                <button class="btn btn-primary btn-lg btn-block" id="btn-next-phase" style="margin-top:var(--space-4);">Continue to Rate Negotiation</button>
              </div>
            ` : `
              <div class="negotiation-controls">
                <div class="slider-group" style="margin-bottom:var(--space-4);">
                  <div class="slider-header">
                    <label class="label">Your Offer</label>
                    <span class="value-lg" id="offer-display">${fmt(currentOffer)}</span>
                  </div>
                  <input type="range" class="slider" id="offer-slider" 
                    min="${Math.round(askingPrice * 0.75)}" max="${askingPrice}" 
                    step="5000" value="${currentOffer}">
                  <div class="row-between" style="font-size:12px;color:var(--color-text-faint);">
                    <span>-25% (${fmt(askingPrice * 0.75)})</span>
                    <span id="discount-pct">${((1 - currentOffer / askingPrice) * 100).toFixed(1)}% discount</span>
                    <span>Asking</span>
                  </div>
                </div>
                <button class="btn btn-primary btn-lg btn-block" id="btn-make-offer">Make Offer</button>
              </div>
            `}
          </div>
        </div>
      `;

      const chatLog = container.querySelector('#chat-log');
      if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;

      const slider = container.querySelector('#offer-slider');
      if (slider) {
        slider.addEventListener('input', () => {
          currentOffer = parseInt(slider.value);
          container.querySelector('#offer-display').textContent = fmt(currentOffer);
          const disc = ((1 - currentOffer / askingPrice) * 100);
          const discEl = container.querySelector('#discount-pct');
          discEl.textContent = disc.toFixed(1) + '% discount';
          discEl.className = disc >= 10 ? 'text-green' : disc >= 5 ? 'text-amber' : '';
        });
      }

      container.querySelector('#btn-make-offer')?.addEventListener('click', () => {
        Sound.play('click');
        makeOffer();
      });

      container.querySelector('#btn-next-phase')?.addEventListener('click', () => {
        Sound.play('click');
        onNext({
          ...ctx,
          originalPrice: ctx.originalPrice,
          finalPrice,
          discountPct: parseFloat(((1 - finalPrice / ctx.originalPrice) * 100).toFixed(1)),
        });
      });
    }

    function makeOffer() {
      const offerPct = currentOffer / askingPrice;
      messages.push({ from: 'you', text: `I'd like to offer ${fmt(currentOffer)} for the property.` });
      round++;

      // v5: First offers face real resistance, but the response reflects the offer.
      // A near-asking first offer can be accepted; a fair one gets a genuine counter;
      // only lowballs get flatly rebuffed. No more exploitable script.
      if (!firstOfferMade) {
        firstOfferMade = true;
        if (offerPct >= 0.98) {
          finalPrice = currentOffer;
          messages.push({ from: 'seller', text: `"You've got yourself a deal at ${fmt(finalPrice)}. Pleasure doing business."` });
          dealDone = true;
          Sound.play('good_event');
          render();
          return;
        }
        if (offerPct >= 0.90 && Math.random() < 0.35) {
          const counterPrice = Math.round((currentOffer + askingPrice) / 2 / 5000) * 5000;
          sellerMood = Math.min(100, sellerMood + 10);
          messages.push({ from: 'seller', text: `"Close, but not quite. Meet me at ${fmt(counterPrice)} and we can talk seriously."` });
          render();
          return;
        }
        const firstRejectResponses = offerPct < 0.85 ? [
          `"I appreciate the offer, but I can't accept that. This property is worth every cent of ${fmt(askingPrice)}."`,
          `"I've had other interest at higher offers. You'll need to come up significantly."`,
        ] : [
          `"That's a starting point, I suppose. But we're not there yet."`,
          `"Thanks, but no. The market is strong right now — come up a bit and we'll talk."`,
        ];
        const resp = firstRejectResponses[Math.floor(Math.random() * firstRejectResponses.length)];
        sellerMood = Math.max(20, sellerMood - (offerPct < 0.85 ? 10 : 3));
        messages.push({ from: 'seller', text: resp });
        render();
        return;
      }

      if (currentOffer >= sellerMinAccept && sellerMood >= 25) {
        const acceptChance = sellerMood / 100 * (offerPct * 1.2);
        if (acceptChance > 0.5 || round >= maxRounds) {
          const counterPrice = Math.round((currentOffer + sellerMinAccept * 1.02) / 2);
          finalPrice = Math.min(askingPrice, Math.max(currentOffer, counterPrice));
          messages.push({ from: 'seller', text: `"I can do ${fmt(finalPrice)}. Final offer. Do we have a deal?"` });
          dealDone = true;
          Sound.play('good_event');
        } else {
          const resp = sellerResponse(offerPct);
          sellerMood = Math.max(0, Math.min(100, sellerMood + resp.moodChange));
          messages.push({ from: 'seller', text: resp.text });
        }
      } else if (sellerMood <= 10 || (round >= maxRounds && currentOffer < sellerMinAccept)) {
        messages.push({ from: 'seller', text: `"I've found another buyer. Good luck."` });
        Sound.play('bad_event');
        setTimeout(() => { newSeller(); render(); }, 1500);
      } else {
        const resp = sellerResponse(offerPct);
        sellerMood = Math.max(0, Math.min(100, sellerMood + resp.moodChange));
        messages.push({ from: 'seller', text: resp.text });
        if (sellerMood <= 15) messages.push({ from: 'seller', text: `"I'm losing patience. One more lowball and I'm walking."` });
      }
      render();
    }

    messages.push({ from: 'seller', text: `"Welcome! This property is listed at ${fmt(askingPrice)}. What's your offer?"` });
    render();
  }

  // ==========================================
  // PHASE 2: RATE NEGOTIATION — unchanged mechanics
  // ==========================================
  function renderRateNegotiation(container, ctx, onNext) {
    const prime = SA.PRIME_RATE;
    const bestPossible = prime - 1.75;

    const banks = [
      { name: 'Meridian Bank', icon: '🏦', color: '#6FB5E8', baseRate: prime + 0.25, flexibility: 0.65, personality: 'Conservative lender. Will budge if pushed reasonably.' },
      { name: 'Atlas Finance', icon: '🌐', color: '#57BE74', baseRate: prime, flexibility: 0.85, personality: 'Competitive. Willing to match offers to win your business.' },
      { name: 'Summit Capital', icon: '🔶', color: '#E8B33C', baseRate: prime + 0.15, flexibility: 0.75, personality: 'Plays hardball initially but has room to move.' },
      { name: 'Horizon Credit', icon: '💠', color: '#B39CE0', baseRate: prime - 0.1, flexibility: 0.50, personality: 'Already competitive. Less room to negotiate but starts lower.' },
    ];

    let bankStates = banks.map((b) => ({
      currentRate: b.baseRate, round: 0, maxRounds: 3, declined: false, bestOffer: b.baseRate,
    }));
    let currentRound = 0;
    let finalRate = null;
    let selectedBankIdx = null;
    let phase = 'submit';
    let playerOffers = [null, null, null, null];

    function render() {
      container.innerHTML = `
        <div class="phase-screen">
          <div class="phase-header">
            <span class="badge badge-blue">Phase 2 of 4</span>
            <h2 class="heading-lg">Negotiate Your Rate</h2>
            <p class="text-muted" style="font-size:14px;">
              Prime rate is <strong>${prime}%</strong>. Submit offers to each bank — they'll counter or decline. 
              <strong>3 rounds max.</strong> Sweet spot: <strong>prime - 1% (${(prime-1).toFixed(2)}%)</strong>.
            </p>
          </div>
          <div class="panel phase-content">
            ${phase === 'done' ? renderDoneUI() : renderRoundUI()}
          </div>
        </div>
      `;
      wireEvents();
    }

    function renderRoundUI() {
      return `
        <div class="heading-sm" style="margin-bottom:var(--space-3);">Round ${currentRound+1} of 3 — ${phase === 'submit' ? 'Submit Your Desired Rate' : 'Bank Responses'}</div>
        <div class="bank-negotiate-grid">
          ${banks.map((b, i) => {
            const bs = bankStates[i];
            if (bs.declined) return `<div class="bank-neg-card declined"><div class="bank-neg-header"><span class="bank-neg-icon">${b.icon}</span><span class="bank-neg-name">${b.name}</span></div><div class="text-red" style="font-size:13px;font-weight:600;">Declined</div></div>`;
            if (phase === 'submit') {
              return `<div class="bank-neg-card">
                <div class="bank-neg-header"><span class="bank-neg-icon">${b.icon}</span><span class="bank-neg-name">${b.name}</span></div>
                <div class="text-muted" style="font-size:12px;margin-bottom:var(--space-2);">${b.personality}</div>
                <div class="text-muted" style="font-size:12px;">Current offer: <strong>${bs.currentRate.toFixed(2)}%</strong></div>
                <div class="slider-group" style="margin-top:var(--space-2);">
                  <div class="slider-header" style="margin-bottom:2px;">
                    <label class="label" style="font-size:12px;">Your ask</label>
                    <span class="value" style="font-size:14px;" id="ask-${i}">${(playerOffers[i] ?? bs.currentRate).toFixed(2)}%</span>
                  </div>
                  <input type="range" class="slider bank-offer-slider" data-bank="${i}"
                    min="${Math.max(bestPossible, bs.currentRate-1.0).toFixed(2)}" max="${bs.currentRate.toFixed(2)}" step="0.05" value="${(playerOffers[i] ?? bs.currentRate).toFixed(2)}">
                </div>
              </div>`;
            } else {
              const response = bs._response;
              return `<div class="bank-neg-card ${response?.accepted ? 'accepted' : ''}">
                <div class="bank-neg-header"><span class="bank-neg-icon">${b.icon}</span><span class="bank-neg-name">${b.name}</span></div>
                <div style="font-size:13px;margin:var(--space-2) 0;">
                  ${response ? `<div class="${response.accepted ? 'text-green' : 'text-amber'}" style="font-weight:600;">${response.accepted ? `Accepted: ${response.offeredRate.toFixed(2)}%` : `Counter: ${response.offeredRate.toFixed(2)}%`}</div><div class="text-muted" style="font-size:12px;margin-top:2px;">${response.message}</div>` : ''}
                </div>
                ${response?.accepted ? `<button class="btn btn-primary btn-sm btn-block" data-accept="${i}">Lock in ${response.offeredRate.toFixed(2)}%</button>` : ''}
              </div>`;
            }
          }).join('')}
        </div>
        ${phase === 'submit' ? `
          <button class="btn btn-primary btn-lg btn-block" id="btn-submit-offers" style="margin-top:var(--space-4);">Submit Offers</button>
        ` : `
          <div style="margin-top:var(--space-4);">
            ${currentRound < 2 ? `<button class="btn btn-outline btn-lg btn-block" id="btn-next-round">Counter Again (Round ${currentRound+2})</button>` : ''}
            <button class="btn btn-ghost btn-block" id="btn-accept-best" style="margin-top:var(--space-2);">Accept Best Available Rate</button>
          </div>
        `}
      `;
    }

    function renderDoneUI() {
      const bank = banks[selectedBankIdx];
      return `
        <div class="result-panel ${finalRate <= prime-1 ? 'panel-glow-green' : 'panel-glow-amber'}" style="text-align:center;padding:var(--space-5);">
          <div style="font-size:32px;margin-bottom:var(--space-2);">${finalRate <= prime-1 ? '🎉' : '📝'}</div>
          <div class="heading-md">${bank.name} — Rate Locked</div>
          <div class="value-xl ${finalRate <= prime-1 ? 'text-green' : 'text-amber'}" style="margin:var(--space-3) 0;">${finalRate.toFixed(2)}%</div>
          <div class="text-muted" style="font-size:14px;">
            ${finalRate <= prime-1 ? 'Below prime -1%! Excellent negotiation.' : finalRate <= prime ? 'At or below prime. Solid deal.' : 'Above prime. Decent but could be better.'}
          </div>
          <div class="stat-grid" style="margin-top:var(--space-4);margin-bottom:var(--space-4);">
            <div class="stat-card"><span class="label">Monthly Payment</span><span class="value">${fmt(Engine.calcMonthlyPayment(ctx.finalPrice*0.9, finalRate, 20))}</span></div>
            <div class="stat-card"><span class="label">vs Prime Rate</span><span class="value ${finalRate < prime ? 'text-green' : 'text-red'}">${finalRate < prime ? '' : '+'}${(finalRate-prime).toFixed(2)}%</span></div>
          </div>
          <button class="btn btn-primary btn-lg btn-block" id="btn-next-phase">Continue to Budget</button>
        </div>
      `;
    }

    function processOffers() {
      banks.forEach((b, i) => {
        const bs = bankStates[i];
        if (bs.declined) return;
        const ask = playerOffers[i] ?? bs.currentRate;
        const minRate = Math.max(bestPossible, b.baseRate - b.flexibility);
        const diff = bs.currentRate - ask;
        if (ask >= bs.currentRate) {
          bs._response = { accepted: true, offeredRate: bs.currentRate, message: '"Deal! We\'re happy to have you."' };
        } else if (ask < minRate - 0.15) {
          bs.declined = true; bs._response = null;
        } else if (ask <= minRate) {
          if (Math.random() > 0.3) {
            bs._response = { accepted: true, offeredRate: Math.max(minRate, ask), message: '"That\'s our absolute best."' };
            bs.currentRate = Math.max(minRate, ask);
          } else {
            bs.currentRate = minRate;
            bs._response = { accepted: false, offeredRate: minRate, message: '"We can do this, but no lower."' };
          }
        } else {
          const concession = diff * (0.3 + Math.random() * 0.4);
          const newRate = Math.max(minRate, parseFloat((bs.currentRate - concession).toFixed(2)));
          bs.currentRate = newRate;
          bs._response = { accepted: false, offeredRate: newRate, message: `"We can come down to ${newRate.toFixed(2)}%."` };
        }
        bs.round++;
      });
    }

    function wireEvents() {
      container.querySelectorAll('.bank-offer-slider').forEach(slider => {
        slider.addEventListener('input', () => {
          const idx = parseInt(slider.dataset.bank);
          playerOffers[idx] = parseFloat(slider.value);
          const display = container.querySelector(`#ask-${idx}`);
          if (display) display.textContent = playerOffers[idx].toFixed(2) + '%';
        });
      });
      container.querySelector('#btn-submit-offers')?.addEventListener('click', () => {
        Sound.play('click');
        banks.forEach((b, i) => { if (playerOffers[i] == null) playerOffers[i] = bankStates[i].currentRate; });
        processOffers(); phase = 'review'; render();
      });
      container.querySelectorAll('[data-accept]').forEach(btn => {
        btn.addEventListener('click', () => {
          Sound.play('good_event'); selectedBankIdx = parseInt(btn.dataset.accept);
          finalRate = bankStates[selectedBankIdx].currentRate; phase = 'done'; render();
        });
      });
      container.querySelector('#btn-next-round')?.addEventListener('click', () => {
        Sound.play('click'); currentRound++; phase = 'submit';
        playerOffers = banks.map(() => null); render();
      });
      container.querySelector('#btn-accept-best')?.addEventListener('click', () => {
        Sound.play('payment'); let bestIdx = 0, bestRate = Infinity;
        bankStates.forEach((bs, i) => { if (!bs.declined && bs.currentRate < bestRate) { bestRate = bs.currentRate; bestIdx = i; } });
        selectedBankIdx = bestIdx; finalRate = bestRate; phase = 'done'; render();
      });
      container.querySelector('#btn-next-phase')?.addEventListener('click', () => {
        Sound.play('click'); onNext({ ...ctx, lendingRate: finalRate });
      });
    }

    render();
  }

  // ==========================================
  // PHASE 3: BUDGET ALLOCATION — unchanged
  // ==========================================
  function renderBudgetAllocation(container, ctx, onNext) {
    const totalSavings = ctx.savings;
    let deposit = Math.round(ctx.finalPrice * 0.10);

    const categories = {
      furniture: { icon: '🪑', label: 'Furniture', options: [
        { id: 'none', label: 'Skip', cost: 0, desc: 'Use what you have' },
        { id: 'basic', label: 'Basic', cost: 25000, desc: 'Essential items only' },
        { id: 'mid', label: 'Mid-range', cost: 60000, desc: 'Comfortable setup' },
        { id: 'luxury', label: 'Luxury', cost: 120000, desc: 'Premium everything' },
      ]},
      appliances: { icon: '🍳', label: 'Appliances', options: [
        { id: 'none', label: 'Skip', cost: 0, desc: 'Use existing' },
        { id: 'basic', label: 'Basic', cost: 15000, desc: 'Fridge, stove, washing machine' },
        { id: 'mid', label: 'Mid-range', cost: 30000, desc: '+ Dishwasher, microwave' },
        { id: 'luxury', label: 'Top-end', cost: 55000, desc: 'Smart appliances' },
      ]},
      garden: { icon: '🌿', label: 'Garden & Outdoor', options: [
        { id: 'none', label: 'Skip', cost: 0, desc: 'Leave as-is' },
        { id: 'basic', label: 'Tidy-up', cost: 8000, desc: 'Basic landscaping' },
        { id: 'mid', label: 'Full garden', cost: 25000, desc: 'Paving, plants, irrigation' },
        { id: 'luxury', label: 'Outdoor living', cost: 50000, desc: 'Braai, deck, pool' },
      ]},
      moving: { icon: '🚛', label: 'Moving', options: [
        { id: 'none', label: 'DIY', cost: 3000, desc: 'Bakkie and friends' },
        { id: 'basic', label: 'Basic', cost: 10000, desc: 'Local movers' },
        { id: 'mid', label: 'Full service', cost: 22000, desc: 'Packing + moving + insurance' },
      ]},
      refurbishments: { icon: '🔨', label: 'Refurbishments', options: [
        { id: 'none', label: 'Skip', cost: 0, desc: 'Move in as-is' },
        { id: 'basic', label: 'Paint only', cost: 15000, desc: 'Fresh coat' },
        { id: 'mid', label: 'Kitchen & bath', cost: 65000, desc: 'Countertops, tiles' },
        { id: 'luxury', label: 'Full renovation', cost: 150000, desc: 'Complete modernisation' },
      ]},
      security: { icon: '🔒', label: 'Security', options: [
        { id: 'none', label: 'Skip', cost: 0, desc: 'Hope for the best' },
        { id: 'basic', label: 'Basic', cost: 8000, desc: 'Alarm + beams' },
        { id: 'mid', label: 'Full system', cost: 20000, desc: 'CCTV, electric fence' },
        { id: 'luxury', label: 'Fort Knox', cost: 40000, desc: 'Biometric, full perimeter' },
      ]},
    };

    let selections = {};
    Object.keys(categories).forEach(k => { selections[k] = categories[k].options[0].id; });
    selections.moving = 'none';

    function getSelectionCost(catKey) {
      const opt = categories[catKey].options.find(o => o.id === selections[catKey]);
      return opt ? opt.cost : 0;
    }
    function calcTotalExtras() { return Object.keys(categories).reduce((sum, k) => sum + getSelectionCost(k), 0); }
    function calcLegal() { return SA.calcAllUpfrontCosts(ctx.finalPrice, ctx.finalPrice - deposit); }
    function calcRemaining() { return totalSavings - deposit - calcLegal().totalLegalCosts - calcTotalExtras(); }

    function render() {
      const legal = calcLegal();
      const extras = calcTotalExtras();
      const remaining = calcRemaining();
      const bondAmount = ctx.finalPrice - deposit;
      const addedToLoan = remaining < 0 ? Math.abs(remaining) : 0;

      container.innerHTML = `
        <div class="phase-screen">
          <div class="phase-header">
            <span class="badge badge-blue">Phase 3 of 4</span>
            <h2 class="heading-lg">Balance Your Budget</h2>
            <p class="text-muted" style="font-size:14px;">
              You have <strong>${fmt(totalSavings)}</strong> in savings.
              ${addedToLoan > 0 ? `<strong class="text-red">Over budget by ${fmt(addedToLoan)} — added to your bond!</strong>` : ''}
            </p>
          </div>
          <div class="panel phase-content">
            <div class="budget-bar-container" style="margin-bottom:var(--space-5);">
              <div class="row-between" style="margin-bottom:var(--space-2);">
                <span class="heading-sm">Savings: ${fmt(totalSavings)}</span>
                <span class="value ${remaining < 0 ? 'text-red' : remaining < 10000 ? 'text-amber' : 'text-green'}">${remaining < 0 ? 'Overflow: ' : ''}${fmt(remaining)}</span>
              </div>
              <div class="budget-bar">
                <div class="budget-seg budget-seg-deposit" style="width:${Math.min(deposit/totalSavings*100,100)}%;"></div>
                <div class="budget-seg budget-seg-legal" style="width:${Math.min(legal.totalLegalCosts/totalSavings*100,50)}%;"></div>
                <div class="budget-seg budget-seg-extras" style="width:${Math.min(extras/totalSavings*100,50)}%;"></div>
              </div>
              <div class="row gap-4" style="margin-top:var(--space-2);font-size:12px;flex-wrap:wrap;">
                <span><span class="dot dot-deposit"></span> Deposit ${fmt(deposit)}</span>
                <span><span class="dot dot-legal"></span> Legal ${fmt(legal.totalLegalCosts)}</span>
                <span><span class="dot dot-extras"></span> Extras ${fmt(extras)}</span>
                ${remaining >= 0 ? `<span><span class="dot dot-remaining"></span> Cash ${fmt(remaining)}</span>` : `<span class="text-red"><span class="dot dot-overflow"></span> +Bond: ${fmt(addedToLoan)}</span>`}
              </div>
            </div>

            <div class="slider-group" style="margin-bottom:var(--space-4);">
              <div class="slider-header">
                <label class="label">Cash Deposit</label>
                <span class="value-lg">${fmt(deposit)} <span class="text-muted" style="font-size:14px;">(${(deposit/ctx.finalPrice*100).toFixed(1)}%)</span></span>
              </div>
              <input type="range" class="slider" id="deposit-slider" min="0" max="${Math.min(totalSavings*0.8,ctx.finalPrice*0.30)}" step="10000" value="${deposit}">
            </div>

            <details style="margin-bottom:var(--space-4);">
              <summary class="heading-sm" style="cursor:pointer;">Legal & Transfer — ${fmt(legal.totalLegalCosts)}</summary>
              <div class="stat-grid" style="grid-template-columns:repeat(2,1fr);margin-top:var(--space-2);">
                <div class="stat-card"><span class="label">Transfer Duty</span><span class="value">${fmt(legal.transferDuty)}</span></div>
                <div class="stat-card"><span class="label">Conveyancing</span><span class="value">${fmt(legal.conveyancing)}</span></div>
                <div class="stat-card"><span class="label">Bond Registration</span><span class="value">${fmt(legal.bondRegistration)}</span></div>
                <div class="stat-card"><span class="label">Bank Initiation</span><span class="value">${fmt(legal.bankInitiation)}</span></div>
              </div>
            </details>

            <div class="heading-sm" style="margin-bottom:var(--space-3);">Home Setup Costs</div>
            <div class="category-grid">
              ${Object.entries(categories).map(([key, cat]) => `
                <div class="category-card">
                  <div class="category-header">
                    <span>${cat.icon} ${cat.label}</span>
                    <span class="value" style="font-size:13px;">${fmt(getSelectionCost(key))}</span>
                  </div>
                  <div class="tier-options">
                    ${cat.options.map(opt => `
                      <button class="tier-btn ${selections[key] === opt.id ? 'active' : ''}" data-cat="${key}" data-tier="${opt.id}">
                        <span class="tier-label">${opt.label}</span>
                        <span class="tier-cost">${opt.cost > 0 ? fmt(opt.cost) : 'Free'}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>

            ${addedToLoan > 0 ? `<div class="warning-banner warning-red" style="margin-top:var(--space-4);">⚠️ ${fmt(addedToLoan)} over budget — added to your home loan.</div>` : ''}

            <button class="btn btn-primary btn-lg btn-block" id="btn-next-phase" style="margin-top:var(--space-4);">Continue to Loan Term</button>
          </div>
        </div>
      `;

      container.querySelector('#deposit-slider').addEventListener('input', (e) => { deposit = parseInt(e.target.value); render(); });
      container.querySelectorAll('.tier-btn').forEach(btn => {
        btn.addEventListener('click', () => { Sound.play('click'); selections[btn.dataset.cat] = btn.dataset.tier; render(); });
      });
      container.querySelector('#btn-next-phase')?.addEventListener('click', () => {
        Sound.play('click');
        const legal = calcLegal(); const extras = calcTotalExtras(); const remaining = calcRemaining();
        onNext({ ...ctx, deposit, bondAmount: ctx.finalPrice-deposit, legalCosts: legal.totalLegalCosts,
          budgetAllocations: {...selections}, savings: totalSavings, remainingSavings: Math.max(0,remaining),
          addedToLoan: remaining < 0 ? Math.abs(remaining) : 0 });
      });
    }
    render();
  }

  // ==========================================
  // PHASE 4: LOAN TERM SELECTION
  // ==========================================
  function renderTermSelection(container, ctx, onNext) {
    let term = 20;

    function render() {
      const bondAmount = ctx.bondAmount + (ctx.addedToLoan || 0);
      const monthly = Engine.calcMonthlyPayment(bondAmount, ctx.lendingRate, term);
      const totalInterest = Engine.calcTotalInterest(bondAmount, ctx.lendingRate, term);
      const totalCost = bondAmount + totalInterest;
      const affordRatio = (monthly / ctx.netSalary * 100);
      const affordability = Engine.getAffordabilityRating(affordRatio);

      container.innerHTML = `
        <div class="phase-screen">
          <div class="phase-header">
            <span class="badge badge-blue">Phase 4 of 4</span>
            <h2 class="heading-lg">Choose Your Loan Term</h2>
            <p class="text-muted" style="font-size:14px;">Shorter term = less interest but higher payments. Each turn = 1 year.</p>
          </div>
          <div class="panel phase-content">
            <div class="term-display" style="text-align:center;margin-bottom:var(--space-5);">
              <div class="value-xl">${term} years</div>
              <div class="badge ${affordability.level === 'danger' || affordability.level === 'warning' ? 'badge-red' : affordability.level === 'caution' ? 'badge-amber' : 'badge-green'}" style="margin-top:var(--space-2);">
                Affordability: ${affordability.label}
              </div>
            </div>
            <input type="range" class="slider" id="term-slider" min="10" max="30" step="1" value="${term}" style="margin-bottom:var(--space-4);">
            <div class="row-between" style="font-size:12px;color:var(--color-text-faint);margin-bottom:var(--space-5);">
              <span>10 years (aggressive)</span>
              <span>30 years (conservative)</span>
            </div>
            <div class="stat-grid" style="margin-bottom:var(--space-4);">
              <div class="stat-card"><span class="label">Monthly Payment</span><span class="value ${affordRatio > 35 ? 'text-red' : ''}">${fmt(monthly)}</span></div>
              <div class="stat-card"><span class="label">Affordability</span><span class="value" style="color:${affordability.color};">${affordability.label}</span></div>
              <div class="stat-card"><span class="label">Total Interest</span><span class="value text-red">${fmt(totalInterest)}</span></div>
              <div class="stat-card"><span class="label">Total Cost</span><span class="value">${fmt(totalCost)}</span></div>
            </div>
            <button class="btn btn-primary btn-lg btn-block" id="btn-start-game">🏠 Start Home Ownership</button>
          </div>
        </div>
      `;
      container.querySelector('#term-slider').addEventListener('input', (e) => { term = parseInt(e.target.value); render(); });
      container.querySelector('#btn-start-game').addEventListener('click', () => { Sound.play('payment'); onNext({ ...ctx, loanTerm: term }); });
    }
    render();
  }

  return { renderIntro, renderPriceNegotiation, renderRateNegotiation, renderBudgetAllocation, renderTermSelection };
})();
