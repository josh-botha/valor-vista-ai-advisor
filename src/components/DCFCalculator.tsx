
// DCF Calculator utility function and types

export interface DCFResults {
  enterpriseValue: number;
  equityValue: number;
  fairValuePerShare: number;
  wacc: number;
  terminalValue: number;
  projectedFreeCashFlows: number[];
}

interface DCFInputData {
  revenueGrowthRates: number[];
  operatingMargins: number[];
  riskFreeRate: number;
  marketReturn: number;
  taxRate: number;
  terminalGrowthRate: number;
  forecastYears: number;
}

const DCFCalculator = (data: DCFInputData): DCFResults => {
  const {
    revenueGrowthRates,
    operatingMargins,
    riskFreeRate,
    marketReturn,
    taxRate,
    terminalGrowthRate,
    forecastYears
  } = data;

  // Assume initial revenue of $100B for calculation purposes
  const initialRevenue = 100000;
  
  // Calculate projected revenues
  const projectedRevenues = [];
  let currentRevenue = initialRevenue;
  for (let i = 0; i < forecastYears; i++) {
    currentRevenue = currentRevenue * (1 + revenueGrowthRates[i]);
    projectedRevenues.push(currentRevenue);
  }

  // Calculate projected free cash flows
  const projectedFreeCashFlows = projectedRevenues.map((revenue, index) => {
    const operatingIncome = revenue * operatingMargins[index];
    const taxExpense = operatingIncome * taxRate;
    const nopat = operatingIncome - taxExpense;
    // Simplified FCF calculation (assuming minimal capex and working capital changes)
    return nopat * 0.85; // Approximate FCF as 85% of NOPAT
  });

  // Calculate WACC (simplified)
  const marketRiskPremium = marketReturn - riskFreeRate;
  const beta = 1.2; // Assume market beta
  const costOfEquity = riskFreeRate + beta * marketRiskPremium;
  const wacc = costOfEquity; // Simplified - assuming no debt

  // Calculate terminal value
  const finalYearFCF = projectedFreeCashFlows[projectedFreeCashFlows.length - 1];
  const terminalFCF = finalYearFCF * (1 + terminalGrowthRate);
  const terminalValue = terminalFCF / (wacc - terminalGrowthRate);

  // Calculate present value of cash flows
  let presentValueOfCashFlows = 0;
  projectedFreeCashFlows.forEach((fcf, index) => {
    const discountFactor = Math.pow(1 + wacc, index + 1);
    presentValueOfCashFlows += fcf / discountFactor;
  });

  // Calculate present value of terminal value
  const presentValueOfTerminalValue = terminalValue / Math.pow(1 + wacc, forecastYears);

  // Calculate enterprise and equity value
  const enterpriseValue = presentValueOfCashFlows + presentValueOfTerminalValue;
  const equityValue = enterpriseValue; // Simplified - assuming no net debt
  
  // Assume 1 billion shares outstanding for calculation
  const sharesOutstanding = 1000;
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

export default DCFCalculator;
