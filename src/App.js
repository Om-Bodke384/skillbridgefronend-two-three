import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchMe, setInitialized } from './store/slices/authSlice';

import MainLayout  from './components/layout/MainLayout';
import AuthLayout  from './components/layout/AuthLayout';

import LandingPage            from './pages/LandingPage';
import LoginPage              from './pages/auth/LoginPage';
import RegisterPage           from './pages/auth/RegisterPage';
import ForgotPasswordPage     from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage      from './pages/auth/ResetPasswordPage';
import VerifyEmailPage        from './pages/auth/VerifyEmailPage';
import DashboardPage          from './pages/DashboardPage';
import CommunitiesPage        from './pages/community/CommunitiesPage';
import CommunityDetailPage    from './pages/community/CommunityDetailPage';
import ChatPage               from './pages/chat/ChatPage';
import TownhallPage           from './pages/townhall/TownhallPage';
import TownhallDetailPage     from './pages/townhall/TownhallDetailPage';
import HackathonPage          from './pages/hackathon/HackathonPage';
import HackathonDetailPage    from './pages/hackathon/HackathonDetailPage';
import EventsPage             from './pages/events/EventsPage';
import EventDetailPage        from './pages/events/EventDetailPage';
import AnnouncementsPage      from './pages/announcements/AnnouncementsPage';
import LearningPage           from './pages/learning/LearningPage';
import LearningPlanDetailPage from './pages/learning/LearningPlanDetailPage';
import PeerReviewPage         from './pages/peer-review/PeerReviewPage';
import PeerReviewDetailPage   from './pages/peer-review/PeerReviewDetailPage';
import PeerMentorshipPage     from './pages/peer-mentorship/PeerMentorshipPage';
import ProfilePage            from './pages/ProfilePage';
import AdminDashboard         from './pages/admin/AdminDashboard';
import NotFoundPage           from './pages/NotFoundPage';
import LoadingSpinner         from './components/ui/LoadingSpinner';
import LivePage     from './pages/live/LivePage';
import LiveRoomPage from './pages/live/LiveRoomPage';
// ─── Route Guards ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isInitialized, user } = useSelector((s) => s.auth);
  // if (!isInitialized) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isInitialized, justRegistered } = useSelector((s) => s.auth);
  // if (!isInitialized) return <LoadingSpinner fullScreen />;
  if (justRegistered) return children;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      // ✅ KEY FIX: Set a 5 second safety timeout
      // If backend doesn't respond in 5s, clear token and show login page
      // This stops the app from being stuck on spinner forever
      const timeoutId = setTimeout(() => {
        dispatch(setInitialized());
        localStorage.removeItem('accessToken');
      }, 5000);

      // Try to verify token with backend
      dispatch(fetchMe()).finally(() => {
        clearTimeout(timeoutId); // backend responded — cancel the timeout
      });
    } else {
      // No token — immediately show the app (no spinner)
      dispatch(setInitialized());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e2a',
            color:      '#f1f1f5',
            border:     '1px solid #2e2e42',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Always accessible */}
        <Route path="/"                      element={<LandingPage />} />
        <Route path="/verify-email/:token"   element={<VerifyEmailPage />} />

        {/* Auth pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login"               element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register"            element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password"     element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        </Route>

        {/* Protected pages */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard"           element={<DashboardPage />} />
          <Route path="/communities"         element={<CommunitiesPage />} />
          <Route path="/communities/:id"     element={<CommunityDetailPage />} />
          <Route path="/chat"                element={<ChatPage />} />
          <Route path="/townhalls"           element={<TownhallPage />} />
          <Route path="/townhalls/:id"       element={<TownhallDetailPage />} />
          <Route path="/hackathons"          element={<HackathonPage />} />
          <Route path="/hackathons/:id"      element={<HackathonDetailPage />} />
          <Route path="/events"              element={<EventsPage />} />
          <Route path="/events/:id"          element={<EventDetailPage />} />
          <Route path="/announcements"       element={<AnnouncementsPage />} />
          <Route path="/learning"            element={<LearningPage />} />
          <Route path="/learning/:id"        element={<LearningPlanDetailPage />} />
          <Route path="/peer-review"         element={<PeerReviewPage />} />
          <Route path="/peer-review/:id"     element={<PeerReviewDetailPage />} />
          <Route path="/peer-mentorship"     element={<PeerMentorshipPage />} />
          <Route path="/profile/:id"         element={<ProfilePage />} />
          <Route path="/live"     element={<LivePage />} />
<Route path="/live/:id" element={<LiveRoomPage />} />
          <Route path="/admin"               element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
