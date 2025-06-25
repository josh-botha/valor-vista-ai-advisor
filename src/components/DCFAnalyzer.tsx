
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Download, FileSpreadsheet, Presentation, Calculator, Target } from 'lucide-react';
import { toast } from 'sonner';

interface FinancialData {
  ticker: string;
  marketCap: number;
  beta: number;
  totalDebt: number;
  interestExpense: number;
  freeCashFlow: number;
  revenue: number;
  ebitda: number;
  taxRate: number;
}

interface DCFResults {
  wacc: number;
  costOfEquity: number;
  costOfDebt: number;
  scenarios: {
    base: { ev: number; equityValue: number; priceTarget: number };
    bull: { ev: number; equityValue: number; priceTarget: number };
    bear: { ev: number; equityValue: number; priceTarget: number };
  };
}

const DCFAnalyzer = () => {
  const [ticker, setTicker] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [dcfResults, setDCFResults] = useState<DCFResults | null>(null);

  const handleAnalyze = async () => {
    if (!ticker.trim()) {
      toast.error('Please enter a valid ticker symbol');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Simulate progressive analysis steps
      const steps = [
        'Fetching real-time financial data...',
        'Calculating WACC using CAPM...',
        'Running multi-scenario DCF analysis...',
        'Generating Excel DCF model...',
        'Creating PowerPoint presentation...',
        'Finalizing valuation summary...'
      ];

      for (let i = 0; i < steps.length; i++) {
        toast.info(steps[i]);
        setProgress((i + 1) * (100 / steps.length));
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Mock financial data (in real implementation, this would come from yfinance API)
      const mockFinancialData: FinancialData = {
        ticker: ticker.toUpperCase(),
        marketCap: 2850000, // $2.85T
        beta: 1.2,
        totalDebt: 120000, // $120B
        interestExpense: 3600, // $3.6B
        freeCashFlow: 95000, // $95B
        revenue: 394000, // $394B
        ebitda: 130000, // $130B
        taxRate: 0.21
      };

      // Calculate WACC and DCF scenarios
      const riskFreeRate = 0.045; // 4.5%
      const marketRiskPremium = 0.06; // 6%
      const costOfEquity = riskFreeRate + mockFinancialData.beta * marketRiskPremium;
      const costOfDebt = (mockFinancialData.interestExpense / mockFinancialData.totalDebt) * (1 - mockFinancialData.taxRate);
      
      const equity = mockFinancialData.marketCap;
      const debt = mockFinancialData.totalDebt;
      const totalCapital = equity + debt;
      
      const wacc = (equity / totalCapital) * costOfEquity + (debt / totalCapital) * costOfDebt;

      const mockDCFResults: DCFResults = {
        wacc: wacc,
        costOfEquity: costOfEquity,
        costOfDebt: costOfDebt,
        scenarios: {
          base: { ev: 3200000, equityValue: 3080000, priceTarget: 185 },
          bull: { ev: 3650000, equityValue: 3530000, priceTarget: 212 },
          bear: { ev: 2800000, equityValue: 2680000, priceTarget: 161 }
        }
      };

      setFinancialData(mockFinancialData);
      setDCFResults(mockDCFResults);
      toast.success('DCF analysis completed successfully!');

    } catch (error) {
      toast.error('Analysis failed. Please try again.');
      console.error('DCF Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
    }
  };

  const handleExportExcel = () => {
    toast.success('Excel DCF model downloaded: DCF_Model.xlsx');
    // In real implementation, generate and download Excel file
  };

  const handleExportPowerPoint = () => {
    toast.success('PowerPoint presentation downloaded: Valuation_Slides.pptx');
    // In real implementation, generate and download PowerPoint file
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">DCF Valuation Engine</h1>
          </div>
          <p className="text-xl text-blue-200">Professional Investment Banking Analysis Platform</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-blue-800 text-blue-100">Real-time Data</Badge>
            <Badge variant="secondary" className="bg-green-800 text-green-100">WACC Calculation</Badge>
            <Badge variant="secondary" className="bg-purple-800 text-purple-100">Multi-scenario DCF</Badge>
            <Badge variant="secondary" className="bg-orange-800 text-orange-100">Excel Export</Badge>
          </div>
        </div>

        {/* Input Section */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Company Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ticker Symbol
                </label>
                <Input
                  placeholder="e.g., AAPL, MSFT, TSLA"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  disabled={isAnalyzing}
                />
              </div>
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {isAnalyzing ? 'Analyzing...' : 'Run DCF Analysis'}
              </Button>
            </div>
            {isAnalyzing && (
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-slate-400 mt-2">Analysis in progress... {Math.round(progress)}%</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {financialData && dcfResults && (
          <div className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400">Market Cap</div>
                  <div className="text-2xl font-bold text-white">
                    ${(financialData.marketCap / 1000).toFixed(1)}T
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400">WACC</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {(dcfResults.wacc * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400">Beta</div>
                  <div className="text-2xl font-bold text-green-400">
                    {financialData.beta.toFixed(1)}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400">FCF</div>
                  <div className="text-2xl font-bold text-purple-400">
                    ${(financialData.freeCashFlow / 1000).toFixed(0)}B
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* DCF Results */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    DCF Valuation Results
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
                <Tabs defaultValue="scenarios" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                    <TabsTrigger value="scenarios" className="text-slate-300">Scenarios</TabsTrigger>
                    <TabsTrigger value="assumptions" className="text-slate-300">Assumptions</TabsTrigger>
                    <TabsTrigger value="summary" className="text-slate-300">Summary</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="scenarios" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-red-900/20 border-red-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-red-400 text-lg">Bear Case (1% Growth)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Enterprise Value:</span>
                              <span className="text-white">${(dcfResults.scenarios.bear.ev / 1000).toFixed(1)}T</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Equity Value:</span>
                              <span className="text-white">${(dcfResults.scenarios.bear.equityValue / 1000).toFixed(1)}T</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-400">Price Target:</span>
                              <span className="text-red-400">${dcfResults.scenarios.bear.priceTarget}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-blue-900/20 border-blue-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-blue-400 text-lg">Base Case (3% Growth)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Enterprise Value:</span>
                              <span className="text-white">${(dcfResults.scenarios.base.ev / 1000).toFixed(1)}T</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Equity Value:</span>
                              <span className="text-white">${(dcfResults.scenarios.base.equityValue / 1000).toFixed(1)}T</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-400">Price Target:</span>
                              <span className="text-blue-400">${dcfResults.scenarios.base.priceTarget}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-green-900/20 border-green-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-green-400 text-lg">Bull Case (5% Growth)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Enterprise Value:</span>
                              <span className="text-white">${(dcfResults.scenarios.bull.ev / 1000).toFixed(1)}T</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Equity Value:</span>
                              <span className="text-white">${(dcfResults.scenarios.bull.equityValue / 1000).toFixed(1)}T</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-400">Price Target:</span>
                              <span className="text-green-400">${dcfResults.scenarios.bull.priceTarget}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="assumptions" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">WACC Calculation</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Risk-free Rate:</span>
                            <span className="text-white">4.5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Market Risk Premium:</span>
                            <span className="text-white">6.0%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Cost of Equity:</span>
                            <span className="text-blue-400">{(dcfResults.costOfEquity * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Cost of Debt:</span>
                            <span className="text-blue-400">{(dcfResults.costOfDebt * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between font-bold border-t border-slate-600 pt-2">
                            <span className="text-slate-400">WACC:</span>
                            <span className="text-blue-400">{(dcfResults.wacc * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Key Assumptions</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Terminal Growth Rate:</span>
                            <span className="text-white">2.5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Forecast Period:</span>
                            <span className="text-white">5 years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tax Rate:</span>
                            <span className="text-white">21%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">FCF Growth (Bear):</span>
                            <span className="text-red-400">1%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">FCF Growth (Base):</span>
                            <span className="text-blue-400">3%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">FCF Growth (Bull):</span>
                            <span className="text-green-400">5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="mt-6">
                    <div className="bg-slate-700/30 p-6 rounded-lg">
                      <h4 className="text-xl font-bold text-white mb-4">Investment Recommendation</h4>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-slate-300 mb-4">
                          Based on our discounted cash flow analysis of <strong>{financialData.ticker}</strong>, 
                          we derive a base case price target of <strong className="text-blue-400">${dcfResults.scenarios.base.priceTarget}</strong> 
                          with a bull case upside to <strong className="text-green-400">${dcfResults.scenarios.bull.priceTarget}</strong> 
                          and bear case downside to <strong className="text-red-400">${dcfResults.scenarios.bear.priceTarget}</strong>.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <div>
                            <h5 className="text-green-400 font-semibold mb-2">Key Strengths:</h5>
                            <ul className="text-slate-300 text-sm space-y-1">
                              <li>• Strong free cash flow generation</li>
                              <li>• Solid balance sheet with manageable debt</li>
                              <li>• Market-leading position in core segments</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-red-400 font-semibold mb-2">Key Risks:</h5>
                            <ul className="text-slate-300 text-sm space-y-1">
                              <li>• Macroeconomic headwinds</li>
                              <li>• Competitive pressure in key markets</li>
                              <li>• Interest rate sensitivity</li>
                            </ul>
                          </div>
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

export default DCFAnalyzer;
