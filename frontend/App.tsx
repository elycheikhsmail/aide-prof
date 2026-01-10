import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EvaluationsProvider } from './contexts/EvaluationsContext';
import { ClassesProvider } from './contexts/ClassesContext';
import { MainLayout } from './components/layout';
import { ProfessorDashboard } from './pages/professor/Dashboard';
import { Evaluations } from './pages/professor/Evaluations';
import { CreateEvaluation } from './pages/professor/CreateEvaluation';
import { Classes } from './pages/professor/Classes';
import { Statistics } from './pages/professor/Statistics';
import { Settings } from './pages/professor/Settings';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

function ProtectedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigate = (page: string) => {
    navigate(`/${page === 'dashboard' ? '' : page}`);
  };

  // Determine active page from current route
  const getActivePage = () => {
    const path = location.pathname.slice(1); // Remove leading slash
    return path || 'dashboard';
  };

  return (
    <MainLayout
      userName={user?.name || 'Utilisateur'}
      activePage={getActivePage()}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={<ProfessorDashboard />} />
        <Route path="/evaluations" element={<Evaluations />} />
        <Route path="/evaluations/create" element={<CreateEvaluation />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MainLayout>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EvaluationsProvider>
          <ClassesProvider>
            <AppContent />
          </ClassesProvider>
        </EvaluationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
