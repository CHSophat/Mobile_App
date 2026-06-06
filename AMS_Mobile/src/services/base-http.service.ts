import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { envService } from './environment.service';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T = any> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Error response interface
 */
export class ApiError extends Error {
  public statusCode: number;
  public responseData: any;

  constructor(message: string, statusCode: number = 500, responseData: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.responseData = responseData;
    this.name = 'ApiError';
  }
}

/**
 * Base HTTP service for making API calls
 * Handles authentication, error handling, and request/response interceptors
 */
class BaseHttpService {
  protected instance: AxiosInstance;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor() {
    this.instance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Create and configure axios instance
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: envService.getApiBaseUrl(),
      timeout: envService.getApiTimeout(),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - add auth token
    this.instance.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Failed to retrieve auth token', error);
        }
        return config;
      },
      (error) => Promise.reject(new ApiError('Request configuration failed', 400, error))
    );

    // Response interceptor - handle responses and errors
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Handle response errors with retry logic for 401
   */
  private async handleResponseError(error: AxiosError) {
    const config = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !config?._retry) {
      config._retry = true;

      try {
        const newToken = await this.refreshToken();
        if (newToken && config.headers) {
          config.headers.Authorization = `Bearer ${newToken}`;
          return this.instance(config);
        }
      } catch (refreshError) {
        // Token refresh failed, logout user
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('refreshToken');
        // Could emit logout event here
        console.warn('Token refresh failed, user logged out');
      }
    }

    const statusCode = error.response?.status || 500;
    const message = this.getErrorMessage(error);
    return Promise.reject(new ApiError(message, statusCode, error.response?.data));
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) {
        return null;
      }

      this.tokenRefreshPromise = this.postWithoutAuth<{ token: string }>('/auth/refresh', {
        refreshToken,
      }).then((response) => {
        const newToken = response.data?.token;
        if (newToken) {
          SecureStore.setItemAsync('authToken', newToken);
        }
        return newToken || null;
      });

      return await this.tokenRefreshPromise;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: AxiosError): string {
    if (!error.response) {
      return 'Network error. Please check your internet connection.';
    }

    const data = error.response.data as any;
    return (
      data?.message ||
      data?.error ||
      error.message ||
      `Error ${error.response.status}`
    );
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST without auth (for login, refresh token, etc.)
   */
  protected async postWithoutAuth<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await axios.post<ApiResponse<T>>(
        `${envService.getApiBaseUrl()}${url}`,
        data,
        {
          timeout: envService.getApiTimeout(),
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle and throw errors
   */
  private handleError(error: any): never {
    if (error instanceof ApiError) {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        this.getErrorMessage(error),
        error.response?.status || 500,
        error.response?.data
      );
    }
    throw new ApiError('An unexpected error occurred', 500);
  }

  /**
   * Get axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

export default BaseHttpService;
