import api from './api';
import { Scholarship, ScholarshipFilters } from '@/types';

export const scholarshipService = {
  async list(filters: ScholarshipFilters = {}, skip = 0, limit = 20) {
    const params = { ...filters, skip, limit };
    const res = await api.get('/scholarships/', { params });
    return res.data as Scholarship[];
  },

  async getById(id: number) {
    const res = await api.get(`/scholarships/${id}`);
    return res.data as Scholarship;
  },

  async getSaved() {
    const res = await api.get('/scholarships/saved/list');
    return res.data as Scholarship[];
  },

  async toggleSave(id: number) {
    const res = await api.post(`/scholarships/${id}/save`);
    return res.data as { saved: boolean; message: string };
  },

  async create(data: Partial<Scholarship>) {
    const res = await api.post('/scholarships/', data);
    return res.data as Scholarship;
  },

  async update(id: number, data: Partial<Scholarship>) {
    const res = await api.put(`/scholarships/${id}`, data);
    return res.data as Scholarship;
  },

  async delete(id: number) {
    const res = await api.delete(`/scholarships/${id}`);
    return res.data;
  },
};
