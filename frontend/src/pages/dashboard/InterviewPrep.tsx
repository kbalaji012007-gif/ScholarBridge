import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Play, Send, CheckCircle2, Star, Target, ChevronRight, BarChart3 } from 'lucide-react';
import { interviewService } from '@/services/interview';
import toast from 'react-hot-toast';

const ROLES = ['Software Engineer', 'Data Analyst', 'Full Stack Developer', 'ML Engineer', 'Product Manager', 'DevOps Engineer'];
const CATEGORIES = ['HR', 'Technical', 'Behavioral', 'Coding'];

type Phase = 'setup' | 'interview' | 'results';

export default function InterviewPrep() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [role, setRole] = useState('Software Engineer');
  const [category, setCategory] = useState('Technical');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [readiness, setReadiness] = useState<any>(null);

  useEffect(() => {
    interviewService.getReadinessScore().then(setReadiness).catch(console.error);
  }, []);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await interviewService.generateQuestions(role, category, 5);
      setQuestions(res.questions || []);
      setCurrentQ(0);
      setAnswers({});
      setPhase('interview');
    } catch { toast.error('Failed to load questions'); }
    finally { setLoading(false); }
  };

  const submitInterview = async () => {
    setLoading(true);
    const submitted = questions.map((q: any, i: number) => ({
      question: q.question,
      category: q.category,
      answer: answers[i] || '',
    }));
    try {
      const res = await interviewService.submitSession(role, submitted);
      setResults(res);
      setPhase('results');
    } catch { toast.error('Submission failed'); }
    finally { setLoading(false); }
  };

  const readinessColor = (level: string) => {
    if (level?.includes('Ready')) return 'text-emerald-400';
    if (level?.includes('Intermediate')) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-secondary-600 flex items-center justify-center">
          <Trophy size={20} className="text-white" />
        </div>
        <div>
          <h1 className="section-title">Interview Preparation</h1>
          <p className="section-subtitle text-sm">Practice HR, Technical, Behavioral & Coding questions</p>
        </div>
      </div>

      {/* Readiness Card */}
      {readiness && (
        <div className="card flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-950/60 to-secondary-950/60 border border-secondary-700/30 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-secondary-300" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {readiness.score || 0}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-400">{readiness.sessions_completed} sessions completed</p>
            <p className={`font-semibold ${readinessColor(readiness.level)}`}>{readiness.level || 'Not Started'}</p>
            <p className="text-xs text-slate-500 mt-1">{readiness.recommendation}</p>
          </div>
        </div>
      )}

      {/* Setup Phase */}
      {phase === 'setup' && (
        <div className="card space-y-5">
          <h2 className="font-semibold text-slate-100">Configure Your Mock Interview</h2>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Target Role</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    role === r ? 'bg-secondary-600 text-white border border-secondary-500' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >{r}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Question Category</label>
            <div className="flex gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    category === c ? 'bg-secondary-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >{c}</button>
              ))}
            </div>
          </div>
          <button onClick={startInterview} disabled={loading} className="btn-primary w-full">
            {loading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Loading questions...</> : <><Play size={16} /> Start Mock Interview</>}
          </button>
        </div>
      )}

      {/* Interview Phase */}
      {phase === 'interview' && questions.length > 0 && (
        <div className="card space-y-5">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Question {currentQ + 1} of {questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div key={i} className={`w-8 h-1 rounded-full transition-colors ${i <= currentQ ? 'bg-secondary-500' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-secondary-950/40 to-primary-950/40 border border-secondary-700/30">
            <div className="flex items-center gap-2 mb-3">
              <span className={`badge ${
                questions[currentQ]?.difficulty === 'Easy' ? 'badge-eligible' :
                questions[currentQ]?.difficulty === 'Hard' ? 'badge-not-eligible' : 'badge-partial'
              }`}>{questions[currentQ]?.difficulty}</span>
              <span className="badge bg-slate-800 text-slate-400">{questions[currentQ]?.category}</span>
            </div>
            <p className="text-slate-100 font-medium leading-relaxed">{questions[currentQ]?.question}</p>
            {questions[currentQ]?.tips && (
              <p className="text-xs text-slate-500 mt-3 italic">💡 Tip: {questions[currentQ].tips}</p>
            )}
          </div>

          {/* Answer */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Your Answer</label>
            <textarea
              value={answers[currentQ] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [currentQ]: e.target.value }))}
              placeholder="Type your answer here..."
              rows={6}
              className="input-field resize-none"
            />
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentQ > 0 && <button onClick={() => setCurrentQ(q => q - 1)} className="btn-ghost">← Prev</button>}
            {currentQ < questions.length - 1 ? (
              <button onClick={() => setCurrentQ(q => q + 1)} className="btn-primary flex-1">
                Next Question <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={submitInterview} disabled={loading} className="btn-primary flex-1 bg-emerald-600 hover:bg-emerald-500">
                {loading ? 'Submitting...' : <><Send size={16} /> Submit Interview</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Phase */}
      {phase === 'results' && results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="card text-center">
            <div className={`w-24 h-24 mx-auto rounded-full flex flex-col items-center justify-center mb-4 ${
              results.overall_score >= 80 ? 'bg-emerald-950/60 border-2 border-emerald-500' :
              results.overall_score >= 60 ? 'bg-amber-950/60 border-2 border-amber-500' : 'bg-red-950/60 border-2 border-red-500'
            }`}>
              <span className="text-3xl font-black text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>{Math.round(results.overall_score)}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
            <h2 className="font-bold text-slate-100 text-xl mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{results.readiness_level}</h2>
            <p className="text-slate-400 text-sm">{results.ai_feedback}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setPhase('setup'); setResults(null); }} className="btn-secondary flex-1">Try Again</button>
            <button onClick={() => setPhase('setup')} className="btn-primary flex-1">New Session</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
