
import { ExcelExporter } from '@/utils/excelExporter';

export interface DividendData {
  year: number;
  dividend: number;
  growthRate?: number;
}

export interface ValuationInputs {
  ticker: string;
  riskFreeRate: number;
  marketReturn: number;
  taxRate: number;
  terminalGrowthRate: number;
  forecastYears: number;
}

export interface DCFResults {
  wacc: number;
  costOfEquity: number;
  costOfDebt: number;
  projectedFCF: number[];
  terminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  pricePerShare: number;
  currentPrice: number;
  upside: number;
}

export interface DDMResults {
  avgDividendGrowth: number;
  nextYearDividend: number;
  intrinsicValue: number;
  currentPrice: number;
  upside: number;
  applicable: boolean;
  reason?: string;
}

export interface ComprehensiveValuation {
  ticker: string;
  dcf: DCFResults;
  ddm: DDMResults;
  recommendation: string;
  keyRisks: string[];
  keyStrengths: string[];
}

export class AdvancedValuationService {
  static async getComprehensiveValuation(
    ticker: string,
    inputs: ValuationInputs
  ): Promise<ComprehensiveValuation> {
    // Mock comprehensive financial data (in production, this would come from financial APIs)
    const mockData = this.getMockFinancialData(ticker);
    
    // Calculate DCF
    const dcfResults = this.calculateDCF(mockData, inputs);
    
    // Calculate DDM
    const ddmResults = this.calculateDDM(mockData, inputs);
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(dcfResults, ddmResults);
    
    return {
      ticker,
      dcf: dcfResults,
      ddm: ddmResults,
      recommendation: recommendation.text,
      keyRisks: recommendation.risks,
      keyStrengths: recommendation.strengths
    };
  }

  private static getMockFinancialData(ticker: string) {
    // Mock data based on ticker - in production, this would be real financial data
    const baseData = {
      'AAPL': {
        revenue: [365817, 394328, 383285, 274515, 260174], // Last 5 years
        netIncome: [94680, 99803, 57411, 48351, 45687],
        operatingIncome: [108949, 119437, 70898, 63930, 61344],
        capex: [-11085, -10708, -7309, -13313, -10495],
        cashFromOps: [122151, 104038, 77434, 69391, 50779],
        dividends: [0.94, 0.90, 0.86, 0.82, 0.78], // Per share
        sharesOutstanding: 15334, // Million
        currentPrice: 180.5,
        marketCap: 2850000, // Million
        totalDebt: 120000, // Million
        interestExpense: 3600, // Million
        beta: 1.2,
        paysDividends: true
      },
      'MSFT': {
        revenue: [211915, 198270, 168088, 143015, 125843],
        netIncome: [72361, 61271, 44281, 39240, 16571],
        operatingIncome: [88523, 76740, 62310, 52959, 22326],
        capex: [-28107, -20622, -13925, -13240, -11632],
        cashFromOps: [87582, 76740, 60675, 52185, 43884],
        dividends: [2.72, 2.48, 2.24, 2.04, 1.84],
        sharesOutstanding: 7430,
        currentPrice: 358.0,
        marketCap: 2650000,
        totalDebt: 60000,
        interestExpense: 2400,
        beta: 0.9,
        paysDividends: true
      }
    };

    return baseData[ticker.toUpperCase() as keyof typeof baseData] || baseData['AAPL'];
  }

  private static calculateDCF(data: any, inputs: ValuationInputs): DCFResults {
    const { riskFreeRate, marketReturn, taxRate, terminalGrowthRate, forecastYears } = inputs;
    
    // Calculate cost of equity using CAPM
    const costOfEquity = riskFreeRate + data.beta * (marketReturn - riskFreeRate);
    
    // Calculate cost of debt (after-tax)
    const costOfDebt = (data.interestExpense / data.totalDebt) * (1 - taxRate);
    
    // Calculate WACC
    const equity = data.marketCap;
    const debt = data.totalDebt;
    const totalCapital = equity + debt;
    const wacc = (equity / totalCapital) * costOfEquity + (debt / totalCapital) * costOfDebt;
    
    // Calculate historical FCF growth
    const historicalFCF = data.cashFromOps.map((cfo: number, i: number) => cfo + data.capex[i]);
    const avgGrowthRate = this.calculateAverageGrowthRate(historicalFCF);
    
    // Project FCF for forecast years
    const projectedFCF = [];
    let currentFCF = historicalFCF[0]; // Most recent FCF
    
    for (let i = 1; i <= forecastYears; i++) {
      currentFCF *= (1 + avgGrowthRate);
      projectedFCF.push(currentFCF);
    }
    
    // Calculate terminal value
    const terminalFCF = projectedFCF[projectedFCF.length - 1] * (1 + terminalGrowthRate);
    const terminalValue = terminalFCF / (wacc - terminalGrowthRate);
    
    // Calculate present values
    const presentValues = projectedFCF.map((fcf, year) => 
      fcf / Math.pow(1 + wacc, year + 1)
    );
    
    const terminalPV = terminalValue / Math.pow(1 + wacc, forecastYears);
    const enterpriseValue = presentValues.reduce((sum, pv) => sum + pv, 0) + terminalPV;
    const equityValue = enterpriseValue - data.totalDebt;
    const pricePerShare = equityValue / data.sharesOutstanding;
    const upside = (pricePerShare - data.currentPrice) / data.currentPrice;
    
    return {
      wacc,
      costOfEquity,
      costOfDebt,
      projectedFCF,
      terminalValue,
      enterpriseValue,
      equityValue,
      pricePerShare,
      currentPrice: data.currentPrice,
      upside
    };
  }

  private static calculateDDM(data: any, inputs: ValuationInputs): DDMResults {
    if (!data.paysDividends || data.dividends.length < 3) {
      return {
        avgDividendGrowth: 0,
        nextYearDividend: 0,
        intrinsicValue: 0,
        currentPrice: data.currentPrice,
        upside: 0,
        applicable: false,
        reason: 'Company does not pay dividends or insufficient dividend history'
      };
    }
    
    // Calculate average dividend growth rate
    const avgDividendGrowth = this.calculateAverageGrowthRate(data.dividends.reverse());
    
    // Calculate cost of equity using CAPM
    const costOfEquity = inputs.riskFreeRate + data.beta * (inputs.marketReturn - inputs.riskFreeRate);
    
    // Check if growth rate is reasonable for DDM
    if (avgDividendGrowth >= costOfEquity) {
      return {
        avgDividendGrowth,
        nextYearDividend: 0,
        intrinsicValue: 0,
        currentPrice: data.currentPrice,
        upside: 0,
        applicable: false,
        reason: 'Dividend growth rate exceeds cost of equity - DDM not applicable'
      };
    }
    
    // Calculate next year's dividend
    const currentDividend = data.dividends[0]; // Most recent dividend
    const nextYearDividend = currentDividend * (1 + avgDividendGrowth);
    
    // Calculate intrinsic value using Gordon Growth Model
    const intrinsicValue = nextYearDividend / (costOfEquity - avgDividendGrowth);
    const upside = (intrinsicValue - data.currentPrice) / data.currentPrice;
    
    return {
      avgDividendGrowth,
      nextYearDividend,
      intrinsicValue,
      currentPrice: data.currentPrice,
      upside,
      applicable: true
    };
  }

  private static calculateAverageGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    
    const growthRates = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] !== 0) {
        growthRates.push((values[i] - values[i - 1]) / Math.abs(values[i - 1]));
      }
    }
    
    return growthRates.length > 0 
      ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length 
      : 0;
  }

  private static generateRecommendation(dcf: DCFResults, ddm: DDMResults) {
    let text = '';
    const risks = [];
    const strengths = [];
    
    // Determine primary valuation method
    if (ddm.applicable) {
      if (Math.abs(dcf.upside) < Math.abs(ddm.upside)) {
        text = `Based on our dual valuation approach, the DCF model suggests a ${(dcf.upside * 100).toFixed(1)}% ${dcf.upside > 0 ? 'upside' : 'downside'} while the DDM indicates ${(ddm.upside * 100).toFixed(1)}% ${ddm.upside > 0 ? 'upside' : 'downside'}. `;
      } else {
        text = `The DDM valuation shows ${(ddm.upside * 100).toFixed(1)}% ${ddm.upside > 0 ? 'upside' : 'downside'} compared to the DCF's ${(dcf.upside * 100).toFixed(1)}% ${dcf.upside > 0 ? 'upside' : 'downside'}. `;
      }
      
      const avgUpside = (dcf.upside + ddm.upside) / 2;
      if (avgUpside > 0.15) {
        text += 'Strong BUY recommendation based on significant undervaluation across both models.';
      } else if (avgUpside > 0.05) {
        text += 'BUY recommendation with moderate upside potential.';
      } else if (avgUpside > -0.05) {
        text += 'HOLD recommendation as the stock appears fairly valued.';
      } else {
        text += 'SELL recommendation due to overvaluation signals.';
      }
    } else {
      text = `Based on DCF analysis, the stock shows ${(dcf.upside * 100).toFixed(1)}% ${dcf.upside > 0 ? 'upside' : 'downside'}. DDM is not applicable: ${ddm.reason}. `;
      
      if (dcf.upside > 0.15) {
        text += 'Strong BUY recommendation based on DCF undervaluation.';
      } else if (dcf.upside > 0.05) {
        text += 'BUY recommendation with moderate upside.';
      } else if (dcf.upside > -0.05) {
        text += 'HOLD recommendation as stock appears fairly valued.';
      } else {
        text += 'SELL recommendation due to DCF overvaluation.';
      }
    }
    
    // Add common risks and strengths
    risks.push('Market volatility and economic headwinds');
    risks.push('Interest rate sensitivity affecting discount rates');
    risks.push('Competitive pressure in core markets');
    
    strengths.push('Strong cash flow generation capability');
    strengths.push('Established market position');
    strengths.push('Professional financial modeling approach');
    
    return { text, risks, strengths };
  }

  static async generateExcelReport(valuation: ComprehensiveValuation): Promise<Blob> {
    // Create comprehensive Excel report with all valuation data
    const csvContent = this.generateComprehensiveCSV(valuation);
    return new Blob([csvContent], { type: 'text/csv' });
  }

  private static generateComprehensiveCSV(valuation: ComprehensiveValuation): string {
    let csv = `Comprehensive Valuation Analysis - ${valuation.ticker}\n\n`;
    
    // DCF Analysis
    csv += 'DISCOUNTED CASH FLOW ANALYSIS\n';
    csv += `Enterprise Value,$${(valuation.dcf.enterpriseValue / 1000000).toFixed(0)}M\n`;
    csv += `Equity Value,$${(valuation.dcf.equityValue / 1000000).toFixed(0)}M\n`;
    csv += `DCF Price Target,$${valuation.dcf.pricePerShare.toFixed(2)}\n`;
    csv += `Current Price,$${valuation.dcf.currentPrice.toFixed(2)}\n`;
    csv += `DCF Upside/Downside,${(valuation.dcf.upside * 100).toFixed(1)}%\n`;
    csv += `WACC,${(valuation.dcf.wacc * 100).toFixed(2)}%\n\n`;
    
    // DDM Analysis
    csv += 'DIVIDEND DISCOUNT MODEL ANALYSIS\n';
    if (valuation.ddm.applicable) {
      csv += `DDM Intrinsic Value,$${valuation.ddm.intrinsicValue.toFixed(2)}\n`;
      csv += `Next Year Dividend,$${valuation.ddm.nextYearDividend.toFixed(2)}\n`;
      csv += `Average Dividend Growth,${(valuation.ddm.avgDividendGrowth * 100).toFixed(1)}%\n`;
      csv += `DDM Upside/Downside,${(valuation.ddm.upside * 100).toFixed(1)}%\n`;
    } else {
      csv += `Status,Not Applicable\n`;
      csv += `Reason,${valuation.ddm.reason}\n`;
    }
    csv += '\n';
    
    // Recommendation
    csv += 'INVESTMENT RECOMMENDATION\n';
    csv += `${valuation.recommendation}\n\n`;
    
    // Key Risks
    csv += 'KEY RISKS\n';
    valuation.keyRisks.forEach(risk => {
      csv += `• ${risk}\n`;
    });
    csv += '\n';
    
    // Key Strengths
    csv += 'KEY STRENGTHS\n';
    valuation.keyStrengths.forEach(strength => {
      csv += `• ${strength}\n`;
    });
    
    return csv;
  }
}
