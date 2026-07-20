import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Sparkles, Plus, CheckCircle2, Circle, ChevronDown, ChevronUp, Video, BookOpen, Code2, Trophy, Rocket } from 'lucide-react';
import { roadmapService } from '@/services/roadmaps';
import toast from 'react-hot-toast';

const GOALS = ['Data Analyst', 'Full Stack Developer', 'Machine Learning Engineer', 'DevOps Engineer', 'Cloud Architect', 'Cybersecurity Analyst', 'Android Developer', 'UI/UX Designer'];

const resourceIcon = (type: string) => {
  if (type === 'youtube') return <Video size={13} className="text-red-400" />;
  if (type === 'documentation') return <BookOpen size={13} className="text-blue-400" />;
  if (type === 'platform') return <Code2 size={13} className="text-accent-400" />;
  return <BookOpen size={13} className="text-slate-400" />;
};

export default function LearningRoadmap() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(60);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  useEffect(() => {
    roadmapService.list().then(setRoadmaps).catch(console.error);
  }, []);

  const generateRoadmap = async () => {
    if (!goal.trim()) { toast.error('Please enter a goal'); return; }
    setGenerating(true);
    try {
      const newRoadmap = await roadmapService.generate({ goal, duration_days: duration });
      setRoadmaps(prev => [newRoadmap, ...prev]);
      setActiveRoadmap(newRoadmap);
      setShowGenerator(false);
      toast.success('Roadmap generated!');
    } catch {
      toast.error('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const phaseColors = ['from-primary-600 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-500'];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <Map size={20} className="text-white" />
          </div>
          <div>
            <h1 className="section-title">Learning Roadmap</h1>
            <p className="section-subtitle text-sm">AI-generated 30/60/90 day personalized learning plans</p>
          </div>
        </div>
        <button onClick={() => setShowGenerator(!showGenerator)} className="btn-primary text-sm">
          <Plus size={16} /> New Roadmap
        </button>
      </div>

      {/* Generator Panel */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
          >
            <div className="ai-card space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-secondary-400" />
                <h3 className="font-semibold text-slate-100">Generate New Roadmap</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Your Goal</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {GOALS.map(g => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        goal === g
                          ? 'bg-secondary-600 text-white border border-secondary-500'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <input
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="Or type your own goal..."
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Duration</label>
                <div className="flex gap-2">
                  {[30, 60, 90].map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        duration === d
                          ? 'bg-secondary-600 text-white shadow-glow-violet'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generateRoadmap} disabled={generating} className="btn-accent w-full">
                {generating ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Generating AI Roadmap...</>
                ) : (
                  <><Rocket size={16} /> Generate {duration}-Day Roadmap</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roadmap List */}
      {!activeRoadmap && roadmaps.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {roadmaps.map((r: any) => (
            <div key={r.id} onClick={() => setActiveRoadmap(r)}
              className="career-card cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                  <Map size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 text-sm">{r.goal}</h3>
                  <p className="text-xs text-slate-400">{r.duration_days} days · {r.status}</p>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${r.progress_percent}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{r.progress_percent}% complete</p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!activeRoadmap && roadmaps.length === 0 && (
        <div className="card text-center py-16">
          <Map size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="font-bold text-slate-300 mb-2">No roadmaps yet</h3>
          <p className="text-slate-500 text-sm mb-6">Generate your first AI-powered learning plan</p>
          <button onClick={() => setShowGenerator(true)} className="btn-primary">
            <Plus size={16} /> Create First Roadmap
          </button>
        </div>
      )}

      {/* Active Roadmap Detail */}
      {activeRoadmap && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Roadmap Header */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-slate-100 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {activeRoadmap.title || `${activeRoadmap.goal} Roadmap`}
                </h2>
                <p className="text-slate-400 text-sm">{activeRoadmap.summary || activeRoadmap.ai_summary}</p>
              </div>
              <button onClick={() => setActiveRoadmap(null)} className="btn-ghost text-xs">← Back</button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">{activeRoadmap.duration_days} day plan</span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-400">{activeRoadmap.progress_percent || 0}% complete</span>
            </div>
            <div className="progress-bar mt-3">
              <div className="progress-fill" style={{ width: `${activeRoadmap.progress_percent || 0}%` }} />
            </div>
          </div>

          {/* Phases */}
          {(activeRoadmap.phases || []).map((phase: any, i: number) => (
            <div key={phase.phase || i} className="card">
              <button
                onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                className="w-full flex items-center gap-4 text-left"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${phaseColors[i % 3]} flex flex-col items-center justify-center shrink-0`}>
                  <span className="text-white text-xs opacity-70">Phase</span>
                  <span className="text-white font-bold">{phase.phase || i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-100">{phase.title}</h3>
                  <p className="text-xs text-slate-400">Days {phase.days}</p>
                </div>
                {expandedPhase === i ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
              </button>

              {expandedPhase === i && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-4 border-t border-slate-800 pt-4">
                  {phase.description && <p className="text-slate-400 text-sm">{phase.description}</p>}

                  {/* Topics */}
                  {phase.topics?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {phase.topics.map((t: string) => (
                          <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {phase.resources?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Resources</h4>
                      <div className="space-y-2">
                        {phase.resources.map((r: any, j: number) => (
                          <div key={j} className="flex items-center gap-2 text-sm text-slate-300">
                            {resourceIcon(r.type)}
                            <span>{r.title}</span>
                            {r.channel && <span className="text-slate-500">· {r.channel}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {phase.projects?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Projects to Build</h4>
                      <div className="space-y-1">
                        {phase.projects.map((p: string) => (
                          <div key={p} className="flex items-center gap-2 text-sm text-slate-300">
                            <Trophy size={12} className="text-amber-400" /> {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ))}

          {/* Final Project */}
          {activeRoadmap.final_project && (
            <div className="ai-card">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={16} className="text-amber-400" />
                <h3 className="font-semibold text-slate-100">Capstone Project</h3>
              </div>
              <p className="text-slate-300 text-sm">{activeRoadmap.final_project}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
