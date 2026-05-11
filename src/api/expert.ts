import apiClient from './client';
import { ExpertMode, ApiResponse } from '../types';

export interface CreateExpertModeRequest {
  name: string;
  description: string;
  systemPrompt: string;
}

export const expertApi = {
  getExperts: async (): Promise<ApiResponse<ExpertMode[]>> => {
    const response = await apiClient.get('/api/experts');
    return response.data;
  },

  getExpert: async (id: string): Promise<ApiResponse<ExpertMode>> => {
    const response = await apiClient.get(`/api/experts/${id}`);
    return response.data;
  },

  createExpert: async (data: CreateExpertModeRequest): Promise<ApiResponse<ExpertMode>> => {
    const response = await apiClient.post('/api/experts', data);
    return response.data;
  },

  updateExpert: async (id: string, data: Partial<ExpertMode>): Promise<ApiResponse<ExpertMode>> => {
    const response = await apiClient.put(`/api/experts/${id}`, data);
    return response.data;
  },

  deleteExpert: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/experts/${id}`);
    return response.data;
  },
};
