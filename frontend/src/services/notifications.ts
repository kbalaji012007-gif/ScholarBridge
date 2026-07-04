import api from './api';
import { Notification } from '@/types';

export const notificationService = {
  async list() {
    const res = await api.get('/notifications/');
    return res.data as Notification[];
  },

  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count');
    return res.data.count as number;
  },

  async markRead(id: number) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead() {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
};
