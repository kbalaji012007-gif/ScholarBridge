import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, Bookmark, BookmarkCheck, Send,
  CheckCircle2, AlertCircle, XCircle, Award, Calendar,
  Building, IndianRupee, FileText, Globe, Loader2, Users
} from 'lucide-react';
import { Scholarship } from '@/types';
import { scholarshipService } from '@/services/scholarships';
import { applicationService } from '@/services/applications';
import toast from 'react-hot-toast';
import { DOCUMENT_TYPES } from '@/types';

const eligibilityConfig = {
  eligible: { icon: CheckCircle2, label: 'Eligible', className: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' },
  partial: { icon: AlertCircle, label: 'Partially Eligible', className: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' },
  not_eligible: { icon: XCircle, label: 'Not Eligible', className: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' },
};

export default function ScholarshipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    scholarshipService.getById(Number(id))
      .then(setScholarship)
      .catch(() => toast.error('Failed to load scholarship'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!scholarship) return;
    setApplying(true);
    try {
      await applicationService.apply(scholarship.id);
      toast.success('Application submitted! 🎉');
      setScholarship(prev => prev ? { ...prev, application_status: 'submitted' } : prev);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!scholarship) return;
    setSaving(true);
    try {
      const res = await scholarshipService.toggleSave(scholarship.id);
      setScholarship(prev => prev ? { ...prev, is_saved: res.saved } : prev);
      toast.success(res.saved ? 'Saved!' : 'Removed from saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="skeleton h-12 w-48 rounded-xl" />
      <div className="skeleton h-64 rounded-2xl" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    </div>
  );

  if (!scholarship) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Scholarship not found.</p>
      <button onClick={() => navigate(-1)} className="btn-primary mt-4">Go Back</button>
    </div>
  );

  const elig = scholarship.eligibility_status
    ? eligibilityConfig[scholarship.eligibility_status]
    : null;

  const docLabel = (key: string) => DOCUMENT_TYPES.find(d => d.key === key)?.label || key;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to Scholarships
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-glow shrink-0">
              <Award size={28} className="text-white" />
            </div>
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={scholarship.provider_type === 'government' ? 'badge-govt' : 'badge-private'}>
                  {scholarship.provider_type === 'government' ? '🏛 Government' : '🏢 Private'}
                </span>
                {elig && (
                  <span className={`badge border ${elig.className}`}>
                    <elig.icon size={12} /> {elig.label}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{scholarship.title}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{scholarship.provider}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                scholarship.is_saved
                  ? 'bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
                  : 'btn-ghost'
              }`}
            >
              {scholarship.is_saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {scholarship.is_saved ? 'Saved' : 'Save'}
            </button>
            {scholarship.official_website && (
              <a href={scholarship.official_website} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
                <Globe size={16} /> Website
              </a>
            )}
          </div>
        </div>

        {/* Key info chips */}
        <div className="flex flex-wrap gap-3">
          {scholarship.amount && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
              <IndianRupee size={15} /> ₹{scholarship.amount.toLocaleString('en-IN')}
            </div>
          )}
          {scholarship.last_date && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-semibold text-sm">
              <Calendar size={15} /> Deadline: {new Date(scholarship.last_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
          {scholarship.eligible_gender && scholarship.eligible_gender !== 'all' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 font-semibold text-sm">
              <Users size={15} /> {scholarship.eligible_gender} only
            </div>
          )}
        </div>
      </div>

      {/* Eligibility box */}
      {elig && (
        <div className={`p-5 rounded-2xl border ${elig.className}`}>
          <div className="flex items-center gap-2 mb-2">
            <elig.icon size={18} />
            <span className="font-bold">{elig.label}</span>
          </div>
          <ul className="space-y-1.5">
            {(scholarship.eligibility_reasons || []).map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1">•</span> {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Description */}
        <div className="card">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">About This Scholarship</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {scholarship.description || 'No description available.'}
          </p>
        </div>

        {/* Eligibility criteria */}
        <div className="card">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">Eligibility Criteria</h2>
          <div className="space-y-2 text-sm">
            {scholarship.min_cgpa && <div className="flex justify-between"><span className="text-gray-500">Min CGPA</span><span className="font-semibold">{scholarship.min_cgpa}</span></div>}
            {scholarship.max_income && <div className="flex justify-between"><span className="text-gray-500">Max Income</span><span className="font-semibold">₹{scholarship.max_income.toLocaleString('en-IN')}/yr</span></div>}
            {scholarship.eligible_states?.length && <div className="flex justify-between"><span className="text-gray-500">States</span><span className="font-semibold text-right max-w-[60%]">{scholarship.eligible_states.join(', ')}</span></div>}
            {scholarship.eligible_courses?.length && <div className="flex justify-between"><span className="text-gray-500">Courses</span><span className="font-semibold text-right max-w-[60%]">{scholarship.eligible_courses.join(', ')}</span></div>}
            {scholarship.eligible_categories?.length && <div className="flex justify-between"><span className="text-gray-500">Categories</span><span className="font-semibold">{scholarship.eligible_categories.join(', ')}</span></div>}
            {scholarship.eligible_gender && <div className="flex justify-between"><span className="text-gray-500">Gender</span><span className="font-semibold capitalize">{scholarship.eligible_gender}</span></div>}
            {scholarship.minority_only && <div className="text-amber-600 text-xs">• Minority students only</div>}
            {scholarship.disability_only && <div className="text-amber-600 text-xs">• Students with disability only</div>}
          </div>
        </div>

        {/* Required documents */}
        {scholarship.required_documents?.length > 0 && (
          <div className="card">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText size={16} className="text-primary-600" /> Required Documents
            </h2>
            <div className="space-y-2">
              {scholarship.required_documents.map((doc) => {
                const isMissing = scholarship.missing_documents?.includes(doc);
                return (
                  <div key={doc} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${isMissing ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'}`}>
                    {isMissing ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                    {docLabel(doc)}
                    {isMissing && <span className="ml-auto text-xs font-medium">Missing</span>}
                  </div>
                );
              })}
            </div>
            {(scholarship.missing_documents?.length || 0) > 0 && (
              <Link to="/dashboard/documents" className="mt-3 flex items-center gap-1 text-primary-600 text-xs font-semibold hover:underline">
                Upload missing documents →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Apply CTA */}
      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Ready to apply?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {scholarship.application_status
              ? `Application status: ${scholarship.application_status}`
              : 'Submit your application for this scholarship now.'}
          </p>
        </div>
        {scholarship.application_status ? (
          <Link to="/dashboard/applications" className="btn-secondary">
            View Application <ArrowLeft size={16} className="rotate-180" />
          </Link>
        ) : (
          <button
            onClick={handleApply}
            disabled={applying || scholarship.eligibility_status === 'not_eligible'}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {applying ? 'Submitting...' : 'Apply Now'}
          </button>
        )}
      </div>
    </div>
  );
}
