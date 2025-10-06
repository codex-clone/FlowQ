import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class APIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 15000
    });

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (axios.isCancel(error)) {
          return Promise.reject(error);
        }

        const message = error.response?.data?.message || error.message;
        return Promise.reject(new Error(message));
      }
    );
  }

  getCancelToken() {
    const controller = new AbortController();
    return controller;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiService = new APIService();

export const apiEndpoints = {
  createSession: () => apiService.post<{ session_id: string; user_id: number }>('/sessions'),
  getSession: (sessionId: string) => apiService.get(`/sessions/${sessionId}`),
  saveApiKey: (payload: { session_id: string; service_name: string; api_key: string }) =>
    apiService.post('/api-keys', payload),
  getApiKeys: (sessionId: string) => apiService.get(`/api-keys/${sessionId}`),
  deleteApiKey: (keyId: number, session_id: string) =>
    apiService.delete(`/api-keys/${keyId}`, { data: { session_id } }),
  startTest: (payload: {
    session_id: string;
    language: string;
    test_type: string;
    difficulty?: number;
  }) => apiService.post<{ test_id: number; questions: unknown[] }>('/tests', payload),
  submitResponse: (
    testId: number,
    payload: FormData
  ) =>
    apiService.post(`/tests/${testId}/responses`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  completeTest: (testId: number, payload: { session_id: string }) =>
    apiService.post<{ score: number; feedback: string; questions: unknown[]; responses: unknown[] }>(
      `/tests/${testId}/complete`,
      payload
    ),
  aiGenerate: (payload: { session_id: string; language: string; test_type: string; difficulty: number }) =>
    apiService.post<{ questions: unknown[] }>('/ai/generate-content', payload),
  aiEvaluate: (payload: { session_id: string; question_id?: number; response: string; type: string }) =>
    apiService.post('/ai/evaluate', payload)
};
