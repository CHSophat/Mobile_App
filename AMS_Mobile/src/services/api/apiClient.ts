import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { envService } from '../environment.service';

const API_BASE_URL = envService.getApiBaseUrl();
const API_TIMEOUT = envService.getApiTimeout();

/**
 * Standard envelope returned by Apartement_Service (see ApiResponse<T> in
 * Endpoints/ApiResponse.cs). EVERY endpoint wraps its payload in this shape:
 *
 *   { "status": "success", "data": ..., "message": "OK", "statusCode": 200 }
 *
 * For 4xx/5xx the body is the same shape with status="error" and a non-2xx code.
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message: string;
  statusCode: number;
}

/** Pull data out, throw on error envelope. */
export function unwrap<T>(env: ApiResponse<T>): T {
  if (env?.status !== 'success') {
    throw new Error(env?.message || `Request failed (${env?.statusCode ?? 'unknown'})`);
  }
  return env.data;
}

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });

    this.instance.interceptors.request.use(async (config) => {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid — clear and let the auth context redirect.
          await tokenStorage.clear();
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }

  setBaseURL(url: string): void {
    this.instance.defaults.baseURL = url;
  }

  getBaseURL(): string {
    return this.instance.defaults.baseURL || API_BASE_URL;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
