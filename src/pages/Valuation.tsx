
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ComprehensiveValuationAnalyzer from '@/components/ComprehensiveValuationAnalyzer';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

const Valuation = () => {
  const [searchParams] = useSearchParams();
  const [initialTicker, setInitialTicker] = useState<string>('');

  useEffect(() => {
    const ticker = searchParams.get('ticker');
    if (ticker) {
      setInitialTicker(ticker);
    }
  }, [searchParams]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ComprehensiveValuationAnalyzer initialTicker={initialTicker} />
      </div>
    </ProtectedRoute>
  );
};

export default Valuation;
