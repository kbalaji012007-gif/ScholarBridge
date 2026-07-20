import api from './api';

export const roadmapService = {
  generate: async (data: { goal: string; duration_days: number; target_role?: string }) => {
    const res = await api.post('/roadmaps/generate', data);
    return res.data;
  },

  list: async () => {
    const res = await api.get('/roadmaps/');
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get(`/roadmaps/${id}`);
    return res.data;
  },

  updateProgress: async (id: number, data: { progress_percent: number; current_phase?: number; completed_topics?: string[]; status?: string }) => {
    const res = await api.put(`/roadmaps/${id}/progress`, data);
    return res.data;
  },
};
