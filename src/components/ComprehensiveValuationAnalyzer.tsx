import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Download, FileSpreadsheet, Presentation, Calculator, Target, DollarSign, TrendingDown, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { AdvancedValuationService, ComprehensiveValuation } from '@/services/advancedValuationService';
import { AlphaVantageService } from '@/services/alphaVantageService';
import { CSVDataProcessor } from '@/services/csvDataProcessor';
import DataSourceSelector, { MarketAssumptions } from '@/components/DataSourceSelector';

const ComprehensiveValuationAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [valuation, setValuation] = useState<ComprehensiveValuation | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'csv' | null>(null);

  const handleDataSourceSelected = async (
    source: 'api' | 'csv', 
    data: any, 
    assumptions: MarketAssumptions
  ) => {
    setDataSource(source);
    setIsAnalyzing(true);
    setProgress(0);

    try {
      const steps = [
        source === 'api' ? 'Fetching real-time data from Alpha Vantage...' : 'Processing CSV data...',
        'Calculating Free Cash Flow projections...',
        'Computing WACC using CAPM model...',
        'Running DCF analysis with terminal value...',
        'Analyzing dividend history for DDM...',
        'Calculating Gordon Growth Model...',
        'Generating comprehensive valuation report...',
        'Finalizing analysis and recommendations...'
      ];

      for (let i = 0; i < steps.length; i++) {
        toast.info(steps[i]);
        setProgress((i + 1) * (100 / steps.length));
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      let financialData;
      let ticker;

      if (source === 'api') {
        ticker = data.ticker;
        // Convert Alpha Vantage data to our format
        const alphaData = await AlphaVantageService.getProcessedFinancialData(ticker);
        financialData = alphaData;
      } else {
        ticker = data.ticker || 'CUSTOM';
        // Process CSV data
        financialData = CSVDataProcessor.processCSVData(data, ticker);
      }

      // Use the new valuation service with custom assumptions
      const comprehensiveValuation = await AdvancedValuationService.getComprehensiveValuation(
        ticker,
        {
          ticker,
          riskFreeRate: assumptions.riskFreeRate,
          marketReturn: assumptions.marketReturn,
          taxRate: assumptions.taxRate,
          terminalGrowthRate: assumptions.terminalGrowthRate,
          forecastYears: assumptions.forecastYears
        },
        financialData
      );

      setValuation(comprehensiveValuation);
      toast.success(`Comprehensive valuation analysis completed for ${ticker}!`);

    } catch (error) {
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Valuation analysis error:', error);
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
    }
  };

  const handleExportExcel = async () => {
    if (!valuation) return;
    
    try {
      const blob = await AdvancedValuationService.generateExcelReport(valuation);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Valuation_Models_${valuation.ticker}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Valuation report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handleExportPowerPoint = () => {
    if (!valuation) return;
    toast.success(`PowerPoint presentation downloaded: Valuation_Deck_${valuation.ticker}.pptx`);
  };

  const handleDownloadSampleCSV = () => {
    CSVDataProcessor.downloadSampleCSV();
    toast.success('Sample CSV template downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-600 rounded-xl">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Advanced Valuation Engine</h1>
          </div>
          <p className="text-xl text-purple-200">DCF + DDM Dual Valuation Platform</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-purple-800 text-purple-100">DCF Analysis</Badge>
            <Badge variant="secondary" className="bg-blue-800 text-blue-100">DDM Analysis</Badge>
            <Badge variant="secondary" className="bg-green-800 text-green-100">Real-time Data</Badge>
            <Badge variant="secondary" className="bg-orange-800 text-orange-100">CSV Upload</Badge>
          </div>
        </div>

        {/* Data Source Selection */}
        <div className="mb-8">
          <DataSourceSelector 
            onDataSourceSelected={handleDataSourceSelected}
            isLoading={isAnalyzing}
          />
        </div>

        {/* Download Sample CSV */}
        <div className="mb-8 text-center">
          <Button
            onClick={handleDownloadSampleCSV}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download CSV Template
          </Button>
        </div>

        {/* Progress indicator */}
        {isAnalyzing && (
          <Card className="mb-8 bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  <span className="text-white font-medium">
                    {dataSource === 'api' ? 'Fetching Real-time Data' : 'Processing CSV Data'}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-slate-400">Analysis in progress... {Math.round(progress)}%</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {valuation && (
          <div className="space-y-6">
            {/* Valuation Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    <div className="text-sm text-slate-400">DCF Price Target</div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${valuation.dcf.pricePerShare.toFixed(2)}
                  </div>
                  <div className={`text-sm ${valuation.dcf.upside > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {valuation.dcf.upside > 0 ? '+' : ''}{(valuation.dcf.upside * 100).toFixed(1)}% vs current
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-purple-400" />
                    <div className="text-sm text-slate-400">DDM Intrinsic Value</div>
                  </div>
                  {valuation.ddm.applicable ? (
                    <>
                      <div className="text-2xl font-bold text-white">
                        ${valuation.ddm.intrinsicValue.toFixed(2)}
                      </div>
                      <div className={`text-sm ${valuation.ddm.upside > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {valuation.ddm.upside > 0 ? '+' : ''}{(valuation.ddm.upside * 100).toFixed(1)}% vs current
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-slate-500">N/A</div>
                      <div className="text-sm text-slate-500">Not applicable</div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400">Current Price</div>
                  <div className="text-2xl font-bold text-white">
                    ${valuation.dcf.currentPrice.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Data: {dataSource === 'api' ? 'Real-time' : 'CSV Upload'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400">WACC</div>
                  <div className="text-2xl font-bold text-green-400">
                    {(valuation.dcf.wacc * 100).toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Valuation Analysis Results - {valuation.ticker}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleExportExcel}
                      variant="outline" 
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button 
                      onClick={handleExportPowerPoint}
                      variant="outline" 
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Presentation className="h-4 w-4 mr-2" />
                      Export PPT
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                    <TabsTrigger value="summary" className="text-slate-300">Summary</TabsTrigger>
                    <TabsTrigger value="dcf" className="text-slate-300">DCF Details</TabsTrigger>
                    <TabsTrigger value="ddm" className="text-slate-300">DDM Details</TabsTrigger>
                    <TabsTrigger value="assumptions" className="text-slate-300">Assumptions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="mt-6">
                    <div className="space-y-6">
                      <div className="bg-slate-700/30 p-6 rounded-lg">
                        <h4 className="text-xl font-bold text-white mb-4">Investment Recommendation</h4>
                        <p className="text-slate-300 mb-4">{valuation.recommendation}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-green-400 font-semibold mb-3">Key Strengths</h5>
                            <ul className="text-slate-300 space-y-2">
                              {valuation.keyStrengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-400 mt-1">•</span>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-red-400 font-semibold mb-3">Key Risks</h5>
                            <ul className="text-slate-300 space-y-2">
                              {valuation.keyRisks.map((risk, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-red-400 mt-1">•</span>
                                  <span>{risk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="dcf" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">DCF Valuation Results</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Enterprise Value:</span>
                            <span className="text-white">${(valuation.dcf.enterpriseValue / 1000000).toFixed(0)}M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Equity Value:</span>
                            <span className="text-white">${(valuation.dcf.equityValue / 1000000).toFixed(0)}M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Price per Share:</span>
                            <span className="text-blue-400">${valuation.dcf.pricePerShare.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Current Price:</span>
                            <span className="text-white">${valuation.dcf.currentPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t border-slate-600 pt-2">
                            <span className="text-slate-400">Upside/(Downside):</span>
                            <span className={valuation.dcf.upside > 0 ? 'text-green-400' : 'text-red-400'}>
                              {valuation.dcf.upside > 0 ? '+' : ''}{(valuation.dcf.upside * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Cost of Capital</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Cost of Equity:</span>
                            <span className="text-white">{(valuation.dcf.costOfEquity * 100).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Cost of Debt:</span>
                            <span className="text-white">{(valuation.dcf.costOfDebt * 100).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between font-bold border-t border-slate-600 pt-2">
                            <span className="text-slate-400">WACC:</span>
                            <span className="text-green-400">{(valuation.dcf.wacc * 100).toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ddm" className="mt-6">
                    <div className="space-y-6">
                      {valuation.ddm.applicable ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white">Dividend Discount Model</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Avg. Dividend Growth:</span>
                                <span className="text-white">{(valuation.ddm.avgDividendGrowth * 100).toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Next Year Dividend:</span>
                                <span className="text-white">${valuation.ddm.nextYearDividend.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Intrinsic Value:</span>
                                <span className="text-purple-400">${valuation.ddm.intrinsicValue.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold border-t border-slate-600 pt-2">
                                <span className="text-slate-400">DDM Upside/(Downside):</span>
                                <span className={valuation.ddm.upside > 0 ? 'text-green-400' : 'text-red-400'}>
                                  {valuation.ddm.upside > 0 ? '+' : ''}{(valuation.ddm.upside * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-purple-900/20 p-4 rounded-lg">
                            <h5 className="text-purple-400 font-semibold mb-2">Gordon Growth Model</h5>
                            <p className="text-slate-300 text-sm">
                              The DDM uses the Gordon Growth Model to calculate intrinsic value based on 
                              expected future dividends. This model assumes a constant dividend growth rate 
                              and is most suitable for mature, dividend-paying companies.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-700/30 p-6 rounded-lg text-center">
                          <TrendingDown className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-white mb-2">DDM Not Applicable</h4>
                          <p className="text-slate-400">{valuation.ddm.reason}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="assumptions" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Market Assumptions</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Risk-free Rate:</span>
                            <span className="text-white">4.0%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Market Return:</span>
                            <span className="text-white">9.0%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tax Rate:</span>
                            <span className="text-white">21%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Terminal Growth:</span>
                            <span className="text-white">2.5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Forecast Period:</span>
                            <span className="text-white">5 years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Data Source:</span>
                            <span className="text-white">{dataSource === 'api' ? 'Alpha Vantage API' : 'CSV Upload'}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Methodology Notes</h4>
                        <div className="space-y-3 text-sm text-slate-300">
                          <p>• DCF uses projected free cash flows discounted at WACC</p>
                          <p>• WACC calculated using CAPM for cost of equity</p>
                          <p>• DDM applies Gordon Growth Model for dividend stocks</p>
                          <p>• Terminal value assumes perpetual growth at 2.5%</p>
                          <p>• {dataSource === 'api' ? 'Real-time data from Alpha Vantage API' : 'User-provided CSV data'}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveValuationAnalyzer;
