import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, Bookmark, BookmarkCheck, Send,
  CheckCircle2, AlertCircle, XCircle, Award, Calendar,
  IndianRupee, FileText, Globe, Loader2, Users, MapPin, Sparkles, X
} from 'lucide-react';
import { Scholarship } from '@/types';
import { scholarshipService } from '@/services/scholarships';
import { applicationService } from '@/services/applications';
import toast from 'react-hot-toast';
import { DOCUMENT_TYPES } from '@/types';

const ensureAbsoluteUrl = (url?: string) => {
  if (!url || url === '#') return '#';
  if (/^(https?:\/\/)/i.test(url)) return url;
  return `https://${url}`;
};

export default function ScholarshipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [bypassWarning, setBypassWarning] = useState(false);

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
      toast.success('Application submitted successfully! 🎉');
      setScholarship(prev => prev ? { ...prev, application_status: 'submitted' } : prev);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to submit application');
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
      toast.success(res.saved ? 'Saved to wallet!' : 'Removed from wallet');
    } catch {
      toast.error('Failed to save scholarship');
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
    <div className="text-center py-20 text-slate-400">
      <p>Scholarship not found.</p>
      <button onClick={() => navigate(-1)} className="btn-primary mt-4">Go Back</button>
    </div>
  );

  // Compute match percentage
  const matchScore = scholarship.eligibility_status === 'eligible' ? 95 : scholarship.eligibility_status === 'partial' ? 70 : 35;
  const docLabel = (key: string) => DOCUMENT_TYPES.find(d => d.key === key)?.label || key;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-slate-100">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to Scholarships
      </button>

      {/* ─── Header Card ─── */}
      <div className="card border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="flex flex-wrap gap-4 items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-glow-violet shrink-0">
              <Award size={24} className="text-white" />
            </div>
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`badge ${scholarship.provider_type === 'government' ? 'badge-govt' : 'badge-private'}`}>
                  {scholarship.provider_type === 'government' ? '🏛 Government' : '🏢 Private'}
                </span>
                <span className={`badge border capitalize ${
                  scholarship.eligibility_status === 'eligible' ? 'badge-eligible' :
                  scholarship.eligibility_status === 'partial' ? 'badge-partial' : 'badge-not-eligible'
                }`}>
                  {scholarship.eligibility_status === 'eligible' ? 'Eligible' : scholarship.eligibility_status === 'partial' ? 'Partially Eligible' : 'Not Eligible'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {scholarship.title}
              </h1>
              <p className="text-sm text-slate-400 mt-1">{scholarship.provider}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                scholarship.is_saved
                  ? 'bg-secondary-950/60 text-secondary-400 border-secondary-500/30'
                  : 'btn-ghost'
              }`}
            >
              {scholarship.is_saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {scholarship.is_saved ? 'Saved' : 'Save'}
            </button>
            {scholarship.official_website && (
              <a href={scholarship.official_website} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-4 py-2">
                <Globe size={14} /> Website
              </a>
            )}
          </div>
        </div>

        {/* Quick summary grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/40 rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/50 flex items-center justify-center border border-emerald-500/20">
              <IndianRupee size={15} className="text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Amount</span>
              <span className="font-extrabold text-sm text-emerald-400">
                {scholarship.amount ? `₹${scholarship.amount.toLocaleString('en-IN')}` : 'Full Waiver'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/50 flex items-center justify-center border border-amber-500/20">
              <Calendar size={15} className="text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Deadline</span>
              <span className="font-semibold text-sm text-slate-300">
                {scholarship.last_date ? new Date(scholarship.last_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-950/50 flex items-center justify-center border border-primary-500/20">
              <Users size={15} className="text-primary-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Gender</span>
              <span className="font-semibold text-sm text-slate-300 capitalize">{scholarship.eligible_gender || 'All'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary-950/50 flex items-center justify-center border border-secondary-500/20">
              <MapPin size={15} className="text-secondary-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">State</span>
              <span className="font-semibold text-sm text-slate-300">{scholarship.applicable_state || 'All India'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Match Reasons Box ─── */}
      <div className="card border border-secondary-500/20 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col sm:flex-row items-center gap-6 p-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary-600 to-primary-600 flex flex-col items-center justify-center shadow-lg shrink-0">
          <span className="text-2xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{matchScore}%</span>
          <span className="text-white/70 text-[10px] font-bold uppercase">Match</span>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold text-slate-100 mb-2 flex items-center justify-center sm:justify-start gap-1.5">
            <Sparkles size={16} className="text-secondary-400" /> Why am I eligible?
          </h3>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {(scholarship.eligibility_reasons || ['Meets course eligibility', 'Income within limit', 'Merit score checks']).map((r, i) => (
              <span key={i} className="text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                ✓ {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Detail Content Grid ─── */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column: Overview & Eligibility */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Overview */}
          <div className="card space-y-3">
            <h3 className="font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Scholarship Overview
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {scholarship.description || 'No description available for this scholarship.'}
            </p>
          </div>

          {/* Detailed Eligibility criteria */}
          <div className="card space-y-4">
            <h3 className="font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Eligibility Criteria
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Minimum CGPA', val: scholarship.min_cgpa ?? 'No limit' },
                { label: 'Maximum Income', val: scholarship.max_income ? `₹${scholarship.max_income.toLocaleString('en-IN')}/year` : 'No limit' },
                { label: 'Category Selection', val: scholarship.eligible_categories?.join(', ') || 'All categories' },
                { label: 'Courses Covered', val: scholarship.eligible_courses?.join(', ') || 'All courses' },
                { label: 'Branches Covered', val: scholarship.eligible_branches?.join(', ') || 'All branches' },
                { label: 'State Restriction', val: scholarship.applicable_state || 'All India' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                  <span className="text-xs text-slate-500 block mb-0.5">{item.label}</span>
                  <span className="font-semibold text-slate-200">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Required Documents & Timelines */}
        <div className="space-y-6">
          
          {/* Required Documents Checklist */}
          {scholarship.required_documents && (
            <div className="card space-y-4">
              <h3 className="font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Required Documents
              </h3>
              <div className="space-y-2">
                {scholarship.required_documents.map((doc) => {
                  const isMissing = scholarship.missing_documents?.includes(doc);
                  return (
                    <div key={doc} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
                      isMissing
                        ? 'bg-red-950/40 text-red-400 border-red-500/20'
                        : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {isMissing ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                      <span className="truncate">{docLabel(doc)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline and Details */}
          <div className="card space-y-3">
            <h3 className="font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Application Timeline
            </h3>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Start Date</span>
                <span className="text-slate-200 font-semibold">Open Now</span>
              </div>
              <div className="flex justify-between">
                <span>Last Date</span>
                <span className="text-slate-200 font-semibold">
                  {scholarship.last_date ? new Date(scholarship.last_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="badge-eligible">Active</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Bottom CTA apply box ─── */}
      <div className="card border border-slate-800 bg-slate-900/60 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>Ready to apply?</h3>
          <p className="text-xs text-slate-400 mt-1">
            {scholarship.application_status
              ? `Your application status: ${scholarship.application_status}`
              : 'Apply directly through our portal in one click.'}
          </p>
        </div>
        <div>
          {scholarship.application_status ? (
            <Link to="/dashboard/applications" className="btn-secondary text-xs">
              View Status
            </Link>
          ) : (
            <button
              onClick={() => { setShowApplyModal(true); setModalStep(1); }}
              disabled={applying || scholarship.eligibility_status === 'not_eligible'}
              className="btn-primary text-xs px-6 py-2.5"
            >
              {applying ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              {applying ? 'Submitting...' : 'Apply Now'}
            </button>
          )}
        </div>
      </div>

      {/* ─── Apply Checklist & Confirmation Modal ─── */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowApplyModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Step 1: Document Checklist */}
              {modalStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Application Checklist
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Check your required documents before continuing to the official scholarship portal.
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-2xl">
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                      <span className="text-slate-400">Document Readiness</span>
                      <span className="text-emerald-400">
                        {scholarship.required_documents?.length ? (
                          `${(scholarship.required_documents.length - (scholarship.missing_documents?.length || 0))} / ${scholarship.required_documents.length} Ready`
                        ) : (
                          'No Documents Required'
                        )}
                      </span>
                    </div>
                    {scholarship.required_documents?.length > 0 && (
                      <div className="progress-bar">
                        <div
                          className="progress-fill bg-emerald-500"
                          style={{
                            width: `${((scholarship.required_documents.length - (scholarship.missing_documents?.length || 0)) / scholarship.required_documents.length) * 100}%`
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Document list */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {scholarship.required_documents?.map((doc) => {
                      const isMissing = scholarship.missing_documents?.includes(doc);
                      return (
                        <div key={doc} className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                          isMissing ? 'bg-red-950/30 border-red-900/30 text-slate-400' : 'bg-emerald-950/20 border-emerald-900/30 text-slate-200'
                        }`}>
                          <span className="font-medium">{docLabel(doc)}</span>
                          {isMissing ? (
                            <span className="flex items-center gap-1 text-red-400 font-bold">
                              <XCircle size={12} /> Missing
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 size={12} /> Ready
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Warning message if documents missing */}
                  {(scholarship.missing_documents?.length || 0) > 0 && (
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-950/30 border border-amber-800/30 text-amber-400 text-xs">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Missing Documents Warning</p>
                        <p className="text-slate-400 mt-0.5">
                          We recommend uploading missing files first to ensure your eligibility stands.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bypass checklist option */}
                  {(scholarship.missing_documents?.length || 0) > 0 && (
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={bypassWarning}
                        onChange={(e) => setBypassWarning(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-secondary-500 focus:ring-0"
                      />
                      I have these documents ready and will upload them later
                    </label>
                  )}

                  {/* Footer actions */}
                  <div className="flex gap-3 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => setShowApplyModal(false)}
                      className="btn-ghost flex-1 justify-center text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        window.open(ensureAbsoluteUrl(scholarship.application_link || scholarship.official_website), '_blank');
                        setModalStep(2);
                      }}
                      disabled={
                        (scholarship.required_documents?.length || 0) > 0 &&
                        (scholarship.missing_documents?.length || 0) > 0 &&
                        !bypassWarning
                      }
                      className="btn-primary flex-1 justify-center text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Continue to Official Portal
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Confirmation */}
              {modalStep === 2 && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-secondary-950/60 border-2 border-secondary-500/30 flex items-center justify-center mx-auto text-secondary-400 animate-pulse mb-2">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Official Portal Opened
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Fill out the form on the official website. Once completed, confirm the submission below.
                    </p>
                  </div>

                  <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl text-left space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Submission Status</h4>
                    <p className="text-xs text-slate-300">
                      Confirming will mark this scholarship application status as <span className="text-emerald-400 font-bold">Submitted</span> in your tracking history.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowApplyModal(false)}
                      className="btn-secondary flex-1 justify-center text-xs"
                    >
                      Not Yet / Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleApply();
                        setShowApplyModal(false);
                      }}
                      className="btn-primary flex-1 justify-center text-xs bg-emerald-600 hover:bg-emerald-500"
                    >
                      Yes, I Submitted!
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
