import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Brain, CheckCircle2, XCircle, AlertCircle,
  FileText, Target, TrendingUp, Zap, ChevronRight,
  Star, Award, Code2, Briefcase, GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeService } from '@/services/resume';

// ─── ATS Score Ring ────────────────────────────────────────────────────
function ATSRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Poor';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={radius} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <div className={`badge text-sm font-semibold ${score >= 80 ? 'badge-eligible' : score >= 60 ? 'badge-partial' : 'badge-not-eligible'}`}>
        {grade}
      </div>
      <p className="text-xs text-slate-500">ATS Score</p>
    </div>
  );
}

// ─── Upload Zone ────────────────────────────────────────────────────────
function UploadZone({ onUpload }: { onUpload: (file: File, role?: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file, targetRole || undefined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file, targetRole || undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={targetRole}
          onChange={e => setTargetRole(e.target.value)}
          placeholder="Target role (optional) — e.g., Data Analyst, Full Stack Developer"
          className="input-field flex-1"
        />
      </div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-secondary-500 bg-secondary-950/30'
            : 'border-slate-700 hover:border-secondary-600 hover:bg-slate-900/50'
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={handleChange} />
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary-600/20 to-primary-600/20 flex items-center justify-center">
          <Upload size={28} className="text-secondary-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Drop your resume here</h3>
        <p className="text-slate-400 text-sm">PDF, DOCX, or TXT • Max 10MB</p>
        <button className="mt-4 btn-secondary text-sm">Browse Files</button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────
export default function ResumeAnalyzer() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'suggestions'>('overview');

  const handleUpload = async (file: File, targetRole?: string) => {
    setLoading(true);
    try {
      const result = await resumeService.upload(file, targetRole);
      setAnalysis(result);
      toast.success('Resume analyzed successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-600 to-purple-600 flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="section-title">Resume Analyzer</h1>
            <p className="section-subtitle text-sm">AI-powered ATS score, skill extraction, and improvement suggestions</p>
          </div>
        </div>
      </div>

      {/* Upload / Loading */}
      {!analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary-600/20 to-primary-600/20 flex items-center justify-center animate-glow-pulse">
                <Brain size={28} className="text-secondary-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Analyzing your resume...</h3>
              <p className="text-slate-400 text-sm">Extracting skills, checking ATS compatibility, generating insights</p>
              <div className="mt-6 flex justify-center gap-2">
                {['Extracting text', 'Checking ATS', 'Generating insights'].map((step, i) => (
                  <span key={step} className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <UploadZone onUpload={handleUpload} />
          )}
        </motion.div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Score Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="card flex items-center justify-center">
              <ATSRing score={Math.round(analysis.ats_score || 0)} />
            </div>
            <div className="md:col-span-3 card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-100">{analysis.file_name}</h2>
                <button onClick={() => setAnalysis(null)} className="btn-ghost text-sm">Upload New</button>
              </div>
              {analysis.ai_summary && (
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  {analysis.ai_summary}
                </p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Skills', value: analysis.extracted_skills?.length || 0, icon: Zap, color: 'text-accent-400' },
                  { label: 'Projects', value: analysis.extracted_projects?.length || 0, icon: Code2, color: 'text-secondary-400' },
                  { label: 'Experience', value: analysis.extracted_experience?.length || 0, icon: Briefcase, color: 'text-emerald-400' },
                  { label: 'Achievements', value: analysis.extracted_achievements?.length || 0, icon: Award, color: 'text-amber-400' },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-800/60 rounded-xl p-3 text-center">
                    <stat.icon size={18} className={`${stat.color} mx-auto mb-1`} />
                    <div className="text-xl font-bold text-slate-100">{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-0">
            {(['overview', 'skills', 'suggestions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium capitalize rounded-t-xl transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-secondary-300 border-secondary-500'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="card">
                <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Strengths
                </h3>
                <div className="space-y-2">
                  {(analysis.strengths || []).map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              {/* Weaknesses */}
              <div className="card">
                <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-400" /> Areas to Improve
                </h3>
                <div className="space-y-2">
                  {(analysis.weaknesses || []).map((w: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Skills */}
          {activeTab === 'skills' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="font-semibold text-slate-100 mb-4">Extracted Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(analysis.extracted_skills || []).map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 rounded-xl bg-emerald-950/50 text-emerald-400 text-sm font-medium border border-emerald-700/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="font-semibold text-slate-100 mb-4">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {(analysis.missing_keywords || []).map((kw: string) => (
                    <span key={kw} className="px-3 py-1.5 rounded-xl bg-red-950/50 text-red-400 text-sm font-medium border border-red-700/30">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Suggestions */}
          {activeTab === 'suggestions' && (
            <div className="card">
              <h3 className="font-semibold text-slate-100 mb-4">Improvement Suggestions</h3>
              <div className="space-y-3">
                {(analysis.improvement_suggestions || []).map((suggestion: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="w-6 h-6 rounded-full bg-secondary-900/60 text-secondary-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-300">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
