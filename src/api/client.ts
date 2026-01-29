import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { getServer, getToken, isTokenExpired } from '../config/store.js';
import { AuthError, ConfigError, ApiError, isAxiosError } from '../utils/errors.js';
import type { ApiResponse } from '../types/index.js';

let clientInstance: AxiosInstance | null = null;

/**
 * Get or create the API client
 */
export function getClient(): AxiosInstance {
  if (clientInstance) {
    return clientInstance;
  }

  const server = getServer();
  if (!server) {
    throw new ConfigError();
  }

  clientInstance = axios.create({
    baseURL: server,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  clientInstance.interceptors.request.use(config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor for error handling
  clientInstance.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        throw new AuthError('Authentication failed or expired. Please run: sprout-track auth login');
      }
      throw error;
    }
  );

  return clientInstance;
}

/**
 * Reset the client instance (e.g., when server changes)
 */
export function resetClient(): void {
  clientInstance = null;
}

/**
 * Check if authentication is required and valid
 */
export function requireAuth(): void {
  const token = getToken();
  if (!token) {
    throw new AuthError();
  }
  if (isTokenExpired()) {
    throw new AuthError('Token has expired. Please run: sprout-track auth login');
  }
}

/**
 * Make an API request with proper error handling
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  data?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  const client = getClient();

  try {
    let response;
    switch (method) {
      case 'GET':
        response = await client.get<ApiResponse<T>>(path, { params: data, ...config });
        break;
      case 'POST':
        response = await client.post<ApiResponse<T>>(path, data, config);
        break;
      case 'PUT':
        response = await client.put<ApiResponse<T>>(path, data, config);
        break;
      case 'PATCH':
        response = await client.patch<ApiResponse<T>>(path, data, config);
        break;
      case 'DELETE':
        response = await client.delete<ApiResponse<T>>(path, { data, ...config });
        break;
    }

    if (!response.data.success) {
      throw new ApiError(response.data.error || 'Request failed');
    }

    return response.data.data as T;
  } catch (error) {
    if (error instanceof AuthError || error instanceof ConfigError || error instanceof ApiError) {
      throw error;
    }

    if (isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.response?.data?.message || error.message;

      if (status === 401) {
        throw new AuthError();
      }
      if (status === 403) {
        throw new ApiError('Access denied', 403);
      }
      if (status === 404) {
        throw new ApiError('Resource not found', 404);
      }
      if (status === 429) {
        throw new ApiError('Too many requests. Please try again later.', 429);
      }

      throw new ApiError(message, status);
    }

    throw error;
  }
}

/**
 * GET request helper
 */
export async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  return apiRequest<T>('GET', path, params);
}

/**
 * POST request helper
 */
export async function post<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  return apiRequest<T>('POST', path, data);
}

/**
 * PUT request helper
 */
export async function put<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  return apiRequest<T>('PUT', path, data);
}

/**
 * PATCH request helper
 */
export async function patch<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  return apiRequest<T>('PATCH', path, data);
}

/**
 * DELETE request helper
 */
export async function del<T>(path: string, data?: Record<string, unknown>): Promise<T> {
  return apiRequest<T>('DELETE', path, data);
}
