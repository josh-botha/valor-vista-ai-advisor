
export interface CSVFinancialData {
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

export class CSVDataProcessor {
  static processCSVData(csvData: any, ticker: string): CSVFinancialData {
    console.log('Processing CSV data:', csvData);

    // Helper function to safely extract numeric array
    const getNumericArray = (key: string, defaultValue: number[] = []): number[] => {
      const data = csvData[key] || csvData[key.toLowerCase()] || csvData[key.toUpperCase()];
      if (Array.isArray(data)) {
        return data.map((val: any) => {
          const num = parseFloat(val);
          return isNaN(num) ? 0 : num;
        });
      }
      return defaultValue;
    };

    // Helper function to safely extract single numeric value
    const getNumericValue = (key: string, defaultValue: number = 0): number => {
      const data = csvData[key] || csvData[key.toLowerCase()] || csvData[key.toUpperCase()];
      if (Array.isArray(data) && data.length > 0) {
        const num = parseFloat(data[0]);
        return isNaN(num) ? defaultValue : num;
      }
      const num = parseFloat(data);
      return isNaN(num) ? defaultValue : num;
    };

    // Process the data
    const revenue = getNumericArray('revenue', [100000, 95000, 90000, 85000, 80000]);
    const netIncome = getNumericArray('netIncome', [15000, 14000, 13000, 12000, 11000]);
    const operatingIncome = getNumericArray('operatingIncome', [20000, 19000, 18000, 17000, 16000]);
    const cashFromOps = getNumericArray('cashFromOps', [18000, 17000, 16000, 15000, 14000]);
    const capex = getNumericArray('capex', [-2000, -1900, -1800, -1700, -1600]);
    const dividends = getNumericArray('dividends', []);

    const marketCap = getNumericValue('marketCap', 500000);
    const beta = getNumericValue('beta', 1.0);
    const totalDebt = getNumericValue('totalDebt', 50000);
    const interestExpense = getNumericValue('interestExpense', 2000);
    const sharesOutstanding = getNumericValue('sharesOutstanding', 1000);
    const currentPrice = getNumericValue('currentPrice', marketCap / sharesOutstanding);

    const paysDividends = dividends.length > 0 && dividends.some(d => d > 0);

    return {
      ticker: ticker.toUpperCase(),
      marketCap,
      beta,
      totalDebt,
      interestExpense,
      revenue,
      netIncome,
      operatingIncome,
      capex,
      cashFromOps,
      dividends,
      sharesOutstanding,
      currentPrice,
      paysDividends
    };
  }

  static generateSampleCSV(): string {
    const sampleData = [
      'metric,year1,year2,year3,year4,year5',
      'revenue,100000,95000,90000,85000,80000',
      'netIncome,15000,14000,13000,12000,11000',
      'operatingIncome,20000,19000,18000,17000,16000',
      'cashFromOps,18000,17000,16000,15000,14000',
      'capex,-2000,-1900,-1800,-1700,-1600',
      'dividends,2.50,2.40,2.30,2.20,2.10',
      'marketCap,500000',
      'beta,1.2',
      'totalDebt,50000',
      'interestExpense,2000',
      'sharesOutstanding,10000',
      'currentPrice,50.00'
    ];

    return sampleData.join('\n');
  }

  static downloadSampleCSV() {
    const csvContent = this.generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_financial_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
