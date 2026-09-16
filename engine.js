/* ============================================
   HOME RUN v4.1 — Game Engine
   New: investments, amortization breakdown,
   score out of 100, slower cash accrual
   ============================================ */

const Engine = (() => {

  function calcMonthlyPayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    if (monthlyRate === 0) return principal / months;
    if (principal <= 0) return 0;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  }

  function calcTotalInterest(principal, annualRate, years) {
    if (principal <= 0) return 0;
    const payment = calcMonthlyPayment(principal, annualRate, years);
    return (payment * years * 12) - principal;
  }

  function createGameState(setupResults) {
    const {
      finalPrice,
      originalPrice,
      discountPct,
      lendingRate,
      deposit,
      loanTerm,
      netSalary,
      budgetAllocations,
      savings,
      remainingSavings,
      addedToLoan,
    } = setupResults;

    const bondAmount = (finalPrice - deposit) + (addedToLoan || 0);
    const minPayment = calcMonthlyPayment(bondAmount, lendingRate, loanTerm);

    // v6: Running costs (rates, utilities, levies, insurance, maintenance) are simulated
    // as 30-40% of the monthly bond repayment — the "true cost of ownership".
    // R10,000 repayment => ~R13,000-R14,000 real monthly cost of the home.
    const runningCostRate = 0.30 + Math.random() * 0.10;
    const runningCostExtra = 0; // permanent increases from events accumulate here
    const ownershipCosts = { total: Math.round(minPayment * runningCostRate) };

    // Living expenses — v4.1: increased from 0.30 to 0.38 to slow cash reserve accumulation
    const livingExpenses = Math.round(netSalary * 0.38);
    const fixedCosts = ownershipCosts.total + livingExpenses;

    // Affordability rating (replaces DTI)
    const affordabilityRatio = minPayment / netSalary * 100;
    const monthlySurplus = netSalary - minPayment - fixedCosts;

    // Annual figures
    const annualNetSalary = netSalary * 12;
    const annualBondPayment = minPayment * 12;
    const annualOwnership = ownershipCosts.total * 12;
    const annualLiving = livingExpenses * 12;
    const annualSurplus = annualNetSalary - annualBondPayment - annualOwnership - annualLiving;

    return {
      // Setup
      originalPrice,
      finalPrice,
      discountPct,
      negotiatedRate: lendingRate,
      depositAmount: deposit,
      depositPct: (deposit / finalPrice * 100),
      loanTermYears: loanTerm,
      originalBondAmount: bondAmount,
      addedToLoan: addedToLoan || 0,

      // Current loan state
      balance: bondAmount,
      interestRate: lendingRate,
      monthlyRate: lendingRate / 100 / 12,
      loanTermMonths: loanTerm * 12,
      minPayment: Math.round(minPayment),

      // Financial state
      currentYear: 0,
      startYear: new Date().getFullYear(),
      monthlyNetSalary: netSalary,
      annualNetSalary,
      cashOnHand: remainingSavings || 0,
      
      // v4: Cash banking system
      bankedCash: 0,        // Cash banked (emergency reserve)
      totalBankedEver: 0,
      
      // v4.1: Investment system
      investments: [],         // [{type, name, amount, returnRate, yearInvested, termYears}]
      totalInvestmentReturns: 0,
      
      // v4.1: Drowning popup
      shownRentPopup: false,
      
      // Monthly breakdown
      ownershipCosts,
      runningCostRate,
      runningCostExtra,
      extraPaidThisYearAmt: 0,
      monthlyLivingExpenses: livingExpenses,
      fixedMonthlyOutgoing: fixedCosts,
      monthlySurplus: Math.round(monthlySurplus),
      affordabilityRatio,  // replaces dtiRatio

      // Annual figures
      annualBondPayment: Math.round(annualBondPayment),
      annualOwnership: Math.round(annualOwnership),
      annualLiving: Math.round(annualLiving),
      annualSurplus: Math.round(annualSurplus),

      // Tracking
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      totalExtraPaid: 0,
      totalOwnershipCostsPaid: 0,
      totalBorrowed: 0,
      loanExtensions: 0,
      balanceHistory: [bondAmount],
      underwaterHistory: [0],
      yearLog: [],
      events: [],
      achievements: [],
      
      // Property
      propertyValue: finalPrice,
      equity: deposit,
      budgetAllocations,
      hasRefurb: !!(budgetAllocations.refurbishments && budgetAllocations.refurbishments !== 'none'),
      hasSecurity: !!(budgetAllocations.security && budgetAllocations.security !== 'none'),
      hasFurniture: !!(budgetAllocations.furniture && budgetAllocations.furniture !== 'none'),
      hasAppliances: !!(budgetAllocations.appliances && budgetAllocations.appliances !== 'none'),

      // Underwater meter
      underwaterLevel: Math.max(0, Math.min(100, monthlySurplus < 0 ? 60 : 25)),

      // Game state
      phase: 'playing',
      score: 0,
      streakExtraPayments: 0,
      yearsSinceLastEvent: 0,
      yearsSinceTimedEvent: 0,
      rateChangeHistory: [],
      
      // v4: Decision system
      decisionsThisYear: [],     // [{id, label, icon, chosen: bool, outcome: null}]
      decisionsWon: 0,           // v7: lifetime positive decision outcomes
      decisionsLost: 0,          // v7: lifetime negative decision outcomes
      decisionOutcomes: [],      // revealed at year-end
      pendingCashFromDecisions: 0, // net impact from decisions (revealed after year)
      usedDecisionIds: [],       // v4.1: track used decisions across all years
      
      // v4: Year-end tracking
      yearEndSummary: null,
      
      // Interest saved from negotiations
      interestSavedFromPrice: Math.round(
        calcTotalInterest(originalPrice - deposit, lendingRate, loanTerm) - 
        calcTotalInterest(finalPrice - deposit, lendingRate, loanTerm)
      ),
      interestSavedFromRate: Math.round(
        calcTotalInterest(bondAmount, SA.PRIME_RATE, loanTerm) - 
        calcTotalInterest(bondAmount, lendingRate, loanTerm)
      ),
    };
  }

  function recalcMinPayment(state) {
    if (state.balance <= 0) return 0;
    const remainingMonths = state.loanTermMonths - (state.currentYear * 12);
    if (remainingMonths <= 0) return state.balance;
    return Math.round(calcMonthlyPayment(
      state.balance, state.interestRate, Math.max(remainingMonths / 12, 1 / 12)
    ));
  }

  // v6: Running costs track the bond repayment (30-40%) plus permanent event increases
  function recalcRunningCosts(state) {
    state.ownershipCosts.total = Math.round(state.minPayment * state.runningCostRate + state.runningCostExtra);
    state.fixedMonthlyOutgoing = state.ownershipCosts.total + state.monthlyLivingExpenses;
  }

  // v6: Pay extra into the bond directly from surplus cash — usable any time
  function payExtraFromCash(state, amount) {
    const actual = Math.max(0, Math.min(amount, state.cashOnHand, state.balance));
    if (actual > 0) {
      state.balance = Math.max(0, state.balance - actual);
      state.cashOnHand -= actual;
      state.totalExtraPaid += actual;
      state.totalPrincipalPaid += actual;
      state.extraPaidThisYearAmt = (state.extraPaidThisYearAmt || 0) + actual;
      state.minPayment = recalcMinPayment(state);
      recalcRunningCosts(state);
      state.annualBondPayment = state.minPayment * 12;
      state.monthlySurplus = state.monthlyNetSalary - state.minPayment - state.fixedMonthlyOutgoing;
      state.affordabilityRatio = state.minPayment / state.monthlyNetSalary * 100;
      state.underwaterLevel = calculateUnderwaterLevel(state);
      if (state.balance <= 0) {
        state.phase = 'won';
        state.score = calculateScore(state);
      }
    }
    return actual;
  }

  // Process a full year (12 months at once)
  function processYear(state, extraPayment = 0) {
    if (state.phase !== 'playing') return state;

    state.currentYear++;
    state.yearsSinceLastEvent++;
    state.yearsSinceTimedEvent++;

    // Annual salary increase (inflation-linked) — after first year
    if (state.currentYear > 1) {
      const raise = state.monthlyNetSalary * SA.ANNUAL_INFLATION;
      state.monthlyNetSalary = Math.round(state.monthlyNetSalary + raise);
      state.annualNetSalary = state.monthlyNetSalary * 12;
      
      // Event-driven running cost increases inflate; the base tracks the repayment
      state.runningCostExtra = Math.round(state.runningCostExtra * (1 + SA.ANNUAL_INFLATION));
      state.monthlyLivingExpenses = Math.round(state.monthlyLivingExpenses * (1 + SA.ANNUAL_INFLATION * 0.9));
      recalcRunningCosts(state);
    }

    // Process 12 months of income
    const annualIncome = state.annualNetSalary;
    state.cashOnHand += annualIncome;

    // Deduct 12 months of ownership + living costs
    const annualFixed = state.fixedMonthlyOutgoing * 12;
    state.cashOnHand -= annualFixed;
    state.totalOwnershipCostsPaid += annualFixed;
    state.annualOwnership = Math.round(state.ownershipCosts.total * 12);
    state.annualLiving = Math.round(state.monthlyLivingExpenses * 12);

    // Process 12 months of mortgage
    let yearInterest = 0;
    let yearPrincipal = 0;
    let tempBalance = state.balance;
    const monthlyRate = state.interestRate / 100 / 12;

    for (let m = 0; m < 12; m++) {
      if (tempBalance <= 0) break;
      const interest = tempBalance * monthlyRate;
      yearInterest += interest;
      const principalPortion = Math.min(state.minPayment - interest, tempBalance);
      yearPrincipal += Math.max(0, principalPortion);
      tempBalance = Math.max(0, tempBalance - principalPortion);
    }

    const annualMinPayment = state.minPayment * 12;
    state.cashOnHand -= annualMinPayment;

    // v8.1: Day-to-day life absorbs most theoretical surplus — reserves grow slowly.
    // Each year you retain ~3-5% of annual net salary as new cash:
    // 5% when financial stress is low, 4% mid, 3% when stress is high.
    const organicFlow = annualIncome - annualFixed - annualMinPayment;
    state.lifestyleAbsorbed = 0;
    if (organicFlow > 0) {
      const retainPct = state.underwaterLevel < 30 ? 0.05 : state.underwaterLevel < 60 ? 0.04 : 0.03;
      const retained = Math.min(organicFlow, Math.round(state.annualNetSalary * retainPct));
      state.lifestyleAbsorbed = organicFlow - retained;
      state.cashOnHand -= state.lifestyleAbsorbed;
    }

    state.totalInterestPaid += yearInterest;
    state.totalPrincipalPaid += yearPrincipal;
    state.balance = Math.max(0, tempBalance);

    // v6: Extra payments now happen from surplus cash during the year
    // (Engine.payExtraFromCash). Here we just settle the streak.
    const yearExtra = state.extraPaidThisYearAmt || 0;
    if (yearExtra > 0) {
      state.streakExtraPayments++;
    } else {
      state.streakExtraPayments = 0;
    }
    state.extraPaidThisYearAmt = 0;

    // v5: Property value appreciation (0.5-5% random per year — some years are nearly flat)
    const appreciationRate = 0.005 + Math.random() * 0.045;
    state.propertyAppreciationThisYear = appreciationRate;
    state.propertyValue *= (1 + appreciationRate);
    state.equity = state.propertyValue - state.balance;

    // Recalc min payment + running costs (which track the repayment)
    state.minPayment = recalcMinPayment(state);
    recalcRunningCosts(state);
    state.annualBondPayment = state.minPayment * 12;
    state.monthlySurplus = state.monthlyNetSalary - state.minPayment - state.fixedMonthlyOutgoing;
    state.annualSurplus = Math.round(state.monthlySurplus * 12);
    state.affordabilityRatio = state.minPayment / state.monthlyNetSalary * 100;

    // Update underwater level
    const financialStress = calculateUnderwaterLevel(state);
    state.underwaterLevel = financialStress;
    state.underwaterHistory.push(financialStress);

    // Track
    state.balanceHistory.push(state.balance);
    
    const yearResult = {
      year: state.currentYear,
      calendarYear: state.startYear + state.currentYear,
      interest: Math.round(yearInterest),
      principal: Math.round(yearPrincipal),
      extra: Math.round(yearExtra),
      lifestyleAbsorbed: Math.round(state.lifestyleAbsorbed || 0),
      totalPaid: Math.round(annualMinPayment + yearExtra),
      balance: Math.round(state.balance),
      cash: Math.round(state.cashOnHand),
      ownership: Math.round(annualFixed),
      underwater: Math.round(financialStress),
      decisions: [...state.decisionsThisYear],
      bankedCash: state.bankedCash,
    };
    state.yearLog.push(yearResult);

    // Win condition
    if (state.balance <= 0) {
      state.phase = 'won';
      state.balance = 0;
      state.score = calculateScore(state);
    }

    // v5 fix: banked cash is a real safety net — it covers shortfalls before bankruptcy
    state.bankedCashUsedThisYear = 0;
    if (state.cashOnHand < 0 && state.bankedCash > 0) {
      const cover = Math.min(state.bankedCash, -state.cashOnHand);
      state.bankedCash -= cover;
      state.cashOnHand += cover;
      state.bankedCashUsedThisYear = cover;
      yearResult.cash = Math.round(state.cashOnHand);
      yearResult.bankedCash = state.bankedCash;
    }

    // Lose condition
    if (state.cashOnHand < -state.monthlyNetSalary * 6) {
      state.phase = 'lost';
      state.lossReason = 'bankrupt';
      state.score = calculateScore(state);
    } else if (state.underwaterLevel >= 95 && state.yearLog.filter(y => y.underwater >= 90).length >= 2) {
      state.phase = 'lost';
      state.lossReason = 'underwater';
      state.score = calculateScore(state);
    }

    return state;
  }

  // v4.1: Calculate amortization breakdown for current year
  function calcYearAmortization(balance, annualRate, loanTermMonths, currentYear) {
    let yearInterest = 0;
    let yearPrincipal = 0;
    let tempBalance = balance;
    const monthlyRate = annualRate / 100 / 12;
    const remainingMonths = loanTermMonths - (currentYear * 12);
    if (remainingMonths <= 0 || tempBalance <= 0) return { interest: 0, principal: 0 };
    const mp = calcMonthlyPayment(tempBalance, annualRate, Math.max(remainingMonths / 12, 1/12));
    for (let m = 0; m < 12; m++) {
      if (tempBalance <= 0) break;
      const interest = tempBalance * monthlyRate;
      yearInterest += interest;
      const principalPortion = Math.min(mp - interest, tempBalance);
      yearPrincipal += Math.max(0, principalPortion);
      tempBalance = Math.max(0, tempBalance - principalPortion);
    }
    return { interest: Math.round(yearInterest), principal: Math.round(yearPrincipal) };
  }

  // v4.1: Process investment returns
  function processInvestments(state) {
    let totalReturns = 0;
    const matured = [];
    state.investments = state.investments.filter(inv => {
      const yearsHeld = state.currentYear - inv.yearInvested;
      if (yearsHeld >= inv.termYears) {
        const returns = Math.round(inv.amount * inv.returnRate * inv.termYears);
        totalReturns += inv.amount + returns;
        state.totalInvestmentReturns += returns;
        matured.push({ ...inv, returns });
        return false;
      }
      return true;
    });
    if (totalReturns > 0) {
      state.cashOnHand += totalReturns;
    }
    return { totalReturns, matured };
  }

  // v5: Resolve decision outcomes at year-end.
  // Odds are no longer a pure coin flip: preparedness shifts them.
  // Healthy reserves and low stress push odds up to 70/30 in your favour;
  // running on fumes pushes them down to 30/70.
  function resolveDecisions(state) {
    const outcomes = [];
    const monthlyObligations = Math.max(1, state.minPayment + state.fixedMonthlyOutgoing);
    const liquidMonths = (state.cashOnHand + state.bankedCash) / monthlyObligations;
    let successChance = 0.5;
    if (liquidMonths >= 3) successChance += 0.15;
    else if (liquidMonths < 1) successChance -= 0.10;
    if (state.underwaterLevel >= 60) successChance -= 0.10;
    else if (state.underwaterLevel <= 20) successChance += 0.05;
    successChance = Math.max(0.30, Math.min(0.70, successChance));
    state.lastDecisionOdds = successChance;

    for (const dec of state.decisionsThisYear) {
      if (!dec.chosen) continue;
      const isPositive = Math.random() < successChance;
      if (isPositive) state.decisionsWon = (state.decisionsWon || 0) + 1;
      else state.decisionsLost = (state.decisionsLost || 0) + 1;
      const impact = isPositive ? dec.positiveImpact : dec.negativeImpact;
      outcomes.push({
        ...dec,
        isPositive,
        impact,
        description: isPositive ? dec.positiveDesc : dec.negativeDesc,
      });
      // Apply impact
      if (impact.cashImpact) state.cashOnHand += impact.cashImpact;
      if (impact.salaryImpact) {
        state.monthlyNetSalary = Math.max(
          Math.round(state.monthlyNetSalary * 0.5),
          Math.round(state.monthlyNetSalary + impact.salaryImpact)
        );
        state.annualNetSalary = state.monthlyNetSalary * 12;
      }
      if (impact.monthlyCostIncrease) {
        state.runningCostExtra += impact.monthlyCostIncrease;
        recalcRunningCosts(state);
      }
    }
    state.decisionOutcomes = outcomes;
    
    // Recalc
    state.monthlySurplus = state.monthlyNetSalary - state.minPayment - state.fixedMonthlyOutgoing;
    state.annualSurplus = Math.round(state.monthlySurplus * 12);
    state.affordabilityRatio = state.minPayment / state.monthlyNetSalary * 100;
    state.underwaterLevel = calculateUnderwaterLevel(state);
    
    return outcomes;
  }

  // v4: Bank cash for emergencies OR pay extra on bond
  function bankCash(state, amount) {
    state.bankedCash += amount;
    state.totalBankedEver += amount;
    state.cashOnHand -= amount;
    return state;
  }

  function payExtraFromBank(state, amount) {
    const actual = Math.min(amount, state.bankedCash, state.balance);
    if (actual > 0) {
      state.balance = Math.max(0, state.balance - actual);
      state.bankedCash -= actual;
      state.totalExtraPaid += actual;
      state.totalPrincipalPaid += actual;
      state.minPayment = recalcMinPayment(state);
      recalcRunningCosts(state);
      state.annualBondPayment = state.minPayment * 12;
    }
    return state;
  }

  // v4: Emergency hits — drain banked cash first, then borrow
  function handleEmergency(state, cost) {
    if (state.bankedCash >= cost) {
      state.bankedCash -= cost;
      return { method: 'banked', amount: cost, borrowed: 0 };
    } else {
      const fromBank = state.bankedCash;
      const shortfall = cost - fromBank;
      state.bankedCash = 0;
      // Must borrow the rest
      borrowFromBank(state, shortfall);
      return { method: 'borrowed', amount: cost, borrowed: shortfall };
    }
  }

  function calculateUnderwaterLevel(state) {
    let level = 0;
    const monthlyObligations = state.minPayment + state.fixedMonthlyOutgoing;
    // Banked cash is real money — it counts as a buffer against stress
    const liquid = state.cashOnHand + state.bankedCash;
    const cashMonths = liquid / monthlyObligations;
    if (cashMonths < 0) level += 40 + Math.min(40, Math.abs(cashMonths) * 15);
    else if (cashMonths < 1) level += 30 - cashMonths * 15;
    else if (cashMonths < 2) level += 15 - (cashMonths - 1) * 10;
    else if (cashMonths < 3) level += 5 - (cashMonths - 2) * 5;

    if (state.affordabilityRatio > 40) level += (state.affordabilityRatio - 40) * 1.5;
    else if (state.affordabilityRatio > 35) level += (state.affordabilityRatio - 35) * 0.8;

    if (state.monthlySurplus < 0) level += 15 + Math.min(25, Math.abs(state.monthlySurplus) / 500);

    const ltv = state.balance / state.propertyValue * 100;
    if (ltv > 100) level += 20;
    else if (ltv > 90) level += 10;

    if (state.totalBorrowed > 0) level += Math.min(15, state.totalBorrowed / state.monthlyNetSalary);

    return Math.max(0, Math.min(100, Math.round(level)));
  }

  // v7: Score out of 100 — early repayment and smart decisions weighted heavily.
  // Paying off in year 1 of a 20-year term should land in the 90s, not the 70s.
  function calcScoreParts(state) {
    const yearsSaved = Math.max(0, state.loanTermYears - state.currentYear);
    const netDecisions = Math.max(0, (state.decisionsWon || 0) - (state.decisionsLost || 0));
    const avgUnderwater = state.underwaterHistory.length > 0 ? state.underwaterHistory.reduce((a, b) => a + b, 0) / state.underwaterHistory.length : 0;
    const stressedYears = state.yearLog.filter(y => y.underwater >= 70).length;
    return {
      yearsSaved, netDecisions, avgUnderwater, stressedYears,
      completionBonus: state.phase === 'won' ? 8 : 0,
      earlyRepayment: Math.round(30 * Math.min(1, yearsSaved / Math.max(1, state.loanTermYears))),
      extraPayments: Math.round(12 * Math.min(1, state.totalExtraPaid / Math.max(1, state.originalBondAmount))),
      streak: Math.min(5, state.streakExtraPayments),
      achievements: Math.min(6, state.achievements.length),
      priceNeg: Math.min(6, Math.round(state.interestSavedFromPrice / 100000)),
      rateNeg: Math.min(6, Math.round(state.interestSavedFromRate / 100000)),
      banked: Math.min(5, Math.round(state.totalBankedEver / Math.max(1, state.monthlyNetSalary * 6) * 5)),
      smartDecisions: Math.min(6, netDecisions * 2),
      stressPenalty: -Math.min(15, Math.round(avgUnderwater / 5)),
      borrowPenalty: -Math.min(10, state.totalBorrowed > 0 ? Math.round(state.totalBorrowed / Math.max(1, state.originalBondAmount) * 30) : 0),
      extensionPenalty: -Math.min(10, state.loanExtensions * 5),
      stressedYearsPenalty: -Math.min(5, stressedYears * 2),
    };
  }

  function calculateScore(state) {
    const p = calcScoreParts(state);
    let score = 40
      + p.completionBonus
      + p.earlyRepayment + p.extraPayments + p.streak + p.achievements
      + p.priceNeg + p.rateNeg + p.banked + p.smartDecisions
      + p.stressPenalty + p.borrowPenalty + p.extensionPenalty + p.stressedYearsPenalty;
    if (state.phase === 'lost') score = Math.max(0, Math.round(score * 0.3));
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  // v5: Itemized score breakdown — mirrors calculateScore exactly,
  // plus plain-language coaching (what went well / what to improve).
  function getScoreBreakdown(state) {
    const p = calcScoreParts(state);
    const items = [];
    const add = (label, pts) => { if (pts !== 0) items.push({ label, pts }); };

    items.push({ label: 'Starting score', pts: 40, base: true });
    add('Paid off the bond in full', p.completionBonus);
    add(p.yearsSaved > 0 ? `Finished ${p.yearsSaved} year${p.yearsSaved === 1 ? '' : 's'} early (of ${state.loanTermYears})` : 'Finished ahead of schedule', p.earlyRepayment);
    add('Extra payments into the bond', p.extraPayments);
    add(`${state.streakExtraPayments}-year extra-payment streak`, p.streak);
    add(`Achievements earned (${state.achievements.length})`, p.achievements);
    add('Price negotiation (interest saved)', p.priceNeg);
    add('Rate negotiation (interest saved)', p.rateNeg);
    add('Emergency reserves banked', p.banked);
    add(`Smart decisions paid off (${state.decisionsWon || 0} wins, ${state.decisionsLost || 0} losses)`, p.smartDecisions);
    add('Average financial stress', p.stressPenalty);
    add('Borrowed from the bank', p.borrowPenalty);
    add(`Loan extensions (${state.loanExtensions})`, p.extensionPenalty);
    add(`High-stress years (${p.stressedYears})`, p.stressedYearsPenalty);
    if (state.phase === 'lost') items.push({ label: 'Lost the game (score reduced to 30%)', pts: null, penalty: true });

    const strengths = [];
    const improvements = [];
    if (p.yearsSaved > 0) strengths.push(`You paid the bond off ${p.yearsSaved} year${p.yearsSaved === 1 ? '' : 's'} early — every early year is a year of interest you never paid.`);
    if (state.discountPct >= 8) strengths.push(`You negotiated ${state.discountPct.toFixed(1)}% off the asking price, which saved roughly ${SA.fmt(state.interestSavedFromPrice)} in lifetime interest.`);
    else improvements.push('Push harder on the purchase price. Every 1% off the price compounds into years of saved interest.');
    if (state.negotiatedRate <= SA.PRIME_RATE - 0.5) strengths.push(`You locked a rate of ${state.negotiatedRate.toFixed(2)}% (${(SA.PRIME_RATE - state.negotiatedRate).toFixed(2)}% below prime) — worth about ${SA.fmt(state.interestSavedFromRate)} over the loan.`);
    else improvements.push('Shop your rate harder. Playing banks against each other can win prime minus 1% or better, worth hundreds of thousands over a full term.');
    if (state.totalExtraPaid > 0) strengths.push(`You paid ${SA.fmt(state.totalExtraPaid)} extra into the bond. Extra payments early in the loan attack the balance when interest is at its heaviest.`);
    else improvements.push('You never paid extra into the bond. Even small extra payments in the early years cut whole years off the term.');
    if ((state.decisionsWon || 0) > (state.decisionsLost || 0)) strengths.push(`Your yearly decisions came out ahead (${state.decisionsWon} wins vs ${state.decisionsLost} losses) — good preparation tilts the odds.`);
    else if ((state.decisionsLost || 0) > (state.decisionsWon || 0)) improvements.push('More of your yearly decisions went wrong than right. Healthy cash reserves and low stress tilt decision odds in your favour.');
    if (state.totalBankedEver >= state.monthlyNetSalary * 3) strengths.push('You kept an emergency reserve, so surprises were paid in cash instead of being added to your bond at full interest.');
    else if (state.currentYear >= 2) improvements.push('Build an emergency fund early. Every unbanked emergency gets borrowed onto your bond and accrues interest for years.');
    if (state.totalBorrowed > 0) improvements.push(`You borrowed ${SA.fmt(state.totalBorrowed)} from the bank along the way — bailout debt compounds at your bond rate and drags your score.`);
    if (state.loanExtensions > 0) improvements.push('Extending the loan lowered your monthly payment, but added years of interest to the total cost.');
    if (p.avgUnderwater < 30 && state.currentYear >= 3) strengths.push('You kept financial stress low for most of the journey — the surest sign of a sustainable budget.');
    if (p.avgUnderwater >= 50) improvements.push('Cash ran thin in most years. Lower fixed costs, or build reserves before taking on discretionary spending.');
    if (state.phase === 'lost' && state.lossReason === 'bankrupt') improvements.push('You ran out of cash entirely. Affordability is about the full monthly cost of ownership — bond, running costs, living expenses — not just the repayment.');
    if (state.phase === 'lost' && state.lossReason === 'underwater') improvements.push('Sustained financial stress ended the game. When the stress meter climbs, cut spending and bank cash before taking on anything new.');

    return { items, total: state.score, strengths, improvements };
  }

  function getScoreRating(score) {
    if (score >= 90) return { label: 'Financial Genius', emoji: '\u{1F3C6}', color: '#D9B44A' };
    if (score >= 75) return { label: 'Smart Homeowner', emoji: '\u{2B50}', color: '#57BE74' };
    if (score >= 60) return { label: 'Decent Manager', emoji: '\u{1F44D}', color: '#6FB5E8' };
    if (score >= 45) return { label: 'Surviving', emoji: '\u{1F610}', color: '#E8B33C' };
    if (score >= 30) return { label: 'Struggling', emoji: '\u{1F62C}', color: '#E07B39' };
    return { label: 'Financial Disaster', emoji: '\u{1F4B8}', color: '#E15B4D' };
  }

  function applyEvent(state, impacts) {
    if (impacts.rateChange) {
      state.interestRate = Math.max(5, Math.min(20, state.interestRate + impacts.rateChange));
      state.monthlyRate = state.interestRate / 100 / 12;
      state.minPayment = recalcMinPayment(state);
      recalcRunningCosts(state);
      state.annualBondPayment = state.minPayment * 12;
      state.rateChangeHistory.push({ year: state.currentYear, rate: state.interestRate });
    }
    if (impacts.cashImpact) {
      state.cashOnHand += impacts.cashImpact;
    }
    if (impacts.salaryImpact) {
      state.monthlyNetSalary = Math.max(
        Math.round(state.monthlyNetSalary * 0.5),
        Math.round(state.monthlyNetSalary + impacts.salaryImpact)
      );
      state.annualNetSalary = state.monthlyNetSalary * 12;
    }
    if (impacts.ownershipCostSpike) {
      state.cashOnHand -= impacts.ownershipCostSpike;
    }
    if (impacts.propertyImpact) {
      state.propertyValue *= (1 + impacts.propertyImpact);
    }
    if (impacts.monthlyCostIncrease) {
      state.runningCostExtra += impacts.monthlyCostIncrease;
      recalcRunningCosts(state);
    }
    state.yearsSinceLastEvent = 0;
    state.monthlySurplus = state.monthlyNetSalary - state.minPayment - state.fixedMonthlyOutgoing;
    state.annualSurplus = Math.round(state.monthlySurplus * 12);
    state.affordabilityRatio = state.minPayment / state.monthlyNetSalary * 100;
    state.underwaterLevel = calculateUnderwaterLevel(state);
    return state;
  }

  function borrowFromBank(state, amount) {
    state.balance += amount;
    state.cashOnHand += amount;
    state.totalBorrowed += amount;
    state.minPayment = recalcMinPayment(state);
    recalcRunningCosts(state);
    state.annualBondPayment = state.minPayment * 12;
    state.monthlySurplus = state.monthlyNetSalary - state.minPayment - state.fixedMonthlyOutgoing;
    state.affordabilityRatio = state.minPayment / state.monthlyNetSalary * 100;
    state.underwaterLevel = calculateUnderwaterLevel(state);
    return state;
  }

  function extendLoan(state, additionalYears) {
    state.loanTermMonths += additionalYears * 12;
    state.loanTermYears += additionalYears;
    state.loanExtensions++;
    state.minPayment = recalcMinPayment(state);
    recalcRunningCosts(state);
    state.annualBondPayment = state.minPayment * 12;
    state.monthlySurplus = state.monthlyNetSalary - state.minPayment - state.fixedMonthlyOutgoing;
    state.affordabilityRatio = state.minPayment / state.monthlyNetSalary * 100;
    state.underwaterLevel = calculateUnderwaterLevel(state);
    return state;
  }

  function checkAchievements(state) {
    const newA = [];
    const has = (id) => state.achievements.some(a => a.id === id);

    if (!has('first_extra') && state.totalExtraPaid > 0)
      newA.push({ id: 'first_extra', icon: '⭐', title: 'First Strike', desc: 'Made your first extra payment' });
    if (!has('streak_3') && state.streakExtraPayments >= 3)
      newA.push({ id: 'streak_3', icon: '🔥', title: 'On Fire', desc: '3 consecutive years of extra payments' });
    if (!has('half_way') && state.balance <= state.originalBondAmount / 2)
      newA.push({ id: 'half_way', icon: '🎯', title: 'Halfway There', desc: 'Balance below 50%' });
    if (!has('quarter') && state.balance <= state.originalBondAmount / 4)
      newA.push({ id: 'quarter', icon: '🚀', title: 'Final Quarter', desc: 'Balance below 25%' });
    if (!has('equity_50') && state.equity >= state.propertyValue * 0.5)
      newA.push({ id: 'equity_50', icon: '🏠', title: 'Majority Owner', desc: 'Own more than 50% equity' });
    if (!has('survived_5') && state.events.length >= 5)
      newA.push({ id: 'survived_5', icon: '🛡️', title: 'Battle Tested', desc: 'Survived 5 life events' });
    if (!has('negotiator') && state.discountPct >= 10)
      newA.push({ id: 'negotiator', icon: '🤝', title: 'Master Negotiator', desc: '10%+ discount on price' });
    if (!has('rate_boss') && state.negotiatedRate <= SA.PRIME_RATE - 1)
      newA.push({ id: 'rate_boss', icon: '📉', title: 'Rate Boss', desc: 'Negotiated prime -1% or better' });
    if (!has('dry_spell') && state.underwaterLevel <= 10 && state.currentYear >= 3)
      newA.push({ id: 'dry_spell', icon: '🌊', title: 'Head Above Water', desc: 'Underwater below 10% at year 3' });
    if (!has('no_bailout') && state.currentYear >= 5 && state.totalBorrowed === 0)
      newA.push({ id: 'no_bailout', icon: '💎', title: 'Self-Made', desc: '5 years without borrowing from bank' });
    if (!has('early_bird') && state.balance <= 0 && state.currentYear < state.loanTermYears)
      newA.push({ id: 'early_bird', icon: '🏆', title: 'Early Bird', desc: 'Paid off ahead of schedule' });
    if (!has('smart_banker') && state.totalBankedEver >= state.monthlyNetSalary * 6)
      newA.push({ id: 'smart_banker', icon: '🏦', title: 'Smart Banker', desc: 'Banked 6+ months of salary' });

    state.achievements.push(...newA);
    return newA;
  }

  function getYearLabel(yearNum, startYear) {
    return `Year ${yearNum} (${startYear + yearNum})`;
  }

  function getRemainingEstimate(state) {
    if (state.balance <= 0) return 0;
    const mr = state.interestRate / 100 / 12;
    if (mr === 0 || state.minPayment <= 0) return Math.ceil(state.balance / (state.minPayment || 1) / 12);
    const ratio = state.balance * mr / state.minPayment;
    if (ratio >= 1) return 99;
    const n = -Math.log(1 - ratio) / Math.log(1 + mr);
    return Math.max(1, Math.ceil(isFinite(n) ? n / 12 : state.loanTermYears - state.currentYear));
  }

  // v4: Affordability rating label
  function getAffordabilityRating(ratio) {
    if (ratio > 45) return { label: 'Critical', color: 'var(--color-danger)', level: 'danger' };
    if (ratio > 38) return { label: 'Stretched', color: 'var(--color-orange)', level: 'warning' };
    if (ratio > 32) return { label: 'Tight', color: 'var(--color-warning)', level: 'caution' };
    if (ratio > 25) return { label: 'Fair', color: 'var(--color-info)', level: 'ok' };
    return { label: 'Comfortable', color: 'var(--color-primary)', level: 'good' };
  }

  return {
    calcMonthlyPayment,
    calcTotalInterest,
    createGameState,
    processYear,
    resolveDecisions,
    recalcRunningCosts,
    payExtraFromCash,
    bankCash,
    payExtraFromBank,
    handleEmergency,
    applyEvent,
    borrowFromBank,
    extendLoan,
    checkAchievements,
    calculateScore,
    getScoreBreakdown,
    getScoreRating,
    calculateUnderwaterLevel,
    getYearLabel,
    getRemainingEstimate,
    getAffordabilityRating,
    calcYearAmortization,
    processInvestments,
  };
})();
