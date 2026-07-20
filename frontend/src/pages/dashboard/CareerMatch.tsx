import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Search, MapPin, Clock, DollarSign, Zap, ChevronRight, Globe } from 'lucide-react';
import { careerService } from '@/services/career';

function MatchBadge({ pct }: { pct: number }) {
  const color = pct >= 80 ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/30' :
    pct >= 60 ? 'bg-amber-950/60 text-amber-400 border-amber-700/30' : 'bg-slate-800 text-slate-400 border-slate-700';
  return <span className={`badge ${color}`}>{pct}% match</span>;
}

export default function CareerMatch() {
  const [tab, setTab] = useState<'paths' | 'jobs' | 'internships'>('paths');
  const [paths, setPaths] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      careerService.getCareerPaths(),
      careerService.getJobs(),
      careerService.getInternships(),
    ]).then(([p, j, i]) => { setPaths(p); setJobs(j); setInternships(i); })
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = jobs.filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));
  const filteredInterns = internships.filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-blue-600 flex items-center justify-center">
          <Briefcase size={20} className="text-white" />
        </div>
        <div>
          <h1 className="section-title">Career Match Engine</h1>
          <p className="section-subtitle text-sm">Find jobs and internships matched to your skills</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['paths', 'jobs', 'internships'] as const).map(t => (
            <button
              key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >{t}</button>
          ))}
        </div>
        {(tab === 'jobs' || tab === 'internships') && (
          <div className="flex-1 min-w-48 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or company..." className="input-field pl-9 text-sm py-2" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>
      ) : (
        <>
          {/* Career Paths */}
          {tab === 'paths' && (
            <div className="grid md:grid-cols-2 gap-4">
              {paths.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="career-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-100">{p.title}</h3>
                      <p className="text-sm text-slate-400">{p.salary_range}/year · {p.demand} Demand</p>
                    </div>
                    <MatchBadge pct={p.match_percent} />
                  </div>
                  <div className="mb-3">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${p.match_percent}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(p.skills_needed || []).slice(0, 5).map((s: string) => (
                      <span key={s} className={`px-2 py-0.5 rounded-lg text-xs border ${
                        p.missing_skills?.includes(s)
                          ? 'bg-red-950/30 text-red-400 border-red-800/30'
                          : 'bg-emerald-950/30 text-emerald-400 border-emerald-800/30'
                      }`}>{s}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Jobs */}
          {tab === 'jobs' && (
            <div className="space-y-3">
              {filteredJobs.length === 0 ? (
                <div className="card text-center py-12 text-slate-500">No jobs found</div>
              ) : filteredJobs.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="card hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-100">{job.title}</h3>
                        <MatchBadge pct={job.match_percent} />
                      </div>
                      <p className="text-slate-400 text-sm">{job.company}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                        {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
                        {job.work_mode && <span className="flex items-center gap-1"><Globe size={11} />{job.work_mode}</span>}
                        {job.salary_min && <span className="flex items-center gap-1"><DollarSign size={11} />₹{job.salary_min/100000}L - ₹{job.salary_max/100000}L</span>}
                      </div>
                    </div>
                    {job.application_link && (
                      <a href={job.application_link} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs px-3 py-2 rounded-xl shrink-0">
                        Apply <ChevronRight size={13} />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Internships */}
          {tab === 'internships' && (
            <div className="space-y-3">
              {filteredInterns.length === 0 ? (
                <div className="card text-center py-12 text-slate-500">No internships found</div>
              ) : filteredInterns.map((intern, i) => (
                <motion.div key={intern.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="card hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-100">{intern.title}</h3>
                        <MatchBadge pct={intern.match_percent} />
                        {intern.ppo_available && <span className="badge bg-secondary-950/60 text-secondary-400 border-secondary-700/30">PPO</span>}
                      </div>
                      <p className="text-slate-400 text-sm">{intern.company}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                        {intern.duration_months && <span className="flex items-center gap-1"><Clock size={11} />{intern.duration_months} months</span>}
                        {intern.stipend_min && <span className="flex items-center gap-1"><DollarSign size={11} />₹{intern.stipend_min?.toLocaleString()}/month</span>}
                        {intern.work_mode && <span className="flex items-center gap-1"><Globe size={11} />{intern.work_mode}</span>}
                      </div>
                    </div>
                    {intern.application_link && (
                      <a href={intern.application_link} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs px-3 py-2 rounded-xl shrink-0">
                        Apply <ChevronRight size={13} />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
