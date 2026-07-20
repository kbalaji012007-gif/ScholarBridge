import api from './api';

export const chatService = {
  sendMessage: async (message: string, sessionId?: string) => {
    const res = await api.post('/chat/message', { message, session_id: sessionId });
    return res.data;
  },

  getHistory: async (sessionId?: string, limit: number = 50) => {
    const res = await api.get('/chat/history', { params: { session_id: sessionId, limit } });
    return res.data;
  },

  getSessions: async () => {
    const res = await api.get('/chat/sessions');
    return res.data;
  },

  clearHistory: async (sessionId?: string) => {
    const res = await api.delete('/chat/clear', { params: { session_id: sessionId } });
    return res.data;
  },
};
