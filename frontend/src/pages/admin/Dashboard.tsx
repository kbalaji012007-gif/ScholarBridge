import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, FileText, CheckCircle2, TrendingUp,
  BarChart3, PieChart, Clock, ArrowUpRight, Award
} from 'lucide-react';
import { AnalyticsStats } from '@/types';
import { adminService } from '@/services/admin';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#2563eb', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ label, value, icon: Icon, color, bg, change }: any) => (
  <div className="card">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
        <Icon size={22} className={color} />
      </div>
      {change && (
        <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg">
          <ArrowUpRight size={12} /> {change}
        </span>
      )}
    </div>
    <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{value?.toLocaleString() || 0}</div>
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    </div>
  );

  const appStatusData = stats?.application_status_breakdown
    ? Object.entries(stats.application_status_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  const scholarshipTypeData = [
    { name: 'Government', value: stats?.govt_scholarships || 0 },
    { name: 'Private', value: stats?.private_scholarships || 0 },
  ];

  const docData = [
    { name: 'Pending', value: stats?.pending_documents || 0, fill: '#f59e0b' },
    { name: 'Verified', value: stats?.verified_documents || 0, fill: '#10b981' },
    { name: 'Rejected', value: stats?.rejected_documents || 0, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">Platform overview and analytics</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats?.total_users} icon={Users} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/30" change="+12%" />
        <StatCard label="Scholarships" value={stats?.total_scholarships} icon={GraduationCap} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-950/30" />
        <StatCard label="Applications" value={stats?.total_applications} icon={FileText} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" change="+8%" />
        <StatCard label="Verified Docs" value={stats?.verified_documents} icon={CheckCircle2} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-950/30" />
      </div>

      {/* Sub stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Gov. Scholarships" value={stats?.govt_scholarships} icon={Award} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/30" />
        <StatCard label="Private Scholarships" value={stats?.private_scholarships} icon={Award} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-950/30" />
        <StatCard label="Pending Docs" value={stats?.pending_documents} icon={Clock} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/30" />
        <StatCard label="Rejected Docs" value={stats?.rejected_documents} icon={TrendingUp} color="text-red-600" bg="bg-red-50 dark:bg-red-950/30" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Application Status */}
        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-primary-600" /> Application Status
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={appStatusData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {appStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scholarship Type */}
        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <PieChart size={18} className="text-indigo-600" /> Scholarship Types
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsPie>
              <Pie data={scholarshipTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {scholarshipTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        {/* State-wise users */}
        {stats?.state_wise_users && stats.state_wise_users.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">State-wise Students</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.state_wise_users.slice(0, 8)} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Document status */}
        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Document Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={docData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {docData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular scholarships + recent users */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">🔥 Popular Scholarships</h3>
          <div className="space-y-3">
            {(stats?.popular_scholarships || []).map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{s.title}</p>
                  <p className="text-gray-400 text-xs">{s.provider}</p>
                </div>
                <span className="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/30 px-2 py-1 rounded-lg">
                  {s.applications} apps
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">👥 Recent Students</h3>
          <div className="space-y-3">
            {(stats?.recent_users || []).map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {(u.name?.[0] || u.email[0]).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{u.name || 'Student'}</p>
                  <p className="text-gray-400 text-xs truncate">{u.email}</p>
                </div>
                <span className="text-xs text-gray-400">{u.joined.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
