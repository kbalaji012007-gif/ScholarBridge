import api from './api';
import { TokenResponse, User } from '@/types';

export const authService = {
  async signup(email: string, password: string, full_name: string) {
    const res = await api.post('/auth/signup', { email, password, full_name });
    return res.data;
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    const res = await api.post('/auth/login', { email, password });
    const data: TokenResponse = res.data;
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async forgotPassword(email: string) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token: string, new_password: string) {
    const res = await api.post('/auth/reset-password', { token, new_password });
    return res.data;
  },

  async verifyEmail(token: string) {
    const res = await api.get(`/auth/verify-email?token=${token}`);
    return res.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getStoredUser(): User | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },
};
