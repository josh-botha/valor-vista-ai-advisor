
export interface DCFResults {
  enterpriseValue: number;
  equityValue: number;
  fairValuePerShare: number;
  wacc: number;
  terminalValue: number;
  projectedFreeCashFlows: number[];
}

export interface DCFInputData {
  revenueGrowthRates: number[];
  operatingMargins: number[];
  riskFreeRate: number;
  marketReturn: number;
  taxRate: number;
  terminalGrowthRate: number;
  forecastYears: number;
}

export const calculateDCF = (data: DCFInputData): DCFResults => {
  const {
    revenueGrowthRates,
    operatingMargins,
    riskFreeRate,
    marketReturn,
    taxRate,
    terminalGrowthRate,
    forecastYears
  } = data;

  // Calculate WACC (simplified calculation)
  const beta = 1.2; // Assumed beta
  const debtToEquity = 0.3; // Assumed debt-to-equity ratio
  const costOfEquity = riskFreeRate + beta * (marketReturn - riskFreeRate);
  const costOfDebt = riskFreeRate + 0.02; // Risk premium
  const wacc = (costOfEquity * (1 / (1 + debtToEquity))) + (costOfDebt * (1 - taxRate) * (debtToEquity / (1 + debtToEquity)));

  // Initial revenue (assumed)
  let currentRevenue = 1000; // Million dollars

  // Project free cash flows
  const projectedFreeCashFlows: number[] = [];
  
  for (let year = 0; year < forecastYears; year++) {
    const growthRate = revenueGrowthRates[year] || 0.05;
    const operatingMargin = operatingMargins[year] || 0.15;
    
    currentRevenue = currentRevenue * (1 + growthRate);
    const operatingIncome = currentRevenue * operatingMargin;
    const taxPayment = operatingIncome * taxRate;
    const nopat = operatingIncome - taxPayment;
    
    // Simplified FCF calculation
    const capex = currentRevenue * 0.05; // 5% of revenue
    const changeInWorkingCapital = currentRevenue * 0.02; // 2% of revenue
    const fcf = nopat - capex - changeInWorkingCapital;
    
    projectedFreeCashFlows.push(fcf);
  }

  // Calculate terminal value
  const finalYearFCF = projectedFreeCashFlows[projectedFreeCashFlows.length - 1];
  const terminalValue = (finalYearFCF * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);

  // Calculate present values
  let presentValueOfFCFs = 0;
  projectedFreeCashFlows.forEach((fcf, index) => {
    presentValueOfFCFs += fcf / Math.pow(1 + wacc, index + 1);
  });

  const presentValueOfTerminalValue = terminalValue / Math.pow(1 + wacc, forecastYears);
  const enterpriseValue = presentValueOfFCFs + presentValueOfTerminalValue;

  // Assume no net debt for simplification
  const equityValue = enterpriseValue;
  
  // Assume 100 million shares outstanding
  const sharesOutstanding = 100;
  const fairValuePerShare = equityValue / sharesOutstanding;

  return {
    enterpriseValue,
    equityValue,
    fairValuePerShare,
    wacc,
    terminalValue,
    projectedFreeCashFlows
  };
};
