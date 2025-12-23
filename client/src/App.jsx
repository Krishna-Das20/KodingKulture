import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ContestList from './pages/contest/ContestList';
import ContestDetails from './pages/contest/ContestDetails';
import MCQSection from './pages/contest/MCQSection';
import CodingSection from './pages/contest/CodingSection';
import UserDashboard from './pages/dashboard/UserDashboard';
import Leaderboard from './pages/leaderboard/Leaderboard';
import Certificate from './pages/certificate/Certificate';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateContest from './pages/admin/CreateContest';
import ManageMCQ from './pages/admin/ManageMCQ';
import ManageCodingProblems from './pages/admin/ManageCodingProblems';
import Loader from './components/common/Loader';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Scroll to Top Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#FF6B35',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contests" element={<Layout><ContestList /></Layout>} />
          <Route path="/contest/:id" element={<Layout><ContestDetails /></Layout>} />
          <Route path="/leaderboard/:contestId" element={<Layout><Leaderboard /></Layout>} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><UserDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Contest Section Routes */}
          <Route
            path="/contest/:contestId/mcq"
            element={
              <ProtectedRoute>
                <MCQSection />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/contest/:contestId/coding"
            element={
              <ProtectedRoute>
                <CodingSection />
              </ProtectedRoute>
            }
          />

          {/* Certificate Route */}
          <Route
            path="/certificate/:resultId"
            element={
              <ProtectedRoute>
                <Layout><Certificate /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Layout><AdminDashboard /></Layout>
              </AdminRoute>
            }
          />
          
          <Route
            path="/admin/contest/create"
            element={
              <AdminRoute>
                <Layout><CreateContest /></Layout>
              </AdminRoute>
            }
          />
          
          <Route
            path="/admin/contest/edit/:contestId"
            element={
              <AdminRoute>
                <Layout><CreateContest /></Layout>
              </AdminRoute>
            }
          />
          
          <Route
            path="/admin/contest/mcq/:contestId"
            element={
              <AdminRoute>
                <Layout><ManageMCQ /></Layout>
              </AdminRoute>
            }
          />
          
          <Route
            path="/admin/contest/coding/:contestId"
            element={
              <AdminRoute>
                <Layout><ManageCodingProblems /></Layout>
              </AdminRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
