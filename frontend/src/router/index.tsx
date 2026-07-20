import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Public pages
import Landing from '@/pages/Landing';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import NotFound from '@/pages/NotFound';

// Student dashboard — existing pages
import DashboardHome from '@/pages/dashboard/Home';
import Profile from '@/pages/dashboard/Profile';
import Scholarships from '@/pages/dashboard/Scholarships';
import ScholarshipDetail from '@/pages/dashboard/ScholarshipDetail';
import Applications from '@/pages/dashboard/Applications';
import Documents from '@/pages/dashboard/Documents';
import Notifications from '@/pages/dashboard/Notifications';
import SavedScholarships from '@/pages/dashboard/SavedScholarships';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminScholarships from '@/pages/admin/Scholarships';
import AdminDocuments from '@/pages/admin/Documents';
import AddEditScholarship from '@/pages/admin/AddEditScholarship';

// New career module pages — lazy loaded for performance
const ResumeAnalyzer = lazy(() => import('@/pages/dashboard/ResumeAnalyzer'));
const CareerMatch = lazy(() => import('@/pages/dashboard/CareerMatch'));
const SkillGap = lazy(() => import('@/pages/dashboard/SkillGap'));
const LearningRoadmap = lazy(() => import('@/pages/dashboard/LearningRoadmap'));
const InterviewPrep = lazy(() => import('@/pages/dashboard/InterviewPrep'));
const Projects = lazy(() => import('@/pages/dashboard/Projects'));
const Certifications = lazy(() => import('@/pages/dashboard/Certifications'));
const AIAssistant = lazy(() => import('@/pages/dashboard/AIAssistant'));
const Analytics = lazy(() => import('@/pages/dashboard/Analytics'));

// Suspense fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading module...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Loading CareerBridge AI...</p>
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      {/* Auth routes */}
      <Route path="/auth">
        <Route path="login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Student dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="scholarships" element={<Scholarships />} />
        <Route path="scholarships/:id" element={<ScholarshipDetail />} />
        <Route path="scholarships/saved" element={<SavedScholarships />} />
        <Route path="applications" element={<Applications />} />
        <Route path="documents" element={<Documents />} />
        <Route path="notifications" element={<Notifications />} />

        {/* ─── NEW CAREER MODULES ─── */}
        <Route path="resume" element={<Suspense fallback={<PageLoader />}><ResumeAnalyzer /></Suspense>} />
        <Route path="career" element={<Suspense fallback={<PageLoader />}><CareerMatch /></Suspense>} />
        <Route path="skills" element={<Suspense fallback={<PageLoader />}><SkillGap /></Suspense>} />
        <Route path="roadmap" element={<Suspense fallback={<PageLoader />}><LearningRoadmap /></Suspense>} />
        <Route path="interview" element={<Suspense fallback={<PageLoader />}><InterviewPrep /></Suspense>} />
        <Route path="projects" element={<Suspense fallback={<PageLoader />}><Projects /></Suspense>} />
        <Route path="certifications" element={<Suspense fallback={<PageLoader />}><Certifications /></Suspense>} />
        <Route path="ai-assistant" element={<Suspense fallback={<PageLoader />}><AIAssistant /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="scholarships" element={<AdminScholarships />} />
        <Route path="scholarships/new" element={<AddEditScholarship />} />
        <Route path="scholarships/:id/edit" element={<AddEditScholarship />} />
        <Route path="documents" element={<AdminDocuments />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
