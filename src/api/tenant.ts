import apiClient from './client';
import { Tenant, User, ApiResponse } from '../types';

export interface TenantMembersResponse {
  members: User[];
  total: number;
}

export const tenantApi = {
  getCurrentTenant: async (): Promise<ApiResponse<Tenant>> => {
    const response = await apiClient.get('/api/tenant');
    return response.data;
  },

  updateTenant: async (data: Partial<Tenant>): Promise<ApiResponse<Tenant>> => {
    const response = await apiClient.put('/api/tenant', data);
    return response.data;
  },

  getMembers: async (): Promise<ApiResponse<TenantMembersResponse>> => {
    const response = await apiClient.get('/api/tenant/members');
    return response.data;
  },

  inviteMember: async (email: string, role: 'admin' | 'user'): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/api/tenant/members/invite', { email, role });
    return response.data;
  },

  removeMember: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/tenant/members/${userId}`);
    return response.data;
  },

  updateMemberRole: async (userId: string, role: 'admin' | 'user'): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(`/api/tenant/members/${userId}`, { role });
    return response.data;
  },
};
