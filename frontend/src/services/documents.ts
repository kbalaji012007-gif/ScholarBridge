import api from './api';
import { Document } from '@/types';

export const documentService = {
  async list() {
    const res = await api.get('/documents/');
    return res.data as Document[];
  },

  async upload(doc_type: string, file: File) {
    const formData = new FormData();
    formData.append('doc_type', doc_type);
    formData.append('file', file);
    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as Document;
  },

  async delete(id: number) {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },

  async adminListAll(status?: string) {
    const params = status ? { status } : {};
    const res = await api.get('/documents/admin/all', { params });
    return res.data as Document[];
  },

  async verify(id: number, status: 'verified' | 'rejected', rejection_reason?: string) {
    const res = await api.put(`/documents/${id}/verify`, { status, rejection_reason });
    return res.data as Document;
  },
};
