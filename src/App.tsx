import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Experts } from './pages/Experts';
import { Settings } from './pages/Settings';
import { TenantManagement } from './pages/TenantManagement';
import { useState, useEffect } from 'react';
import { ExpertMode } from './types';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedExpert, setSelectedExpert] = useState<ExpertMode | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleSelectExpert = (expert: ExpertMode | null) => {
    setSelectedExpert(expert);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } 
        />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {currentPage === 'dashboard' && (
                <Dashboard onNavigate={handleNavigate} />
              )}
              {currentPage === 'experts' && (
                <Experts onNavigate={handleNavigate} onSelectExpert={handleSelectExpert} />
              )}
              {currentPage === 'settings' && (
                <Settings onNavigate={handleNavigate} />
              )}
              {currentPage === 'tenant' && (
                <TenantManagement onNavigate={handleNavigate} />
              )}
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
