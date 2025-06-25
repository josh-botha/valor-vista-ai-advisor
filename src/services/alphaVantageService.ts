
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface AlphaVantageOverview {
  Symbol: string;
  Name: string;
  MarketCapitalization: string;
  Beta: string;
  DividendYield: string;
  BookValue: string;
  SharesOutstanding: string;
  TrailingPE: string;
  ForwardPE: string;
  DividendPerShare: string;
  DividendDate: string;
}

export interface AlphaVantageFinancials {
  fiscalDateEnding: string;
  reportedCurrency: string;
  totalRevenue: string;
  totalOperatingExpense: string;
  operatingIncome: string;
  netIncome: string;
  ebitda: string;
}

export interface AlphaVantageCashFlow {
  fiscalDateEnding: string;
  reportedCurrency: string;
  operatingCashflow: string;
  capitalExpenditures: string;
  freeCashFlow: string;
}

export interface ProcessedFinancialData {
  ticker: string;
  marketCap: number;
  beta: number;
  totalDebt: number;
  interestExpense: number;
  revenue: number[];
  netIncome: number[];
  operatingIncome: number[];
  capex: number[];
  cashFromOps: number[];
  dividends: number[];
  sharesOutstanding: number;
  currentPrice: number;
  paysDividends: boolean;
}

export class AlphaVantageService {
  static async fetchCompanyOverview(ticker: string): Promise<AlphaVantageOverview> {
    const { data, error } = await supabase.functions.invoke('alpha-vantage', {
      body: { ticker, dataType: 'overview' }
    });

    if (error) throw new Error(`Failed to fetch overview: ${error.message}`);
    if (data.error) throw new Error(data.error);

    return data.data;
  }

  static async fetchIncomeStatement(ticker: string): Promise<AlphaVantageFinancials[]> {
    const { data, error } = await supabase.functions.invoke('alpha-vantage', {
      body: { ticker, dataType: 'income_statement' }
    });

    if (error) throw new Error(`Failed to fetch income statement: ${error.message}`);
    if (data.error) throw new Error(data.error);

    return data.data.annualReports || [];
  }

  static async fetchCashFlow(ticker: string): Promise<AlphaVantageCashFlow[]> {
    const { data, error } = await supabase.functions.invoke('alpha-vantage', {
      body: { ticker, dataType: 'cash_flow' }
    });

    if (error) throw new Error(`Failed to fetch cash flow: ${error.message}`);
    if (data.error) throw new Error(data.error);

    return data.data.annualReports || [];
  }

  static async getProcessedFinancialData(ticker: string): Promise<ProcessedFinancialData> {
    try {
      console.log(`Fetching financial data for ${ticker}...`);
      
      const [overview, incomeStatements, cashFlows] = await Promise.all([
        this.fetchCompanyOverview(ticker),
        this.fetchIncomeStatement(ticker),
        this.fetchCashFlow(ticker)
      ]);

      console.log('Alpha Vantage data fetched successfully');

      // Process the data into our format
      const marketCap = parseInt(overview.MarketCapitalization) || 0;
      const beta = parseFloat(overview.Beta) || 1.0;
      const sharesOutstanding = parseInt(overview.SharesOutstanding) || 1;
      
      // Get current price estimate from market cap and shares
      const currentPrice = marketCap > 0 && sharesOutstanding > 0 
        ? marketCap / sharesOutstanding 
        : 100; // fallback

      // Process historical data (last 5 years)
      const revenue = incomeStatements.slice(0, 5).map(stmt => 
        parseInt(stmt.totalRevenue) / 1000000 || 0
      );
      
      const netIncome = incomeStatements.slice(0, 5).map(stmt => 
        parseInt(stmt.netIncome) / 1000000 || 0
      );
      
      const operatingIncome = incomeStatements.slice(0, 5).map(stmt => 
        parseInt(stmt.operatingIncome) / 1000000 || 0
      );

      const cashFromOps = cashFlows.slice(0, 5).map(cf => 
        parseInt(cf.operatingCashflow) / 1000000 || 0
      );

      const capex = cashFlows.slice(0, 5).map(cf => 
        Math.abs(parseInt(cf.capitalExpenditures)) / 1000000 || 0
      );

      // Dividend data
      const dividendPerShare = parseFloat(overview.DividendPerShare) || 0;
      const dividendYield = parseFloat(overview.DividendYield) || 0;
      const paysDividends = dividendPerShare > 0;
      
      // Generate historical dividend data (estimate based on current dividend)
      const dividends = paysDividends 
        ? Array(5).fill(0).map((_, i) => dividendPerShare * (1 - i * 0.05)) // Rough historical estimate
        : [];

      // Estimate debt and interest (Alpha Vantage free tier doesn't include balance sheet)
      const estimatedDebt = marketCap * 0.3; // Rough estimate: 30% of market cap
      const interestExpense = estimatedDebt * 0.03; // Estimate 3% interest rate

      return {
        ticker: ticker.toUpperCase(),
        marketCap: marketCap / 1000000, // Convert to millions
        beta,
        totalDebt: estimatedDebt / 1000000,
        interestExpense: interestExpense / 1000000,
        revenue,
        netIncome,
        operatingIncome,
        capex: capex.map(c => -c), // Make negative for FCF calculation
        cashFromOps,
        dividends,
        sharesOutstanding: sharesOutstanding / 1000000, // Convert to millions
        currentPrice,
        paysDividends
      };

    } catch (error) {
      console.error('Error fetching Alpha Vantage data:', error);
      throw new Error(`Failed to fetch financial data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
