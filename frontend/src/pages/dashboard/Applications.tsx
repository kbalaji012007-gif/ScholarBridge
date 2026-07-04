import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, Trash2, ChevronRight, Award, Calendar } from 'lucide-react';
import { Application } from '@/types';
import { applicationService } from '@/services/applications';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const STATUS_STEPS = ['submitted', 'verified', 'approved', 'completed'];

const statusIcons: Record<string, React.ElementType> = {
  submitted: Clock,
  verified: AlertCircle,
  approved: CheckCircle2,
  rejected: XCircle,
  completed: CheckCircle2,
  draft: FileText,
};

const statusColors: Record<string, string> = {
  submitted: 'status-submitted',
  verified: 'status-verified',
  approved: 'status-approved',
  rejected: 'status-rejected',
  draft: 'status-draft',
  completed: 'status-completed',
};

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    applicationService.list()
      .then(setApplications)
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (id: number) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await applicationService.withdraw(id);
      setApplications(prev => prev.filter(a => a.id !== id));
      toast.success('Application withdrawn');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to withdraw');
    }
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">My Applications</h1>
        <p className="section-subtitle">Track the status of all your scholarship applications.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'submitted', 'verified', 'approved', 'rejected', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab
                ? 'bg-primary-600 text-white shadow-glow'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'all' && (
              <span className="ml-2 text-xs opacity-70">
                ({applications.filter(a => a.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-bold text-gray-600 dark:text-gray-400 mb-2">No applications found</h3>
          <p className="text-gray-400 text-sm mb-6">Start applying for scholarships to track them here.</p>
          <Link to="/dashboard/scholarships" className="btn-primary">Browse Scholarships</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app, i) => {
            const StatusIcon = statusIcons[app.status] || FileText;
            const stepIdx = STATUS_STEPS.indexOf(app.status);
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <Award size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                          {app.scholarship?.title || 'Scholarship'}
                        </h3>
                        <p className="text-gray-400 text-sm">{app.scholarship?.provider}</p>
                      </div>
                      <span className={statusColors[app.status] || 'status-draft'}>
                        <StatusIcon size={12} /> {app.status}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {stepIdx >= 0 && app.status !== 'rejected' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                          {STATUS_STEPS.map((step) => (
                            <span key={step} className={STATUS_STEPS.indexOf(step) <= stepIdx ? 'text-primary-600 font-semibold' : ''}>{step}</span>
                          ))}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-indigo-500 h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${((stepIdx + 1) / STATUS_STEPS.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      {app.scholarship?.amount && (
                        <span className="text-emerald-600 font-semibold">₹{app.scholarship.amount.toLocaleString('en-IN')}</span>
                      )}
                      {app.submitted_at && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Applied {formatDistanceToNow(new Date(app.submitted_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    {app.admin_remarks && (
                      <div className={`mt-3 p-3 rounded-xl text-xs ${app.status === 'rejected' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'}`}>
                        <strong>Admin Note:</strong> {app.admin_remarks}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      to={`/dashboard/scholarships/${app.scholarship_id}`}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </Link>
                    {['draft', 'submitted'].includes(app.status) && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
