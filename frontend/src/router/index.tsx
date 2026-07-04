import React from 'react';
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

// Student dashboard pages
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading ScholarBridge...</p>
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
