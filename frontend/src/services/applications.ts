import api from './api';
import { Application } from '@/types';

export const applicationService = {
  async list() {
    const res = await api.get('/applications/');
    return res.data as Application[];
  },

  async apply(scholarship_id: number, notes?: string) {
    const res = await api.post('/applications/', { scholarship_id, notes });
    return res.data as Application;
  },

  async getById(id: number) {
    const res = await api.get(`/applications/${id}`);
    return res.data as Application;
  },

  async updateStatus(id: number, status: string, admin_remarks?: string) {
    const res = await api.put(`/applications/${id}`, { status, admin_remarks });
    return res.data as Application;
  },

  async withdraw(id: number) {
    const res = await api.delete(`/applications/${id}`);
    return res.data;
  },
};
