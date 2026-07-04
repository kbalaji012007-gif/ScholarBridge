import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2, Search, Mail, User, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { User as UserType } from '@/types';
import { adminService } from '@/services/admin';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.listUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const filtered = users.filter(u =>
    !u.is_admin && (
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Students</h1>
          <p className="section-subtitle">{filtered.length} registered students</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          type="text"
          placeholder="Search by name or email..."
          className="input-field pl-9 rounded-2xl"
        />
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">College</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Profile</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(u.full_name?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{u.full_name || 'Not set'}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={10} /> {u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{u.college || '—'}</p>
                    <p className="text-xs text-gray-400">{u.course} {u.semester ? `• Sem ${u.semester}` : ''}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${u.profile_completion}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{u.profile_completion}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={u.is_active ? 'badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'badge bg-red-100 text-red-700'}>
                        {u.is_active ? <CheckCircle2 size={10} /> : <XCircle size={10} />} {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {u.is_verified && <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"><CheckCircle2 size={10} /> Verified</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-xs text-gray-400">{format(new Date(u.created_at), 'dd MMM yyyy')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No students found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
