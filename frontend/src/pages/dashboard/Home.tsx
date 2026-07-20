import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, FileText, BookmarkCheck, Bell, Clock,
  CheckCircle2, XCircle, AlertCircle, ArrowRight, Award,
  Sparkles, ShieldCheck, MapPin, DollarSign, Calendar, Bot
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { scholarshipService } from '@/services/scholarships';
import { applicationService } from '@/services/applications';
import { notificationService } from '@/services/notifications';
import { adminService } from '@/services/admin';
import { Scholarship, Application, Notification } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardHome() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<Scholarship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<{
    eligibleScholarships: number;
    savedScholarships: number;
    appliedScholarships: number;
    deadlinesThisWeek: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Document Checklist status (mock based on user profile completion/uploads)
  const mockDocuments = [
    { name: 'Aadhaar Card', ready: true },
    { name: 'Income Certificate', ready: user?.family_income !== null },
    { name: 'Previous Marks Card', ready: user?.cgpa !== null },
    { name: 'Caste Certificate', ready: user?.category !== 'General' },
    { name: 'Bonafide Certificate', ready: false },
  ];

  const docsReadyCount = mockDocuments.filter(d => d.ready).length;
  const totalDocsCount = mockDocuments.length;

  useEffect(() => {
    Promise.all([
      scholarshipService.list({}, 0, 15),
      applicationService.list(),
      notificationService.list(),
      scholarshipService.getSaved(),
      adminService.getDashboardStats(),
    ]).then(([s, a, n, sv, st]) => {
      setScholarships(s);
      setApplications(a);
      setNotifications(n.slice(0, 3));
      setSavedScholarships(sv);
      setStats(st);
    }).catch(err => {
      console.error(err);
      toast.error('Failed to load dashboard data');
    }).finally(() => setLoading(false));
  }, []);

  const eligibleScholarships = scholarships.filter(s => {
    // Basic filter matching user profile fields
    if (s.eligible_gender && s.eligible_gender !== 'all' && user?.gender && s.eligible_gender.toLowerCase() !== user.gender.toLowerCase()) return false;
    if (s.max_income && user?.family_income && user.family_income > s.max_income) return false;
    if (s.min_cgpa && user?.cgpa && user.cgpa < s.min_cgpa) return false;
    return true;
  });

  const eligibleCount = stats?.eligibleScholarships ?? 0;
  const savedCount = stats?.savedScholarships ?? 0;
  const appliedCount = stats?.appliedScholarships ?? 0;
  const deadlinesThisWeek = stats?.deadlinesThisWeek ?? 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 skeleton h-96 rounded-2xl" />
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const profilePercent = user?.profile_completion ?? 75;

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* ─── Top Stats Grid ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Eligible Scholarships', value: eligibleCount, icon: GraduationCap, color: 'text-primary-400', bg: 'bg-primary-950/40 border-primary-500/20', to: '/dashboard/scholarships?filter=eligible' },
          { label: 'Saved Scholarships', value: savedCount, icon: BookmarkCheck, color: 'text-secondary-400', bg: 'bg-secondary-950/40 border-secondary-500/20', to: '/dashboard/scholarships?filter=saved' },
          { label: 'Applied Scholarships', value: appliedCount, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/20', to: '/dashboard/applications' },
          { label: 'Deadlines This Week', value: deadlinesThisWeek, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/20', to: '/dashboard/scholarships?filter=deadlines' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="w-full"
          >
            <Link
              to={stat.to}
              className={`card border ${stat.bg} block hover:scale-[1.02] hover:border-slate-600 transition-all duration-200 cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black gradient-text" style={{ fontFamily: 'Poppins, sans-serif' }}>{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</div>
                  <span className="text-[10px] text-slate-500 hover:text-slate-300 font-bold block mt-2">View →</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
                  <stat.icon size={18} className={stat.color} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ─── Profile & Document Onboarding Banner ─── */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Profile Completion Stepper */}
        <div className="md:col-span-2 glass-card p-6 border-secondary-500/20 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-secondary-400 font-bold uppercase tracking-wider mb-1">Profile Onboarding</p>
                <h2 className="text-xl font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Welcome back, {user?.full_name?.split(' ')[0] || 'Student'} 👋
                </h2>
              </div>
              <span className="text-sm font-semibold text-secondary-400">{profilePercent}% Completed</span>
            </div>
            
            <p className="text-sm text-slate-400 mb-6 max-w-xl">
              Complete your profile steps so our AI engine can accurately match you with verified state, private, and national scholarships.
            </p>

            {/* Step badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
              {[
                { label: 'State', done: !!user?.state },
                { label: 'Course', done: !!user?.course },
                { label: 'Income', done: user?.family_income !== null },
                { label: 'Category', done: !!user?.category },
                { label: 'Gender', done: !!user?.gender },
              ].map((step, idx) => (
                <div key={step.label} className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold ${
                  step.done ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${step.done ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  {step.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <span className="text-xs text-slate-500">Last updated: Just now</span>
            <Link to="/dashboard/profile" className="btn-primary text-xs px-4 py-2 rounded-xl">
              Complete Profile <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Document Wallet Checklist */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Document Wallet
            </h3>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {docsReadyCount} / {totalDocsCount} Ready
            </span>
          </div>

          <div className="space-y-2">
            {mockDocuments.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/60 text-xs">
                <span className="text-slate-300 font-medium">{doc.name}</span>
                {doc.ready ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 size={12} /> Ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400 font-semibold">
                    <XCircle size={12} /> Missing
                  </span>
                )}
              </div>
            ))}
          </div>

          <Link to="/dashboard/documents" className="btn-secondary w-full text-xs justify-center py-2">
            Manage Documents
          </Link>
        </div>
      </div>

      {/* ─── Bottom Section: Scholarships vs AI Assistant ─── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Match Recommendations List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Your Top Scholarship Matches
            </h3>
            <Link to="/dashboard/scholarships" className="text-xs text-primary-400 hover:underline font-semibold flex items-center gap-1">
              View All Matches <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-4">
            {eligibleScholarships.slice(0, 3).map((scholarship) => {
              // Match logic calculation based on user profile compatibility
              let matchScore = 90;
              const reasons = [];
              if (user?.state && scholarship.applicable_state === user.state) {
                matchScore += 5;
                reasons.push(`✓ Verified Resident of ${user.state}`);
              }
              if (user?.gender && scholarship.eligible_gender === user.gender.toLowerCase()) {
                reasons.push(`✓ Eligible Gender: ${user.gender}`);
              }
              if (user?.course && scholarship.eligible_courses?.some(c => user.course?.toLowerCase().includes(c.toLowerCase()))) {
                reasons.push(`✓ Enrolled in ${user.course}`);
              }
              if (user?.family_income && scholarship.max_income && user.family_income <= scholarship.max_income) {
                reasons.push(`✓ Annual Income fits requirements`);
              }

              return (
                <div key={scholarship.id} className="career-card p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{scholarship.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{scholarship.provider}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="badge bg-secondary-950/70 text-secondary-400 border border-secondary-700/30 font-bold">
                        {matchScore}% Match
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 rounded-xl p-3 border border-slate-800/80 mb-4 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Amount</span>
                      <span className="font-bold text-emerald-400">
                        {scholarship.amount ? `₹${scholarship.amount.toLocaleString('en-IN')}` : 'Full Waiver'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Last Date</span>
                      <span className="font-semibold text-slate-300">
                        {scholarship.last_date ? new Date(scholarship.last_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Type</span>
                      <span className="font-semibold text-slate-300 capitalize">{scholarship.provider_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Status</span>
                      <span className="badge-eligible text-[10px]">Verified</span>
                    </div>
                  </div>

                  {/* Why am I eligible? */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Why am I eligible?</p>
                    <div className="flex flex-wrap gap-2">
                      {reasons.map((r, i) => (
                        <span key={i} className="text-[11px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end border-t border-slate-800/80 pt-3">
                    <Link to={`/dashboard/scholarships/${scholarship.id}`} className="btn-primary text-xs px-4 py-2 rounded-xl">
                      Apply Now <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Quick Assistant widget */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
            AI Assistant
          </h3>
          <div className="ai-card p-5 flex flex-col justify-between h-[360px]">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-600 to-primary-600 flex items-center justify-center shadow-md">
                  <Bot size={15} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">CareerBridge AI</h4>
                  <p className="text-[10px] text-slate-500">Ask about match criteria or career paths</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                "I am a final-year CSE student from Karnataka with ₹2 lakh income. What scholarships can I apply to?"
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="text-[11px] bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-slate-300 leading-relaxed">
                👋 Simply type your query below to get instant personalized matching recommendations and documents guidelines.
              </div>
              <Link to="/dashboard/ai-assistant" className="btn-accent w-full text-xs justify-center py-2.5">
                Start Chatting <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
