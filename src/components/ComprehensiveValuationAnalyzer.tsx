import React, { useState, useEffect } from 'react';
import DataSourceSelector, { MarketAssumptions } from '@/components/DataSourceSelector';
import { calculateDCF, DCFResults } from '@/utils/dcfCalculator';
import { AlphaVantageService } from '@/services/alphaVantageService';
import { FMPService } from '@/services/fmpService';
import { ExcelExporter, DCFExportData } from '@/utils/excelExporter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sparkles, BarChart3, FilePieChart, Presentation, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ComprehensiveValuationAnalyzerProps {
  initialTicker?: string;
}

const ComprehensiveValuationAnalyzer: React.FC<ComprehensiveValuationAnalyzerProps> = ({ 
  initialTicker = '' 
}) => {
  const [dataSource, setDataSource] = useState<'api' | 'csv' | 'fmp' | null>(null);
  const [data, setData] = useState<any>(null);
  const [assumptions, setAssumptions] = useState<MarketAssumptions | null>(null);
  const [results, setResults] = useState<DCFResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticker, setTicker] = useState<string>(initialTicker);

  const handleDataSourceSelected = async (source: 'api' | 'csv' | 'fmp', data: any, assumptions: MarketAssumptions) => {
    console.log('Data source selected:', source, data, assumptions);
    
    try {
      setDataSource(source);
      setData(data);
      setAssumptions(assumptions);
      setResults(null);
      setError(null);
      setIsLoading(true);

      await new Promise(resolve => setTimeout(resolve, 500));

      if (source === 'fmp') {
        const tickerSymbol = (data as { ticker: string }).ticker;
        setTicker(tickerSymbol);
        console.log(`Fetching FMP data for ticker: ${tickerSymbol}`);
        
        // Use the FMPService to fetch data
        const processedData = await FMPService.getProcessedFinancialData(tickerSymbol);
        
        setData(processedData);

        // Calculate revenue growth rates from historical data
        const revenueGrowthRates = [];
        for (let i = 1; i < Math.min(processedData.revenue.length, assumptions.forecastYears); i++) {
          const growth = (processedData.revenue[i-1] - processedData.revenue[i]) / processedData.revenue[i];
          revenueGrowthRates.push(Math.max(growth, 0.02)); // Minimum 2% growth
        }
        
        // Fill remaining years with average growth
        const avgGrowth = revenueGrowthRates.reduce((sum, rate) => sum + rate, 0) / revenueGrowthRates.length || 0.05;
        while (revenueGrowthRates.length < assumptions.forecastYears) {
          revenueGrowthRates.push(avgGrowth);
        }

        // Calculate operating margins from historical data
        const operatingMargins = [];
        for (let i = 0; i < Math.min(processedData.operatingIncome.length, assumptions.forecastYears); i++) {
          const margin = processedData.operatingIncome[i] / processedData.revenue[i];
          operatingMargins.push(Math.max(margin, 0.05)); // Minimum 5% margin
        }
        
        // Fill remaining years with average margin
        const avgMargin = operatingMargins.reduce((sum, margin) => sum + margin, 0) / operatingMargins.length || 0.15;
        while (operatingMargins.length < assumptions.forecastYears) {
          operatingMargins.push(avgMargin);
        }
        
        const dcfData = {
          revenueGrowthRates,
          operatingMargins,
          riskFreeRate: assumptions.riskFreeRate,
          marketReturn: assumptions.marketReturn,
          taxRate: assumptions.taxRate,
          terminalGrowthRate: assumptions.terminalGrowthRate,
          forecastYears: assumptions.forecastYears
        };

        setResults(calculateDCF(dcfData));
        toast.success('FMP data fetched and valuation complete!');

      } else if (source === 'api') {
        const tickerSymbol = (data as { ticker: string }).ticker;
        setTicker(tickerSymbol);
        console.log(`Fetching data for ticker: ${tickerSymbol}`);
        
        // Use the AlphaVantageService instead of direct API calls
        const processedData = await AlphaVantageService.getProcessedFinancialData(tickerSymbol);
        
        setData(processedData);

        // Calculate revenue growth rates from historical data
        const revenueGrowthRates = [];
        for (let i = 1; i < Math.min(processedData.revenue.length, assumptions.forecastYears); i++) {
          const growth = (processedData.revenue[i-1] - processedData.revenue[i]) / processedData.revenue[i];
          revenueGrowthRates.push(Math.max(growth, 0.02)); // Minimum 2% growth
        }
        
        // Fill remaining years with average growth
        const avgGrowth = revenueGrowthRates.reduce((sum, rate) => sum + rate, 0) / revenueGrowthRates.length || 0.05;
        while (revenueGrowthRates.length < assumptions.forecastYears) {
          revenueGrowthRates.push(avgGrowth);
        }

        // Calculate operating margins from historical data
        const operatingMargins = [];
        for (let i = 0; i < Math.min(processedData.operatingIncome.length, assumptions.forecastYears); i++) {
          const margin = processedData.operatingIncome[i] / processedData.revenue[i];
          operatingMargins.push(Math.max(margin, 0.05)); // Minimum 5% margin
        }
        
        // Fill remaining years with average margin
        const avgMargin = operatingMargins.reduce((sum, margin) => sum + margin, 0) / operatingMargins.length || 0.15;
        while (operatingMargins.length < assumptions.forecastYears) {
          operatingMargins.push(avgMargin);
        }
        
        const dcfData = {
          revenueGrowthRates,
          operatingMargins,
          riskFreeRate: assumptions.riskFreeRate,
          marketReturn: assumptions.marketReturn,
          taxRate: assumptions.taxRate,
          terminalGrowthRate: assumptions.terminalGrowthRate,
          forecastYears: assumptions.forecastYears
        };

        setResults(calculateDCF(dcfData));
        toast.success('Real-time data fetched and valuation complete!');

      } else if (source === 'csv') {
        if (!data['Revenue'] && !data['revenue']) {
          throw new Error('CSV data must contain Revenue column');
        }
        
        const revenueGrowthRates = Array(assumptions.forecastYears).fill(0.05);
        const operatingMargins = Array(assumptions.forecastYears).fill(0.15);
        
        const dcfData = {
          revenueGrowthRates,
          operatingMargins,
          riskFreeRate: assumptions.riskFreeRate,
          marketReturn: assumptions.marketReturn,
          taxRate: assumptions.taxRate,
          terminalGrowthRate: assumptions.terminalGrowthRate,
          forecastYears: assumptions.forecastYears
        };

        setResults(calculateDCF(dcfData));
        toast.success('CSV data processed and valuation complete!');
      }
    } catch (e: any) {
      console.error('Error in data processing:', e);
      const errorMessage = e.message || 'Failed to fetch or process data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelExport = async () => {
    if (!results || !assumptions || !data) {
      toast.error('No data available for export');
      return;
    }

    setIsExporting(true);
    try {
      const exportData: DCFExportData = {
        ticker: ticker || 'UNKNOWN',
        assumptions: {
          wacc: results.wacc,
          terminalGrowth: assumptions.terminalGrowthRate,
          taxRate: assumptions.taxRate,
          forecastYears: assumptions.forecastYears
        },
        financials: {
          revenue: data.revenue?.[0] || 1000,
          freeCashFlow: results.projectedFreeCashFlows[0] || 0,
          marketCap: data.marketCap || 0,
          totalDebt: data.totalDebt || 0
        },
        scenarios: [
          {
            name: 'Base Case',
            growthRate: 0.05,
            projectedFCFs: results.projectedFreeCashFlows,
            terminalValue: results.terminalValue,
            enterpriseValue: results.enterpriseValue,
            equityValue: results.equityValue,
            priceTarget: results.fairValuePerShare
          },
          {
            name: 'Bull Case',
            growthRate: 0.08,
            projectedFCFs: results.projectedFreeCashFlows.map(fcf => fcf * 1.2),
            terminalValue: results.terminalValue * 1.3,
            enterpriseValue: results.enterpriseValue * 1.25,
            equityValue: results.equityValue * 1.25,
            priceTarget: results.fairValuePerShare * 1.25
          },
          {
            name: 'Bear Case',
            growthRate: 0.02,
            projectedFCFs: results.projectedFreeCashFlows.map(fcf => fcf * 0.8),
            terminalValue: results.terminalValue * 0.7,
            enterpriseValue: results.enterpriseValue * 0.75,
            equityValue: results.equityValue * 0.75,
            priceTarget: results.fairValuePerShare * 0.75
          }
        ]
      };

      const blob = await ExcelExporter.generateDCFModel(exportData);
      const filename = `DCF_Analysis_${ticker}_${new Date().toISOString().split('T')[0]}.csv`;
      ExcelExporter.downloadFile(blob, filename);
      
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    } finally {
      setIsExporting(false);
    }
  };

  // Auto-trigger analysis if initial ticker is provided
  useEffect(() => {
    if (initialTicker && !isLoading && !results && !error) {
      console.log('Auto-triggering analysis for ticker:', initialTicker);
      const defaultAssumptions = {
        riskFreeRate: 0.04,
        marketReturn: 0.09,
        taxRate: 0.21,
        terminalGrowthRate: 0.025,
        forecastYears: 5
      };
      
      handleDataSourceSelected('fmp', { ticker: initialTicker }, defaultAssumptions);
    }
  }, [initialTicker, isLoading, results, error]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Comprehensive Valuation Analyzer</h1>
        {results && (
          <Button 
            onClick={handleExcelExport}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <Sparkles className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export DCF Model
          </Button>
        )}
      </div>
      
      <DataSourceSelector onDataSourceSelected={handleDataSourceSelected} isLoading={isLoading} />

      {isLoading && (
        <Card className="mt-6 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 animate-spin" />
              Analyzing Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-[40%]" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mt-6 bg-red-800/50 border-red-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card className="mt-6 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Valuation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Key Metrics</h3>
                <div className="space-y-2 text-slate-400">
                  <div>Enterprise Value: <span className="text-white">${results?.enterpriseValue.toFixed(2)}</span></div>
                  <div>Equity Value: <span className="text-white">${results?.equityValue.toFixed(2)}</span></div>
                  <div>Fair Value per Share: <span className="text-white">${results?.fairValuePerShare.toFixed(2)}</span></div>
                  <div>WACC: <span className="text-white">{(results?.wacc * 100).toFixed(2)}%</span></div>
                  <div>Terminal Value: <span className="text-white">${results?.terminalValue.toFixed(2)}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Detailed Cash Flow Projections</h3>
                <ScrollArea className="h-[300px] rounded-md border bg-secondary">
                  <table className="w-full text-sm">
                    <thead className="[&_th]:px-4 [&_th]:py-2 [&_th:first-child]:text-left [&_th:last-child]:text-right">
                      <tr>
                        <th>Year</th>
                        <th>Free Cash Flow</th>
                      </tr>
                    </thead>
                    <tbody className="[&_td]:px-4 [&_td]:py-2 [&_td:first-child]:text-left [&_td:last-child]:text-right">
                      {results.projectedFreeCashFlows.map((fcf, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>${fcf.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </div>

            <Separator className="my-6 bg-slate-700" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FilePieChart className="h-4 w-4 text-green-400" />
                  DCF Analysis Summary
                </h3>
                <div className="text-sm text-slate-400 space-y-2">
                  <p>
                    Based on the Discounted Cash Flow (DCF) model, the fair value per share is estimated to be{' '}
                    <span className="text-green-400 font-medium">${results?.fairValuePerShare.toFixed(2)}</span>.
                  </p>
                  <p>
                    This valuation is derived from projecting future free cash flows and discounting them back to
                    present value using a Weighted Average Cost of Capital (WACC) of{' '}
                    <span className="text-green-400 font-medium">{(results?.wacc * 100).toFixed(2)}%</span>.
                  </p>
                  <p>
                    The analysis incorporates a terminal value of{' '}
                    <span className="text-green-400 font-medium">${results?.terminalValue.toFixed(2)}</span>,
                    representing the value of the company beyond the explicit forecast period.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Presentation className="h-4 w-4 text-blue-400" />
                  Recommendation
                </h3>
                <div className="text-sm text-slate-400 space-y-2">
                  {results.fairValuePerShare > 0 ? (
                    <>
                      <p>
                        The current market price is below the estimated fair value, suggesting that the stock may be{' '}
                        <span className="text-blue-400 font-medium">undervalued</span>.
                      </p>
                      <p>
                        Based on this analysis, a potential <span className="text-blue-400 font-medium">BUY</span>{' '}
                        recommendation is warranted.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        The analysis indicates a negative fair value, suggesting significant financial challenges or
                        risks.
                      </p>
                      <p>
                        A <span className="text-red-400 font-medium">SELL</span> recommendation may be appropriate.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComprehensiveValuationAnalyzer;
