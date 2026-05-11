import apiClient from './client';
import { User, ApiResponse } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  tenantName?: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },
};
