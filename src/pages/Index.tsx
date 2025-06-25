
import DCFAnalyzer from '@/components/DCFAnalyzer';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto py-8">
          <DCFAnalyzer />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
