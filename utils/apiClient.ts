import { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from './logger';
import { env } from './env';

export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, string | number>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers: Record<string, string>;
  url: string;
}

/**
 * Professional API Client for REST API testing
 * Provides a clean interface for making HTTP requests with proper error handling
 */
export class ApiClient {
  private request: APIRequestContext;
  private baseUrl: string;

  constructor(request: APIRequestContext, baseUrl?: string) {
    this.request = request;
    this.baseUrl = baseUrl || env.BASE_URL;
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    endpoint: string,
    options: Partial<ApiRequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request('GET', endpoint, options);
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: Partial<ApiRequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request('POST', endpoint, { ...options, data });
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: Partial<ApiRequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request('PUT', endpoint, { ...options, data });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: Partial<ApiRequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request('DELETE', endpoint, options);
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: Partial<ApiRequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    return this.request('PATCH', endpoint, { ...options, data });
  }

  /**
   * Generic request method
   */
  private async request<T = any>(
    method: ApiRequestOptions['method'],
    endpoint: string,
    options: Partial<ApiRequestOptions> = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const requestOptions = this.buildRequestOptions(method, options);

    logger.info(`Making ${method} request to: ${url}`);

    try {
      const response: APIResponse = await this.request.request(url, requestOptions);
      
      const responseData: ApiResponse<T> = {
        status: response.status(),
        data: await response.json().catch(() => null),
        headers: response.headers(),
        url: response.url(),
      };

      logger.info(`Response received: ${responseData.status} - ${url}`);
      
      return responseData;
    } catch (error) {
      logger.error(`Request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${baseUrl}${cleanEndpoint}`;
  }

  /**
   * Build request options
   */
  private buildRequestOptions(
    method: ApiRequestOptions['method'],
    options: Partial<ApiRequestOptions>
  ): any {
    const requestOptions: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      timeout: options.timeout || env.TEST_TIMEOUT,
    };

    if (options.data) {
      requestOptions.data = options.data;
    }

    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      requestOptions.params = searchParams;
    }

    return requestOptions;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.request.setExtraHTTPHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.request.setExtraHTTPHeaders({});
  }

  /**
   * Set custom headers
   */
  setHeaders(headers: Record<string, string>): void {
    this.request.setExtraHTTPHeaders(headers);
  }
}
