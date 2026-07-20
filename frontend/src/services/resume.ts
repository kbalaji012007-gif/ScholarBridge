import api from './api';

export const resumeService = {
  upload: async (file: File, targetRole?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (targetRole) formData.append('target_role', targetRole);
    const res = await api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getLatest: async () => {
    const res = await api.get('/resume/analysis');
    return res.data;
  },

  getHistory: async () => {
    const res = await api.get('/resume/history');
    return res.data;
  },
};
