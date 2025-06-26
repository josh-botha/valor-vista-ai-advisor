
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Brain, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  timestamp: string;
}

interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

const LiveStockVisualizer = () => {
  const [ticker, setTicker] = useState('AAPL');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();

  // Generate realistic mock stock data
  const generateMockStockData = (symbol: string): StockData => {
    const basePrice = Math.random() * 300 + 50;
    const change = (Math.random() - 0.5) * 10;
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
      peRatio: parseFloat((Math.random() * 50 + 5).toFixed(2)),
      dayHigh: parseFloat((basePrice + Math.random() * 5).toFixed(2)),
      dayLow: parseFloat((basePrice - Math.random() * 5).toFixed(2)),
      yearHigh: parseFloat((basePrice + Math.random() * 50).toFixed(2)),
      yearLow: parseFloat((basePrice - Math.random() * 30).toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  };

  const generateChartData = (currentPrice: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    let price = currentPrice;
    
    for (let i = 30; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60000).toLocaleTimeString();
      price = price + (Math.random() - 0.5) * 2;
      data.push({
        time,
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000),
      });
    }
    
    return data;
  };

  const fetchStockData = async () => {
    if (!ticker.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = generateMockStockData(ticker);
      setStockData(data);
      setChartData(generateChartData(data.price));
      
      toast({
        title: "Stock Data Updated",
        description: `${ticker.toUpperCase()} data refreshed successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch stock data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeStock = async () => {
    if (!stockData) {
      toast({
        title: "No Data",
        description: "Please fetch stock data first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('stock-analysis', {
        body: {
          ticker: stockData.symbol,
          stockData: {
            currentPrice: stockData.price,
            marketCap: stockData.marketCap,
            volume: stockData.volume,
            dayHigh: stockData.dayHigh,
            dayLow: stockData.dayLow,
            yearHigh: stockData.yearHigh,
            yearLow: stockData.yearLow,
            peRatio: stockData.peRatio,
            priceChange: stockData.change,
            changePercent: stockData.changePercent,
          },
          analysisType: 'comprehensive'
        }
      });

      if (error) throw error;
      
      setAiAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI analysis generated successfully",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to generate analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchStockData, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, ticker]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Live Stock Visualizer & AI Analyst</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="w-4 h-4 mr-2" />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* Stock Input and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Enter stock ticker (e.g., AAPL, GOOGL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="max-w-xs"
            />
            <Button onClick={fetchStockData} disabled={isLoading}>
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              Fetch Data
            </Button>
            <Button onClick={analyzeStock} disabled={isAnalyzing || !stockData} variant="secondary">
              {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
              AI Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {stockData && (
        <>
          {/* Stock Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{stockData.symbol}</span>
                <Badge variant={stockData.change >= 0 ? "default" : "destructive"}>
                  {stockData.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {stockData.changePercent.toFixed(2)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold">{formatCurrency(stockData.price)}</p>
                  <p className={`text-sm ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stockData.change >= 0 ? '+' : ''}{formatCurrency(stockData.change)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-xl font-semibold">{formatNumber(stockData.marketCap)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volume</p>
                  <p className="text-xl font-semibold">{formatNumber(stockData.volume)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">P/E Ratio</p>
                  <p className="text-xl font-semibold">{stockData.peRatio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts and Analysis */}
          <Tabs defaultValue="price" className="space-y-4">
            <TabsList>
              <TabsTrigger value="price">Price Chart</TabsTrigger>
              <TabsTrigger value="volume">Volume Chart</TabsTrigger>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="price">
              <Card>
                <CardHeader>
                  <CardTitle>Price Movement (Last 30 Minutes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Price']} />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="volume">
              <Card>
                <CardHeader>
                  <CardTitle>Trading Volume (Last 30 Minutes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Volume']} />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#10b981" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI-Powered Stock Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aiAnalysis ? (
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {aiAnalysis}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Click "AI Analysis" to generate comprehensive stock analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Day High</p>
                  <p className="text-lg font-semibold">{formatCurrency(stockData.dayHigh)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Day Low</p>
                  <p className="text-lg font-semibold">{formatCurrency(stockData.dayLow)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">52W High</p>
                  <p className="text-lg font-semibold">{formatCurrency(stockData.yearHigh)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">52W Low</p>
                  <p className="text-lg font-semibold">{formatCurrency(stockData.yearLow)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default LiveStockVisualizer;
