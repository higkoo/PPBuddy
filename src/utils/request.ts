import apiClient from '../api/client';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: Record<string, any>;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', data, params } = options;

  try {
    const response = await apiClient.request({
      url,
      method,
      data,
      params,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Request failed';
    throw new Error(message);
  }
}

export function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  return request<T>(url, { method: 'GET', params });
}

export function post<T>(url: string, data?: any): Promise<T> {
  return request<T>(url, { method: 'POST', data });
}

export function put<T>(url: string, data?: any): Promise<T> {
  return request<T>(url, { method: 'PUT', data });
}

export function del<T>(url: string): Promise<T> {
  return request<T>(url, { method: 'DELETE' });
}
