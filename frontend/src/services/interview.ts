import api from './api';

export const interviewService = {
  generateQuestions: async (role: string, category: string, count: number = 10) => {
    const res = await api.post('/interview/generate-questions', { role, category, count });
    return res.data;
  },

  browseQuestions: async (params?: { category?: string; difficulty?: string; role?: string; limit?: number }) => {
    const res = await api.get('/interview/questions', { params });
    return res.data;
  },

  submitSession: async (role: string, questions: Array<{ question: string; category: string; answer: string }>) => {
    const res = await api.post('/interview/session/submit', { role, questions });
    return res.data;
  },

  getSessions: async () => {
    const res = await api.get('/interview/sessions');
    return res.data;
  },

  getReadinessScore: async () => {
    const res = await api.get('/interview/readiness-score');
    return res.data;
  },
};
