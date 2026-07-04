import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, GraduationCap, IndianRupee, Calendar } from 'lucide-react';
import { Scholarship } from '@/types';
import { scholarshipService } from '@/services/scholarships';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    scholarshipService.list({}, 0, 100).then(setScholarships).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this scholarship? This cannot be undone.')) return;
    try {
      await scholarshipService.delete(id);
      setScholarships(prev => prev.filter(s => s.id !== id));
      toast.success('Scholarship deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = scholarships.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Scholarships</h1>
          <p className="section-subtitle">{filtered.length} scholarships managed</p>
        </div>
        <Link to="/admin/scholarships/new" className="btn-primary">
          <Plus size={18} /> Add Scholarship
        </Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search scholarships..." className="input-field pl-9 rounded-2xl" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Scholarship</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Amount</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Deadline</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shrink-0">
                          <GraduationCap size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{s.title}</p>
                          <p className="text-xs text-gray-400">{s.provider}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={s.provider_type === 'government' ? 'badge-govt' : 'badge-private'}>
                        {s.provider_type === 'government' ? 'Government' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="font-semibold text-emerald-600 text-sm flex items-center gap-1">
                        <IndianRupee size={12} />
                        {s.amount ? s.amount.toLocaleString('en-IN') : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {s.last_date ? format(new Date(s.last_date), 'dd MMM yyyy') : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/scholarships/${s.id}/edit`} className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-400 hover:text-blue-600 transition-colors">
                          <Pencil size={16} />
                        </Link>
                        <button onClick={() => handleDelete(s.id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <GraduationCap size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No scholarships found</p>
                <Link to="/admin/scholarships/new" className="btn-primary mt-4 text-sm">Add First Scholarship</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
