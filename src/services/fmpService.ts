
export interface FMPCompanyProfile {
  symbol: string;
  companyName: string;
  marketCap: number;
  beta: number;
  price: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  changesPercentage: number;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
}

export interface FMPIncomeStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  researchAndDevelopmentExpenses: number;
  generalAndAdministrativeExpenses: number;
  sellingAndMarketingExpenses: number;
  sellingGeneralAndAdministrativeExpenses: number;
  otherExpenses: number;
  operatingExpenses: number;
  costAndExpenses: number;
  interestIncome: number;
  interestExpense: number;
  depreciationAndAmortization: number;
  ebitda: number;
  ebitdaratio: number;
  operatingIncome: number;
  operatingIncomeRatio: number;
  totalOtherIncomeExpensesNet: number;
  incomeBeforeTax: number;
  incomeBeforeTaxRatio: number;
  incomeTaxExpense: number;
  netIncome: number;
  netIncomeRatio: number;
  eps: number;
  epsdiluted: number;
  weightedAverageShsOut: number;
  weightedAverageShsOutDil: number;
}

export interface FMPCashFlowStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  netIncome: number;
  depreciationAndAmortization: number;
  deferredIncomeTax: number;
  stockBasedCompensation: number;
  changeInWorkingCapital: number;
  accountsReceivables: number;
  inventory: number;
  accountsPayables: number;
  otherWorkingCapital: number;
  otherNonCashItems: number;
  netCashProvidedByOperatingActivities: number;
  investmentsInPropertyPlantAndEquipment: number;
  acquisitionsNet: number;
  purchasesOfInvestments: number;
  salesMaturitiesOfInvestments: number;
  otherInvestingActivites: number;
  netCashUsedForInvestingActivites: number;
  debtRepayment: number;
  commonStockIssued: number;
  commonStockRepurchased: number;
  dividendsPaid: number;
  otherFinancingActivites: number;
  netCashUsedProvidedByFinancingActivities: number;
  effectOfForexChangesOnCash: number;
  netChangeInCash: number;
  cashAtEndOfPeriod: number;
  cashAtBeginningOfPeriod: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
}

export interface FMPBalanceSheet {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  cashAndShortTermInvestments: number;
  netReceivables: number;
  inventory: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;
  propertyPlantEquipmentNet: number;
  goodwill: number;
  intangibleAssets: number;
  goodwillAndIntangibleAssets: number;
  longTermInvestments: number;
  taxAssets: number;
  otherNonCurrentAssets: number;
  totalNonCurrentAssets: number;
  otherAssets: number;
  totalAssets: number;
  accountPayables: number;
  shortTermDebt: number;
  taxPayables: number;
  deferredRevenue: number;
  otherCurrentLiabilities: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  deferredRevenueNonCurrent: number;
  deferredTaxLiabilitiesNonCurrent: number;
  otherNonCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  otherLiabilities: number;
  capitalLeaseObligations: number;
  totalLiabilities: number;
  preferredStock: number;
  commonStock: number;
  retainedEarnings: number;
  accumulatedOtherComprehensiveIncomeLoss: number;
  othertotalStockholdersEquity: number;
  totalStockholdersEquity: number;
  totalEquity: number;
  totalLiabilitiesAndStockholdersEquity: number;
  minorityInterest: number;
  totalLiabilitiesAndTotalEquity: number;
  totalInvestments: number;
  totalDebt: number;
  netDebt: number;
}

export interface ProcessedFMPData {
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

export class FMPService {
  private static readonly BASE_URL = 'https://financialmodelingprep.com/api/v3';
  private static readonly API_KEY = import.meta.env.VITE_FMP_API_KEY;

  static async fetchCompanyProfile(ticker: string): Promise<FMPCompanyProfile> {
    const response = await fetch(
      `${this.BASE_URL}/profile/${ticker}?apikey=${this.API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch company profile: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data[0];
  }

  static async fetchIncomeStatement(ticker: string, years: number = 5): Promise<FMPIncomeStatement[]> {
    const response = await fetch(
      `${this.BASE_URL}/income-statement/${ticker}?limit=${years}&apikey=${this.API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch income statement: ${response.statusText}`);
    }
    
    return await response.json();
  }

  static async fetchCashFlowStatement(ticker: string, years: number = 5): Promise<FMPCashFlowStatement[]> {
    const response = await fetch(
      `${this.BASE_URL}/cash-flow-statement/${ticker}?limit=${years}&apikey=${this.API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cash flow statement: ${response.statusText}`);
    }
    
    return await response.json();
  }

  static async fetchBalanceSheet(ticker: string, years: number = 5): Promise<FMPBalanceSheet[]> {
    const response = await fetch(
      `${this.BASE_URL}/balance-sheet-statement/${ticker}?limit=${years}&apikey=${this.API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch balance sheet: ${response.statusText}`);
    }
    
    return await response.json();
  }

  static async getProcessedFinancialData(ticker: string): Promise<ProcessedFMPData> {
    try {
      console.log(`Fetching FMP data for ${ticker}...`);
      
      const [profile, incomeStatements, cashFlows, balanceSheets] = await Promise.all([
        this.fetchCompanyProfile(ticker),
        this.fetchIncomeStatement(ticker),
        this.fetchCashFlowStatement(ticker),
        this.fetchBalanceSheet(ticker)
      ]);

      console.log('FMP data fetched successfully');

      // Process the data into our format
      const marketCap = profile.mktCap || 0;
      const beta = profile.beta || 1.0;
      const currentPrice = profile.price || 0;
      
      // Calculate shares outstanding from market cap and price
      const sharesOutstanding = marketCap > 0 && currentPrice > 0 
        ? marketCap / currentPrice 
        : incomeStatements[0]?.weightedAverageShsOut || 1;

      // Process historical data (last 5 years)
      const revenue = incomeStatements.map(stmt => stmt.revenue / 1000000 || 0);
      const netIncome = incomeStatements.map(stmt => stmt.netIncome / 1000000 || 0);
      const operatingIncome = incomeStatements.map(stmt => stmt.operatingIncome / 1000000 || 0);
      const cashFromOps = cashFlows.map(cf => cf.operatingCashFlow / 1000000 || 0);
      const capex = cashFlows.map(cf => Math.abs(cf.capitalExpenditure) / 1000000 || 0);

      // Dividend data
      const dividendPerShare = profile.lastDiv || 0;
      const paysDividends = dividendPerShare > 0;
      
      // Generate historical dividend data
      const dividends = paysDividends 
        ? Array(5).fill(0).map((_, i) => dividendPerShare * (1 - i * 0.02)) // Rough historical estimate
        : [];

      // Get debt and interest expense from balance sheet and income statement
      const totalDebt = balanceSheets[0]?.totalDebt || 0;
      const interestExpense = incomeStatements[0]?.interestExpense || 0;

      return {
        ticker: ticker.toUpperCase(),
        marketCap: marketCap / 1000000, // Convert to millions
        beta,
        totalDebt: totalDebt / 1000000,
        interestExpense: Math.abs(interestExpense) / 1000000,
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
      console.error('Error fetching FMP data:', error);
      throw new Error(`Failed to fetch financial data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
