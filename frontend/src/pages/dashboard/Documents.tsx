import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileCheck, Clock, XCircle, Trash2, Eye, Download,
  CheckCircle2, AlertCircle, FileText, Plus, Info
} from 'lucide-react';
import { Document, DOCUMENT_TYPES } from '@/types';
import { documentService } from '@/services/documents';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending Review', icon: Clock, className: 'status-pending' },
  verified: { label: 'Verified', icon: CheckCircle2, className: 'status-verified' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'status-rejected' },
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    documentService.list()
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, []);

  const getDoc = (docType: string) => documents.find(d => d.doc_type === docType);

  const handleUpload = async (docType: string, file: File) => {
    if (!file) return;
    setUploading(docType);
    try {
      const newDoc = await documentService.upload(docType, file);
      setDocuments(prev => {
        const filtered = prev.filter(d => d.doc_type !== docType);
        return [...filtered, newDoc];
      });
      toast.success('Document uploaded! Pending admin review.');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Upload failed. Check file type and size.');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (id: number, docType: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await documentService.delete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const totalRequired = DOCUMENT_TYPES.length;

  if (loading) return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Document Wallet</h1>
          <p className="section-subtitle">Store and manage all your required documents securely.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold gradient-text">{verifiedCount}/{totalRequired}</div>
          <div className="text-xs text-gray-400">Verified</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Document Completion</span>
            <span className="font-bold text-primary-600">{documents.length}/{totalRequired} Uploaded</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-primary-500 to-indigo-500 h-2.5 rounded-full transition-all"
              style={{ width: `${(documents.length / totalRequired) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex gap-3 text-xs shrink-0">
          <div className="text-center">
            <div className="font-bold text-emerald-600">{verifiedCount}</div>
            <div className="text-gray-400">Verified</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-amber-600">{documents.filter(d => d.status === 'pending').length}</div>
            <div className="text-gray-400">Pending</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-red-600">{documents.filter(d => d.status === 'rejected').length}</div>
            <div className="text-gray-400">Rejected</div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
        <Info size={15} className="shrink-0" />
        Accepted formats: PDF, JPEG, PNG. Max size: 5MB per file.
      </div>

      {/* Document grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const doc = getDoc(docType.key);
          const status = doc?.status;
          const sc = status ? statusConfig[status as keyof typeof statusConfig] : null;
          const isUploading = uploading === docType.key;

          return (
            <motion.div
              key={docType.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card relative overflow-hidden border-2 transition-all ${
                !doc ? 'border-dashed border-gray-200 dark:border-gray-700'
                : status === 'verified' ? 'border-emerald-200 dark:border-emerald-800'
                : status === 'rejected' ? 'border-red-200 dark:border-red-800'
                : 'border-amber-200 dark:border-amber-800'
              }`}
            >
              {/* Status ribbon */}
              {status === 'verified' && (
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-b-[40px] border-l-transparent border-b-emerald-500" />
              )}

              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  !doc ? 'bg-gray-100 dark:bg-gray-800'
                  : status === 'verified' ? 'bg-emerald-100 dark:bg-emerald-950/40'
                  : status === 'rejected' ? 'bg-red-100 dark:bg-red-950/40'
                  : 'bg-amber-100 dark:bg-amber-950/40'
                }`}>
                  {!doc ? <FileText size={18} className="text-gray-400" />
                  : status === 'verified' ? <CheckCircle2 size={18} className="text-emerald-600" />
                  : status === 'rejected' ? <XCircle size={18} className="text-red-600" />
                  : <Clock size={18} className="text-amber-600" />}
                </div>
                {sc && <span className={sc.className}><sc.icon size={11} /> {sc.label}</span>}
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{docType.label}</h3>

              {doc ? (
                <>
                  <p className="text-xs text-gray-400 mb-2 truncate">{doc.original_filename}</p>
                  <p className="text-xs text-gray-400 mb-3">
                    Uploaded: {format(new Date(doc.uploaded_at), 'dd MMM yyyy')}
                  </p>
                  {doc.rejection_reason && (
                    <div className="mb-3 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 text-xs">
                      {doc.rejection_reason}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <a
                      href={`/uploads/documents/${doc.user_id}/${doc.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye size={13} /> Preview
                    </a>
                    <label className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 text-xs font-medium cursor-pointer hover:bg-primary-100 transition-colors">
                      {isUploading ? <span className="animate-pulse">Uploading...</span> : <><Upload size={13} /> Replace</>}
                      <input
                        ref={el => fileInputRefs.current[docType.key] = el}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(docType.key, f); }}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => handleDelete(doc.id, docType.key)}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <label className="mt-2 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 cursor-pointer transition-colors group">
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-primary-600 text-sm animate-pulse">
                      <Upload size={18} className="animate-bounce" /> Uploading...
                    </div>
                  ) : (
                    <>
                      <Plus size={24} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                      <span className="text-xs text-gray-400 group-hover:text-primary-500 font-medium transition-colors text-center">
                        Click to upload
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(docType.key, f); }}
                    className="hidden"
                  />
                </label>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
