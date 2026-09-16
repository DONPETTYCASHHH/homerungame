/* ============================================
   HOME RUN v4 — Events System
   Yearly events, timed decisions (smooth countdown),
   more life events & temptation, bank extension offers
   ============================================ */

const GameEvents = (() => {

  // Regular events — one per year
  const EVENTS = [
    // === ECONOMIC / RATE EVENTS ===
    { id: 'sarb_hike', type: 'bad', icon: '📈', title: 'SARB Rate Hike',
      desc: 'The MPC raised the repo rate to combat inflation. Your bond rate increases.',
      getImpact: (s) => { const hike = [0.25,0.50,0.50,0.75,1.00][Math.floor(Math.random()*5)];
        return { rateChange: hike, impactText: `Rate: ${s.interestRate.toFixed(2)}% → ${(s.interestRate+hike).toFixed(2)}%` }; }, weight: 4 },
    { id: 'sarb_cut', type: 'good', icon: '📉', title: 'SARB Rate Cut',
      desc: 'The MPC lowered the repo rate. Your bond payment decreases.',
      getImpact: (s) => { const cut = [0.25,0.25,0.50][Math.floor(Math.random()*3)];
        return { rateChange: -cut, impactText: `Rate: ${s.interestRate.toFixed(2)}% → ${(s.interestRate-cut).toFixed(2)}%` }; }, weight: 2 },
    { id: 'rand_crash', type: 'bad', icon: '💱', title: 'Rand Under Pressure',
      desc: 'Global risk-off sentiment hammered the Rand. Fuel and food prices spike for months.',
      getImpact: (s) => { const hit = Math.round(s.monthlyNetSalary*1.5);
        return { cashImpact: -hit, impactText: `Cost of living spike: -${SA.fmt(hit)}` }; }, weight: 2 },

    // === PROPERTY / MAINTENANCE ===
    { id: 'geyser', type: 'bad', icon: '💧', title: 'Geyser Burst',
      desc: 'Your geyser burst overnight. Water damage to ceilings. Urgent replacement needed.',
      getImpact: (s) => { const cost = 18000+Math.round(Math.random()*25000);
        return { ownershipCostSpike: cost, impactText: `Emergency repair: -${SA.fmt(cost)}` }; }, weight: 3 },
    { id: 'roof_leak', type: 'bad', icon: '🏚️', title: 'Roof Leak',
      desc: 'Gauteng hailstorm damaged your roof. Insurance excess applies.',
      getImpact: (s) => { const cost = 12000+Math.round(Math.random()*30000);
        return { ownershipCostSpike: cost, impactText: `Repair cost: -${SA.fmt(cost)}` }; }, weight: 2 },
    { id: 'special_levy', type: 'bad', icon: '🏢', title: 'Special Levy',
      desc: 'Body corporate issued a special levy for building waterproofing.',
      getImpact: (s) => { const cost = 15000+Math.round(Math.random()*25000);
        return { ownershipCostSpike: cost, impactText: `Special levy: -${SA.fmt(cost)}` }; }, weight: 3 },
    { id: 'loadshedding', type: 'bad', icon: '⚡', title: 'Load Shedding Damage',
      desc: 'Power surges fried your appliances. Inverter battery needs replacing.',
      getImpact: (s) => { const base = s.hasAppliances ? 12000 : 30000; const cost = base+Math.round(Math.random()*20000);
        return { ownershipCostSpike: cost, impactText: `Damage: -${SA.fmt(cost)}` }; }, weight: 2 },
    { id: 'plumbing', type: 'bad', icon: '🔧', title: 'Plumbing Nightmare',
      desc: 'Sewage backup. Plumber had to dig up tiles. Messy and expensive.',
      getImpact: (s) => { const cost = 12000+Math.round(Math.random()*20000);
        return { ownershipCostSpike: cost, impactText: `Plumbing bill: -${SA.fmt(cost)}` }; }, weight: 2 },
    { id: 'rates_hike', type: 'bad', icon: '🏛️', title: 'Municipal Rates Increase',
      desc: 'City of Joburg hiked rates above inflation. Monthly costs increase permanently.',
      getImpact: (s) => { const increase = Math.round(s.ownershipCosts.total*0.10);
        return { monthlyCostIncrease: increase, impactText: `Monthly costs up by ${SA.fmt(increase)}/month permanently` }; }, weight: 2 },
    { id: 'security_incident', type: 'bad', icon: '🔒', title: 'Break-in Attempt',
      desc: s => s.hasSecurity ? 'Attempted break-in, but your security system held. Minor fence repair needed.' : 'Break-in while you were away. Stolen electronics and property damage.',
      getImpact: (s) => { const cost = s.hasSecurity ? (5000+Math.round(Math.random()*8000)) : (20000+Math.round(Math.random()*40000));
        return { ownershipCostSpike: cost, impactText: `${s.hasSecurity ? 'Minor repair' : 'Theft & damage'}: -${SA.fmt(cost)}` }; }, weight: 2 },

    // === INCOME / CAREER ===
    { id: 'bonus', type: 'good', icon: '💰', title: 'Performance Bonus',
      desc: 'Company results were strong. You received a performance bonus.',
      getImpact: (s) => { const bonus = Math.round(s.monthlyNetSalary*(0.5+Math.random()*1.0));
        return { cashImpact: bonus, impactText: `Bonus: +${SA.fmt(bonus)}` }; }, weight: 3 },
    { id: 'freelance', type: 'good', icon: '💻', title: 'Side Hustle Pays Off',
      desc: 'Your freelance project delivered. Extra income this year.',
      getImpact: (s) => { const income = 8000+Math.round(Math.random()*25000);
        return { cashImpact: income, impactText: `Side income: +${SA.fmt(income)}` }; }, weight: 2 },
    { id: 'sars_refund', type: 'good', icon: '🧾', title: 'SARS Tax Refund',
      desc: 'Your tax assessment came back with a refund.',
      getImpact: (s) => { const refund = 5000+Math.round(Math.random()*18000);
        return { cashImpact: refund, impactText: `Refund: +${SA.fmt(refund)}` }; }, weight: 2 },
    { id: 'retrenchment', type: 'bad', icon: '😰', title: 'Retrenchment Scare',
      desc: 'Company restructuring. You survived but your salary was cut.',
      getImpact: (s) => { const cut = -Math.round(s.monthlyNetSalary*0.10);
        return { salaryImpact: cut, impactText: `Salary permanently: -${SA.fmt(Math.abs(cut))}/month` }; }, weight: 1 },
    { id: 'promotion', type: 'good', icon: '📊', title: 'Promotion!',
      desc: 'Your hard work got recognized. Salary increase effective immediately.',
      getImpact: (s) => { const raise = Math.round(s.monthlyNetSalary*(0.08+Math.random()*0.07));
        return { salaryImpact: raise, impactText: `Salary: +${SA.fmt(raise)}/month` }; }, weight: 1 },
    { id: 'medical', type: 'bad', icon: '🏥', title: 'Medical Emergency',
      desc: 'Hospital stay not fully covered by medical aid. Gap payment required.',
      getImpact: (s) => { const cost = 10000+Math.round(Math.random()*40000);
        return { ownershipCostSpike: cost, impactText: `Medical gap: -${SA.fmt(cost)}` }; }, weight: 2 },
    { id: 'car_trouble', type: 'bad', icon: '🚗', title: 'Car Breakdown',
      desc: 'Your car needs major repairs. No choice — you need it for work.',
      getImpact: (s) => { const cost = 12000+Math.round(Math.random()*30000);
        return { ownershipCostSpike: cost, impactText: `Mechanic: -${SA.fmt(cost)}` }; }, weight: 2 },
    { id: 'property_boom', type: 'good', icon: '🏘️', title: 'Property Value Surge',
      desc: 'New Gautrain station announced nearby. Property values in your area jumped.',
      getImpact: (s) => { const pct = 0.05+Math.random()*0.08;
        return { propertyImpact: pct, impactText: `Property value: +${(pct*100).toFixed(1)}%` }; }, weight: 1 },
    { id: 'property_slump', type: 'bad', icon: '📉', title: 'Property Market Slump',
      desc: 'Oversupply and a weak economy hit your area. Property values dipped this year.',
      getImpact: (s) => { const pct = -(0.03+Math.random()*0.05);
        return { propertyImpact: pct, impactText: `Property value: ${(pct*100).toFixed(1)}%` }; }, weight: 1 },

    // === v4 NEW: MORE LIFE EVENTS & TEMPTATIONS ===
    { id: 'wedding_invite', type: 'bad', icon: '💒', title: 'Wedding Season',
      desc: 'Three weddings this year. Gifts, outfits, and travel add up fast.',
      getImpact: (s) => { const cost = 8000+Math.round(Math.random()*15000);
        return { ownershipCostSpike: cost, impactText: `Wedding expenses: -${SA.fmt(cost)}` }; }, weight: 2 },
    { id: 'holiday_temptation', type: 'bad', icon: '✈️', title: 'Holiday Temptation',
      desc: 'Friends are going to Zanzibar. You caved and booked a trip.',
      getImpact: (s) => { const cost = 15000+Math.round(Math.random()*25000);
        return { ownershipCostSpike: cost, impactText: `Holiday: -${SA.fmt(cost)}` }; }, weight: 2 },
    { id: 'black_friday', type: 'bad', icon: '🛍️', title: 'Black Friday Splurge',
      desc: 'Those deals were too good. New TV, soundbar, and "essential" gadgets.',
      getImpact: (s) => { const cost = 8000+Math.round(Math.random()*20000);
        return { ownershipCostSpike: cost, impactText: `Shopping spree: -${SA.fmt(cost)}` }; }, weight: 2 },
    { id: 'pet_emergency', type: 'bad', icon: '🐕', title: 'Pet Emergency',
      desc: 'Your dog ate something it shouldn\'t have. Emergency vet bills.',
      getImpact: (s) => { const cost = 5000+Math.round(Math.random()*15000);
        return { ownershipCostSpike: cost, impactText: `Vet bill: -${SA.fmt(cost)}` }; }, weight: 1 },
    { id: 'new_baby', type: 'bad', icon: '👶', title: 'New Addition to Family',
      desc: 'Congratulations! But babies are expensive. Monthly expenses increase permanently.',
      getImpact: (s) => { const increase = Math.round(s.monthlyLivingExpenses*0.15);
        return { monthlyCostIncrease: increase, impactText: `Monthly costs up: +${SA.fmt(increase)}/month` }; }, weight: 1 },
    { id: 'fuel_hike', type: 'bad', icon: '⛽', title: 'Fuel Price Shock',
      desc: 'Petrol jumped R3/litre overnight. Transport costs soar.',
      getImpact: (s) => { const cost = 4000+Math.round(Math.random()*8000);
        return { cashImpact: -cost, impactText: `Extra fuel costs: -${SA.fmt(cost)}` }; }, weight: 2 },
    { id: 'crypto_win', type: 'good', icon: '🪙', title: 'Crypto Windfall',
      desc: 'That Bitcoin you forgot about? It\'s worth something now.',
      getImpact: (s) => { const gain = 10000+Math.round(Math.random()*40000);
        return { cashImpact: gain, impactText: `Crypto profit: +${SA.fmt(gain)}` }; }, weight: 1 },
    { id: 'rental_income', type: 'good', icon: '🏘️', title: 'Airbnb Income',
      desc: 'Listed your spare room on Airbnb. Steady bookings this year.',
      getImpact: (s) => { const income = 3000+Math.round(Math.random()*5000);
        return { salaryImpact: income, impactText: `Rental income: +${SA.fmt(income)}/month` }; }, weight: 1 },
  ];

  // TIMED DECISION EVENTS — smooth countdown, 10 seconds
  const TIMED_EVENTS = [
    { id: 'timed_refinance', icon: '🏦', title: 'Quick Decision: Refinance Offer',
      desc: 'A competing bank offers a lower rate, but it expires in 10 seconds.',
      getChoices: (s) => {
        const newRate = Math.max(SA.PRIME_RATE-1.5, s.interestRate-(0.5+Math.random()*0.75));
        const fee = Math.round(s.balance*0.01);
        return { choices: [
          { label: `Switch to ${newRate.toFixed(2)}% (fee: ${SA.fmt(fee)})`, apply: { rateChange: -(s.interestRate-newRate), cashImpact: -fee } },
          { label: 'Stay with current bank', apply: {} },
        ], defaultChoice: 1, impactText: `New rate: ${newRate.toFixed(2)}% | Fee: ${SA.fmt(fee)}` };
      },
    },
    { id: 'timed_inheritance', icon: '🎁', title: 'Quick Decision: Inheritance',
      desc: 'A distant relative left you money. Lump sum on bond or keep as cash? 10 seconds.',
      getChoices: (s) => {
        const amount = 40000+Math.round(Math.random()*80000);
        return { choices: [
          { label: `Pay ${SA.fmt(amount)} into bond`, apply: { cashImpact: 0, _lumpSum: amount } },
          { label: `Keep ${SA.fmt(amount)} as cash`, apply: { cashImpact: amount } },
        ], defaultChoice: 1, impactText: `Amount: ${SA.fmt(amount)}` };
      },
    },
    { id: 'timed_solar', icon: '☀️', title: 'Quick Decision: Solar Installation',
      desc: 'Limited-time solar deal. Install now or miss out. 10 seconds.',
      getChoices: (s) => {
        const cost = 90000+Math.round(Math.random()*50000);
        const monthlySaving = 1200+Math.round(Math.random()*800);
        return { choices: [
          { label: `Install (${SA.fmt(cost)})`, apply: { cashImpact: -cost, propertyImpact: 0.05, monthlyCostIncrease: -monthlySaving } },
          { label: 'Pass', apply: {} },
        ], defaultChoice: 1, impactText: `Cost: ${SA.fmt(cost)} | Save ${SA.fmt(monthlySaving)}/mo` };
      },
    },
    { id: 'timed_investment', icon: '📈', title: 'Quick Decision: Investment Opportunity',
      desc: 'A friend offers you into a property syndicate. High risk. 10 seconds.',
      getChoices: (s) => {
        const amount = Math.round(s.monthlyNetSalary*2);
        const isSuccess = Math.random() > 0.45;
        return { choices: [
          { label: `Invest ${SA.fmt(amount)}`, apply: isSuccess ? { cashImpact: Math.round(amount*0.2) } : { cashImpact: -amount } },
          { label: 'Too risky, pass', apply: {} },
        ], defaultChoice: 1, impactText: isSuccess ? `Return: +${SA.fmt(Math.round(amount*0.2))}` : `Lost: -${SA.fmt(amount)}`, revealAfter: true };
      },
    },
    { id: 'timed_retrench', icon: '😰', title: 'Quick Decision: Severance Package',
      desc: 'Company restructuring. Take severance or stay at reduced salary? 10 seconds.',
      getChoices: (s) => {
        const severance = Math.round(s.monthlyNetSalary*4);
        return { choices: [
          { label: `Take ${SA.fmt(severance)} severance`, apply: { cashImpact: severance, salaryImpact: -Math.round(s.monthlyNetSalary*0.25) } },
          { label: 'Stay at reduced salary', apply: { salaryImpact: -Math.round(s.monthlyNetSalary*0.12) } },
        ], defaultChoice: 1, impactText: `Severance: ${SA.fmt(severance)} (but -25% salary)` };
      },
    },
    { id: 'timed_tenant', icon: '🏠', title: 'Quick Decision: Rental Income',
      desc: 'A colleague needs a place urgently. Rent out your spare room? 10 seconds.',
      getChoices: (s) => {
        const rental = 3500+Math.round(Math.random()*2500);
        return { choices: [
          { label: `Rent room (+${SA.fmt(rental)}/mo)`, apply: { salaryImpact: rental } },
          { label: 'Keep privacy', apply: {} },
        ], defaultChoice: 1, impactText: `Extra income: +${SA.fmt(rental)}/month` };
      },
    },
    // v4: new timed events
    { id: 'timed_car_deal', icon: '🚙', title: 'Quick Decision: Car Upgrade',
      desc: 'Flash sale on a reliable commuter car. Your current one is costing you in repairs. 10 seconds.',
      getChoices: (s) => {
        const cost = 60000+Math.round(Math.random()*40000);
        return { choices: [
          { label: `Buy car (${SA.fmt(cost)})`, apply: { cashImpact: -cost, monthlyCostIncrease: -500 } },
          { label: 'Keep old car', apply: {} },
        ], defaultChoice: 1, impactText: `Cost: ${SA.fmt(cost)} | Save R500/mo on repairs` };
      },
    },
    { id: 'timed_study', icon: '📚', title: 'Quick Decision: Upskill',
      desc: 'Employer offers partial funding for a certification. Could boost your salary. 10 seconds.',
      getChoices: (s) => {
        const cost = 15000+Math.round(Math.random()*10000);
        const raise = Math.round(s.monthlyNetSalary*0.08);
        return { choices: [
          { label: `Study (${SA.fmt(cost)})`, apply: { cashImpact: -cost, salaryImpact: raise } },
          { label: 'Pass', apply: {} },
        ], defaultChoice: 1, impactText: `Cost: ${SA.fmt(cost)} | Salary +${SA.fmt(raise)}/mo` };
      },
    },
  ];

  // v4: DECISION POOL — 4 random per year, 50/50 outcomes, no amounts shown
  const DECISION_POOL = [
    // Small/insignificant decisions (low impact either way)
    { id: 'cut_coffee', icon: '☕', label: 'Cut your daily coffee',
      positiveDesc: 'You saved on coffee and discovered a love for home-brewed. Small win.',
      negativeDesc: 'You tried, but ended up buying fancier beans. Barely broke even.',
      positiveImpact: { cashImpact: 2400 }, negativeImpact: { cashImpact: -800 }, category: 'small' },
    { id: 'pack_lunch', icon: '🍱', label: 'Pack your lunch',
      positiveDesc: 'Meal-prepping saved you a decent chunk and you ate healthier.',
      negativeDesc: 'Food waste and Woolies runs made it cost about the same.',
      positiveImpact: { cashImpact: 3600 }, negativeImpact: { cashImpact: -1200 }, category: 'small' },
    { id: 'cancel_gym', icon: '🏋️', label: 'Cancel your gym membership',
      positiveDesc: 'Running outside worked just as well. Saved the fees.',
      negativeDesc: 'You missed the gym, rejoined at a higher rate.',
      positiveImpact: { cashImpact: 6000 }, negativeImpact: { cashImpact: -2000 }, category: 'small' },
    { id: 'diy_haircut', icon: '💇', label: 'DIY haircuts at home',
      positiveDesc: 'Turns out you\'re decent with clippers. Saved a bit.',
      negativeDesc: 'Disaster. Emergency salon visit cost more than usual.',
      positiveImpact: { cashImpact: 2400 }, negativeImpact: { cashImpact: -1500 }, category: 'small' },

    // Medium decisions (moderate swings)
    { id: 'side_hustle', icon: '💻', label: 'Start a side hustle',
      positiveDesc: 'Your freelance gig took off. Solid extra income this year.',
      negativeDesc: 'The side hustle flopped. You spent on tools and got nowhere.',
      positiveImpact: { cashImpact: 36000 }, negativeImpact: { cashImpact: -12000 }, category: 'medium' },
    { id: 'switch_insurance', icon: '📋', label: 'Switch insurance providers',
      positiveDesc: 'Found a better deal with same cover. Monthly savings.',
      negativeDesc: 'New provider had gaps. Uncovered claim hit your pocket.',
      positiveImpact: { monthlyCostIncrease: -800 }, negativeImpact: { cashImpact: -15000 }, category: 'medium' },
    { id: 'rent_room', icon: '🏠', label: 'Rent out the spare room',
      positiveDesc: 'Great tenant — steady rental income all year.',
      negativeDesc: 'Terrible tenant. Damage, missed payments, legal fees.',
      positiveImpact: { salaryImpact: 4500 }, negativeImpact: { cashImpact: -20000 }, category: 'medium' },
    { id: 'invest_stocks', icon: '📈', label: 'Invest savings in shares',
      positiveDesc: 'Market rallied. Your portfolio grew nicely.',
      negativeDesc: 'Market crashed. Lost a chunk of your investment.',
      positiveImpact: { cashImpact: 25000 }, negativeImpact: { cashImpact: -18000 }, category: 'medium' },
    { id: 'carpool', icon: '🚗', label: 'Carpool to work',
      positiveDesc: 'Fuel savings and good company on the drive.',
      negativeDesc: 'Schedule clashes made it impractical. Uber costs added up.',
      positiveImpact: { cashImpact: 18000 }, negativeImpact: { cashImpact: -6000 }, category: 'medium' },
    { id: 'downgrade_medical', icon: '🏥', label: 'Switch to cheaper medical aid',
      positiveDesc: 'Saved monthly and still covered for what you needed.',
      negativeDesc: 'Needed specialist care. Had to pay the gap out of pocket.',
      positiveImpact: { monthlyCostIncrease: -1200 }, negativeImpact: { cashImpact: -25000 }, category: 'medium' },

    // Big decisions (significant swings)
    { id: 'start_business', icon: '🏪', label: 'Start a small business',
      positiveDesc: 'The business found its market. You\'re earning extra income.',
      negativeDesc: 'The business failed. Start-up costs were a total loss.',
      positiveImpact: { salaryImpact: 6000 }, negativeImpact: { cashImpact: -40000 }, category: 'big' },
    { id: 'buy_rental', icon: '🏘️', label: 'Invest in a rental property',
      positiveDesc: 'Good location — rental income covers costs and then some.',
      negativeDesc: 'Bad tenants and maintenance ate all the profit and more.',
      positiveImpact: { salaryImpact: 3000 }, negativeImpact: { cashImpact: -35000 }, category: 'big' },
    { id: 'overseas_course', icon: '🎓', label: 'Take an overseas short course',
      positiveDesc: 'New qualification landed you a salary bump.',
      negativeDesc: 'Course was a waste. Travel costs blew out your budget.',
      positiveImpact: { salaryImpact: 5000 }, negativeImpact: { cashImpact: -45000 }, category: 'big' },
    { id: 'renovate_kitchen', icon: '🍳', label: 'Renovate the kitchen',
      positiveDesc: 'Property value jumped. Great investment.',
      negativeDesc: 'Contractor disappeared mid-job. Had to pay double to fix it.',
      positiveImpact: { cashImpact: 30000 }, negativeImpact: { cashImpact: -50000 }, category: 'big' },

    // Life/temptation decisions
    { id: 'new_phone', icon: '📱', label: 'Upgrade to latest smartphone',
      positiveDesc: 'Got a deal and sold the old one. Net cost was minimal.',
      negativeDesc: 'Screen cracked in week two. Repair + insurance excess.',
      positiveImpact: { cashImpact: 2000 }, negativeImpact: { cashImpact: -8000 }, category: 'medium' },
    { id: 'holiday_local', icon: '🏖️', label: 'Book a holiday to Ballito',
      positiveDesc: 'Off-season deal. Great break and barely spent anything.',
      negativeDesc: 'Peak season prices. Way over budget.',
      positiveImpact: { cashImpact: -3000 }, negativeImpact: { cashImpact: -20000 }, category: 'medium' },
    { id: 'gaming_setup', icon: '🎮', label: 'Build a gaming PC',
      positiveDesc: 'Got parts on sale. Ended up doing freelance design work on it.',
      negativeDesc: 'Spent way too much. And it\'s eating into your productive hours.',
      positiveImpact: { cashImpact: 5000 }, negativeImpact: { cashImpact: -15000 }, category: 'medium' },
    { id: 'adopt_pet', icon: '🐶', label: 'Adopt a rescue dog',
      positiveDesc: 'Low-maintenance companion. Vet bills were minimal this year.',
      negativeDesc: 'Emergency surgery needed. Vet bills were brutal.',
      positiveImpact: { cashImpact: -3000 }, negativeImpact: { cashImpact: -18000 }, category: 'medium' },

    // v4.2: MORE VARIETY — fresh decisions
    // Small
    { id: 'cancel_streaming', icon: '📺', label: 'Cancel streaming subscriptions',
      positiveDesc: 'You discovered free content and saved every month.',
      negativeDesc: 'Lasted two weeks. Resubscribed to everything plus one more.',
      positiveImpact: { cashImpact: 3600 }, negativeImpact: { cashImpact: -1000 }, category: 'small' },
    { id: 'grow_veggies', icon: '🥬', label: 'Start a veggie garden',
      positiveDesc: 'Fresh produce all year. Grocery bill dropped nicely.',
      negativeDesc: 'Bought fancy tools and seeds. Everything died in week 3.',
      positiveImpact: { cashImpact: 4000 }, negativeImpact: { cashImpact: -2500 }, category: 'small' },
    { id: 'sell_clutter', icon: '📦', label: 'Sell stuff on Facebook Marketplace',
      positiveDesc: 'Cleared the garage and made decent cash.',
      negativeDesc: 'Time wasters and no-shows. Barely sold anything.',
      positiveImpact: { cashImpact: 5000 }, negativeImpact: { cashImpact: -500 }, category: 'small' },
    { id: 'switch_cellphone', icon: '📶', label: 'Switch to a cheaper data plan',
      positiveDesc: 'Same coverage, half the price. Easy win.',
      negativeDesc: 'Terrible network. Had to switch back and pay an exit fee.',
      positiveImpact: { cashImpact: 3000 }, negativeImpact: { cashImpact: -2000 }, category: 'small' },
    { id: 'batch_cooking', icon: '🍲', label: 'Batch cook meals for the week',
      positiveDesc: 'Saved on takeout and ate healthier.',
      negativeDesc: 'Bought too many containers and gadgets. Kitchen chaos.',
      positiveImpact: { cashImpact: 4800 }, negativeImpact: { cashImpact: -1500 }, category: 'small' },
    { id: 'cycle_work', icon: '🚴', label: 'Cycle to work',
      positiveDesc: 'Saved on fuel and got fit.',
      negativeDesc: 'Bike got stolen in week 2. Had to buy a new one.',
      positiveImpact: { cashImpact: 6000 }, negativeImpact: { cashImpact: -4000 }, category: 'small' },

    // Medium
    { id: 'solar_geyser', icon: '☀️', label: 'Install a solar geyser',
      positiveDesc: 'Electricity bill dropped massively. Great investment.',
      negativeDesc: 'Dodgy installer. Leaked within months. Repair costs piled up.',
      positiveImpact: { monthlyCostIncrease: -900 }, negativeImpact: { cashImpact: -22000 }, category: 'medium' },
    { id: 'freelance_weekend', icon: '💻', label: 'Take weekend freelance work',
      positiveDesc: 'Clients loved your work. Extra income rolling in.',
      negativeDesc: 'Burnt out fast. Quality dropped and clients disappeared.',
      positiveImpact: { cashImpact: 24000 }, negativeImpact: { cashImpact: -5000 }, category: 'medium' },
    { id: 'learn_trading', icon: '📉', label: 'Learn forex trading',
      positiveDesc: 'Disciplined approach paid off. Made decent returns.',
      negativeDesc: 'Got rekt by a volatile market. Lost your starting capital.',
      positiveImpact: { cashImpact: 18000 }, negativeImpact: { cashImpact: -20000 }, category: 'medium' },
    { id: 'rainwater_tank', icon: '💧', label: 'Install a rainwater tank',
      positiveDesc: 'Water bill halved. Garden thriving from free water.',
      negativeDesc: 'Tank cracked. Water damage to the patio. Insurance won\'t cover it.',
      positiveImpact: { monthlyCostIncrease: -600 }, negativeImpact: { cashImpact: -15000 }, category: 'medium' },
    { id: 'change_bank', icon: '🏦', label: 'Switch your primary bank',
      positiveDesc: 'Better fees and a nice sign-up bonus.',
      negativeDesc: 'Debit orders failed during the switch. Late payment fees everywhere.',
      positiveImpact: { cashImpact: 8000 }, negativeImpact: { cashImpact: -12000 }, category: 'medium' },
    { id: 'online_course', icon: '🎓', label: 'Take an online certification course',
      positiveDesc: 'New skills impressed your boss. Salary bump incoming.',
      negativeDesc: 'Course was useless. No ROI on the money spent.',
      positiveImpact: { salaryImpact: 2500 }, negativeImpact: { cashImpact: -10000 }, category: 'medium' },
    { id: 'host_airbnb', icon: '🏠', label: 'List your place on Airbnb weekends',
      positiveDesc: 'Fully booked. Extra income covered a bond payment.',
      negativeDesc: 'Guests trashed the place. Cleaning and repairs ate the profit.',
      positiveImpact: { cashImpact: 20000 }, negativeImpact: { cashImpact: -15000 }, category: 'medium' },
    { id: 'designer_furniture', icon: '🛋️', label: 'Buy designer furniture on credit',
      positiveDesc: 'Found it second-hand at a fraction of the price. Looks amazing.',
      negativeDesc: 'Interest on store credit was brutal. Still paying it off.',
      positiveImpact: { cashImpact: -2000 }, negativeImpact: { cashImpact: -18000 }, category: 'medium' },
    { id: 'join_stokvel', icon: '🤝', label: 'Join a stokvel savings group',
      positiveDesc: 'Disciplined saving with the group. Nice payout at year end.',
      negativeDesc: 'One member defaulted. Group payout was delayed and reduced.',
      positiveImpact: { cashImpact: 15000 }, negativeImpact: { cashImpact: -5000 }, category: 'medium' },
    { id: 'new_wardrobe', icon: '👔', label: 'Upgrade your wardrobe',
      positiveDesc: 'Thrifted smart. New look boosted confidence at work.',
      negativeDesc: 'Designer labels and impulse buys. Credit card took a hit.',
      positiveImpact: { cashImpact: -1000 }, negativeImpact: { cashImpact: -12000 }, category: 'medium' },
    { id: 'electric_fence', icon: '⚡', label: 'Install an electric fence',
      positiveDesc: 'Insurance premium dropped. Peace of mind.',
      negativeDesc: 'Faulty installation caused a fire scare. Had to redo it.',
      positiveImpact: { monthlyCostIncrease: -400 }, negativeImpact: { cashImpact: -16000 }, category: 'medium' },

    // Big
    { id: 'buy_bakkie', icon: '🚚', label: 'Buy a second-hand bakkie for side jobs',
      positiveDesc: 'Delivery gigs and moving jobs brought in great extra cash.',
      negativeDesc: 'Engine died after 3 months. Money pit.',
      positiveImpact: { salaryImpact: 4000 }, negativeImpact: { cashImpact: -45000 }, category: 'big' },
    { id: 'open_restaurant', icon: '🍽️', label: 'Invest in a friend\'s restaurant',
      positiveDesc: 'The spot became a local favourite. Your share is paying well.',
      negativeDesc: 'Restaurant closed in 6 months. Total loss.',
      positiveImpact: { salaryImpact: 5000 }, negativeImpact: { cashImpact: -50000 }, category: 'big' },
    { id: 'granny_flat', icon: '🏗️', label: 'Build a granny flat to rent out',
      positiveDesc: 'Tenant moved in immediately. Rental income covers bond extras.',
      negativeDesc: 'Council rejected plans. Demolition order. Money wasted.',
      positiveImpact: { salaryImpact: 6000 }, negativeImpact: { cashImpact: -60000 }, category: 'big' },
    { id: 'franchise', icon: '🍔', label: 'Buy into a franchise',
      positiveDesc: 'Location was perfect. Business is profitable from month one.',
      negativeDesc: 'Franchise fees and overheads crushed your margins. Walking away.',
      positiveImpact: { salaryImpact: 8000 }, negativeImpact: { cashImpact: -55000 }, category: 'big' },
    { id: 'flip_property', icon: '🏡', label: 'Buy a fixer-upper to flip',
      positiveDesc: 'Renovated on budget and sold at a profit. Nice payday.',
      negativeDesc: 'Hidden structural issues. Costs spiralled. Sold at a loss.',
      positiveImpact: { cashImpact: 45000 }, negativeImpact: { cashImpact: -55000 }, category: 'big' },
  ];

  // v4.1: Randomize decisions, never repeat until all used
  function getYearlyDecisions(state, count = 4) {
    const usedIds = state.usedDecisionIds || [];
    
    // Filter out already-used decisions
    let available = DECISION_POOL.filter(d => !usedIds.includes(d.id));
    
    // If not enough left, reset the pool (keep going)
    if (available.length < count) {
      state.usedDecisionIds = [];
      available = [...DECISION_POOL];
    }
    
    // Ensure mix: 1 small, 1 medium+, fill rest randomly
    const small = available.filter(d => d.category === 'small');
    const medBig = available.filter(d => d.category !== 'small');
    
    const picks = [];
    if (small.length > 0) {
      const idx = Math.floor(Math.random() * small.length);
      picks.push(small[idx]);
    }
    if (medBig.length > 0) {
      const idx = Math.floor(Math.random() * medBig.length);
      picks.push(medBig[idx]);
    }
    
    const pickedIds = new Set(picks.map(p => p.id));
    const remaining = available.filter(d => !pickedIds.has(d.id));
    while (picks.length < count && remaining.length > 0) {
      const idx = Math.floor(Math.random() * remaining.length);
      picks.push(remaining.splice(idx, 1)[0]);
    }
    
    // Shuffle
    for (let i = picks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [picks[i], picks[j]] = [picks[j], picks[i]];
    }
    
    // Track used IDs
    picks.forEach(p => { if (!state.usedDecisionIds) state.usedDecisionIds = []; state.usedDecisionIds.push(p.id); });
    
    return picks.map(d => ({ ...d, chosen: false, outcome: null }));
  }

  function shouldTriggerYearly(state) {
    if (state.currentYear < 1) return false;
    return true;
  }

  function shouldTriggerTimedEvent(state) {
    if (state.currentYear < 2) return false;
    if (state.yearsSinceTimedEvent < 2) return false;
    return state.yearsSinceTimedEvent >= 2 && (state.yearsSinceTimedEvent >= 3 || Math.random() > 0.4);
  }

  // v4.1: Should offer bond extension — much less frequent
  function shouldOfferExtension(state) {
    if (state.currentYear < 5) return false;
    if (state.loanExtensions >= 2) return false;
    // Only every 7-8 years, or if critically stressed
    return state.currentYear % 8 === 0 || (state.currentYear % 7 === 0 && state.underwaterLevel > 60);
  }

  function getEvent(state) {
    const pool = EVENTS.map(e => {
      let w = e.weight;
      const last = [...state.events].reverse().find(ev => ev.id === e.id);
      if (last && (state.currentYear - (last.year || 0)) < 2) w *= 0.1;
      if (e.type === 'bad') w *= Math.min(1.5, 1 + state.currentYear / 15);
      if (e.id === 'sarb_hike' && state.rateChangeHistory.length === 0 && state.currentYear > 2) w *= 2;
      return { ...e, w };
    });

    const total = pool.reduce((s, e) => s + e.w, 0);
    let roll = Math.random() * total;
    for (const e of pool) {
      roll -= e.w;
      if (roll <= 0) {
        const desc = typeof e.desc === 'function' ? e.desc(state) : e.desc;
        const impact = e.getImpact(state);
        return { id: e.id, type: e.type, icon: e.icon, title: e.title, desc, year: state.currentYear, ...impact };
      }
    }
    return null;
  }

  function getTimedEvent(state) {
    const usedIds = state.events.filter(e => e.timed).map(e => e.id);
    const available = TIMED_EVENTS.filter(e => !usedIds.includes(e.id) || state.currentYear - (state.events.find(ev => ev.id === e.id)?.year || 0) >= 3);
    if (available.length === 0) return null;
    const e = available[Math.floor(Math.random() * available.length)];
    const result = e.getChoices(state);
    return { id: e.id, icon: e.icon, title: e.title, desc: e.desc, year: state.currentYear, timed: true, timerSeconds: 10, ...result };
  }

  return { 
    shouldTriggerYearly, shouldTriggerTimedEvent, shouldOfferExtension,
    getEvent, getTimedEvent, getYearlyDecisions, DECISION_POOL 
  };
})();
