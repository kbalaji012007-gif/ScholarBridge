import api from './api';
import { User, AnalyticsStats } from '@/types';

export const adminService = {
  async getStats(): Promise<AnalyticsStats> {
    const res = await api.get('/analytics/stats');
    return res.data;
  },

  async listUsers(skip = 0, limit = 50) {
    const res = await api.get('/users/', { params: { skip, limit } });
    return res.data as User[];
  },

  async deleteUser(id: number) {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/users/me');
    return res.data as User;
  },

  async updateProfile(data: Partial<User>) {
    const res = await api.put('/users/me', data);
    return res.data as User;
  },

  async uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/users/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as User;
  },
};
