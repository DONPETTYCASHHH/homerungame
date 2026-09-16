/* ============================================
   South African Financial Data — 2025/2026
   Real data for realistic gameplay
   ============================================ */

const SA = (() => {

  // SARB Prime Rate — default 10.50%, adjustable by the player (it changes in real life)
  let PRIME_RATE = 10.50;
  function setPrimeRate(v) {
    PRIME_RATE = Math.max(5, Math.min(20, Number(v) || PRIME_RATE));
    return PRIME_RATE;
  }
  
  // Transfer Duty brackets (SARS 2025/2026 — marginal rates)
  const TRANSFER_DUTY_BRACKETS = [
    { from: 0, to: 1210000, rate: 0 },
    { from: 1210001, to: 1663800, rate: 0.03 },
    { from: 1663801, to: 2329000, rate: 0.06 },
    { from: 2329001, to: 2994800, rate: 0.08 },
    { from: 2994801, to: 13310000, rate: 0.11 },
    { from: 13310001, to: Infinity, rate: 0.13 },
  ];

  function calcTransferDuty(price) {
    let duty = 0;
    for (const b of TRANSFER_DUTY_BRACKETS) {
      if (price <= b.from) break;
      const taxable = Math.min(price, b.to) - b.from + (b.from === 0 ? 0 : 1);
      if (taxable > 0) duty += taxable * b.rate;
    }
    return Math.round(Math.max(0, duty));
  }

  // Conveyancing fees (from 1 Aug 2025 LPC tariff)
  function calcConveyancingFee(price) {
    let fee = 0;
    if (price <= 100000) {
      fee = 6640;
    } else if (price <= 500000) {
      fee = 6640 + Math.ceil((price - 100000) / 50000) * 1060;
    } else if (price <= 1000000) {
      fee = 15120 + Math.ceil((price - 500000) / 100000) * 2050;
    } else if (price <= 5000000) {
      fee = 25370 + Math.ceil((price - 1000000) / 200000) * 2050;
    } else {
      fee = 66370 + Math.ceil((price - 5000000) / 1000000) * 5160;
    }
    return Math.round(fee * 1.15); // + VAT
  }

  // Bond registration fees (attorney fees, roughly matching LPC scale)
  function calcBondRegistrationFee(bondAmount) {
    let fee;
    if (bondAmount <= 300000) fee = 8500;
    else if (bondAmount <= 500000) fee = 11000;
    else if (bondAmount <= 800000) fee = 14500;
    else if (bondAmount <= 1000000) fee = 17500;
    else if (bondAmount <= 1500000) fee = 22000;
    else if (bondAmount <= 2000000) fee = 27000;
    else if (bondAmount <= 3000000) fee = 33000;
    else fee = 33000 + Math.ceil((bondAmount - 3000000) / 1000000) * 5000;
    return Math.round(fee * 1.15); // + VAT
  }

  // Deeds Office fees
  function calcDeedsOfficeFee(price) {
    if (price <= 100000) return 50;
    if (price <= 200000) return 114;
    if (price <= 300000) return 727;
    if (price <= 600000) return 956;
    if (price <= 800000) return 1346;
    if (price <= 1000000) return 1546;
    if (price <= 2000000) return 1738;
    if (price <= 4000000) return 2408;
    if (price <= 6000000) return 2922;
    if (price <= 8000000) return 3480;
    if (price <= 10000000) return 4068;
    return 4844;
  }

  // Bank initiation fee
  const BANK_INITIATION_FEE = 6038;

  // Total upfront costs breakdown
  function calcAllUpfrontCosts(purchasePrice, bondAmount) {
    const transferDuty = calcTransferDuty(purchasePrice);
    const conveyancing = calcConveyancingFee(purchasePrice);
    const bondReg = calcBondRegistrationFee(bondAmount);
    const deedsTransfer = calcDeedsOfficeFee(purchasePrice);
    const deedsBond = calcDeedsOfficeFee(bondAmount);
    const postPetties = 3500;
    const ficaFees = 1200;

    return {
      transferDuty,
      conveyancing,
      bondRegistration: bondReg,
      deedsOfficeTransfer: deedsTransfer,
      deedsOfficeBond: deedsBond,
      bankInitiation: BANK_INITIATION_FEE,
      postPetties,
      ficaFees,
      totalLegalCosts: transferDuty + conveyancing + bondReg + deedsTransfer + deedsBond + BANK_INITIATION_FEE + postPetties + ficaFees,
    };
  }

  // Johannesburg municipal rates (2025/2026)
  function calcAnnualMunicipalRates(propertyValue) {
    const exemption = 300000;
    const rateInRand = 0.009545;
    const taxable = Math.max(0, propertyValue - exemption);
    return Math.round(taxable * rateInRand);
  }

  // Monthly ownership costs (realistic Gauteng estimates)
  function calcMonthlyOwnershipCosts(propertyValue, isComplex = false) {
    const rates = Math.round(calcAnnualMunicipalRates(propertyValue) / 12);
    const electricity = 1800 + Math.round(Math.random() * 600);
    const water = 800 + Math.round(Math.random() * 400);
    const refuse = 280;
    const sewerage = 350;
    const insurance = Math.round(propertyValue * 0.002 / 12); // ~0.2% of value per year
    const levies = isComplex ? (2500 + Math.round(propertyValue / 500000) * 800) : 0;
    const maintenance = Math.round(propertyValue * 0.01 / 12); // 1% of value annually

    return {
      rates,
      electricity,
      water,
      refuse,
      sewerage,
      insurance,
      levies,
      maintenance,
      total: rates + electricity + water + refuse + sewerage + insurance + levies + maintenance,
    };
  }

  // Typical upfront home-buying extras
  const UPFRONT_EXTRAS = {
    movingCosts: { min: 5000, max: 25000, label: 'Moving costs' },
    furnitureBasic: { min: 20000, max: 60000, label: 'Basic furniture' },
    furnitureFull: { min: 60000, max: 150000, label: 'Full furnishing' },
    refurbLight: { min: 15000, max: 50000, label: 'Light refurbishment' },
    refurbMajor: { min: 50000, max: 200000, label: 'Major renovation' },
    appliancesPack: { min: 15000, max: 40000, label: 'Appliances package' },
    securitySetup: { min: 8000, max: 30000, label: 'Security setup' },
    gardenLandscape: { min: 5000, max: 25000, label: 'Garden & landscaping' },
  };

  // CPI / Inflation rate (SA average)
  const ANNUAL_INFLATION = 0.055; // 5.5%

  // Format ZAR
  function fmt(amount) {
    const sign = amount < 0 ? '-' : '';
    return sign + 'R ' + Math.round(Math.abs(amount)).toLocaleString('en-ZA');
  }

  function fmtShort(amount) {
    if (Math.abs(amount) >= 1000000) return 'R ' + (amount / 1000000).toFixed(1) + 'M';
    if (Math.abs(amount) >= 1000) return 'R ' + (amount / 1000).toFixed(0) + 'k';
    return 'R ' + Math.round(amount);
  }

  return {
    get PRIME_RATE() { return PRIME_RATE; },
    setPrimeRate,
    ANNUAL_INFLATION,
    TRANSFER_DUTY_BRACKETS,
    BANK_INITIATION_FEE,
    UPFRONT_EXTRAS,
    calcTransferDuty,
    calcConveyancingFee,
    calcBondRegistrationFee,
    calcDeedsOfficeFee,
    calcAllUpfrontCosts,
    calcAnnualMunicipalRates,
    calcMonthlyOwnershipCosts,
    fmt,
    fmtShort,
  };
})();
