import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookmarkCheck, BookmarkX, ChevronRight, IndianRupee, Calendar, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Scholarship } from '@/types';
import { scholarshipService } from '@/services/scholarships';
import toast from 'react-hot-toast';

const eligBadge = {
  eligible: { label: 'Eligible', className: 'badge-eligible', icon: CheckCircle2 },
  partial: { label: 'Partial', className: 'badge-partial', icon: AlertCircle },
  not_eligible: { label: 'Not Eligible', className: 'badge-not-eligible', icon: XCircle },
};

export default function SavedScholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scholarshipService.getSaved().then(setScholarships).finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    try {
      await scholarshipService.toggleSave(id);
      setScholarships(prev => prev.filter(s => s.id !== id));
      toast.success('Removed from saved');
    } catch { toast.error('Failed to remove'); }
  };

  if (loading) return <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Saved Scholarships</h1>
        <p className="section-subtitle">{scholarships.length} saved scholarship{scholarships.length !== 1 ? 's' : ''}</p>
      </div>

      {scholarships.length === 0 ? (
        <div className="card text-center py-16">
          <BookmarkCheck size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-bold text-gray-500 mb-2">No saved scholarships</h3>
          <p className="text-gray-400 text-sm mb-6">Browse scholarships and save the ones you're interested in.</p>
          <Link to="/dashboard/scholarships" className="btn-primary">Browse Scholarships</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {scholarships.map((s, i) => {
            const elig = s.eligibility_status ? eligBadge[s.eligibility_status] : null;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Link to={`/dashboard/scholarships/${s.id}`} className="card-hover flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={s.provider_type === 'government' ? 'badge-govt' : 'badge-private'}>
                        {s.provider_type === 'government' ? 'Government' : 'Private'}
                      </span>
                      {elig && <span className={elig.className}><elig.icon size={10} /> {elig.label}</span>}
                    </div>
                    <button onClick={(e) => handleUnsave(e, s.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors">
                      <BookmarkX size={16} />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{s.title}</h3>
                  <p className="text-gray-400 text-xs mb-2">{s.provider}</p>
                  <div className="mt-auto pt-3 flex items-center gap-3 border-t border-gray-100 dark:border-gray-800">
                    {s.amount && <span className="text-emerald-600 text-xs font-bold flex items-center gap-1"><IndianRupee size={11} />{s.amount.toLocaleString('en-IN')}</span>}
                    {s.last_date && <span className="text-amber-600 text-xs flex items-center gap-1"><Calendar size={11} />{new Date(s.last_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                    <ChevronRight size={14} className="ml-auto text-gray-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
