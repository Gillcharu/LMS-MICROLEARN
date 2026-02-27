import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LessonsPage from './pages/LessonsPage';
import LessonDetailPage from './pages/LessonDetailPage';
import PathsPage from './pages/PathsPage';
import DashboardPage from './pages/DashboardPage';
import CreatorStudioPage from './pages/CreatorStudioPage';
import HelpPage from './pages/HelpPage';
import StudyGroupsPage from './pages/StudyGroupsPage';
import ParentTrackingPage from './pages/ParentTrackingPage';
import AdminCenterPage from './pages/AdminCenterPage';
import SessionsPage from './pages/SessionsPage';

function routeByRole(role) {
  if (role === 'creator') return '/creator';
  if (role === 'parent') return '/parent-tracking';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}

function RoleAwareHome() {
  const { user, loading } = useAuth();
  if (loading) return <main className="container">Loading...</main>;
  if (!user) return <HomePage />;
  return <Navigate to={routeByRole(user.role)} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<RoleAwareHome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/lessons" element={<ProtectedRoute role="learner"><LessonsPage /></ProtectedRoute>} />
          <Route path="/lessons/:lessonId" element={<ProtectedRoute role="learner"><LessonDetailPage /></ProtectedRoute>} />
          <Route path="/paths" element={<ProtectedRoute role="learner"><PathsPage /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute role="learner"><StudyGroupsPage /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute role="learner"><SessionsPage /></ProtectedRoute>} />
          <Route path="/parent-tracking" element={<ProtectedRoute role="parent"><ParentTrackingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute role="learner"><DashboardPage /></ProtectedRoute>} />
          <Route path="/creator" element={<ProtectedRoute role="creator"><CreatorStudioPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminCenterPage /></ProtectedRoute>} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
