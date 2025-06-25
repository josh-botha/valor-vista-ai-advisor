
// Financial Data Service for real-time data fetching
// In production, this would integrate with APIs like Yahoo Finance, Alpha Vantage, or Bloomberg

export interface CompanyFinancials {
  ticker: string;
  marketCap: number;
  beta: number;
  totalDebt: number;
  interestExpense: number;
  freeCashFlow: number;
  revenue: number;
  ebitda: number;
  sharesOutstanding: number;
  currentPrice: number;
  taxRate: number;
}

export interface DCFInputs {
  riskFreeRate: number;
  marketRiskPremium: number;
  terminalGrowthRate: number;
  forecastYears: number;
  taxRate: number;
}

export interface DCFScenario {
  name: string;
  growthRate: number;
  enterpriseValue: number;
  equityValue: number;
  pricePerShare: number;
  impliedReturn: number;
}

export class FinancialDataService {
  private static readonly API_BASE_URL = 'https://api.example.com'; // Replace with actual financial API

  static async fetchCompanyData(ticker: string): Promise<CompanyFinancials> {
    try {
      // In real implementation, this would call external APIs
      // For now, returning mock data based on ticker
      
      const mockData: Record<string, CompanyFinancials> = {
        'AAPL': {
          ticker: 'AAPL',
          marketCap: 2850000,
          beta: 1.2,
          totalDebt: 120000,
          interestExpense: 3600,
          freeCashFlow: 95000,
          revenue: 394000,
          ebitda: 130000,
          sharesOutstanding: 15800,
          currentPrice: 180.5,
          taxRate: 0.21
        },
        'MSFT': {
          ticker: 'MSFT',
          marketCap: 2650000,
          beta: 0.9,
          totalDebt: 60000,
          interestExpense: 2400,
          freeCashFlow: 60000,
          revenue: 211000,
          ebitda: 90000,
          sharesOutstanding: 7400,
          currentPrice: 358.0,
          taxRate: 0.21
        },
        'TSLA': {
          ticker: 'TSLA',
          marketCap: 800000,
          beta: 2.0,
          totalDebt: 25000,
          interestExpense: 1200,
          freeCashFlow: 7500,
          revenue: 96000,
          ebitda: 15000,
          sharesOutstanding: 3170,
          currentPrice: 252.0,
          taxRate: 0.21
        }
      };

      return mockData[ticker.toUpperCase()] || mockData['AAPL'];
    } catch (error) {
      console.error('Error fetching financial data:', error);
      throw new Error('Failed to fetch financial data');
    }
  }

  static calculateWACC(financials: CompanyFinancials, inputs: DCFInputs): number {
    const { beta, totalDebt, marketCap, interestExpense, taxRate } = financials;
    const { riskFreeRate, marketRiskPremium } = inputs;

    // Cost of Equity using CAPM
    const costOfEquity = riskFreeRate + beta * marketRiskPremium;
    
    // Cost of Debt (after-tax)
    const costOfDebt = (interestExpense / totalDebt) * (1 - taxRate);
    
    // Market values
    const totalCapital = marketCap + totalDebt;
    const equityWeight = marketCap / totalCapital;
    const debtWeight = totalDebt / totalCapital;
    
    // WACC calculation
    return equityWeight * costOfEquity + debtWeight * costOfDebt;
  }

  static runDCFAnalysis(financials: CompanyFinancials, inputs: DCFInputs): DCFScenario[] {
    const wacc = this.calculateWACC(financials, inputs);
    const scenarios = [
      { name: 'Bear', growthRate: 0.01 },
      { name: 'Base', growthRate: 0.03 },
      { name: 'Bull', growthRate: 0.05 }
    ];

    return scenarios.map(scenario => {
      const projectedFCFs = this.projectFCF(financials.freeCashFlow, scenario.growthRate, inputs.forecastYears);
      const terminalValue = this.calculateTerminalValue(
        projectedFCFs[projectedFCFs.length - 1],
        inputs.terminalGrowthRate,
        wacc
      );
      
      const presentValues = projectedFCFs.map((fcf, year) => 
        fcf / Math.pow(1 + wacc, year + 1)
      );
      
      const terminalPV = terminalValue / Math.pow(1 + wacc, inputs.forecastYears);
      const enterpriseValue = presentValues.reduce((sum, pv) => sum + pv, 0) + terminalPV;
      const equityValue = enterpriseValue - financials.totalDebt;
      const pricePerShare = equityValue / financials.sharesOutstanding;
      const impliedReturn = (pricePerShare - financials.currentPrice) / financials.currentPrice;

      return {
        name: scenario.name,
        growthRate: scenario.growthRate,
        enterpriseValue: enterpriseValue * 1000000, // Convert to actual dollars
        equityValue: equityValue * 1000000,
        pricePerShare,
        impliedReturn
      };
    });
  }

  private static projectFCF(baseFCF: number, growthRate: number, years: number): number[] {
    const projections = [];
    let currentFCF = baseFCF;
    
    for (let i = 0; i < years; i++) {
      currentFCF *= (1 + growthRate);
      projections.push(currentFCF);
    }
    
    return projections;
  }

  private static calculateTerminalValue(finalYearFCF: number, terminalGrowth: number, wacc: number): number {
    return (finalYearFCF * (1 + terminalGrowth)) / (wacc - terminalGrowth);
  }
}
