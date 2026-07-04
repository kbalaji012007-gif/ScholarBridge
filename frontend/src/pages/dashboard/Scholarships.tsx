import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, CheckCircle2, AlertCircle, XCircle, Bookmark, BookmarkCheck, IndianRupee, Calendar, ChevronRight, X } from 'lucide-react';
import { Scholarship, ScholarshipFilters } from '@/types';
import { scholarshipService } from '@/services/scholarships';
import toast from 'react-hot-toast';

const STATES = ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Punjab'];
const CATEGORIES = ['General', 'SC', 'ST', 'OBC', 'EWS'];
const COURSES = ['B.Tech', 'B.E', 'B.Sc', 'B.Com', 'BA', 'M.Tech', 'M.Sc', 'MBA', 'MBBS', 'BCA'];

const eligBadge = {
  eligible: { label: 'Eligible', className: 'badge-eligible', icon: CheckCircle2 },
  partial: { label: 'Partial', className: 'badge-partial', icon: AlertCircle },
  not_eligible: { label: 'Not Eligible', className: 'badge-not-eligible', icon: XCircle },
};

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [filters, setFilters] = useState<ScholarshipFilters>({
    search: '', state: '', course: '', category: '', gender: '', provider_type: '', sort_by: 'last_date', order: 'asc'
  });

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const data = await scholarshipService.list(filters, 0, 50);
      setScholarships(data);
    } catch {
      toast.error('Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScholarships(); }, [filters.sort_by, filters.order, filters.provider_type]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchScholarships(); };
  const clearFilter = (key: keyof ScholarshipFilters) => setFilters(prev => ({ ...prev, [key]: '' }));

  const handleSave = async (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation();
    setSavingId(id);
    try {
      const res = await scholarshipService.toggleSave(id);
      setScholarships(prev => prev.map(s => s.id === id ? { ...s, is_saved: res.saved } : s));
    } catch { toast.error('Failed'); }
    finally { setSavingId(null); }
  };

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && !['search', 'sort_by', 'order'].includes(k));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Find Scholarships</h1>
          <p className="section-subtitle">{scholarships.length} scholarships found</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${showFilters ? 'bg-primary-600 text-white' : 'btn-secondary'}`}>
          <SlidersHorizontal size={16} /> Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title, provider, description..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="input-field pl-11 pr-28 py-3.5 rounded-2xl text-base"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm">Search</button>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">State</label>
            <select value={filters.state} onChange={(e) => setFilters(p => ({ ...p, state: e.target.value }))} className="input-field text-sm">
              <option value="">All States</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Category</label>
            <select value={filters.category} onChange={(e) => setFilters(p => ({ ...p, category: e.target.value }))} className="input-field text-sm">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Course</label>
            <select value={filters.course} onChange={(e) => setFilters(p => ({ ...p, course: e.target.value }))} className="input-field text-sm">
              <option value="">All Courses</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Type</label>
            <select value={filters.provider_type} onChange={(e) => setFilters(p => ({ ...p, provider_type: e.target.value }))} className="input-field text-sm">
              <option value="">All Types</option>
              <option value="government">Government</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Gender</label>
            <select value={filters.gender} onChange={(e) => setFilters(p => ({ ...p, gender: e.target.value }))} className="input-field text-sm">
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Sort By</label>
            <select value={filters.sort_by} onChange={(e) => setFilters(p => ({ ...p, sort_by: e.target.value }))} className="input-field text-sm">
              <option value="last_date">Deadline</option>
              <option value="amount">Amount</option>
              <option value="created_at">Newest</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Order</label>
            <select value={filters.order} onChange={(e) => setFilters(p => ({ ...p, order: e.target.value }))} className="input-field text-sm">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({ search: '', state: '', course: '', category: '', gender: '', provider_type: '', sort_by: 'last_date', order: 'asc' })} className="btn-ghost w-full text-sm">
              <X size={14} /> Clear All
            </button>
          </div>
        </motion.div>
      )}

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(([key, val]) => (
            <span key={key} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 text-sm font-medium">
              {val}
              <button onClick={() => clearFilter(key as keyof ScholarshipFilters)} className="hover:text-primary-900">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : scholarships.length === 0 ? (
        <div className="text-center py-20 card">
          <Search size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-bold text-gray-600 dark:text-gray-400 mb-2">No scholarships found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {scholarships.map((s, i) => {
            const elig = s.eligibility_status ? eligBadge[s.eligibility_status] : null;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/dashboard/scholarships/${s.id}`} className="card-hover h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className={s.provider_type === 'government' ? 'badge-govt' : 'badge-private'}>
                        {s.provider_type === 'government' ? 'Government' : 'Private'}
                      </span>
                      {elig && (
                        <span className={elig.className}>
                          <elig.icon size={10} /> {elig.label}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleSave(e, s.id)}
                      disabled={savingId === s.id}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {s.is_saved
                        ? <BookmarkCheck size={16} className="text-primary-600" />
                        : <Bookmark size={16} className="text-gray-400" />
                      }
                    </button>
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1 line-clamp-2">{s.title}</h3>
                  <p className="text-gray-400 text-xs mb-3">{s.provider}</p>

                  {s.description && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-3 flex-1">{s.description}</p>
                  )}

                  <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                    {s.amount && (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <IndianRupee size={12} />
                        {s.amount >= 100000 ? `${(s.amount / 100000).toFixed(1)}L` : s.amount.toLocaleString('en-IN')}
                      </div>
                    )}
                    {s.last_date && (
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
                        <Calendar size={12} />
                        {new Date(s.last_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
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
