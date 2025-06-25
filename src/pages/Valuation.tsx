
import ComprehensiveValuationAnalyzer from '@/components/ComprehensiveValuationAnalyzer';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

const Valuation = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ComprehensiveValuationAnalyzer />
      </div>
    </ProtectedRoute>
  );
};

export default Valuation;
