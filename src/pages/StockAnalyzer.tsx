
import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import LiveStockVisualizer from '@/components/LiveStockVisualizer';
import ErrorBoundary from '@/components/ErrorBoundary';

const StockAnalyzer = () => {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <ErrorBoundary>
            <LiveStockVisualizer />
          </ErrorBoundary>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
};

export default StockAnalyzer;
