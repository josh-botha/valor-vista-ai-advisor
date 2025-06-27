import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Globe, FileText, Settings, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export interface MarketAssumptions {
  riskFreeRate: number;
  marketReturn: number;
  taxRate: number;
  terminalGrowthRate: number;
  forecastYears: number;
}

export interface DataSourceSelectorProps {
  onDataSourceSelected: (source: 'api' | 'csv' | 'fmp', data: any, assumptions: MarketAssumptions) => void;
  isLoading: boolean;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ onDataSourceSelected, isLoading }) => {
  const [ticker, setTicker] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [assumptions, setAssumptions] = useState<MarketAssumptions>({
    riskFreeRate: 0.04, // 4%
    marketReturn: 0.09, // 9%
    taxRate: 0.21, // 21%
    terminalGrowthRate: 0.025, // 2.5%
    forecastYears: 5
  });

  const handleApiDataFetch = () => {
    if (!ticker.trim()) {
      toast.error('Please enter a valid ticker symbol');
      return;
    }
    onDataSourceSelected('api', { ticker: ticker.toUpperCase() }, assumptions);
  };

  const handleFMPDataFetch = () => {
    if (!ticker.trim()) {
      toast.error('Please enter a valid ticker symbol');
      return;
    }
    onDataSourceSelected('fmp', { ticker: ticker.toUpperCase() }, assumptions);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const csvData = parseCSV(csvText);
        onDataSourceSelected('csv', csvData, assumptions);
        toast.success('CSV data uploaded successfully');
      } catch (error) {
        toast.error('Failed to parse CSV file');
        console.error('CSV parsing error:', error);
      }
    };
    
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data: any = {};
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const key = values[0]?.trim();
      
      if (key) {
        // Parse numeric values
        const numericValues = values.slice(1).map(v => {
          const num = parseFloat(v.trim());
          return isNaN(num) ? 0 : num;
        });
        data[key] = numericValues;
      }
    }
    
    return data;
  };

  const updateAssumption = (key: keyof MarketAssumptions, value: number) => {
    setAssumptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Data Source & Market Assumptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="data-source" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="data-source" className="text-slate-300">Data Source</TabsTrigger>
            <TabsTrigger value="assumptions" className="text-slate-300">Market Assumptions</TabsTrigger>
          </TabsList>

          <TabsContent value="data-source" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Financial Modeling Prep */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">FMP Data</h4>
                  <Badge variant="secondary" className="bg-purple-800 text-purple-100">Premium</Badge>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Enter ticker symbol (e.g., AAPL)"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleFMPDataFetch}
                    disabled={isLoading || !ticker.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? 'Fetching Data...' : 'Fetch FMP Data'}
                  </Button>
                  <p className="text-sm text-slate-400">
                    High-quality financial data from Financial Modeling Prep including detailed financials, ratios, and market data.
                  </p>
                </div>
              </div>

              {/* Alpha Vantage API Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4 text-green-400" />
                  <h4 className="text-lg font-semibold text-white">Alpha Vantage</h4>
                  <Badge variant="secondary" className="bg-green-800 text-green-100">Free</Badge>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Enter ticker symbol (e.g., AAPL)"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleApiDataFetch}
                    disabled={isLoading || !ticker.trim()}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Fetching Data...' : 'Fetch Alpha Vantage'}
                  </Button>
                  <p className="text-sm text-slate-400">
                    Free financial data including basic income statements, cash flows, and market data.
                  </p>
                </div>
              </div>

              {/* CSV Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="h-4 w-4 text-blue-400" />
                  <h4 className="text-lg font-semibold text-white">Upload CSV</h4>
                  <Badge variant="secondary" className="bg-blue-800 text-blue-100">Manual</Badge>
                </div>
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={isLoading}
                    />
                  </div>
                  {csvFile && (
                    <div className="flex items-center gap-2 text-green-400">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{csvFile.name}</span>
                    </div>
                  )}
                  <p className="text-sm text-slate-400">
                    Upload financial data in CSV format. First column should be metric names, subsequent columns should be yearly values.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assumptions" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">Market Parameters</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Risk-free Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={(assumptions.riskFreeRate * 100).toFixed(2)}
                      onChange={(e) => updateAssumption('riskFreeRate', parseFloat(e.target.value) / 100)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Market Return (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={(assumptions.marketReturn * 100).toFixed(2)}
                      onChange={(e) => updateAssumption('marketReturn', parseFloat(e.target.value) / 100)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Corporate Tax Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={(assumptions.taxRate * 100).toFixed(2)}
                      onChange={(e) => updateAssumption('taxRate', parseFloat(e.target.value) / 100)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">Valuation Parameters</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Terminal Growth Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={(assumptions.terminalGrowthRate * 100).toFixed(2)}
                      onChange={(e) => updateAssumption('terminalGrowthRate', parseFloat(e.target.value) / 100)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Forecast Years
                    </label>
                    <Input
                      type="number"
                      min="3"
                      max="10"
                      value={assumptions.forecastYears}
                      onChange={(e) => updateAssumption('forecastYears', parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="bg-slate-700/30 p-3 rounded-lg mt-4">
                    <h5 className="text-slate-300 font-medium mb-2">Current Settings:</h5>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>Equity Risk Premium: {((assumptions.marketReturn - assumptions.riskFreeRate) * 100).toFixed(1)}%</div>
                      <div>Forecast Period: {assumptions.forecastYears} years</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataSourceSelector;
