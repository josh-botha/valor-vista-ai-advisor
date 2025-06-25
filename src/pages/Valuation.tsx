
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ComprehensiveValuationAnalyzer from '@/components/ComprehensiveValuationAnalyzer';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import ErrorBoundary from '@/components/ErrorBoundary';

const Valuation = () => {
  const [searchParams] = useSearchParams();
  const [initialTicker, setInitialTicker] = useState<string>('');

  useEffect(() => {
    try {
      const ticker = searchParams.get('ticker');
      if (ticker) {
        setInitialTicker(ticker);
      }
    } catch (error) {
      console.error('Error reading search params:', error);
    }
  }, [searchParams]);

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <ErrorBoundary>
            <ComprehensiveValuationAnalyzer initialTicker={initialTicker} />
          </ErrorBoundary>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
};

export default Valuation;
