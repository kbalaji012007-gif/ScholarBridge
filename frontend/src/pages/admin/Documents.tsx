import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Eye, FileText, User, Search } from 'lucide-react';
import { Document } from '@/types';
import { documentService } from '@/services/documents';
import { DOCUMENT_TYPES } from '@/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'status-pending' },
  verified: { label: 'Verified', icon: CheckCircle2, className: 'status-verified' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'status-rejected' },
};

const docLabel = (key: string) => DOCUMENT_TYPES.find(d => d.key === key)?.label || key.replace(/_/g, ' ');

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    documentService.adminListAll(statusFilter || undefined).then(setDocuments).finally(() => setLoading(false));
  }, [statusFilter]);

  const refetch = () => {
    setLoading(true);
    documentService.adminListAll(statusFilter || undefined).then(setDocuments).finally(() => setLoading(false));
  };

  const handleVerify = async (id: number) => {
    setActionLoading(id);
    try {
      await documentService.verify(id, 'verified');
      toast.success('Document verified!');
      refetch();
    } catch { toast.error('Failed to verify'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await documentService.verify(id, 'rejected', rejectReason || 'Document does not meet requirements');
      toast.success('Document rejected');
      setRejectingId(null);
      setRejectReason('');
      refetch();
    } catch { toast.error('Failed to reject'); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Document Verification</h1>
        <p className="section-subtitle">Review and verify student uploaded documents</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'verified', 'rejected', ''].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              statusFilter === s
                ? 'bg-primary-600 text-white shadow-glow'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : documents.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400">No {statusFilter} documents</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Document</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Student ID</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Uploaded</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {documents.map((doc, i) => {
                  const sc = statusConfig[doc.status as keyof typeof statusConfig];
                  return (
                    <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{docLabel(doc.doc_type)}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[140px]">{doc.original_filename}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-500">User #{doc.user_id}</span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-xs text-gray-400">{format(new Date(doc.uploaded_at), 'dd MMM yyyy, HH:mm')}</span>
                      </td>
                      <td className="px-6 py-4">
                       <span className={sc?.className}>{sc?.icon && <sc.icon size={11} />}{sc?.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/uploads/documents/${doc.user_id}/${doc.filename}`}
                            target="_blank" rel="noopener noreferrer"
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <Eye size={16} />
                          </a>
                          {doc.status !== 'verified' && (
                            <button
                              onClick={() => handleVerify(doc.id)}
                              disabled={actionLoading === doc.id}
                              className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-400 hover:text-emerald-600 transition-colors"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          {doc.status !== 'rejected' && (
                            <button
                              onClick={() => setRejectingId(doc.id)}
                              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                        {/* Reject modal inline */}
                        {rejectingId === doc.id && (
                          <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                            <input
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              placeholder="Rejection reason..."
                              className="input-field text-xs py-1.5 mb-2"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleReject(doc.id)} disabled={actionLoading === doc.id} className="btn-danger text-xs py-1.5 px-3">
                                Reject
                              </button>
                              <button onClick={() => setRejectingId(null)} className="btn-ghost text-xs py-1.5 px-3">Cancel</button>
                            </div>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
