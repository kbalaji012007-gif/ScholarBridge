import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Search, CheckCircle2, XCircle, Clock, ArrowRight, Lightbulb } from 'lucide-react';
import { careerService } from '@/services/career';
import toast from 'react-hot-toast';

const SAMPLE_JD = `We are looking for a Data Analyst with strong skills in:
- Python (pandas, NumPy, matplotlib)
- SQL (PostgreSQL, complex queries, window functions)
- Tableau or Power BI for dashboard creation
- Statistical analysis and A/B testing
- Machine Learning basics (scikit-learn)
- Excel, pivot tables, VLOOKUP
- Communication and data storytelling skills
`;

export default function SkillGap() {
  const [jd, setJd] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!jd.trim()) { toast.error('Paste a job description first'); return; }
    setLoading(true);
    try {
      const data = await careerService.analyzeSkillGap(jd);
      setResult(data);
    } catch {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const matchColor = (pct: number) =>
    pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';
  const matchBg = (pct: number) =>
    pct >= 80 ? 'from-emerald-600 to-teal-600' : pct >= 60 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-600';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="section-title">Skill Gap Analyzer</h1>
          <p className="section-subtitle text-sm">Paste a job description to see your match and what to learn</p>
        </div>
      </div>

      {/* Input */}
      <div className="card space-y-4">
        <label className="block text-sm font-medium text-slate-300">
          Paste Job Description
        </label>
        <textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder={SAMPLE_JD}
          rows={8}
          className="input-field font-mono text-xs resize-none"
        />
        <div className="flex gap-3">
          <button onClick={analyze} disabled={loading} className="btn-primary">
            {loading ? (
              <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Analyzing...</>
            ) : (
              <><Search size={16} /> Analyze Skill Gap</>
            )}
          </button>
          <button onClick={() => setJd(SAMPLE_JD)} className="btn-ghost text-sm">Use Sample JD</button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Match Score */}
          <div className="card flex flex-col md:flex-row items-center gap-6">
            <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${matchBg(result.match_percent)} flex flex-col items-center justify-center shadow-lg`}>
              <span className="text-4xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{result.match_percent}%</span>
              <span className="text-white/70 text-xs mt-1">Match</span>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-slate-100 text-xl mb-2">
                <span className={matchColor(result.match_percent)}>
                  {result.match_percent >= 80 ? '🎯 Strong Match!' : result.match_percent >= 60 ? '✅ Good Match' : '⚠️ Needs Work'}
                </span>
              </h2>
              <p className="text-slate-400 text-sm mb-4">{result.summary}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 size={14} /> {result.matched_skills?.length || 0} skills matched
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <XCircle size={14} /> {result.missing_skills?.length || 0} skills missing
                </span>
                <span className="flex items-center gap-1.5 text-accent-400">
                  <Clock size={14} /> ~{result.estimated_learning_weeks || 8} weeks to close gap
                </span>
              </div>
            </div>
          </div>

          {/* Skill Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" /> Skills You Have
              </h3>
              <div className="flex flex-wrap gap-2">
                {(result.matched_skills || []).map((s: string) => (
                  <span key={s} className="px-3 py-1.5 rounded-xl bg-emerald-950/50 text-emerald-400 text-xs font-medium border border-emerald-700/30">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <XCircle size={15} className="text-red-400" /> Skills to Acquire
              </h3>
              <div className="flex flex-wrap gap-2">
                {(result.missing_skills || []).map((s: string) => (
                  <span key={s} className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                    (result.priority_skills || []).includes(s)
                      ? 'bg-red-950/50 text-red-400 border-red-700/30 ring-1 ring-red-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {(result.priority_skills || []).includes(s) ? '🔥' : '+'} {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Resources */}
          {result.learning_resources?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Lightbulb size={15} className="text-accent-400" /> Learning Resources
              </h3>
              <div className="space-y-3">
                {result.learning_resources.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="w-8 h-8 rounded-lg bg-accent-950/60 flex items-center justify-center">
                      <span className="text-accent-400 text-xs font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">{r.skill}</p>
                      <p className="text-xs text-slate-400">{r.resource}</p>
                    </div>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs text-accent-400 gap-1">
                      Learn <ArrowRight size={12} />
                    </a>
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
