import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, FileText, BookmarkCheck, Bell, TrendingUp,
  AlertCircle, ArrowRight, Clock, CheckCircle2, Award, Target,
  Zap, User, FolderOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { scholarshipService } from '@/services/scholarships';
import { applicationService } from '@/services/applications';
import { notificationService } from '@/services/notifications';
import { Scholarship, Application, Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<string, string> = {
  submitted: 'status-submitted',
  verified: 'status-verified',
  approved: 'status-approved',
  rejected: 'status-rejected',
  draft: 'status-draft',
  completed: 'status-completed',
};

export default function DashboardHome() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      scholarshipService.list({}, 0, 6),
      applicationService.list(),
      notificationService.list(),
    ]).then(([s, a, n]) => {
      setScholarships(s);
      setApplications(a);
      setNotifications(n.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const eligibleCount = scholarships.filter(s => s.eligibility_status === 'eligible').length;
  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  const quickActions = [
    { to: '/dashboard/scholarships', icon: GraduationCap, label: 'Find Scholarships', color: 'from-blue-500 to-indigo-600' },
    { to: '/dashboard/documents', icon: FolderOpen, label: 'Upload Documents', color: 'from-emerald-500 to-teal-600' },
    { to: '/dashboard/applications', icon: FileText, label: 'My Applications', color: 'from-amber-500 to-orange-600' },
    { to: '/dashboard/profile', icon: User, label: 'Complete Profile', color: 'from-violet-500 to-purple-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 p-8 text-white"
      >
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
          <p className="text-primary-200 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="text-3xl font-extrabold mb-2">{user?.full_name || user?.email} 👋</h1>
          <p className="text-primary-100 mb-6">
            You have <strong>{eligibleCount}</strong> eligible scholarships waiting for you!
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard/scholarships" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-all text-sm shadow-lg">
              Explore Scholarships <ArrowRight size={16} />
            </Link>
            {user?.profile_completion !== undefined && user.profile_completion < 100 && (
              <Link to="/dashboard/profile" className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/30 transition-all text-sm backdrop-blur-sm">
                Complete Profile ({user.profile_completion}%)
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Eligible', value: eligibleCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Applications', value: applications.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Saved', value: 0, icon: BookmarkCheck, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
          { label: 'Notifications', value: unreadNotifs, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Profile completion alert */}
      {user?.profile_completion !== undefined && user.profile_completion < 80 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
        >
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 dark:text-amber-300">Complete your profile to unlock more scholarships</p>
            <p className="text-amber-700 dark:text-amber-400 text-sm mt-0.5">Your profile is {user.profile_completion}% complete. Add more details to see personalized results.</p>
          </div>
          <Link to="/dashboard/profile" className="text-amber-700 font-semibold text-sm hover:underline whitespace-nowrap">
            Update →
          </Link>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                to={action.to}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all group text-center"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <action.icon size={22} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Applications</h3>
            <Link to="/dashboard/applications" className="text-sm text-primary-600 hover:underline font-medium">
              View All
            </Link>
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No applications yet</p>
              <Link to="/dashboard/scholarships" className="text-primary-600 text-sm hover:underline">Browse Scholarships</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                    <Award size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {app.scholarship?.title || 'Scholarship'}
                    </p>
                    <p className="text-xs text-gray-400">{app.scholarship?.provider}</p>
                  </div>
                  <span className={statusColors[app.status] || 'status-draft'}>{app.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
            <Link to="/dashboard/notifications" className="text-sm text-primary-600 hover:underline font-medium">
              View All
            </Link>
          </div>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Bell size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`flex gap-3 p-3 rounded-xl transition-colors ${n.is_read ? 'bg-gray-50 dark:bg-gray-800/30' : 'bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/30'}`}>
                  <div className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1.5" style={{ opacity: n.is_read ? 0 : 1 }} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming deadlines */}
      {scholarships.filter(s => s.last_date).length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-amber-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scholarships.filter(s => s.last_date).slice(0, 3).map((s) => (
              <Link
                key={s.id}
                to={`/dashboard/scholarships/${s.id}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors"
              >
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{s.title}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    Due: {new Date(s.last_date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
