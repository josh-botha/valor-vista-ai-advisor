
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, TrendingUp, Brain, Target, BarChart3 } from 'lucide-react';

const Index = () => {
  const [ticker, setTicker] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (ticker.trim()) {
      navigate(`/valuation?ticker=${ticker.toUpperCase()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* AI Robot Illustration Area */}
          <div className="absolute top-0 right-0 w-1/3 h-96 opacity-20">
            <div className="w-full h-full bg-gradient-to-l from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-4xl mx-auto text-center">
              {/* Logo and Branding */}
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-4xl font-bold">
                      <span className="text-blue-400">x</span>
                      <span className="text-cyan-400">AI</span>
                    </div>
                    <div className="text-2xl font-light text-gray-300 ml-4">
                      WALL ST
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  <Brain className="inline w-4 h-4 mr-2" />
                  Customize
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  xAi Wall St Analysts
                </h1>
              </div>

              {/* Welcome Message */}
              <div className="mb-12">
                <h2 className="text-xl text-gray-300 mb-4 flex items-center justify-center">
                  Welcome to xAi Wall St Analysts 🎯
                </h2>
                <p className="text-lg text-gray-400 mb-6 max-w-2xl mx-auto">
                  Cut through the noise with instant, AI-powered stock analysis.
                </p>
                <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
                  Our intelligent analyst agents simulate real-world investment decision-making—delivering 
                  consensus-driven, investor-grade equity reports based on real-time market data, valuation 
                  models, and risk insights.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/stock-analyzer')}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium text-lg px-8 py-3"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Live Stock Analyzer
                </Button>
                <Button
                  onClick={() => navigate('/valuation')}
                  variant="outline"
                  className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white font-medium text-lg px-8 py-3"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Valuation Tools
                </Button>
              </div>

              {/* Process Steps */}
              <div className="mb-12">
                <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="flex items-start space-x-3 text-left">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-sm font-bold text-white">
                        📈
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-300">Enter a stock.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 text-left">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-sm font-bold text-white">
                        🧠
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-300">Let our analysts debate.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 text-left">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-sm font-bold text-white">
                        🎯
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-300">Receive your personalised investment-grade recommendation.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div className="mb-12">
                <p className="text-gray-400 text-lg">
                  No bias. No fluff. Just Wall Street logic—at AI speed.
                </p>
              </div>

              {/* Stock Input */}
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <div className="flex items-center text-green-400 mb-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Wall St Stock Ticker or Company Name</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="e.g., AAPL, Tesla, Microsoft..."
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
                      className="w-full h-12 bg-slate-800/80 border-slate-600 text-white placeholder-slate-400 text-center text-lg focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleAnalyze}
                  disabled={!ticker.trim()}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Analyze Stock
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-12 max-w-2xl mx-auto">
                <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">What you'll get:</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Real-time financial analysis
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      DCF & DDM valuations
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Risk assessment
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Investment recommendation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
