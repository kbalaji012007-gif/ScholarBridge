import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Award, FileText, Target, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Analytics() {
  const { user } = useAuth();
  const stats = [
    { label: 'Applications Submitted', value: '0', icon: FileText, color: 'from-primary-600 to-indigo-600' },
    { label: 'Scholarships Eligible', value: '0', icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
    { label: 'Resume ATS Score', value: '—', icon: Target, color: 'from-secondary-500 to-purple-600' },
    { label: 'Mock Interviews Done', value: '0', icon: Award, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center">
          <BarChart3 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="section-title">Analytics Dashboard</h1>
          <p className="section-subtitle text-sm">Track your progress across all modules</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
              <s.icon size={20} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-100 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.value}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card text-center py-12">
        <TrendingUp size={40} className="text-slate-600 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-300 mb-2">Analytics Coming Soon</h3>
        <p className="text-slate-500 text-sm">Start using the platform to see detailed progress charts and insights here.</p>
      </div>
    </div>
  );
}
