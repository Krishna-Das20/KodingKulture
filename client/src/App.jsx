import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContestTimerProvider } from './context/ContestTimerContext';
import api from './services/authService';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ContestList from './pages/contest/ContestList';
import ContestDetails from './pages/contest/ContestDetails';
import ContestHub from './pages/contest/ContestHub';
import MCQSection from './pages/contest/MCQSection';
import CodingSection from './pages/contest/CodingSection';
import ContestReview from './pages/contest/ContestReview';
import UserDashboard from './pages/dashboard/UserDashboard';
import Leaderboard from './pages/leaderboard/Leaderboard';
import LeaderboardList from './pages/leaderboard/LeaderboardList';
import Certificate from './pages/certificate/Certificate';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateContest from './pages/admin/CreateContest';
import ManageMCQ from './pages/admin/ManageMCQ';
import ManageCodingProblems from './pages/admin/ManageCodingProblems';
import MCQLibrary from './pages/admin/MCQLibrary';
import CodingLibrary from './pages/admin/CodingLibrary';
import ContestViolations from './pages/admin/ContestViolations';
import ContestParticipants from './pages/admin/ContestParticipants';
import Loader from './components/common/Loader';
import ProctorGuard from './components/contest/ProctorGuard';

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

// Contest Wrapper with Timer Provider
const ContestWithTimer = ({ children }) => {
  const { contestId } = useParams();
  return (
    <ContestTimerProvider contestId={contestId}>
      {children}
    </ContestTimerProvider>
  );
};

// Proctored Contest Wrapper (for MCQ and Coding sections)
const ProctoredContest = ({ children }) => {
  const { contestId } = useParams();
  const navigate = useNavigate();

  const handleAutoSubmit = async (reason) => {
    try {
      // Read MCQ answers from localStorage
      const mcqAnswers = JSON.parse(localStorage.getItem(`mcq_answers_${contestId}`) || '{}');
      const formattedAnswers = Object.entries(mcqAnswers).map(([mcqId, selectedOptions]) => ({
        mcqId,
        selectedOptions
      }));

      // Submit answers to backend before navigating
      await api.post(`/contests/${contestId}/submit`, {
        mcqAnswers: formattedAnswers
      });

      // Clear localStorage for this contest
      Object.keys(localStorage).forEach(key => {
        if (key.includes(contestId)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Auto-submit error:', error);
      // Continue navigation even if submit fails (backend already marked as terminated)
    }

    // Navigate to review page
    setTimeout(() => {
      navigate(`/contest/${contestId}/review`);
    }, 2000);
  };

  return (
    <ContestTimerProvider contestId={contestId}>
      <ProctorGuard contestId={contestId} onAutoSubmit={handleAutoSubmit} enabled={true}>
        {children}
      </ProctorGuard>
    </ContestTimerProvider>
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
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/contests" element={<Layout><ContestList /></Layout>} />
          <Route path="/contest/:id" element={<Layout><ContestDetails /></Layout>} />
          <Route path="/leaderboard" element={<Layout><LeaderboardList /></Layout>} />
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
            path="/contest/:contestId/hub"
            element={
              <ProtectedRoute>
                <ContestWithTimer>
                  <ContestHub />
                </ContestWithTimer>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contest/:contestId/mcq"
            element={
              <ProtectedRoute>
                <ProctoredContest>
                  <MCQSection />
                </ProctoredContest>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contest/:contestId/coding"
            element={
              <ProtectedRoute>
                <ProctoredContest>
                  <CodingSection />
                </ProctoredContest>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contest/:contestId/review"
            element={
              <ProtectedRoute>
                <Layout>
                  <ContestReview />
                </Layout>
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

          {/* Library Routes */}
          <Route
            path="/admin/mcq-library"
            element={
              <AdminRoute>
                <Layout><MCQLibrary /></Layout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/coding-library"
            element={
              <AdminRoute>
                <Layout><CodingLibrary /></Layout>
              </AdminRoute>
            }
          />

          {/* Proctoring Violations Route */}
          <Route
            path="/admin/contest/:contestId/violations"
            element={
              <AdminRoute>
                <ContestViolations />
              </AdminRoute>
            }
          />

          {/* Admin Participants Route */}
          <Route
            path="/admin/contest/:contestId/participants"
            element={
              <AdminRoute>
                <ContestParticipants />
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
