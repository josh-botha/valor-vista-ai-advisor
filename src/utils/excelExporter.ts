
// Excel Export Utility for DCF Models
// In production, this would use libraries like exceljs or xlsx

export interface DCFExportData {
  ticker: string;
  assumptions: {
    wacc: number;
    terminalGrowth: number;
    taxRate: number;
    forecastYears: number;
  };
  financials: {
    revenue: number;
    freeCashFlow: number;
    marketCap: number;
    totalDebt: number;
  };
  scenarios: Array<{
    name: string;
    growthRate: number;
    projectedFCFs: number[];
    terminalValue: number;
    enterpriseValue: number;
    equityValue: number;
    priceTarget: number;
  }>;
}

export class ExcelExporter {
  static async generateDCFModel(data: DCFExportData): Promise<Blob> {
    // In real implementation, would use exceljs to create Excel workbook
    // For now, creating a CSV representation
    
    const csvContent = this.generateCSVContent(data);
    return new Blob([csvContent], { type: 'text/csv' });
  }

  private static generateCSVContent(data: DCFExportData): string {
    let csv = '';
    
    // Header
    csv += `DCF Valuation Model - ${data.ticker}\n\n`;
    
    // Key Assumptions
    csv += 'Key Assumptions\n';
    csv += `WACC,${(data.assumptions.wacc * 100).toFixed(2)}%\n`;
    csv += `Terminal Growth Rate,${(data.assumptions.terminalGrowth * 100).toFixed(2)}%\n`;
    csv += `Tax Rate,${(data.assumptions.taxRate * 100).toFixed(2)}%\n`;
    csv += `Forecast Years,${data.assumptions.forecastYears}\n\n`;
    
    // Current Financials
    csv += 'Current Financials ($ millions)\n';
    csv += `Revenue,${data.financials.revenue.toLocaleString()}\n`;
    csv += `Free Cash Flow,${data.financials.freeCashFlow.toLocaleString()}\n`;
    csv += `Market Cap,${data.financials.marketCap.toLocaleString()}\n`;
    csv += `Total Debt,${data.financials.totalDebt.toLocaleString()}\n\n`;
    
    // Scenario Analysis
    csv += 'Scenario Analysis\n';
    csv += 'Scenario,Growth Rate,Enterprise Value,Equity Value,Price Target\n';
    
    data.scenarios.forEach(scenario => {
      csv += `${scenario.name},${(scenario.growthRate * 100).toFixed(1)}%,`;
      csv += `${(scenario.enterpriseValue / 1000000).toFixed(0)},`;
      csv += `${(scenario.equityValue / 1000000).toFixed(0)},`;
      csv += `${scenario.priceTarget.toFixed(2)}\n`;
    });
    
    return csv;
  }

  static downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
